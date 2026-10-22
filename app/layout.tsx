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

// Страховка для мини-аппов: если бандл не загрузился или упал, вместо белого
// экрана показываем причину и кнопку перезагрузки. Сниппет стоит в <head>,
// поэтому обработчики успевают встать раньше кода приложения.
const tmaGuardSnippet = `
(function () {
  var path = location.pathname;
  if (path !== '/telegram-mini-app' && path !== '/admin/tg' && path !== '/admin-mini-app') return;

  function show(text) {
    if (document.getElementById('tma-fail')) return;
    var box = document.createElement('div');
    box.id = 'tma-fail';
    box.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:2147483647;background:#7a1a1a;color:#fff;padding:14px 16px;font:14px/1.45 -apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;';
    var message = document.createElement('div');
    message.textContent = text;
    var button = document.createElement('button');
    button.type = 'button';
    button.textContent = 'Перезагрузить';
    button.style.cssText = 'margin-top:10px;padding:8px 14px;border:0;border-radius:8px;background:#fff;color:#7a1a1a;font-weight:600;';
    button.onclick = function () { location.reload(); };
    box.appendChild(message);
    box.appendChild(button);
    var attach = function () { (document.body || document.documentElement).appendChild(box); };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', attach);
    } else {
      attach();
    }
  }

  window.addEventListener('error', function (event) {
    if (!event || !event.message || event.message === 'Script error.') return;
    show('Ошибка приложения: ' + event.message);
  });
  window.addEventListener('unhandledrejection', function (event) {
    var reason = event && event.reason;
    if (reason && reason.name === 'AbortError') return;
    show('Ошибка приложения: ' + ((reason && reason.message) || reason || 'неизвестно'));
  });
  setTimeout(function () {
    if (!window.__tmaReady) show('Приложение не загрузилось за 15 секунд. Проверьте связь и нажмите «Перезагрузить».');
  }, 15000);
})();
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
        {/* Шрифты грузим асинхронно: <link rel=stylesheet> на fonts.googleapis.com
            в РФ часто висит и блокирует первую отрисовку — мини-апп оставался
            белым, пока браузер ждал Google. */}
        <script
          id="google-fonts"
          dangerouslySetInnerHTML={{
            __html: `(function(){var l=document.createElement('link');l.rel='stylesheet';l.href='https://fonts.googleapis.com/css2?family=Oswald:wght@500;700&family=Golos+Text:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap';document.head.appendChild(l);})();`,
          }}
        />
        <script id="tma-guard" dangerouslySetInnerHTML={{ __html: tmaGuardSnippet }} />
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
