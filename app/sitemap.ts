import type { MetadataRoute } from 'next'
import { COMPANY } from '@/lib/company'
import { lastModified } from '@/lib/dates'

// lastmod считается по реальным датам: коммит файла страницы и её гайд-компонента,
// для незакоммиченных правок — время изменения на диске.

const STATIC: { path: string; files: string[]; priority: number; changeFrequency: 'daily' | 'weekly' | 'yearly' }[] = [
  {
    path: '/',
    files: ['app/page.tsx', 'components/site/Hero.tsx', 'components/site/Sections.tsx', 'components/site/Calculator.tsx'],
    priority: 1,
    changeFrequency: 'daily',
  },
  {
    path: '/materials',
    files: ['app/materials/page.tsx', 'components/site/MaterialsPage.tsx'],
    priority: 0.7,
    changeFrequency: 'weekly',
  },
  {
    path: '/terms',
    files: ['app/terms/page.tsx', 'components/site/TermsPage.tsx'],
    priority: 0.3,
    changeFrequency: 'yearly',
  },
  {
    path: '/privacy',
    files: ['app/privacy/page.tsx', 'components/site/PrivacyPage.tsx'],
    priority: 0.3,
    changeFrequency: 'yearly',
  },
]

const GUIDES: { path: string; slug: string; component: string }[] = [
  { path: '/guides/alipay', slug: 'alipay', component: 'AlipayGuidePage' },
  { path: '/guides/alipay-unblock', slug: 'alipay-unblock', component: 'AlipayUnblockGuidePage' },
  { path: '/guides/alipay-china', slug: 'alipay-china', component: 'AlipayChinaGuidePage' },
  { path: '/guides/tbank', slug: 'tbank', component: 'GuidePage' },
  { path: '/guides/poizon', slug: 'poizon', component: 'PoizonGuidePage' },
  { path: '/guides/taobao', slug: 'taobao', component: 'TaobaoGuidePage' },
  { path: '/guides/china-bikes', slug: 'china-bikes', component: 'ChinaBikesGuidePage' },
  { path: '/guides/china-metro', slug: 'china-metro', component: 'ChinaMetroGuidePage' },
  { path: '/guides/china-taxi', slug: 'china-taxi', component: 'ChinaTaxiGuidePage' },
  { path: '/guides/china-50-things', slug: 'china-50-things', component: 'China50ThingsGuidePage' },
]

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...STATIC.map((page) => ({
      url: `${COMPANY.url}${page.path === '/' ? '/' : page.path}`,
      lastModified: lastModified(page.files),
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    })),
    ...GUIDES.map((guide) => ({
      url: `${COMPANY.url}${guide.path}`,
      lastModified: lastModified([
        `app/guides/${guide.slug}/page.tsx`,
        `components/site/${guide.component}.tsx`,
      ]),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ]
}
