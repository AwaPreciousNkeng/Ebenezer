'use client';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/store/authStore';

/**
 * OAuth2 callback handler. The backend redirects here after a Google login with
 *   /oauth2/redirect?token=<jwt>&refreshToken=<jwt>
 * or on failure with
 *   /oauth2/redirect?error=<message>
 */
export default function OAuth2RedirectPage() {
    const router = useRouter();
    const setTokens = useAuthStore((s) => s.setTokens);
    const setAuth = useAuthStore((s) => s.setAuth);
    const handled = useRef(false);

    useEffect(() => {
        if (handled.current) return;
        handled.current = true;

        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        const refreshToken = params.get('refreshToken');
        const error = params.get('error');

        if (error) {
            toast.error(decodeURIComponent(error) || 'Google sign-in failed');
            router.replace('/login');
            return;
        }

        if (!token || !refreshToken) {
            toast.error('Sign-in failed — missing credentials');
            router.replace('/login');
            return;
        }

        (async () => {
            try {
                // Store tokens first so the API client attaches them to /users/me
                setTokens(token, refreshToken);
                const res = await authApi.getMe();
                const user = res.data.data;
                setAuth(user, token, refreshToken);
                toast.success(`Welcome, ${user.fullName}!`);
                router.replace('/dashboard');
            } catch {
                toast.error('Could not load your profile. Please try again.');
                useAuthStore.getState().clearAuth();
                router.replace('/login');
            }
        })();
    }, [router, setTokens, setAuth]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Completing sign-in…</p>
        </div>
    );
}
