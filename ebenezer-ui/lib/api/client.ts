import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/authStore';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

// ─── JWT helpers ─────────────────────────────────────────

function getTokenExpiry(token: string): number | null {
    try {
        // JWT uses base64URL — replace URL-safe chars before calling atob
        const b64 = token.split('.')[1]
            .replace(/-/g, '+')
            .replace(/_/g, '/')
            .padEnd(Math.ceil(token.split('.')[1].length / 4) * 4, '=');
        const payload = JSON.parse(atob(b64));
        return payload.exp ? payload.exp * 1000 : null;
    } catch {
        return null;
    }
}

function isTokenExpiringSoon(token: string, thresholdMs = 60_000): boolean {
    const exp = getTokenExpiry(token);
    if (!exp) return true;
    return Date.now() >= exp - thresholdMs;
}

// ─── Refresh lock (deduplicate concurrent calls) ─────────

let refreshPromise: Promise<string | null> | null = null;

async function doRefresh(): Promise<string | null> {
    if (refreshPromise) return refreshPromise;

    refreshPromise = (async () => {
        try {
            const refreshToken = useAuthStore.getState().refreshToken;
            if (!refreshToken) return null;

            // Backend reads the refresh token from the Authorization header
            // and returns a raw AuthenticationResponse (not ApiResponse-wrapped)
            const { data } = await axios.post(
                `${BASE_URL}/auth/refresh-token`,
                null,
                { headers: { Authorization: `Bearer ${refreshToken}` } }
            );

            if (data?.access_token) {
                useAuthStore.getState().setTokens(
                    data.access_token,
                    data.refresh_token ?? refreshToken,
                );
                if (data.user) {
                    useAuthStore.getState().setUser(data.user);
                }
                return data.access_token as string;
            }
            return null;
        } catch {
            return null;
        } finally {
            refreshPromise = null;
        }
    })();

    return refreshPromise;
}

function redirectToLogin() {
    useAuthStore.getState().clearAuth();
    if (typeof window !== 'undefined') {
        window.location.href = '/login';
    }
}

// ─── Request Interceptor ─────────────────────────────────
// Proactively refresh if the access token expires within 60 s.

apiClient.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        if (typeof window === 'undefined') return config;

        let token = useAuthStore.getState().accessToken;
        if (!token) return config;

        if (isTokenExpiringSoon(token)) {
            const newToken = await doRefresh();
            if (newToken) {
                token = newToken;
            } else {
                redirectToLogin();
                return Promise.reject(new Error('Session expired. Please log in again.'));
            }
        }

        config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

// ─── Response Interceptor ────────────────────────────────
// Reactive fallback: if a 401 slips through (race condition,
// clock skew, server-side revocation), try one refresh then retry.

apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<{ message?: string }>) => {
        const original = error.config as InternalAxiosRequestConfig & {
            _retry?: boolean;
        };

        if (error.response?.status === 401 && !original._retry) {
            original._retry = true;

            const newToken = await doRefresh();
            if (newToken) {
                original.headers.Authorization = `Bearer ${newToken}`;
                return apiClient(original);
            }

            redirectToLogin();
        }

        const errorMessage =
            error.response?.data?.message ||
            error.message ||
            'An error occurred';
        const structuredError = new Error(errorMessage) as AxiosError;
        structuredError.response = error.response;
        structuredError.config = error.config;
        return Promise.reject(structuredError);
    }
);
