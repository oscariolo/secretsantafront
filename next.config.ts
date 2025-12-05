import type { NextConfig } from "next";

const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/secret-santa/rooms',
        destination: 'http://localhost:8000/api/secret-santa/rooms',
      },
      {
        source: '/api/secret-santa/room/:roomId/shuffle',
        destination: 'http://localhost:8000/api/secret-santa/room/:roomId/shuffle',
      },
      {
        source: '/api/secret-santa/room/:roomId/participant',
        destination: 'http://localhost:8000/api/secret-santa/room/:roomId/participant',
      },
      {
        source: '/api/secret-santa/room/:roomId',
        destination: 'http://localhost:8000/api/secret-santa/room/:roomId',
      },
      {
        source: '/api/:path*',
        destination: 'http://localhost:8080/api/:path*',
      },
    ]
  },
};

export default nextConfig;