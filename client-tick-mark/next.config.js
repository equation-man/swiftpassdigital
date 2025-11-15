// @ts-expect-error TS(2792): Cannot find module 'next'. Did you mean to set the... Remove this comment to see the full error message
const withPWA = require("next-pwa");
const runtimeCaching = require("next-pwa/cache");

const isProd = process.env.NODE_ENV === "production";

const nextConfig = {
  // output: "standalone",
  reactStrictMode: true,
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  pwa: {
    dest: "public",
    register: true,
    skipWaiting: true,
    disable: !isProd, // disable PWA in development
    runtimeCaching: runtimeCaching,
  },
};

module.exports = withPWA(nextConfig);
