'use client'

import { useEffect, useState } from 'react'
import { Header, MobileMenu } from './Header'
import { Hero, Marquee } from './Hero'
import { CalcSection } from './Sections'
import { RatesSection } from './RateChart'
import { Why, How, Platforms, Services, Office, Reviews, Faq, Contact } from './Sections'
import { TelegramSection, TgFloat } from './Telegram'
import { TbankPromo } from './TbankPromo'
import { Footer, MobileBar } from './Footer'
import { OrderModal } from './OrderModal'
import { useReveal } from './shared'
import type { CalcState, OrderPayload } from './Calculator'

export function HomePage() {
  const [menu, setMenu] = useState(false)
  const [order, setOrder] = useState<OrderPayload | null>(null)
  const [calc, setCalc] = useState<CalcState | null>(null)
  useReveal()

  useEffect(() => {
    document.body.style.overflow = menu || order ? 'hidden' : ''
  }, [menu, order])

  return (
    <>
      <Header onMenu={() => setMenu(true)} />
      <MobileMenu open={menu} onClose={() => setMenu(false)} />
      <Hero />
      <Marquee />
      <CalcSection onOrder={setOrder} onChange={setCalc} />
      <RatesSection />
      <Why />
      <How />
      <Platforms />
      <Services />
      <TbankPromo />
      <TelegramSection />
      <Office />
      <Reviews />
      <Faq />
      <Contact />
      <Footer />
      <MobileBar calc={calc} />
      <TgFloat />
      <OrderModal order={order} onClose={() => setOrder(null)} />
    </>
  )
}
