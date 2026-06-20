/** @type {import('next').NextConfig} */
const nextConfig = {
  // 静态导出
  output: 'export',
  // GitHub Pages 项目站点需要 basePath
  basePath: '/cuoti-ben',
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
