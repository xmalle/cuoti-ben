/** @type {import('next').NextConfig} */
const nextConfig = {
  // 静态导出，部署到 EdgeOne Pages / 任意静态托管
  output: 'export',
  // 静态导出时不使用 next/image 的优化
  images: {
    unoptimized: true,
  },
  // trailingSlash 让静态托管的路由更稳定
  trailingSlash: true,
  reactStrictMode: true,
  webpack: (config) => {
    // tesseract.js 需要的 fallback
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    };
    return config;
  },
};

module.exports = nextConfig;
