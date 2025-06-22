const nextConfig = {
  // Vercel optimizations
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true,
  compress: true,
  
  // Image configuration
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  
  // Internationalization
  i18n: {
    locales: ['en', 'es'],
    defaultLocale: 'en',
    localeDetection: true,
  },
  
  // TypeScript and ESLint
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
    dirs: ['src'],
  },
  
  // Experimental features
  experimental: {
    optimizeCss: true,
    serverActions: true,
    typedRoutes: true,
    serverComponentsExternalPackages: ['@mistralai/mistralai', '@google/generative-ai'],
  },
  
  // Environment variables validation
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Webpack optimizations for Vercel
  webpack: (config, { dev, isServer }) => {
    // Production optimizations
    if (!dev && !isServer) {
      // Optimize chunk splitting
      Object.assign(config.optimization.splitChunks.cacheGroups, {
        commons: {
          name: 'commons',
          chunks: 'all',
          minChunks: 2,
          reuseExistingChunk: true,
        },
        vendors: {
          name: 'vendors',
          test: /[\/]node_modules[\/]/,
          chunks: 'all',
          priority: -10,
        },
        ai: {
          name: 'ai-vendors',
          test: /[\/]node_modules[\/](@mistralai|@google)[\/]/,
          chunks: 'all',
          priority: 10,
        },
      });

      config.optimization.moduleIds = 'deterministic';
    }
    
    // Handle AI SDK modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    
    return config;
  },
  
  // Headers for API routes
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
