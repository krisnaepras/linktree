import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "images.unsplash.com",
                port: "",
                pathname: "/**"
            },
            {
                protocol: "https",
                hostname: "example.com",
                port: "",
                pathname: "/**"
            },
            {
                protocol: "https",
                hostname: "via.placeholder.com",
                port: "",
                pathname: "/**"
            },
            {
                protocol: "https",
                hostname: "picsum.photos",
                port: "",
                pathname: "/**"
            },
            // Add more domains as needed for user profile photos
            {
                protocol: "https",
                hostname: "*.googleusercontent.com",
                port: "",
                pathname: "/**"
            },
            {
                protocol: "https",
                hostname: "res.cloudinary.com",
                port: "",
                pathname: "/**"
            },
            {
                protocol: "https",
                hostname: "*.amazonaws.com",
                port: "",
                pathname: "/**"
            }
        ]
    }
};

export default nextConfig;
