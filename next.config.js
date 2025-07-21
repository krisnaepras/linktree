/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        ignoreDuringBuilds: true
    },
    typescript: {
        ignoreBuildErrors: true
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "**"
            },
            {
                protocol: "http",
                hostname: "**"
            }
        ],
        dangerouslyAllowSVG: true,
        unoptimized: false
    },
    experimental: {
        turbopack: {
            enabled: true
        }
    }
};

module.exports = nextConfig;
