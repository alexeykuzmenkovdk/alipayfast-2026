/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // AVIF отдаётся первым, webp — фолбэк для старых браузеров.
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 828, 1080, 1440, 1920],
    imageSizes: [96, 128, 256, 384],
    minimumCacheTTL: 2592000,
  },
  compress: true,
  poweredByHeader: false,
  trailingSlash: false,
  async rewrites() {
    return {
      // Файлы, загруженные в рантайме, next start из public/ не раздаёт —
      // отдаём их через обработчик, который читает каталог загрузок с диска.
      afterFiles: [{ source: '/uploads/:path*', destination: '/api/uploads/:path*' }],
    }
  },
  async headers() {
    return [
      {
        // Статика с хешем в имени — кэшируем надолго.
        source: '/_next/static/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        // Загруженная оптика next/image.
        source: '/_next/image',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=2592000, stale-while-revalidate=86400' }],
      },
    ]
  },
}

export default nextConfig
