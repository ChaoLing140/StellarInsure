/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["@stellar/freighter-api", "@stellar/stellar-sdk"],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.runtimeChunk = "single";
      config.optimization.splitChunks = {
        chunks: "all",
        cacheGroups: {
          default: false,
          vendors: false,
          stellar: {
            test: /[\\/]node_modules[\\/](@stellar|stellar-sdk)[\\/]/,
            name: "vendor-stellar",
            priority: 10,
            enforce: true,
            reuseExistingChunk: true,
          },
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: "vendor-react",
            priority: 20,
            enforce: true,
            reuseExistingChunk: true,
          },
          common: {
            minChunks: 2,
            priority: 5,
            reuseExistingChunk: true,
            name: "common",
          },
        },
      };
    }
    return config;
  },
}

module.exports = nextConfig
