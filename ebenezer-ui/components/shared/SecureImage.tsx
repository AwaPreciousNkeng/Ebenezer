'use client';
import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

interface SecureImageProps {
    src: string;
    alt: string;
    className?: string;
}

/**
 * Loads images that require a JWT Authorization header.
 * Use this for any /api/v1/... image endpoints.
 * For public static images (profile avatars) a regular <img> is fine.
 */
export function SecureImage({ src, alt, className }: SecureImageProps) {
    const [objectUrl, setObjectUrl] = useState<string | null>(null);
    const [errored, setErrored] = useState(false);
    const accessToken = useAuthStore((s) => s.accessToken);
    const prevUrl = useRef<string | null>(null);

    useEffect(() => {
        if (!src) return;

        let alive = true;

        const load = async () => {
            try {
                const fullUrl = src.startsWith('http')
                    ? src
                    : `${BASE_URL.replace('/api/v1', '')}${src}`;

                const res = await fetch(fullUrl, {
                    headers: accessToken
                        ? { Authorization: `Bearer ${accessToken}` }
                        : {},
                });
                if (!res.ok || !alive) return;

                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                if (!alive) { URL.revokeObjectURL(url); return; }

                if (prevUrl.current) URL.revokeObjectURL(prevUrl.current);
                prevUrl.current = url;
                setObjectUrl(url);
            } catch {
                if (alive) setErrored(true);
            }
        };

        load();
        return () => { alive = false; };
    }, [src, accessToken]);

    if (errored || !objectUrl) {
        return (
            <div className={cn(
                'bg-muted flex items-center justify-center text-muted-foreground text-xs',
                className
            )}>
                {!objectUrl && !errored ? (
                    <div className="w-full h-full animate-pulse bg-muted-foreground/20 rounded-lg" />
                ) : '⚠'}
            </div>
        );
    }

    return <img src={objectUrl} alt={alt} className={className} />;
}
