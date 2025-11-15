import withPWA from "next-pwa";
import runtimeCaching from "next-pwa/cache";
const isProd = process.env.NODE_ENV === "production";
const nextConfig = {
    /* config options here */
    //output: "standalone",
    reactStrictMode: true,
    typescript: { ignoreBuildErrors: true },
    eslint: { ignoreDuringBuilds: true },
};
export default withPWA(Object.assign(Object.assign({}, nextConfig), { pwa: {
        dest: "public",
        register: true,
        skipWaiting: true,
        disable: !isProd, // disable PWA in development
        runtimeCaching
    } }));
