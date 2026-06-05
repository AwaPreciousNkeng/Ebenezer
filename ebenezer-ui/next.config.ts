import type { NextConfig } from 'next';

const BACKEND = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1')
    .replace('/api/v1', '');

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: '*.amazonaws.com' },
            { protocol: 'https', hostname: 'ui-avatars.com' },
        ],
    },
    async rewrites() {
        return [
            {
                // Proxy static uploads through the Next.js server to the backend.
                // Fixes relative /uploads/... URLs resolving to the wrong origin.
                source: '/uploads/:path*',
                destination: `${BACKEND}/uploads/:path*`,
            },
        ];
    },
};

export default nextConfig;
