'use client'

import Link from 'next/link'
import Image from 'next/image'

export function TbankPromo() {
  return (
    <section className="tp-section">
      <div className="wrap">
        <div className="tp-content">
          <div className="tp-text">
            <span className="tp-tag">Новое</span>
            <h2>Как быстро пополнить Alipay</h2>
            <p>Подробная инструкция по переводу денег через Т-Банк с пошаговыми скриншотами</p>
            <div className="tp-meta">
              <span>21.09.2026</span>
              <span>Читать 3 мин</span>
            </div>
            <Link href="/guides/tbank" className="btn btn-red">
              Читать инструкцию →
            </Link>
          </div>
          <div className="tp-image">
            <Image
              src="/assets/covers/tbank.jpg"
              alt="Перевод денег через Т-Банк для пополнения Alipay"
              width={640}
              height={427}
              sizes="(max-width: 900px) 100vw, 480px"
              className="tp-img"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
