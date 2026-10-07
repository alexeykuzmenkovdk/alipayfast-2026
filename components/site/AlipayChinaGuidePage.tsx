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
  priority?: boolean
}

function Shot({ src, alt, width, height, caption, priority }: ShotProps) {
  const ratio = width / height
  const shape = ratio < 0.85 ? 'phone' : ratio < 1.25 ? 'square' : 'wide'
  const sizes =
    shape === 'phone'
      ? '(max-width: 360px) 100vw, 320px'
      : shape === 'square'
        ? '(max-width: 500px) 100vw, 460px'
        : '(max-width: 760px) 100vw, 720px'
  return (
    <figure className={'gp-figure gp-figure-' + shape}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        priority={priority}
        className="gp-shot"
      />
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  )
}

const TOC: [string, string][] = [
  ['1', 'Зачем туристу Alipay'],
  ['2', 'Настройка приложения'],
  ['3', 'Можно ли без китайского номера'],
  ['4', 'Как платить: магазины и онлайн'],
  ['5', 'Оплата транспорта'],
  ['6', 'Alipay или WeChat Pay'],
  ['7', 'Насколько это безопасно'],
  ['8', 'Пополнение баланса и курс'],
  ['9', 'Частые вопросы'],
]

export function AlipayChinaGuidePage() {
  return (
    <main className="gp">
      <section className="gp-hero">
        <div className="wrap">
          <Link href="/#top" className="gp-back">
            ← Вернуться на главную
          </Link>
          <div className="gp-hero-content">
            <div>
              <h1>Как платить через Alipay в Китае: полный гид для туриста</h1>
              <p className="gp-sub">
                Настройка приложения, пополнение баланса, оплата в магазинах и транспорте — без китайского счёта и
                китайского номера.
              </p>
            </div>
            <div className="gp-hero-icon">💳</div>
          </div>
        </div>
      </section>

      <section className="gp-content">
        <div className="wrap">
          <article className="gp-article">
            {/* Вступление */}
            <div className="gp-block">
              <Shot
                src="/assets/covers/alipay-china.jpg"
                alt="Обложка: оплата через Alipay в Китае"
                width={1248}
                height={832}
                priority
              />
              <h2>Наличные в Китае почти не нужны</h2>
              <p>
                В Китае бумажные деньги ушли на второй план: наличные не примут ни в уличной закусочной, ни в дорогом
                отеле. Везде ждут QR-код, и главное приложение для расчётов — <strong>Alipay</strong>.
              </p>
              <p>
                Приезжему это удобно: открывать счёт в китайском банке не нужно, а баланс кошелька можно пополнить
                через сервис <strong>AlipayFast</strong>. Ниже — по шагам, как всё настроить и где потом платить.
              </p>
              <div className="gp-alert">
                <p>
                  <strong>Что пригодится перед поездкой.</strong> Если Alipay у вас ещё не установлен, у нас есть{' '}
                  <Link href="/guides/alipay" className="gp-link">
                    подробная инструкция по регистрации и верификации
                  </Link>
                  , а про оплату метро — отдельный гайд ниже.
                </p>
              </div>
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
                  <h3>Зачем туристу Alipay</h3>
                  <p>Три причины, почему без него в Китае неудобно:</p>
                  <ul className="gp-list">
                    <li>
                      <strong>Принимают почти везде.</strong> Свыше 80 миллионов торговых точек: такси, метро, кафе,
                      мелкие лотки. Практически у каждого местного жителя Alipay стоит на телефоне.
                    </li>
                    <li>
                      <strong>Китайский счёт не нужен.</strong> Баланс кошелька пополняется через сервис AlipayFast —
                      открывать счёт в китайском банке и привязывать карты не требуется.
                    </li>
                    <li>
                      <strong>Всё в одном приложении.</strong> Оплата по QR-коду, разделение счёта, покупка билетов на
                      поезд и самолёт, бронирование отелей, перевод меню.
                    </li>
                  </ul>
                  <Shot
                    src="/assets/alipay-china/02-why.png"
                    alt="Ключевые возможности Alipay"
                    width={225}
                    height={225}
                    caption="Alipay закрывает почти все повседневные траты туриста"
                  />
                </div>
              </div>

              {/* 2 */}
              <div className="gp-step" id="2">
                <div className="gp-step-num">2</div>
                <div className="gp-step-content">
                  <h3>Настройка приложения</h3>
                  <p>Настройка занимает несколько минут. Удобнее сделать это ещё до поездки.</p>

                  <div className="gp-substeps">
                    <div className="gp-substep">
                      <h4>2.1. Скачиваем приложение</h4>
                      <ul className="gp-list">
                        <li>
                          <strong>iOS:</strong> ищите «Alipay» в App Store.
                        </li>
                        <li>
                          <strong>Android:</strong> приложение есть в Google Play и в Huawei AppGallery.
                        </li>
                      </ul>
                      <div className="gp-alert">
                        <p>
                          <strong>Совет.</strong> Скачайте и настройте приложение до вылета — в Китае бывают сложности
                          с доступом к некоторым магазинам приложений.
                        </p>
                      </div>
                      <Shot
                        src="/assets/alipay-china/03-download.png"
                        alt="Установка приложения Alipay"
                        width={1286}
                        height={643}
                        caption="Шаг 1. Устанавливаем приложение из магазина"
                      />
                    </div>

                    <div className="gp-substep">
                      <h4>2.2. Регистрируем аккаунт</h4>
                      <p>
                        Откройте приложение, нажмите «Sign Up» и укажите <strong>международный номер телефона</strong>.
                        Выберите страну и подтвердите номер кодом из СМС. Важно, чтобы номер принимал сообщения — код
                        придёт именно туда.
                      </p>
                      <Shot
                        src="/assets/alipay-china/04-register.png"
                        alt="Регистрация аккаунта в Alipay"
                        width={1299}
                        height={605}
                        caption="Шаг 2. Регистрация по зарубежному номеру"
                      />
                    </div>

                    <div className="gp-substep">
                      <h4>2.3. Подтверждаем личность</h4>
                      <p>
                        Этот шаг можно отложить, но с ним открываются повышенные лимиты. Путь такой:{' '}
                        <strong>Me → Settings → Account &amp; Security → Identity Verification</strong>. Загрузите фото
                        загранпаспорта, заполните данные и пройдите проверку по лицу.
                      </p>
                      <Shot
                        src="/assets/alipay-china/05-verify.png"
                        alt="Подтверждение личности в Alipay"
                        width={768}
                        height={1024}
                        caption="Шаг 3. Паспорт и проверка по лицу"
                      />
                    </div>

                    <div className="gp-substep">
                      <h4>2.4. Пополняем баланс</h4>
                      <p>
                        Платить в Китае удобнее с баланса кошелька, и пополнить его можно через сервис{' '}
                        <strong>AlipayFast</strong>. Перевод идёт по нашему курсу, без скрытых комиссий, а зачисление обычно занимает около 15 минут.
                      </p>
                      <p>
                        Для этого не нужны ни счёт в китайском банке, ни привязка карт — достаточно оформить пополнение
                        и дождаться зачисления на кошелёк.
                      </p>
                      <div className="gp-alert gp-alert-success">
                        <p>
                          <strong>Совет.</strong> Пополните баланс заранее, до вылета, — так в поездке не придётся
                          искать способ оплаты на месте. Написать нам можно в{' '}
                          <a href="https://t.me/alipayfast" target="_blank" rel="noopener noreferrer" className="gp-link">
                            Telegram
                          </a>
                          .
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3 */}
              <div className="gp-step" id="3">
                <div className="gp-step-num">3</div>
                <div className="gp-step-content">
                  <h3>Можно ли пользоваться без китайского номера</h3>
                  <p>
                    <strong>Да.</strong> Регистрация проходит по международному номеру, он же нужен для получения кодов
                    подтверждения.
                  </p>
                  <div className="gp-alert">
                    <p>
                      <strong>Нюанс.</strong> Отдельные функции — например, часть скидок и акций — могут требовать
                      китайский номер. Но обычные платежи по QR-коду работают и без него.
                    </p>
                  </div>
                </div>
              </div>

              {/* 4 */}
              <div className="gp-step" id="4">
                <div className="gp-step-num">4</div>
                <div className="gp-step-content">
                  <h3>Как платить: магазины и онлайн</h3>

                  <div className="gp-substeps">
                    <div className="gp-substep">
                      <h4>В магазинах и кафе</h4>
                      <ul className="gp-list">
                        <li>
                          Откройте Alipay, нажмите <strong>«Pay»</strong> и покажите продавцу свой код — он его
                          отсканирует, а сумма спишется с баланса кошелька.
                        </li>
                        <li>
                          Либо нажмите значок <strong>«Scan»</strong>, отсканируйте код продавца и введите сумму
                          самостоятельно.
                        </li>
                      </ul>
                      <Shot
                        src="/assets/alipay-china/08-pay.png"
                        alt="Оплата по QR-коду в магазине"
                        width={1080}
                        height={670}
                        caption="Оплата в магазине: код показываете вы или сканируете сами"
                      />
                      <Shot
                        src="/assets/alipay-china/09-store.png"
                        alt="Оплата на кассе через Alipay"
                        width={640}
                        height={360}
                      />
                    </div>

                    <div className="gp-substep">
                      <h4>Онлайн</h4>
                      <p>
                        Alipay пригодится и при бронировании: отели, поезда, авиабилеты на китайских платформах удобно
                        оплачивать прямо из приложения.
                      </p>
                      <Shot
                        src="/assets/alipay-china/10-online.png"
                        alt="Онлайн-оплата через Alipay"
                        width={1287}
                        height={543}
                        caption="Онлайн-оплата бронирований"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 5 */}
              <div className="gp-step" id="5">
                <div className="gp-step-num">5</div>
                <div className="gp-step-content">
                  <h3>Оплата транспорта</h3>
                  <ol>
                    <li>
                      Откройте Alipay и на главном экране нажмите иконку с автобусом — раздел <strong>«出行»</strong>
                      (поездки).
                    </li>
                    <li>
                      Выберите город, например Шанхай. Появятся варианты: метро, автобусы, велосипеды.
                    </li>
                    <li>Активируйте транспортную карту: примите условия и подтвердите выпуск.</li>
                    <li>
                      Один и тот же QR-код используется на входе и на выходе — прикладывайте телефон к сканеру турникета
                      в обе стороны.
                    </li>
                  </ol>
                  <Shot
                    src="/assets/alipay-china/11-transport.png"
                    alt="Оплата транспорта в Alipay"
                    width={2000}
                    height={1125}
                    caption="Транспортный раздел Alipay: метро, автобусы, велосипеды"
                  />
                  <div className="gp-alert">
                    <p>
                      Подробнее про проездные коды, турникеты и правило двух сканирований мы разобрали в отдельном гайде
                      —{' '}
                      <Link href="/guides/china-metro" className="gp-link">
                        «Как оплачивать метро в Китае через Alipay»
                      </Link>
                      .
                    </p>
                  </div>
                </div>
              </div>

              {/* 6 */}
              <div className="gp-step" id="6">
                <div className="gp-step-num">6</div>
                <div className="gp-step-content">
                  <h3>Alipay или WeChat Pay: что проще для туриста</h3>
                  <p>
                    Для короткой поездки удобнее Alipay: он проще в настройке и дружелюбнее к приезжим.
                  </p>
                  <Shot
                    src="/assets/alipay-china/12-compare.png"
                    alt="Сравнение Alipay и WeChat Pay"
                    width={750}
                    height={420}
                  />
                  <table className="gp-table">
                    <thead>
                      <tr>
                        <th>Критерий</th>
                        <th>Alipay</th>
                        <th>WeChat Pay</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Китайский счёт в банке</td>
                        <td className="yes">Не нужен</td>
                        <td className="no">Нужен</td>
                      </tr>
                      <tr>
                        <td>Китайский ID</td>
                        <td className="yes">Не нужен</td>
                        <td className="no">Обычно нужен</td>
                      </tr>
                      <tr>
                        <td>Номер телефона</td>
                        <td className="yes">Подходит международный</td>
                        <td>Обычно нужен китайский</td>
                      </tr>
                      <tr>
                        <td>Пополнение баланса</td>
                        <td className="yes">Через сервис AlipayFast</td>
                        <td>Непросто для приезжего</td>
                      </tr>
                      <tr>
                        <td>Проверка личности</td>
                        <td>Простая</td>
                        <td>Больше шагов и ограничений</td>
                      </tr>
                      <tr>
                        <td>Удобство для туриста</td>
                        <td className="yes">Легко</td>
                        <td className="no">Сложно</td>
                      </tr>
                    </tbody>
                  </table>
                  <p>
                    Если планируете жить в Китае долго или регулярно переводить деньги друзьям, стоит завести оба
                    приложения. Для обычной поездки достаточно Alipay.
                  </p>
                </div>
              </div>

              {/* 7 */}
              <div className="gp-step" id="7">
                <div className="gp-step-num">7</div>
                <div className="gp-step-content">
                  <h3>Насколько это безопасно</h3>
                  <p>Да, если соблюдать базовые правила.</p>
                  <ul className="gp-list">
                    <li>Alipay использует банковское шифрование и следит за подозрительными операциями.</li>
                    <li>Данные вашего кошелька не передаются продавцу напрямую.</li>
                    <li>
                      Для дополнительной защиты включите оплату по отпечатку или лицу и задайте платёжный пароль.
                    </li>
                    <li>
                      Платёжный пароль и код входа храните в надёжном месте: восстановить их иногда невозможно.
                    </li>
                  </ul>
                </div>
              </div>

              {/* 8 */}
              <div className="gp-step" id="8">
                <div className="gp-step-num">8</div>
                <div className="gp-step-content">
                  <h3>Пополнение баланса и курс</h3>
                  <p>
                    Мы исходим из того, что баланс кошелька вы пополняете через сервис <strong>AlipayFast</strong>.
                    Пополнение идёт по нашему курсу: итоговая сумма известна заранее, скрытых
                    комиссий нет.
                  </p>
                  <p>
                    В поездке оплата списывается прямо с баланса в юанях, поэтому дополнительных сборов за зарубежную
                    операцию и конвертацию не возникает — платите ровно столько, сколько стоит товар.
                  </p>

                  <h4 className="gp-h4">Что стоит помнить</h4>
                  <ul className="gp-list">
                    <li>курс фиксируется в момент пополнения;</li>
                    <li>удобнее пополнить кошелёк заранее, до вылета;</li>
                    <li>если поездка затянулась, пополнение можно повторить.</li>
                  </ul>

                  <div className="gp-alert gp-alert-success">
                    <p>
                      <strong>Как сэкономить.</strong> Пополните баланс заранее и на нужную сумму — тогда в поездке не
                      придётся искать способ оплаты на месте и переплачивать за срочность.
                    </p>
                  </div>
                </div>
              </div>

              {/* 9 */}
              <div className="gp-step" id="9">
                <div className="gp-step-num">9</div>
                <div className="gp-step-content">
                  <h3>Частые вопросы</h3>
                  <div className="gp-substeps">
                    <div className="gp-substep">
                      <h4>Можно ли платить без китайского счёта в банке?</h4>
                      <p>
                        Да. Счёт в китайском банке не нужен: баланс кошелька пополняется через сервис AlipayFast, а
                        покупки оплачиваются уже с этого баланса.
                      </p>
                    </div>
                    <div className="gp-substep">
                      <h4>Нужен ли китайский номер телефона?</h4>
                      <p>
                        Нет. Регистрация проходит по зарубежному номеру, хотя часть дополнительных функций может быть
                        ограничена.
                      </p>
                    </div>
                    <div className="gp-substep">
                      <h4>Где реально принимают Alipay?</h4>
                      <p>В большинстве магазинов, кафе, такси и туристических мест Китая.</p>
                    </div>
                    <div className="gp-substep">
                      <h4>Нужно ли знать китайский?</h4>
                      <p>
                        Нет. В приложении есть английский интерфейс, а для оплаты достаточно отсканировать код и
                        подтвердить сумму.
                      </p>
                    </div>
                    <div className="gp-substep">
                      <h4>Почему платёж иногда не проходит?</h4>
                      <p>
                        Обычно причин две: на балансе не хватает средств или подводит связь. Проверьте баланс кошелька и
                        повторите попытку.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="gp-cta">
              <h2>Пополнить Alipay перед поездкой</h2>
              <p>
                Поможем с пополнением кошелька: наш курс, без скрытых комиссий. Зачисление
                обычно занимает около 15 минут.
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
