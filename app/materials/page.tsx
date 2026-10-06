import type { Metadata } from 'next'
import '@/components/site/materials.css'
import { MaterialsPage } from '@/components/site/MaterialsPage'

export const metadata: Metadata = {
  title: 'Полезные материалы — AlipayFast',
  description: 'Инструкции по Alipay, Poizon, Taobao и поездкам в Китай. Пошагово, со скриншотами, на русском.',
}

export default function Page() {
  return <MaterialsPage />
}
