import type { Metadata } from 'next'
import './globals.css'
import { RatesProvider } from '@/components/site/rates-context'

export const metadata: Metadata = {
  title: 'AlipayFast — пополнение Alipay юанями',
  description:
    'Пополнение Alipay юанями во Владивостоке: выгодный курс без скрытых комиссий. Зачисление за ~15 минут.',
  keywords: ['Alipay', 'пополнение Alipay', 'юани', 'Владивосток', 'обмен рублей на юани', 'Т-Банк'],
  robots: { index: true, follow: true },
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
      </head>
      <body data-theme="white">
        <RatesProvider>{children}</RatesProvider>
      </body>
    </html>
  )
}
