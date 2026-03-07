import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  compiler: {
    styledComponents: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io", pathname: "/images/**" },
      { protocol: "https", hostname: "picsum.photos", pathname: "/**" },
      { protocol: "https", hostname: "placehold.co", pathname: "/**" },
    ],
  },
};

export default nextConfig;
