const nextConfig = {
  react: {
    useSuspense: true,
  },
  output: 'standalone',
  basePath: '',
  trailingSlash: false,
  images: {
    unoptimized: true,
  },
  i18n: {
    locales: ['en', 'es'],
    defaultLocale: 'en',
    localeDetection: true,
  },
  env: {},
  publicRuntimeConfig: {},
  serverRuntimeConfig: {},
  async redirects() {
    return [];
  },
  async rewrites() {
    return [];
  },
  async headers() {
    return [];
  },
  async redirects() {
    return [];
  },
  async experimental() {
    return {};
  },
  async redirects() {
    return [];
  },
  async headers() {
    return [];
  },
  async rewrites() {
    return [];
  },
  async redirects() {
    return [];
  },
  async headers() {
    return [];
  },
  async rewrites() {
    return [];
  },
  async redirects() {
    return [];
  },
  async headers() {
    return [];
  },
  poweredByHeader: false,
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
    dirs: ['src'],
  },
  images: {
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
  experimental: {
    optimizeCss: true,
    serverActions: true,
    typedRoutes: true,
    serverComponentsExternalPackages: [],
  },
  webpack: (config: any, { dev, isServer }: { dev: boolean; isServer: boolean }) => {
    // Optimizaciones para producción
    if (!dev && !isServer) {
      Object.assign(config.optimization.splitChunks.cacheGroups, {
        commons: {
          name: 'commons',
          chunks: 'all',
          minChunks: 2,
          reuseExistingChunk: true,
        },
        vendors: {
          name: 'vendors',
          test: /[\\/]node_modules[\\/]/,
          chunks: 'all',
          priority: -10,
        },
      });

      config.optimization.moduleIds = 'deterministic';
    }
    return config;
  },
  compress: true,
  productionBrowserSourceMaps: false,
  swcMinify: true,
};

export default nextConfig;
