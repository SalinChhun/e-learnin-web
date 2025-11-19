import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: 'standalone',
    images: {
        domains: ['localhost', '172.16.30.21'],
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '8080',
                pathname: '/api/wba/v1/image/**',
            },
            {
                protocol: 'http',
                hostname: '172.16.30.21',
                port: '28181',
                pathname: '/**',
            },
        ],
    },
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'X-Real-IP',
                        value: '#{x-real-ip}',
                    },
                    {
                        key: 'X-Forwarded-For',
                        value: '#{x-forwarded-for}',
                    },
                ],
            },
        ];
    },

    async rewrites() {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        return [
            {
                // source: '/api/wba/v1/auth/:path*',
                // destination: '/api/wba/v1/auth/:path*',
                source: '/api/auth/:path*',
                destination: '/api/auth/:path*',

            },
            
            // Forward all other API routes
            {
                source: '/api/wba/v1/:path*',
                destination: `${apiUrl}/api/wba/v1/:path*`,
            },
        
        ];
    }
};

export default nextConfig;
