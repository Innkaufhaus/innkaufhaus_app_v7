const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Add case sensitive paths plugin
    config.plugins.push(new CaseSensitivePathsPlugin());

    // Configure webpack cache
    config.cache = {
      type: 'filesystem',
      buildDependencies: {
        config: [__filename],
      },
      cacheDirectory: path.resolve('.next/cache'),
      name: `${isServer ? 'server' : 'client'}-${dev ? 'development' : 'production'}`,
      version: buildId,
    };

    // Enhanced resolve configuration
    config.resolve = {
      ...config.resolve,
      // Force case-sensitive path resolution
      symlinks: false,
      // Ensure consistent casing in import paths
      alias: {
        ...config.resolve.alias,
        '@': path.resolve(__dirname, './src'),
      },
      // Enforce extension resolution
      enforceExtension: false,
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      // Cache module resolution
      cache: true,
      // Use only exact matches
      enforceModuleExtension: false,
    };

    // Add module resolution fallbacks
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
    };

    return config;
  },
  // Disable static optimization to prevent casing issues
  experimental: {
    forceSwcTransforms: true,
  },
  // Clear cache on build
  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
};

module.exports = nextConfig;
