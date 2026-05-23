/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: __dirname,
  images: {
    remotePatterns: [],
  },
  headers: async () => [
    {
      source: "/api/:path*",
      headers: [
        { key: "Access-Control-Allow-Credentials", value: "true" },
        { key: "Access-Control-Allow-Origin", value: "*" },
        { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
      ],
    },
  ],
  async rewrites() {
    // BACKEND_URL is set by Render (fromService) or manually; fall back to localhost
    const raw = process.env.BACKEND_URL || "http://localhost:8000";
    const backendUrl = raw.startsWith("http") ? raw : `https://${raw}`;
    return {
      beforeFiles: [
        {
          source: "/api/v1/:path*",
          destination: `${backendUrl}/api/v1/:path*`,
        },
      ],
    };
  },
};

module.exports = nextConfig;
