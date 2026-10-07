# SEO-аудит AlipayFast: что сделано и что нужно от владельца

Дата: 8 октября 2026. Проверка после правок: 14 страниц, 0 замечаний,
238 изображений отдаются с кодом 200.

## Сделано в коде

| № | Задача | Где |
|---|---|---|
| 1 | Уникальные title и description, длина в норме | `lib/seo.ts` → `pageMetadata()` вызывается на каждой странице |
| 2 | Верификация Google и Яндекса через переменные окружения | `app/layout.tsx`, `GOOGLE_VERIFICATION` / `YANDEX_VERIFICATION` |
| 4 | Organization / LocalBusiness / WebSite / Service / FAQPage | `lib/seo.ts`, `app/layout.tsx`, `app/page.tsx` |
| 5 | Article + BreadcrumbList на всех гайдах | `lib/seo.ts`, `components/site/GuideBreadcrumbs.tsx` |
| 6 | Один `<h1>` на страницу | проверено скриптом по всем 14 URL |
| 7 | canonical, og:url, og:image, og:type | `pageMetadata()` — единая точка |
| 8 | Единый источник NAP (телефон, почта, адрес, индекс, часы) | `lib/company.ts` |
| 9 | alt у содержательных изображений, декор — `alt=""` + `aria-hidden` | `Header.tsx`, `Hero.tsx`, `MaterialsPage.tsx` |
| 10 | Геомета, карта офиса, блок контактов | `app/layout.tsx`, `components/site/Sections.tsx`, `Footer.tsx` |
| 11 | Убраны `ignoreDuringBuilds` и `ignoreBuildErrors` | `next.config.mjs`; сборка проходит с проверками |
| 13 | Все 10 гайдов в подменю «Гайды» | `components/site/Header.tsx`, `lib/guides.ts` |
| 14 | AVIF + webp, кэш статики | `next.config.mjs` |
| 15 | Сжатие тяжёлых картинок гайдов: 18 МБ → 2,6 МБ | 65 PNG переведены в webp |
| 16 | Растеризация SVG (метро) — `dangerouslyAllowSVG` выключен | `public/assets/china-metro/*.png` |
| 18 | Хлебные крошки + блок «Читайте также» | `GuideBreadcrumbs.tsx`, `RelatedGuides.tsx`, `lib/guides.ts` |
| 19 | robots.txt с Host и Sitemap, sitemap.xml | `app/robots.ts`, `app/sitemap.ts` |
| 20 | `lastmod` по реальным датам правок | `lib/dates.ts` — дата коммита, для незакоммиченных файлов время на диске |

Исправлены попутные дефекты: обложка гайда «50 вещей» ссылалась на несуществующий
файл (4 места), три картинки витрины отсутствовали — заменены плейсхолдерами,
убраны упоминания «курс ЦБ РФ» из клиентских текстов (Poizon, Taobao).

## Требует действий владельца

1. **Подтвердить сайт** в Google Search Console и Яндекс.Вебмастере, прописать
   выданные коды в `.env` на сервере:

   ```
   GOOGLE_VERIFICATION=...
   YANDEX_VERIFICATION=...
   ```

2. **Применить nginx-конфиг** из `docs/seo-nginx.md`: 301 с `www`, HTTPS,
   сжатие, кэш. Без этого `www.alipayfast.ru` остаётся дублем (сейчас 200).
3. **Указать координаты офиса** в Яндекс.Картах и прислать их — сейчас в схеме
   используется `43.1159, 131.8865`, переопределяется через
   `NEXT_PUBLIC_OFFICE_LAT` / `NEXT_PUBLIC_OFFICE_LNG`.
4. **Разместить бизнес-карточки** в Яндекс.Бизнес, Google Business Profile,
   2ГИС с теми же данными, что в `lib/company.ts` (телефон, адрес, индекс 690091,
   часы Пн–Пт 10:00–19:00, Сб 11:00–17:00).
5. **Сменить пароль администратора** на сервере (`ADMIN_PASSWORD`). Старый
   пароль из прошлого репозитория в новый код не переносился, но и не отозван.
6. **Деплой на прод**: сейчас на alipayfast.ru работает старая сборка, в ней
   остались заглушки (`+7-XXX-XXX-XXXX`, `ул. Примерная, 1`, `690000`, коды
   верификации-заглушки) и два `<h1>` на главной.
7. **Самоподключение шрифтов** (пункт 17) отложено: из этой среды домены
   `fonts.googleapis.com` и `fonts.gstatic.com` недоступны. Когда появится
   доступ — перевести Google Fonts на `next/font/local` с файлами в `public/fonts`.
