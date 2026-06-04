'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

export function GuestGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        setHydrated(useAuthStore.persist.hasHydrated());
        const unsub = useAuthStore.persist.onFinishHydration(() => setHydrated(true));
        return unsub;
    }, []);

    useEffect(() => {
        if (hydrated && isAuthenticated) router.replace('/dashboard');
    }, [hydrated, isAuthenticated, router]);

    if (!hydrated) return <LoadingSpinner fullScreen />;
    if (isAuthenticated) return <LoadingSpinner fullScreen />;
    return <>{children}</>;
}