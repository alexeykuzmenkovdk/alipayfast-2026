// Единственный источник данных о компании.
//
// Отсюда берут значения: футер, блок офиса, JSON-LD, гео-мета и карта.
// Меняем данные только здесь — тогда NAP (имя, адрес, телефон) не разъедется
// между разметкой и содержимым страниц.
//
// Координаты офиса можно переопределить переменными окружения, чтобы правка
// не требовала изменения кода.

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://alipayfast.ru').replace(/\/$/, '')

function coord(raw: string | undefined, fallback: number) {
  const value = Number(raw)
  return Number.isFinite(value) ? value : fallback
}

export const COMPANY = {
  name: 'AlipayFast',
  legalName: 'AlipayFast',
  tagline: 'Пополнение Alipay юанями',
  url: siteUrl,

  // Контакты
  phone: '+7 924 339-49-24',
  phoneRaw: '+79243394924',
  email: 'zakaz.alipayfast@gmail.com',
  telegram: 'https://t.me/alipayfast',
  telegramHandle: '@alipayfast',
  whatsapp: 'https://wa.me/79243394924',

  // Адрес офиса
  street: 'Краснознамённый переулок, д. 5',
  locality: 'Владивосток',
  region: 'Приморский край',
  postalCode: '690091',
  country: 'RU',
  district: 'Ленинский район',

  // Координаты (уточняются по карточке офиса на Яндекс.Картах)
  latitude: coord(process.env.NEXT_PUBLIC_OFFICE_LAT, 43.1159),
  longitude: coord(process.env.NEXT_PUBLIC_OFFICE_LNG, 131.8865),

  // Часы работы
  hours: [
    { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '10:00', closes: '19:00' },
    { days: ['Saturday'], opens: '11:00', closes: '17:00' },
  ],
} as const

export const FULL_ADDRESS = `${COMPANY.street}, ${COMPANY.locality}, ${COMPANY.postalCode}`

export const OFFICE_MAP_SRC = `https://yandex.ru/map-widget/v1/?text=${encodeURIComponent(
  `${COMPANY.locality}, ${COMPANY.street}`,
)}&z=17`
