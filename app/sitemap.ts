import type { MetadataRoute } from 'next'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://alipayfast.ru'

const guides = [
  '/guides/alipay',
  '/guides/alipay-unblock',
  '/guides/alipay-china',
  '/guides/tbank',
  '/guides/poizon',
  '/guides/taobao',
  '/guides/china-bikes',
  '/guides/china-metro',
  '/guides/china-taxi',
  '/guides/china-50-things',
]

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  return [
    { url: `${baseUrl}/`, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/materials`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    ...guides.map((path) => ({
      url: `${baseUrl}${path}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
    { url: `${baseUrl}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ]
}
