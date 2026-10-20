import type { Metadata } from 'next'
import './globals.css'
import { RatesProvider } from '@/components/site/rates-context'
import { COMPANY, FULL_ADDRESS } from '@/lib/company'
import { organizationGraph, jsonLd } from '@/lib/seo'

// Яндекс.Метрика. Сниппет стоит прямо в <head>, чтобы он был в исходном HTML.
// Админку (/admin/*) не инициализируем — это внутренние страницы.
const METRIKA_ID = 108769865
const metrikaSnippet = `
if (location.pathname.indexOf('/admin') !== 0) {
  (function(m,e,t,r,i,k,a){
      m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
      m[i].l=1*new Date();
      for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
      k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
  })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=${METRIKA_ID}', 'ym');

  ym(${METRIKA_ID}, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", referrer: document.referrer, url: location.href, accurateTrackBounce:true, trackLinks:true});
}
`

export const metadata: Metadata = {
  metadataBase: new URL(COMPANY.url),
  title: 'Пополнение Alipay юанями из России — выгодный курс и зачисление за 15 минут',
  description: `${COMPANY.name} — пополнение кошелька Alipay китайскими юанями: выгодный курс без скрытых комиссий, оплата через Т-Банк, зачисление около 15 минут. Офис во Владивостоке, онлайн 24/7.`,
  keywords: [
    'пополнение Alipay',
    'пополнить Alipay',
    'Alipay юани',
    'обмен рублей на юани',
    'Владивосток',
    'Т-Банк',
    'китайские юани',
    'оплата в Китае',
  ],
  robots: { index: true, follow: true },
  applicationName: COMPANY.name,
  authors: [{ name: COMPANY.name, url: COMPANY.url }],
  creator: COMPANY.name,
  publisher: COMPANY.name,
  formatDetection: { telephone: true, email: true, address: true },
  // Коды подтверждения задаются переменными окружения: без них тег не выводится.
  ...(process.env.GOOGLE_VERIFICATION || process.env.YANDEX_VERIFICATION
    ? {
        verification: {
          ...(process.env.GOOGLE_VERIFICATION ? { google: process.env.GOOGLE_VERIFICATION } : {}),
          ...(process.env.YANDEX_VERIFICATION ? { yandex: process.env.YANDEX_VERIFICATION } : {}),
        },
      }
    : {}),
  // Локальное SEO: гео-данные офиса во Владивостоке.
  other: {
    'geo.region': 'RU-PRI',
    'geo.placename': COMPANY.locality,
    'geo.position': `${COMPANY.latitude};${COMPANY.longitude}`,
    ICBM: `${COMPANY.latitude}, ${COMPANY.longitude}`,
    'address': FULL_ADDRESS,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Oswald:wght@500;700&family=Golos+Text:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(organizationGraph()) }}
        />
        <script id="yandex-metrika" dangerouslySetInnerHTML={{ __html: metrikaSnippet }} />
      </head>
      <body data-theme="white">
        <noscript>
          <div>
            <img
              src={`https://mc.yandex.ru/watch/${METRIKA_ID}`}
              style={{ position: 'absolute', left: '-9999px' }}
              alt=""
            />
          </div>
        </noscript>
        <RatesProvider>{children}</RatesProvider>
      </body>
    </html>
  )
}
