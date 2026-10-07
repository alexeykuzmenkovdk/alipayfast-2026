'use client'

import Link from 'next/link'
import Image from 'next/image'
import { TgIcon } from './shared'

type ShotProps = {
  src: string
  alt: string
  width: number
  height: number
  caption?: string
}

function Shot({ src, alt, width, height, caption }: ShotProps) {
  const ratio = width / height
  const shape = ratio < 0.85 ? 'phone' : ratio < 1.25 ? 'square' : 'wide'
  return (
    <figure className={'gp-figure gp-figure-' + shape}>
      <Image src={src} alt={alt} width={width} height={height} className="gp-shot" />
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  )
}

const TOC: [string, string][] = [
  ['1', 'Синие велосипеды — Hello Bike'],
  ['2', 'Бирюзовые велосипеды — Didi Bike'],
  ['3', 'Жёлтые велосипеды'],
  ['4', 'Как арендовать: пошагово'],
  ['5', 'Оплата аренды'],
  ['6', 'Дорожки и безопасность'],
  ['7', 'Что ещё важно знать'],
]

export function ChinaBikesGuidePage() {
  return (
    <main className="gp">
      <section className="gp-hero">
        <div className="wrap">
          <Link href="/#top" className="gp-back">
            ← Вернуться на главную
          </Link>
          <div className="gp-hero-content">
            <div>
              <h1>Велосипеды и мопеды в Китае: как арендовать туристу</h1>
              <p className="gp-sub">
                Разбираем синие, бирюзовые и жёлтые велосипеды: чем сервисы отличаются, как разблокировать транспорт и
                чем платить.
              </p>
            </div>
            <div className="gp-hero-icon">🚲</div>
          </div>
        </div>
      </section>

      <section className="gp-content">
        <div className="wrap">
          <article className="gp-article">
            {/* Вступление */}
            <div className="gp-block">
              <Shot
                src="/assets/china-bikes/bike-01.jpg"
                alt="Прокатные велосипеды на улице китайского города"
                width={1080}
                height={1440}
                caption="Прокатные велосипеды встречаются в Китае буквально на каждом шагу"
              />
              <h2>Почему это удобно</h2>
              <p>
                В Китае прокатные велосипеды расставлены повсюду — синие, бирюзовые, жёлтые. Для туриста это один из
                самых быстрых и дешёвых способов передвижения по городу: короткая поездка часто занимает меньше времени,
                чем дорога на машине в пробке.
              </p>
              <p>
                Главное — понимать, чем сервисы отличаются друг от друга. Одни легко разблокировать приезжему, с
                другими возникают сложности. Разберём по порядку.
              </p>
            </div>

            {/* Содержание */}
            <nav className="gp-toc" aria-label="Содержание">
              <h2>Содержание</h2>
              <ol>
                {TOC.map(([id, title]) => (
                  <li key={id}>
                    <a href={'#' + id}>{title}</a>
                  </li>
                ))}
              </ol>
            </nav>

            <div className="gp-steps">
              {/* 1 */}
              <div className="gp-step" id="1">
                <div className="gp-step-num">1</div>
                <div className="gp-step-content">
                  <h3>Синие велосипеды — Hello Bike (HelloRide)</h3>
                  <p>
                    Самый распространённый сервис аренды в стране и, пожалуй, самый удобный для приезжих. Его чаще всего
                    и используют туристы:
                  </p>
                  <ul className="gp-list">
                    <li>велосипеды легко найти у выходов из метро;</li>
                    <li>на улицах много и велосипедов, и мопедов;</li>
                    <li>удобно для коротких поездок по городу.</li>
                  </ul>
                  <p>
                    Поездка на велосипеде обычно стоит около <strong>¥1,5–3</strong>, аренда мопеда — примерно{' '}
                    <strong>¥5–15</strong>.
                  </p>
                  <Shot
                    src="/assets/china-bikes/bike-02.jpg"
                    alt="Синие велосипеды Hello Bike на парковке"
                    width={1080}
                    height={1440}
                    caption="Синие велосипеды Hello Bike"
                  />
                </div>
              </div>

              {/* 2 */}
              <div className="gp-step" id="2">
                <div className="gp-step-num">2</div>
                <div className="gp-step-content">
                  <h3>Бирюзовые велосипеды — Didi Bike</h3>
                  <p>
                    Это транспорт сервиса Didi, знакомого всем, кто заказывал в Китае такси. Его плюсы:
                  </p>
                  <ul className="gp-list">
                    <li>велосипед и такси живут в одном приложении;</li>
                    <li>можно быстро пересесть с велосипеда на машину;</li>
                    <li>интерфейс чаще адаптирован для иностранцев.</li>
                  </ul>
                  <p>
                    В части городов через Didi доступны и мопеды для коротких городских поездок. Цены примерно те же:
                    велосипед — от <strong>¥1,5</strong>, мопед — около <strong>¥5–15</strong>.
                  </p>
                  <Shot
                    src="/assets/china-bikes/bike-03.jpg"
                    alt="Бирюзовые велосипеды Didi Bike"
                    width={1080}
                    height={1440}
                    caption="Бирюзовые велосипеды Didi Bike"
                  />
                </div>
              </div>

              {/* 3 */}
              <div className="gp-step" id="3">
                <div className="gp-step-num">3</div>
                <div className="gp-step-content">
                  <h3>Жёлтые велосипеды</h3>
                  <p>
                    С ними у туристов возникает больше всего проблем: для аренды нередко требуется полноценная
                    верификация. Из-за этого иностранец часто не может завершить регистрацию или разблокировать
                    велосипед.
                  </p>
                  <Shot
                    src="/assets/china-bikes/bike-04.jpg"
                    alt="Жёлтые велосипеды на улице"
                    width={1080}
                    height={1440}
                    caption="Жёлтые велосипеды чаще требуют полной верификации"
                  />
                </div>
              </div>

              {/* 4 */}
              <div className="gp-step" id="4">
                <div className="gp-step-num">4</div>
                <div className="gp-step-content">
                  <h3>Как арендовать: пошагово</h3>
                  <ol>
                    <li>Откройте приложение нужного сервиса.</li>
                    <li>Отсканируйте QR-код на руле велосипеда.</li>
                    <li>Подтвердите аренду.</li>
                    <li>
                      После поездки припаркуйте транспорт в разрешённой зоне и завершите аренду в приложении.
                    </li>
                  </ol>
                  <Shot
                    src="/assets/china-bikes/bike-05.jpg"
                    alt="QR-код на руле прокатного велосипеда"
                    width={1080}
                    height={1440}
                    caption="Аренда начинается со сканирования QR-кода на руле"
                  />
                </div>
              </div>

              {/* 5 */}
              <div className="gp-step" id="5">
                <div className="gp-step-num">5</div>
                <div className="gp-step-content">
                  <h3>Оплата аренды</h3>
                  <p>
                    Списание обычно происходит автоматически — через <strong>Alipay</strong> или привязанную
                    банковскую карту. Поэтому перед поездкой стоит заранее позаботиться о кошельке.
                  </p>
                  <div className="gp-alert">
                    <p>
                      Если Alipay ещё не установлен или баланс пуст, загляните в нашу{' '}
                      <Link href="/guides/alipay" className="gp-link">
                        подробную инструкцию по Alipay
                      </Link>
                      .
                    </p>
                  </div>
                  <p>
                    Отдельно проверьте, что на телефоне есть интернет: без связи приложение не откроет замок и не
                    завершит аренду.
                  </p>
                </div>
              </div>

              {/* 6 */}
              <div className="gp-step" id="6">
                <div className="gp-step-num">6</div>
                <div className="gp-step-content">
                  <h3>Дорожки и безопасность</h3>
                  <p>
                    В Китае для велосипедов и мопедов часто выделены отдельные дорожки, полосы и специальные знаки на
                    дорогах. Но движение на них бывает очень плотным, поэтому туристам стоит быть особенно внимательными.
                  </p>
                  <Shot
                    src="/assets/china-bikes/bike-06.jpg"
                    alt="Велосипедная дорожка в китайском городе"
                    width={1080}
                    height={1440}
                    caption="По возможности держитесь выделенных велодорожек"
                  />
                </div>
              </div>

              {/* 7 */}
              <div className="gp-step" id="7">
                <div className="gp-step-num">7</div>
                <div className="gp-step-content">
                  <h3>Что ещё важно знать</h3>
                  <ul className="gp-list">
                    <li>велосипед нельзя оставлять где угодно: парковка проверяется по GPS, и приложение может не дать завершить аренду вне разрешённой зоны;</li>
                    <li>у многих мопедов есть голосовые оповещения;</li>
                    <li>некоторые мопеды автоматически выдают шлем;</li>
                    <li>многие мопеды ограничены по скорости;</li>
                    <li>у части мопедов есть ограничение зоны поездки;</li>
                    <li>без интернета пользоваться такими сервисами будет сложно.</li>
                  </ul>
                  <Shot
                    src="/assets/china-bikes/bike-07.jpg"
                    alt="Мопеды для аренды на улице города"
                    width={1080}
                    height={1440}
                    caption="Мопеды удобны для коротких поездок, но требуют внимания на дороге"
                  />
                  <p>
                    В Китае такие велосипеды и мопеды — часть обычной городской жизни. Иногда на них добраться до
                    нужного места получается быстрее, чем на машине.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="gp-cta">
              <h2>Едете в Китай?</h2>
              <p>
                Поможем пополнить Alipay — им удобно платить за аренду велосипедов, метро, такси и покупки. Курс ЦБ РФ
                плюс прозрачная надбавка, без скрытых комиссий.
              </p>
              <div className="gp-contacts">
                <a href="https://t.me/alipayfast" target="_blank" rel="noopener noreferrer" className="btn btn-red">
                  <TgIcon size={18} /> Написать в Telegram
                </a>
                <a href="https://wa.me/79243394924" target="_blank" rel="noopener noreferrer" className="btn">
                  WhatsApp
                </a>
              </div>
            </div>
          </article>
        </div>
      </section>
    </main>
  )
}
