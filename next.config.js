/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { dev, isServer }) => {
    config.module.rules = [
      ...config.module.rules,
      {
        test: /\.(mjs|js|jsx)$/,
        include: /node_modules/,
        resolve: { mainFields: ["browser", "main"] },
      },
    ];

    return config;
  },
};

module.exports = nextConfig;
