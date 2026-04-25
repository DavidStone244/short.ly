/** @type {import('next').NextConfig} */
const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");

const nextConfig = {
  async rewrites() {
    return {
      // `fallback` only runs when no Next.js page or filesystem route matches.
      // This makes any unmatched single-segment path (e.g. /abc123) get
      // forwarded to the backend's redirect handler at GET /<code>.
      fallback: [
        {
          source: "/:code((?!api|_next|.*\\..*).*)",
          destination: `${apiUrl}/:code`,
        },
      ],
    };
  },
};

export default nextConfig;
