import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

// ─── Request Interceptor ─────────────────────────────────
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('accessToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ─── Response Interceptor ────────────────────────────────
apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<{ message?: string; data?: any }>) => {
        const original = error.config as InternalAxiosRequestConfig & {
            _retry?: boolean;
        };

        if (error.response?.status === 401 && !original._retry) {
            original._retry = true;
            try {
                const refreshToken = typeof window !== 'undefined'
                    ? localStorage.getItem('refreshToken')
                    : null;
                if (!refreshToken) throw new Error('No refresh token');

                const { data } = await axios.post(
                    `${BASE_URL}/auth/refresh`,
                    { refreshToken }
                );

                if (data?.data?.accessToken) {
                    localStorage.setItem('accessToken', data.data.accessToken);
                    if (data.data.refreshToken) {
                        localStorage.setItem('refreshToken', data.data.refreshToken);
                    }
                    original.headers.Authorization = `Bearer ${data.data.accessToken}`;
                    return apiClient(original);
                }
            } catch {
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    window.location.href = '/login';
                }
            }
        }

        // Provide structured error response
        const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
        const structuredError = new Error(errorMessage) as AxiosError;
        structuredError.response = error.response;
        structuredError.config = error.config;

        return Promise.reject(structuredError);
    }
);