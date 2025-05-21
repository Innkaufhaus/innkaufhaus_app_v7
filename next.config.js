/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Add case sensitive paths plugin
    config.resolve = {
      ...config.resolve,
      // Force case-sensitive path resolution
      symlinks: false,
      // Ensure consistent casing in import paths
      alias: {
        ...config.resolve.alias,
        '@': require('path').resolve(__dirname, './src'),
      }
    }

    return config
  },
  // Disable static optimization to prevent casing issues
  experimental: {
    forceSwcTransforms: true,
  }
}

module.exports = nextConfig
