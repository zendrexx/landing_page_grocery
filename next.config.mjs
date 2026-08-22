/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Static screenshots are already sized; keep the default (optimized) loader.
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;

import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
