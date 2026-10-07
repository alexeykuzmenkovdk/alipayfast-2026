// Структурированные данные Schema.org.
//
// Все значения берутся из lib/company.ts — адрес, телефон и координаты
// в разметке не могут разойтись с содержимым сайта.

import { COMPANY, FULL_ADDRESS } from '@/lib/company'
import { FAQ } from '@/lib/seo-faq'

type Json = Record<string, unknown>

const ORG_ID = `${COMPANY.url}/#organization`
const SITE_ID = `${COMPANY.url}/#website`

function postalAddress(): Json {
  return {
    '@type': 'PostalAddress',
    streetAddress: COMPANY.street,
    addressLocality: COMPANY.locality,
    addressRegion: COMPANY.region,
    postalCode: COMPANY.postalCode,
    addressCountry: COMPANY.country,
  }
}

function geo(): Json {
  return { '@type': 'GeoCoordinates', latitude: COMPANY.latitude, longitude: COMPANY.longitude }
}

export function organizationGraph(): Json {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['Organization', 'FinancialService', 'LocalBusiness'],
        '@id': ORG_ID,
        name: COMPANY.name,
        alternateName: 'Алипей Фаст',
        description:
          'Сервис пополнения кошелька Alipay китайскими юанями: обмен рублей на юани, оплата через Т-Банк, офис во Владивостоке.',
        url: COMPANY.url,
        telephone: COMPANY.phone,
        email: COMPANY.email,
        image: `${COMPANY.url}/assets/covers/alipay-setup.jpg`,
        logo: {
          '@type': 'ImageObject',
          url: `${COMPANY.url}/assets/logo-mark.png`,
        },
        address: postalAddress(),
        geo: geo(),
        hasMap: `https://yandex.ru/maps/?text=${encodeURIComponent(FULL_ADDRESS)}`,
        openingHoursSpecification: COMPANY.hours.map((slot) => ({
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: slot.days,
          opens: slot.opens,
          closes: slot.closes,
        })),
        currenciesAccepted: 'RUB, CNY',
        paymentAccepted: 'Перевод из приложения Т-Банк',
        priceRange: '3000–500000 RUB',
        areaServed: { '@type': 'Country', name: 'Россия' },
        sameAs: [COMPANY.telegram, COMPANY.whatsapp],
      },
      {
        '@type': 'WebSite',
        '@id': SITE_ID,
        url: COMPANY.url,
        name: `${COMPANY.name} — ${COMPANY.tagline}`,
        inLanguage: 'ru-RU',
        publisher: { '@id': ORG_ID },
      },
    ],
  }
}

export function serviceGraph(): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${COMPANY.url}/#service`,
    name: 'Пополнение Alipay юанями',
    description:
      'Обмен рублей на китайские юани с зачислением на кошелёк Alipay. Оплата переводом из приложения Т-Банк, зачисление около 15 минут.',
    serviceType: 'Пополнение кошелька Alipay',
    provider: { '@id': ORG_ID },
    areaServed: { '@type': 'Country', name: 'Россия' },
    availableChannel: {
      '@type': 'ServiceChannel',
      serviceUrl: COMPANY.url,
      servicePhone: COMPANY.phone,
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'RUB',
      availability: 'https://schema.org/InStock',
      areaServed: { '@type': 'Country', name: 'Россия' },
    },
  }
}

export function faqGraph(): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  }
}

export function breadcrumbGraph(items: { name: string; url?: string }[]): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      ...(item.url ? { item: item.url.startsWith('http') ? item.url : `${COMPANY.url}${item.url}` } : {}),
    })),
  }
}

export function articleGraph(data: {
  title: string
  description: string
  path: string
  image?: string
  updated?: string
}): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: data.title,
    description: data.description,
    mainEntityOfPage: `${COMPANY.url}${data.path}`,
    inLanguage: 'ru-RU',
    ...(data.image ? { image: `${COMPANY.url}${data.image}` } : {}),
    ...(data.updated ? { dateModified: data.updated } : {}),
    author: { '@id': ORG_ID },
    publisher: { '@id': ORG_ID },
  }
}

// Сериализация для <script type="application/ld+json">
export function jsonLd(data: Json): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

// Метаданные страницы: canonical и og:url всегда строятся от одного адреса,
// поэтому разойтись между собой не могут.
export function pageMetadata(data: {
  title: string
  description: string
  path: string
  image?: string
  type?: 'website' | 'article'
  noindex?: boolean
}): import('next').Metadata {
  const image = data.image ?? '/assets/covers/alipay-setup.jpg'
  return {
    title: data.title,
    description: data.description,
    alternates: { canonical: data.path },
    robots: data.noindex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      type: data.type ?? 'website',
      url: data.path,
      title: data.title,
      description: data.description,
      siteName: `${COMPANY.name} — ${COMPANY.tagline}`,
      locale: 'ru_RU',
      images: [{ url: image, width: 1248, height: 832, alt: data.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: data.title,
      description: data.description,
      images: [image],
    },
  }
}
