/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // shared/*.mjs is plain ESM shared with the asset generator
  transpilePackages: [],
};

export default nextConfig;
