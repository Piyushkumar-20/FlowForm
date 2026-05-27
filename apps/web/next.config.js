/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const apiBase = process.env.API_URL ?? "http://localhost:8000";
    return [
      {
        source: "/api/trpc/:path*",
        destination: `${apiBase}/trpc/:path*`,
      },
    ];
  },
};

export default nextConfig;
