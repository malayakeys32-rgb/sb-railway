/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // On Railway, set BACKEND_URL to the backend service's public domain,
    // e.g. https://sentinel-black-api-production.up.railway.app
    const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";
    return [
      {
        source: "/api-backend/:path*",
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
