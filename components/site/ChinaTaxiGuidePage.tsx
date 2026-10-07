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
  ['1', 'Что такое DiDi'],
  ['2', 'Установка и настройка'],
  ['3', 'Оплата поездок'],
  ['4', 'Как заказать машину'],
  ['5', 'Отмена заказа'],
  ['6', 'Безопасность и советы'],
  ['7', 'DiDi внутри Alipay и WeChat'],
  ['8', 'Типы машин'],
  ['9', 'Сколько стоит поездка'],
  ['10', 'Не только машины'],
  ['11', 'Частые вопросы'],
]

export function ChinaTaxiGuidePage() {
  return (
    <main className="gp">
      <section className="gp-hero">
        <div className="wrap">
          <div className="gp-hero-content">
            <div>
              <h1>Как заказать такси в Китае: гид по DiDi для туриста</h1>
              <p className="gp-sub">
                Установка приложения, оплата поездок, выбор тарифа и безопасность — всё, что нужно знать приезжему о
                главном сервисе такси в Китае.
              </p>
            </div>
            <div className="gp-hero-icon">🚕</div>
          </div>
        </div>
      </section>

      <section className="gp-content">
        <div className="wrap">
          <article className="gp-article">
            {/* Вступление */}
            <div className="gp-block">
              <Shot
                src="/assets/covers/taxi.jpg"
                alt="Обложка: такси в Китае, DiDi"
                width={1248}
                height={832}
                priority
              />
              <h2>Коротко о главном</h2>
              <p>
                DiDi — главное приложение для заказа такси в Китае, местный аналог Uber. Им спокойно пользуются
                иностранцы: подойдёт обычный номер телефона, интерфейс переключается на английский.
              </p>
              <p>
                Заказать можно машину, велосипед и даже автобус — в большинстве городов страны. Оплата проходит без
                наличных, а поездка выходит дешевле классического такси.
              </p>
              <div className="gp-alert">
                <p>
                  <strong>Что понадобится.</strong> Телефон с интернетом и кошелёк Alipay с положительным балансом: из
                  него чаще всего и списывается оплата. Пополнить баланс заранее удобно через сервис{' '}
                  <strong>AlipayFast</strong> — по выгодному курсу и без скрытых комиссий.
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
                  <h3>Что такое DiDi</h3>
                  <p>
                    DiDi — крупнейший сервис поездок в Китае. Регистрация проходит по международному номеру, а в
                    приложении есть английский язык, поэтому языковой барьер почти не мешает.
                  </p>
                  <p>Возможности шире, чем у обычного такси:</p>
                  <ul className="gp-list">
                    <li>заказ машин разных классов;</li>
                    <li>велосипеды и самокаты;</li>
                    <li>городские автобусы;</li>
                    <li>услуга «трезвый водитель» — он приедет и поведёт вашу машину домой.</li>
                  </ul>
                  <p>
                    Цена известна заранее, а встроенный переводчик помогает переписываться с водителем, даже если вы не
                    знаете китайского.
                  </p>
                  <Shot
                    src="/assets/china-taxi/02-logo.png"
                    alt="Логотип приложения DiDi"
                    width={1280}
                    height={419}
                  />
                </div>
              </div>

              {/* 2 */}
              <div className="gp-step" id="2">
                <div className="gp-step-num">2</div>
                <div className="gp-step-content">
                  <h3>Установка и настройка</h3>
                  <p>
                    Скачайте в магазине приложений <strong>DiDi</strong> — ищите именно официальное приложение, чтобы не
                    наткнуться на копии.
                  </p>
                  <p>
                    Регистрация проходит по обычному номеру телефона: китайская SIM-карта не нужна. Чтобы принять код
                    подтверждения, включите роуминг или позаботьтесь об интернете в поездке.
                  </p>
                  <p>
                    Сразу смените язык: <strong>Settings → Language → English</strong>. С английским разобраться в
                    приложении гораздо проще.
                  </p>
                  <Shot
                    src="/assets/china-taxi/03-setup.webp"
                    alt="Установка и настройка DiDi"
                    width={943}
                    height={662}
                    caption="Устанавливаем приложение и сразу переключаем язык на английский"
                  />
                </div>
              </div>

              {/* 3 */}
              <div className="gp-step" id="3">
                <div className="gp-step-num">3</div>
                <div className="gp-step-content">
                  <h3>Оплата поездок</h3>
                  <h4 className="gp-h4">Включите автооплату</h4>
                  <p>
                    Зайдите в раздел <strong>Me</strong>, затем <strong>Wallet → Payment Methods</strong> и включите
                    автоплатёж. Тогда после поездки не придётся ничего искать — сумма спишется сама.
                  </p>

                  <h4 className="gp-h4">Чем платить</h4>
                  <p>
                    Удобнее всего расплачиваться с баланса <strong>Alipay</strong>: деньги списываются автоматически, без
                    лишних действий. Именно поэтому баланс кошелька стоит пополнить заранее — через сервис{' '}
                    <strong>AlipayFast</strong> это занимает около 15 минут, а курс известен до оплаты.
                  </p>

                  <h4 className="gp-h4">Наличные — редкость</h4>
                  <p>
                    Некоторые водители принимают наличные, но так делают немногие. Если хотите уточнить, спросите:
                    «Kěyǐ yòng xiànjīn ma?» («Можно наличными?»). Но проще настроить автоплатёж и не отвлекаться.
                  </p>
                  <Shot
                    src="/assets/china-taxi/04-payment.png"
                    alt="Настройка способа оплаты в DiDi"
                    width={1104}
                    height={697}
                    caption="Настройте способ оплаты сразу после установки"
                  />
                </div>
              </div>

              {/* 4 */}
              <div className="gp-step" id="4">
                <div className="gp-step-num">4</div>
                <div className="gp-step-content">
                  <h3>Как заказать машину</h3>

                  <h4 className="gp-h4">Точка подачи</h4>
                  <p>
                    Включите геолокацию и внимательно проверьте метку на карте: улицы в Китае бывают запутанными, а
                    одинаковых вывесок рядом хватает. Адрес назначения можно ввести латиницей или пиньинем — например,
                    «Beijing Railway Station».
                  </p>

                  <h4 className="gp-h4">Выбор тарифа</h4>
                  <p>
                    Чаще всего достаточно <strong>DiDi Express</strong> — простые машины по невысокой цене. Для поездки
                    из аэропорта или после долгого перелёта приятнее <strong>Premier</strong>: машины чище и тише.
                  </p>

                  <h4 className="gp-h4">Подтверждение</h4>
                  <ol>
                    <li>нажмите «Confirm Request»;</li>
                    <li>
                      сделайте скриншот номера машины — например, «沪A·12345»;
                    </li>
                    <li>
                      когда водитель приедет, покажите последние 4 цифры своего номера телефона: так он убедится, что
                      нашёл нужного пассажира.
                    </li>
                  </ol>
                  <Shot
                    src="/assets/china-taxi/05-booking.webp"
                    alt="Процесс заказа поездки в DiDi"
                    width={921}
                    height={762}
                    caption="Проверьте точку подачи и подтвердите заказ"
                  />
                </div>
              </div>

              {/* 5 */}
              <div className="gp-step" id="5">
                <div className="gp-step-num">5</div>
                <div className="gp-step-content">
                  <h3>Отмена заказа</h3>
                  <p>
                    Если планы изменились, отмените поездку в первые <strong>2 минуты</strong> — это бесплатно. Позже
                    начнёт действовать сбор: обычно <strong>&#165;3–5</strong> (около 40–60 рублей).
                  </p>
                  <p>
                    Если водитель задержался или поехал странным маршрутом, сбор можно оспорить прямо в приложении. Так
                    же стоит поступить, если заказ отменил водитель.
                  </p>
                </div>
              </div>

              {/* 6 */}
              <div className="gp-step" id="6">
                <div className="gp-step-num">6</div>
                <div className="gp-step-content">
                  <h3>Безопасность и советы</h3>
                  <ul className="gp-list">
                    <li>
                      <strong>Сверяйте номер машины.</strong> Он должен совпадать с тем, что указан в приложении. Если
                      нет — отмените заказ и сообщите об этом.
                    </li>
                    <li>
                      <strong>Делитесь поездкой.</strong> Кнопка «Share Trip» отправит близким маршрут и данные машины.
                    </li>
                    <li>
                      <strong>Кнопка SOS.</strong> Если что-то пошло не так, она свяжет со службой поддержки и
                      экстренными службами.
                    </li>
                    <li>
                      <strong>Пишите в чат приложения.</strong> Встроенный переводчик поможет объясниться: например,
                      «Я в синем рюкзаке у выхода из метро».
                    </li>
                    <li>
                      <strong>Забыли вещь?</strong> В разделе «Lost Item» можно связаться с водителем. Водители охотнее
                      отвечают, если предложить небольшое вознаграждение.
                    </li>
                    <li>
                      <strong>Избегайте часа пик.</strong> С 7:00 до 9:00 и с 17:00 до 19:00 цены заметно выше, а подача
                      дольше.
                    </li>
                  </ul>
                  <div className="gp-alert">
                    <p>
                      <strong>Про службу поддержки.</strong> Горячая линия DiDi — <strong>400-000-0999</strong>, но
                      звонить туда из-за границы неудобно. Обычные вопросы проще решать в чате приложения.
                    </p>
                  </div>
                </div>
              </div>

              {/* 7 */}
              <div className="gp-step" id="7">
                <div className="gp-step-num">7</div>
                <div className="gp-step-content">
                  <h3>DiDi внутри Alipay и WeChat</h3>
                  <p>
                    Отдельное приложение ставить не обязательно: DiDi работает и как мини-программа внутри Alipay и
                    WeChat. Тогда оплата проходит автоматически с баланса кошелька — и это ещё один повод держать кошелёк
                    пополненным.
                  </p>

                  <h4 className="gp-h4">Как заказать в Alipay</h4>
                  <ol>
                    <li>
                      Откройте Alipay и нажмите раздел <strong>«Транспорт»</strong> (иконка с машиной).
                    </li>
                    <li>
                      Выберите <strong>«Такси»</strong> — появится DiDi как доступный сервис.
                    </li>
                    <li>Укажите точку подачи и адрес, выберите класс машины и подтвердите заказ.</li>
                  </ol>
                  <p>
                    Если баланс кошелька пуст, поездка не пройдёт — но пополнение через{' '}
                    <strong>AlipayFast</strong> решает вопрос за несколько минут.
                  </p>
                  <Shot
                    src="/assets/china-taxi/06-alipay.webp"
                    alt="Заказ DiDi через Alipay"
                    width={1280}
                    height={1422}
                    caption="Мини-программа DiDi внутри Alipay"
                  />

                  <h4 className="gp-h4">Как заказать в WeChat</h4>
                  <ol>
                    <li>
                      Откройте WeChat → <strong>Discover → Mini Programs</strong>.
                    </li>
                    <li>
                      Введите в поиске <strong>滴滴出行</strong> — по-английски «didi» обычно не находится.
                    </li>
                    <li>Оплата пройдёт через WeChat Pay.</li>
                  </ol>
                  <p>
                    Пригодятся и иероглифы классов машин: <strong>快车</strong> — Express, <strong>专车</strong> —
                    Premier.
                  </p>
                  <Shot
                    src="/assets/china-taxi/07-wechat.webp"
                    alt="Заказ DiDi через WeChat"
                    width={1280}
                    height={904}
                    caption="Мини-программа DiDi внутри WeChat"
                  />
                </div>
              </div>

              {/* 8 */}
              <div className="gp-step" id="8">
                <div className="gp-step-num">8</div>
                <div className="gp-step-content">
                  <h3>Типы машин</h3>
                  <p>Выбор тарифа в DiDi — как между обычной лапшой и праздничным ужином. Разбираем варианты:</p>
                  <table className="gp-table">
                    <thead>
                      <tr>
                        <th>Тариф</th>
                        <th>Что за машина</th>
                        <th>Цена (Пекин, 30 мин)</th>
                        <th>Кому подойдёт</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Express (快车)</td>
                        <td>Простые машины без излишеств</td>
                        <td>&#165;35–50 &#8776; 420–600 &#8381;</td>
                        <td>Короткие поездки по городу</td>
                      </tr>
                      <tr>
                        <td>Premier (专车)</td>
                        <td>Чистые машины, вода, спокойная езда</td>
                        <td>&#165;60–80 &#8776; 720–960 &#8381;</td>
                        <td>Аэропорт, деловые поездки</td>
                      </tr>
                      <tr>
                        <td>Luxe (豪华车)</td>
                        <td>Mercedes-Benz, зонт, зарядка</td>
                        <td>В 2–3 раза дороже Express</td>
                        <td>Особые случаи</td>
                      </tr>
                      <tr>
                        <td>Express Pool (拼车)</td>
                        <td>Поездка с попутчиками</td>
                        <td>На 30–50% дешевле Express</td>
                        <td>Когда время не поджимает</td>
                      </tr>
                    </tbody>
                  </table>
                  <p>
                    После выбора тарифа пролистайте варианты влево — в некоторых городах доступны минивэны и
                    электромобили.
                  </p>
                  <Shot
                    src="/assets/china-taxi/08-car-types.webp"
                    alt="Выбор типа машины в DiDi"
                    width={942}
                    height={750}
                    caption="Тарифы различаются ценой и уровнем комфорта"
                  />
                </div>
              </div>

              {/* 9 */}
              <div className="gp-step" id="9">
                <div className="gp-step-num">9</div>
                <div className="gp-step-content">
                  <h3>Сколько стоит поездка</h3>
                  <p>Цена собирается из нескольких частей:</p>
                  <ul className="gp-list">
                    <li>
                      <strong>Базовая ставка:</strong> примерно &#165;10–15 в зависимости от города.
                    </li>
                    <li>
                      <strong>За километр:</strong> около &#165;2–4 — обычно дешевле классического такси.
                    </li>
                    <li>
                      <strong>За минуту ожидания в пробке:</strong> примерно &#165;0,5–1.
                    </li>
                    <li>
                      <strong>Повышающий коэффициент:</strong> в часы пик цена может вырасти вдвое.
                    </li>
                  </ul>

                  <h4 className="gp-h4">Пример: 20 минут, 8 км в Пекине</h4>
                  <ul className="gp-list">
                    <li>Express: &#165;30–40 (около 360–480 &#8381;)</li>
                    <li>Premier: &#165;50–70 (около 600–840 &#8381;)</li>
                  </ul>
                  <p>
                    Оплата списывается с баланса кошелька, поэтому лишних конвертаций при поездке не возникает — баланс
                    уже в юанях.
                  </p>
                </div>
              </div>

              {/* 10 */}
              <div className="gp-step" id="10">
                <div className="gp-step-num">10</div>
                <div className="gp-step-content">
                  <h3>Не только машины</h3>
                  <p>DiDi — это целый транспортный набор в одном приложении:</p>
                  <table className="gp-table">
                    <thead>
                      <tr>
                        <th>Сервис</th>
                        <th>Что это</th>
                        <th>Цена (юани)</th>
                        <th>Кому подойдёт</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>DiDi Bike (青桔)</td>
                        <td>Зелёные электровелосипеды и самокаты</td>
                        <td>&#165;1,5 за 30 минут</td>
                        <td>Короткие поездки от метро</td>
                      </tr>
                      <tr>
                        <td>DiDi Bus</td>
                        <td>Автобусы по фиксированным маршрутам</td>
                        <td>&#165;2–5</td>
                        <td>Экономичные поездки по городу</td>
                      </tr>
                      <tr>
                        <td>Трезвый водитель (代驾)</td>
                        <td>Водитель приедет и поведёт вашу машину</td>
                        <td>&#165;100–200</td>
                        <td>Если вы за рулём и выпили</td>
                      </tr>
                      <tr>
                        <td>Международные поездки</td>
                        <td>Предзаказ в Японии, Австралии, Мексике и др.</td>
                        <td>Зависит от страны</td>
                        <td>Продолжение маршрута за пределами Китая</td>
                      </tr>
                    </tbody>
                  </table>
                  <p>
                    Про аренду велосипедов и мопедов у нас есть отдельный гайд —{' '}
                    <Link href="/guides/china-bikes" className="gp-link">
                      велосипеды и мопеды в Китае
                    </Link>
                    .
                  </p>
                </div>
              </div>

              {/* 11 */}
              <div className="gp-step" id="11">
                <div className="gp-step-num">11</div>
                <div className="gp-step-content">
                  <h3>Частые вопросы</h3>
                  <div className="gp-substeps">
                    <div className="gp-substep">
                      <h4>Иностранец может пользоваться DiDi?</h4>
                      <p>
                        Да. Нужен загранпаспорт и международный номер телефона — в приложении есть английский язык.
                      </p>
                    </div>
                    <div className="gp-substep">
                      <h4>Нужен ли китайский номер?</h4>
                      <p>
                        Нет, подойдёт любой международный. Главное — чтобы на него пришёл код подтверждения при
                        регистрации.
                      </p>
                    </div>
                    <div className="gp-substep">
                      <h4>Как оплачивать поездки?</h4>
                      <p>
                        Проще всего с баланса Alipay — тогда сумма списывается автоматически. Достаточно следить, чтобы
                        кошелёк был пополнен.
                      </p>
                    </div>
                    <div className="gp-substep">
                      <h4>DiDi работает по всей стране?</h4>
                      <p>
                        В крупных городах — Пекине, Шанхае, Гуанчжоу, Чэнду — работает стабильно. В отдалённой сельской
                        местности машин может не быть.
                      </p>
                    </div>
                    <div className="gp-substep">
                      <h4>Насколько это безопасно?</h4>
                      <p>
                        В приложении есть отслеживание поездки, передача маршрута близким и кнопка SOS для экстренных
                        случаев.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="gp-cta">
              <h2>Едете в Китай?</h2>
              <p>
                Поездки в DiDi, метро и покупки удобнее оплачивать с баланса Alipay. Пополнить кошелёк можно через
                AlipayFast: наш курс, зачисление обычно около 15 минут.
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
