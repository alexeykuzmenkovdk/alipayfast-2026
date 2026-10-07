import type { MetadataRoute } from 'next'
import { COMPANY } from '@/lib/company'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Служебные разделы закрываем: админка, API и мини-приложение.
        disallow: ['/admin/', '/api/', '/telegram-mini-app'],
      },
    ],
    sitemap: `${COMPANY.url}/sitemap.xml`,
    host: COMPANY.url,
  }
}
