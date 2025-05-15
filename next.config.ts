import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // Add API proxy to avoid CORS issues
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://5y1fktfbn0.execute-api.us-east-1.amazonaws.com/dev/:path*',
      },
    ];
  },

  // Enable CORS headers if needed
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ];
  },
};

export default nextConfig;