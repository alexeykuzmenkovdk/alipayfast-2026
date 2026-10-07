import type { Metadata } from 'next'
import '@/components/site/materials.css'
import { MaterialsPage } from '@/components/site/MaterialsPage'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: "Полезные материалы: инструкции по Alipay и Китаю",
  description: "Гайды по Alipay, Poizon, Taobao и поездкам в Китай: пошаговые инструкции со скриншотами — установка, оплата, метро, такси и обмен юаней.",
  path: "/materials",
  image: "/assets/covers/alipay-setup.jpg",
})

export default function Page() {
  return <MaterialsPage />
}
