import type { NextConfig } from "next";

const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/apiSpring/:path*',
        destination: 'http://localhost:8080/api/:path*',
      },
      {
        source: '/apiFast/:path*',
        destination: 'http://127.0.0.1:8000/api/:path*',
      }
    ]
  },
};

export default nextConfig;

