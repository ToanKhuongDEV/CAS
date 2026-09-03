import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
