/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // Local/dev only: proxy /api/backend → FastAPI on this machine.
    // Production (Vercel): set NEXT_PUBLIC_API_URL to the Railway HTTPS URL —
    // do NOT rely on a 127.0.0.1 rewrite (it cannot reach the user's laptop).
    const enableRewrite =
      process.env.NODE_ENV === "development" ||
      process.env.ENABLE_API_REWRITE === "true";
    if (!enableRewrite) {
      return [];
    }
    const dest = (
      process.env.BACKEND_REWRITE_URL || "http://127.0.0.1:8000"
    ).replace(/\/$/, "");
    return [
      {
        source: "/api/backend/:path*",
        destination: `${dest}/:path*`,
      },
    ];
  },
};

export default nextConfig;
