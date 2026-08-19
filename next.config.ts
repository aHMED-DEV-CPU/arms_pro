import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/en",
        permanent: true,
      },
      {
        source: "/services/:slug",
        destination: "/en/services/:slug",
        permanent: true,
      },
      {
        source: "/projects/:slug",
        destination: "/en/projects/:slug",
        permanent: true,
      },
      {
        source: "/about",
        destination: "/en/about",
        permanent: true,
      },
      {
        source: "/services",
        destination: "/en/services",
        permanent: true,
      },
      {
        source: "/projects",
        destination: "/en/projects",
        permanent: true,
      },
      {
        source: "/contact",
        destination: "/en/contact",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
