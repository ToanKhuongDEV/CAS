import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL?.replace(/\/+$/, "");
    return backendUrl
      ? [{ source: "/api/v1/:path*", destination: `${backendUrl}/api/v1/:path*` }]
      : [];
  },
  images: {
    remotePatterns: [
      {
        hostname: "res.cloudinary.com",
        pathname: "/dh6qzqf73/image/upload/**",
        protocol: "https",
      },
    ],
  },
  reactStrictMode: true,
  output: "standalone",
};

export default nextConfig;
