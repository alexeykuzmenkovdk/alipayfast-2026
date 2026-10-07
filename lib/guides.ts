// Реестр гайдов: используется для блока «Читайте также» и sitemap.
// Заголовки совпадают с title страниц, чтобы не расходиться в выдаче.

export interface GuideEntry {
  path: string
  tag: string
  title: string
  minutes: number
  image: string
}

export const GUIDES: GuideEntry[] = [
  {
    path: '/guides/alipay',
    tag: 'Alipay',
    title: 'Как установить, верифицировать и пользоваться Alipay',
    minutes: 12,
    image: '/assets/covers/alipay-setup.jpg',
  },
  {
    path: '/guides/alipay-unblock',
    tag: 'Alipay',
    title: 'Как снять блокировку Alipay',
    minutes: 4,
    image: '/assets/alipay-unblock/cover.png',
  },
  {
    path: '/guides/alipay-china',
    tag: 'Alipay',
    title: 'Как платить через Alipay в Китае',
    minutes: 9,
    image: '/assets/alipay-china/01-hero.jpg',
  },
  {
    path: '/guides/tbank',
    tag: 'Т-Банк',
    title: 'Как перевести деньги через Т-Банк',
    minutes: 3,
    image: '/assets/covers/tbank.jpg',
  },
  {
    path: '/guides/poizon',
    tag: 'Poizon',
    title: 'Как заказать товары с Poizon: полная инструкция',
    minutes: 12,
    image: '/assets/covers/poizon.jpg',
  },
  {
    path: '/guides/taobao',
    tag: 'Taobao',
    title: 'Как заказать товары с Taobao: пошаговая инструкция',
    minutes: 12,
    image: '/assets/covers/taobao.jpg',
  },
  {
    path: '/guides/china-metro',
    tag: 'Поездки в Китай',
    title: 'Как оплачивать метро в Китае через Alipay',
    minutes: 8,
    image: '/assets/china-metro/hero.png',
  },
  {
    path: '/guides/china-taxi',
    tag: 'Поездки в Китай',
    title: 'Как заказать такси в Китае: гид по DiDi',
    minutes: 8,
    image: '/assets/china-taxi/01-hero.png',
  },
  {
    path: '/guides/china-bikes',
    tag: 'Поездки в Китай',
    title: 'Велосипеды и мопеды в Китае: как арендовать',
    minutes: 6,
    image: '/assets/covers/bikes.jpg',
  },
  {
    path: '/guides/china-50-things',
    tag: 'Поездки в Китай',
    title: '50 вещей о Китае, которые стоит знать',
    minutes: 18,
    image: '/assets/china-50-things/hero.jpg',
  },
]

// Три связанных материала: сначала из той же категории, затем — по порядку.
export function relatedGuides(currentPath: string, limit = 3): GuideEntry[] {
  const current = GUIDES.find((guide) => guide.path === currentPath)
  const others = GUIDES.filter((guide) => guide.path !== currentPath)

  if (!current) return others.slice(0, limit)

  const sameTag = others.filter((guide) => guide.tag === current.tag)
  const rest = others.filter((guide) => guide.tag !== current.tag)

  return [...sameTag, ...rest].slice(0, limit)
}
