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
  ['1', 'Виза и въезд для россиян'],
  ['2', 'Технологии и приложения'],
  ['3', 'Планируем поездку'],
  ['4', 'Билеты, транспорт и граница'],
  ['5', 'Деньги и оплата'],
  ['6', 'Безопасность'],
  ['7', 'Язык и общение'],
  ['8', 'Что взять с собой'],
  ['9', 'Еда и напитки'],
  ['10', 'Прочие советы'],
]

export function China50ThingsGuidePage() {
  return (
    <main className="gp">
      <section className="gp-hero">
        <div className="wrap">
          <div className="gp-hero-content">
            <div>
              <h1>Путешествуете в Китай из России: 50 вещей, которые нужно знать в 2026 году</h1>
              <p className="gp-sub">
                Безвиз, роуминг, VPN, приложения, деньги и Alipay, граница и Дальний Восток, еда и бытовые мелочи — всё,
                что стоит знать россиянину до вылета.
              </p>
            </div>
            <div className="gp-hero-icon">🧭</div>
          </div>
        </div>
      </section>

      <section className="gp-content">
        <div className="wrap">
          <article className="gp-article">
            {/* Вступление */}
            <div className="gp-block">
              <Shot
                src="/assets/covers/china-travel-2026.jpg"
                alt="Обложка: путешествие в Китай, 2026"
                width={1248}
                height={832}
                priority
              />
              <h2>Коротко о главном</h2>
              <p>
                В 2026 году поездка в Китай для россиянина стала заметно проще: виза не нужна, прямых рейсов много, а
                границу можно перейти даже на Дальнем Востоке. Но есть свои нюансы — российские карты в Китае не
                работают, почти все расчёты идут через телефон, а привычные приложения требуют VPN.
              </p>
              <p>
                Мы собрали 50 практических советов именно для путешественников из России: от безвиза и приложений до
                денег, транспорта, языка и еды. Часть пригодится ещё до вылета, часть — уже на месте. Можно читать по
                порядку или сразу перейти к нужному разделу.
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

            {/* 1. Виза и въезд */}
            <div className="gp-block" id="1">
              <h2>Виза и въезд для россиян</h2>
              <Shot
                src="/assets/china-50-things/great-wall.jpg"
                alt="Великая Китайская стена на закате"
                width={1280}
                height={720}
                caption="Великая Китайская стена — обязательный пункт почти любого маршрута"
              />
              <div className="gp-steps">
                <div className="gp-step">
                  <div className="gp-step-num">1</div>
                  <div className="gp-step-content">
                    <h3>Россиянам виза в Китай не нужна</h3>
                    <p>
                      С 15 сентября 2025 года граждане России с обычным загранпаспортом могут въезжать в Китай без визы и
                      находиться в стране до <strong>30 дней подряд</strong>. Оформлять ничего заранее не нужно — только
                      действующий загранпаспорт.
                    </p>
                  </div>
                </div>
                <div className="gp-step">
                  <div className="gp-step-num">2</div>
                  <div className="gp-step-content">
                    <h3>Безвиз действует до 31 декабря 2027 года</h3>
                    <p>
                      Изначально эксперимент был рассчитан до сентября 2026-го, но его продлили. Актуальный срок — до{' '}
                      <strong>31 декабря 2027 года</strong>. Перед поездкой всё же стоит заглянуть на сайт консульства:
                      сроки и правила иногда уточняются.
                    </p>
                  </div>
                </div>
                <div className="gp-step">
                  <div className="gp-step-num">3</div>
                  <div className="gp-step-content">
                    <h3>Что можно без визы, а что нельзя</h3>
                    <p>
                      Безвизовый въезд рассчитан на туризм, короткие деловые поездки, визиты к родственникам и транзит.
                      Максимум — 30 дней за один въезд. Работать без соответствующего разрешения нельзя: это уже другая
                      процедура.
                    </p>
                  </div>
                </div>
                <div className="gp-step">
                  <div className="gp-step-num">4</div>
                  <div className="gp-step-content">
                    <h3>Паспорт и регистрация</h3>
                    <p>
                      Паспорт должен быть действителен ещё несколько месяцев после поездки, а его страницы — в хорошем
                      состоянии. Отели регистрируют иностранных гостей сами; если вы живёте у знакомых, регистрацию нужно
                      оформить отдельно.
                    </p>
                  </div>
                </div>
                <div className="gp-step">
                  <div className="gp-step-num">5</div>
                  <div className="gp-step-content">
                    <h3>Карантина больше нет</h3>
                    <p>
                      Обязательный карантин при въезде отменён ещё в 2023 году. Сложные формы заполнять не нужно, но
                      требования авиакомпании и общие санитарные правила стоит уточнить перед вылетом.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Технологии */}
            <div className="gp-block" id="2">
              <h2>Технологии и приложения</h2>
              <div className="gp-steps">
                <div className="gp-step">
                  <div className="gp-step-num">6</div>
                  <div className="gp-step-content">
                    <h3>Установите VPN до вылета</h3>
                    <p>
                      В Китае заблокированы Google, Instagram, Facebook, X, а также Telegram и WhatsApp. Без VPN не
                      откроются ни почта, ни привычные мессенджеры. Скачайте и проверьте VPN дома — на месте это сделать
                      сложнее.
                    </p>
                    <Shot
                      src="/assets/china-50-things/blocked-apps.jpg"
                      alt="Схема: какие приложения недоступны в Китае без VPN"
                      width={700}
                      height={376}
                      caption="Без VPN часть привычных приложений не заработает"
                    />
                  </div>
                </div>
                <div className="gp-step">
                  <div className="gp-step-num">7</div>
                  <div className="gp-step-content">
                    <h3>Китайская SIM или eSIM вместо роуминга</h3>
                    <p>
                      Российский роуминг в Китае стоит очень дорого. Выгоднее взять местную SIM-карту (телефон должен
                      быть не залочен) или eSIM — она подключается за пару минут и часто уже включает VPN.
                    </p>
                  </div>
                </div>
                <div className="gp-step">
                  <div className="gp-step-num">8</div>
                  <div className="gp-step-content">
                    <h3>WeChat — обязательная программа</h3>
                    <p>
                      WeChat — не просто мессенджер: через него бронируют билеты, переводят деньги, делятся локацией и
                      пользуются мини-приложениями. Поставьте его ещё дома, чтобы общаться с водителями, гидами и
                      новыми знакомыми.
                    </p>
                  </div>
                </div>
                <div className="gp-step">
                  <div className="gp-step-num">9</div>
                  <div className="gp-step-content">
                    <h3>Набор приложений для россиянина</h3>
                    <ul className="gp-list">
                      <li>Pleco — офлайн-словарь китайского;</li>
                      <li>Ctrip — поезда, самолёты и отели на английском;</li>
                      <li>карты — Baidu Maps или Amap (точнее Google Maps);</li>
                      <li>конвертер юаня — чтобы быстро считать цену;</li>
                      <li>Didi — вызов такси с оплатой из Alipay.</li>
                    </ul>
                    <Shot
                      src="/assets/china-50-things/apps.jpg"
                      alt="Экран телефона с набором китайских приложений"
                      width={800}
                      height={534}
                      caption="Базовый набор приложений лучше установить заранее"
                    />
                  </div>
                </div>
                <div className="gp-step">
                  <div className="gp-step-num">10</div>
                  <div className="gp-step-content">
                    <h3>Скачайте офлайн-всё, что можно</h3>
                    <p>
                      Переводчик, карты и словарь загрузите для офлайн-работы. Связь может пропасть, VPN — отвалиться, а
                      без интернета в незнакомом городе сразу становится сложно.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Планирование */}
            <div className="gp-block" id="3">
              <h2>Планируем поездку</h2>
              <div className="gp-steps">
                <div className="gp-step">
                  <div className="gp-step-num">11</div>
                  <div className="gp-step-content">
                    <h3>Не ездите в большие праздники</h3>
                    <p>
                      Два периода лучше обойти стороной: Китайский Новый год (конец января — февраль, даты меняются) и
                      Национальный день 1 октября. В «золотую неделю» 1–7 октября миллионы людей едут по стране: билеты
                      раскупают, а достопримечательности переполнены.
                    </p>
                  </div>
                </div>
                <div className="gp-step">
                  <div className="gp-step-num">12</div>
                  <div className="gp-step-content">
                    <h3>Маршрут и разница во времени</h3>
                    <p>
                      Китай огромный, и регионы сильно отличаются. Кроме Пекина, Шанхая и Сианя стоит заложить время на
                      горы, маленькие города и природные места. И учитывайте время: вся страна живёт по единому
                      поясу <strong>UTC+8</strong> — это <strong>+5 часов к Москве</strong>.
                    </p>
                    <Shot
                      src="/assets/china-50-things/cities.jpg"
                      alt="Коллаж фотографий популярных городов Китая"
                      width={700}
                      height={425}
                      caption="От Пекина и Шанхая до Гуйлиня и Ханчжоу — у каждого города свой характер"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Билеты и граница */}
            <div className="gp-block" id="4">
              <h2>Билеты, транспорт и граница</h2>
              <div className="gp-steps">
                <div className="gp-step">
                  <div className="gp-step-num">13</div>
                  <div className="gp-step-content">
                    <h3>Ctrip для бронирования</h3>
                    <p>
                      Поезда, самолёты и отели проще всего бронировать через Ctrip: интерфейс на английском, поддержка и
                      приём зарубежных карт. Российские карты при этом не подойдут — платить придётся с карты, которая
                      работает за рубежом, либо через Alipay (об этом ниже).
                    </p>
                  </div>
                </div>
                <div className="gp-step">
                  <div className="gp-step-num">14</div>
                  <div className="gp-step-content">
                    <h3>Высокоскоростные поезда</h3>
                    <p>
                      Китайские скоростные поезда быстрые, пунктуальные и удобные: досмотр занимает куда меньше времени,
                      чем в аэропорту. Это ещё и отличный способ увидеть страну из окна. На дальние расстояния ходят и
                      ночные поезда со спальными местами.
                    </p>
                    <Shot
                      src="/assets/china-50-things/rail.jpg"
                      alt="Пассажиры у высокоскоростного поезда в Китае"
                      width={598}
                      height={336}
                      caption="Высокоскоростные поезда — один из лучших способов передвижения по Китаю"
                    />
                    <div className="gp-alert">
                      <p>
                        Городской транспорт тоже стоит настроить заранее: в{' '}
                        <Link href="/guides/china-metro" className="gp-link">
                          гиде по метро
                        </Link>{' '}
                        мы показали, как включить транспортный QR-код в Alipay, чтобы проходить турникеты телефоном.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="gp-step">
                  <div className="gp-step-num">15</div>
                  <div className="gp-step-content">
                    <h3>Проверяйте расписание достопримечательностей</h3>
                    <p>
                      Многие музеи и дворцы требуют предварительной брони и закрыты по определённым дням. Например,
                      Запретный город обычно нельзя посетить без брони, а по понедельникам он закрыт. Планируйте визиты
                      заранее.
                    </p>
                  </div>
                </div>
                <div className="gp-step">
                  <div className="gp-step-num">16</div>
                  <div className="gp-step-content">
                    <h3>Дальний Восток и приграничные маршруты</h3>
                    <p>
                      Жителям Дальнего Востока до Китая часто ближе, чем до Москвы. Есть прямые рейсы из Владивостока,
                      Хабаровска и других городов, а также наземные переходы: Забайкальск — Маньчжоули, Суйфэньхэ,
                      Хуньчунь, Хэйхэ. Это удобный способ съездить на несколько дней без визы.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Деньги и оплата */}
            <div className="gp-block" id="5">
              <h2>Деньги и оплата</h2>
              <Shot
                src="/assets/china-50-things/alipay.jpg"
                alt="Иконки мобильных платёжных сервисов Alipay и WeChat Pay"
                width={300}
                height={199}
                caption="Alipay и WeChat Pay принимают почти везде — от такси до маленьких лавок"
              />
              <div className="gp-steps">
                <div className="gp-step">
                  <div className="gp-step-num">17</div>
                  <div className="gp-step-content">
                    <h3>Российские карты в Китае не работают</h3>
                    <p>
                      Это главное, что стоит понять до поездки: карты «Мир», а также Visa и Mastercard, выпущенные в
                      России, в Китае не принимают — ни в терминалах, ни в банкоматах, ни для привязки к платёжным
                      приложениям. Рассчитывать на них бессмысленно.
                    </p>
                  </div>
                </div>
                <div className="gp-step">
                  <div className="gp-step-num">18</div>
                  <div className="gp-step-content">
                    <h3>Платить придётся через Alipay</h3>
                    <p>
                      Китай — почти полностью безналичная страна: QR-коды висят в такси, кафе, на рынках и в маленьких
                      магазинах. Для туриста самый удобный кошелёк — <strong>Alipay</strong>: его принимают везде, и он
                      поддерживает регистрацию по российскому номеру и верификацию по загранпаспорту.
                    </p>
                    <div className="gp-alert">
                      <p>
                        Но есть нюанс: привязать российскую карту к Alipay не получится, а баланс пополнять где-то
                        нужно. Именно этим занимаемся мы — <strong>AlipayFast</strong>: пополняем ваш Alipay юанями по
                        нашему курсу, без скрытых комиссий. Переводы принимаем через Т-Банк. Как
                        зарегистрировать и верифицировать кошелёк — в{' '}
                        <Link href="/guides/alipay" className="gp-link">
                          подробной инструкции по Alipay
                        </Link>
                        .
                      </p>
                    </div>
                  </div>
                </div>
                <div className="gp-step">
                  <div className="gp-step-num">19</div>
                  <div className="gp-step-content">
                    <h3>Наличные юани — только как запас</h3>
                    <p>
                      Купить юани в России можно, но курс обычно невыгодный, а банкоматы в Китае российские карты не
                      принимают. Поэтому наличные стоит рассматривать лишь как небольшой запас на первый день, а не как
                      основной способ оплаты.
                    </p>
                    <Shot
                      src="/assets/china-50-things/atm.jpg"
                      alt="Банкомат в Китае, принимающий иностранные карты"
                      width={540}
                      height={340}
                      caption="Российские карты китайские банкоматы не обслуживают"
                    />
                  </div>
                </div>
                <div className="gp-step">
                  <div className="gp-step-num">20</div>
                  <div className="gp-step-content">
                    <h3>Перевод через Т-Банк</h3>
                    <p>
                      Для пополнения Alipay мы принимаем переводы через Т-Банк: банк позволяет отправить чек прямо из
                      приложения, что исключает подделку. Пошагово весь процесс разобран в{' '}
                      <Link href="/guides/tbank" className="gp-link">
                        отдельной инструкции по Т-Банку
                      </Link>
                      .
                    </p>
                  </div>
                </div>
                <div className="gp-step">
                  <div className="gp-step-num">21</div>
                  <div className="gp-step-content">
                    <h3>Чаевые не нужны</h3>
                    <p>
                      В Китае не принято оставлять чаевые. Это может даже смутить персонал — исключение разве что
                      действительно выдающийся гид или особый случай.
                    </p>
                  </div>
                </div>
                <div className="gp-step">
                  <div className="gp-step-num">22</div>
                  <div className="gp-step-content">
                    <h3>Цены фиксированные</h3>
                    <p>
                      Цена на ценнике — это и есть цена, налог сверху не добавляют, а торговаться можно разве что на
                      отдельных рынках. В магазинах и ресторанах цены фиксированные — это упрощает подсчёты.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 6. Безопасность */}
            <div className="gp-block" id="6">
              <h2>Безопасность</h2>
              <div className="gp-steps">
                <div className="gp-step">
                  <div className="gp-step-num">23</div>
                  <div className="gp-step-content">
                    <h3>Паспорт всегда с собой</h3>
                    <p>
                      На многих достопримечательностях паспорт спрашивают на входе, так что он нужен под рукой. Если
                      выходите на вечер, оригинал лучше оставить в сейфе, а с собой взять копию страниц паспорта.
                    </p>
                  </div>
                </div>
                <div className="gp-step">
                  <div className="gp-step-num">24</div>
                  <div className="gp-step-content">
                    <h3>Не забудьте про страховку</h3>
                    <p>
                      Медицинская страховка для поездки в Китай — не формальность: лечение здесь дорогое, а помощь по
                      российскому полису не действует. Оформляйте заранее и проверяйте, что покрытие включает экстренную
                      помощь и эвакуацию.
                    </p>
                  </div>
                </div>
                <div className="gp-step">
                  <div className="gp-step-num">25</div>
                  <div className="gp-step-content">
                    <h3>Путешествовать одному безопасно</h3>
                    <p>
                      Китай считается одной из самых безопасных стран для соло-путешествий, в том числе для женщин.
                      Трафик, шум и культурный контраст могут утомлять, но в целом здесь спокойно даже поздно вечером.
                      Базовые меры предосторожности всё равно никто не отменял.
                    </p>
                  </div>
                </div>
                <div className="gp-step">
                  <div className="gp-step-num">26</div>
                  <div className="gp-step-content">
                    <h3>Осторожно с типичными разводами</h3>
                    <p>
                      Как и везде, туриста могут попытаться обмануть. Классика — «чайный» развод, когда незнакомец
                      приглашает в чайную и оставляет вас с огромным счётом. Осторожнее с приглашениями в бар от новых
                      знакомых из дейтинг-приложений.
                    </p>
                  </div>
                </div>
                <div className="gp-step">
                  <div className="gp-step-num">27</div>
                  <div className="gp-step-content">
                    <h3>Такси — только официальная стоянка</h3>
                    <p>
                      В аэропорту и на вокзале идите к официальной стоянке такси: там работает счётчик. Не соглашайтесь
                      на предложения «подвезти» от людей, которые окликают вас у выхода — чаще всего это завышенная
                      цена.
                    </p>
                    <Shot
                      src="/assets/china-50-things/taxi.jpg"
                      alt="Официальное такси в Пекине"
                      width={479}
                      height={216}
                      caption="Берите такси на официальной стоянке или заказывайте через приложение"
                    />
                    <div className="gp-alert">
                      <p>
                        Удобнее вызывать машину через DiDi и платить из Alipay — в{' '}
                        <Link href="/guides/china-taxi" className="gp-link">
                          гиде по такси
                        </Link>{' '}
                        мы разобрали установку и настройку приложения.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 7. Язык */}
            <div className="gp-block" id="7">
              <h2>Язык и общение</h2>
              <Shot
                src="/assets/china-50-things/language.jpg"
                alt="Уличная вывеска с китайскими иероглифами"
                width={4032}
                height={3024}
                caption="Английский в Китае знают далеко не все — зато выручают переводчик и пара фраз"
              />
              <div className="gp-steps">
                <div className="gp-step">
                  <div className="gp-step-num">28</div>
                  <div className="gp-step-content">
                    <h3>Распечатайте адрес отеля по-китайски</h3>
                    <p>
                      Простой, но спасительный лайфхак: покажите водителю бумажку с адресом отеля, написанным
                      иероглифами. Так вы точно объясните, куда ехать.
                    </p>
                  </div>
                </div>
                <div className="gp-step">
                  <div className="gp-step-num">29</div>
                  <div className="gp-step-content">
                    <h3>Выучите пару простых фраз</h3>
                    <p>
                      Английский знают в крупных городах и международных заведениях, но в остальных местах пригодятся
                      базовые фразы. Даже пара слов и приветливая улыбка сильно помогают в общении.
                    </p>
                  </div>
                </div>
                <div className="gp-step">
                  <div className="gp-step-num">30</div>
                  <div className="gp-step-content">
                    <h3>Переводчик офлайн, а не только Google</h3>
                    <p>
                      Pleco работает без интернета и не требует VPN. Google Translate без VPN в Китае не откроется, зато
                      Яндекс Переводы и сервисы WeChat переводят текст и камерой. Заранее скачайте офлайн-словарь —
                      интернета может не быть.
                    </p>
                  </div>
                </div>
                <div className="gp-step">
                  <div className="gp-step-num">31</div>
                  <div className="gp-step-content">
                    <h3>Говорите медленно и коротко</h3>
                    <p>
                      Если собеседник не знает английского, говорите медленно, простыми словами и без спешки. Некоторые
                      китайские слова звучат похоже на английские (coffee — kāfēi, salad — shālā), это иногда выручает.
                      Вежливость здесь ценится больше громкости.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 8. Что взять */}
            <div className="gp-block" id="8">
              <h2>Что взять с собой</h2>
              <div className="gp-steps">
                <div className="gp-step">
                  <div className="gp-step-num">32</div>
                  <div className="gp-step-content">
                    <h3>Удобная обувь</h3>
                    <p>
                      В Китае придётся много ходить: музеи, дворцы, рынки и метро легко дают по 10–15 тысяч шагов в
                      день. Возьмите разношенную удобную обувь.
                    </p>
                  </div>
                </div>
                <div className="gp-step">
                  <div className="gp-step-num">33</div>
                  <div className="gp-step-content">
                    <h3>Одежда слоями</h3>
                    <p>
                      От Пекина на севере до Гуанчжоу на юге климат очень разный. Слои, лёгкая дождевка и быстросохнущие
                      ткани сделают поездку комфортнее в любой сезон.
                    </p>
                  </div>
                </div>
                <div className="gp-step">
                  <div className="gp-step-num">34</div>
                  <div className="gp-step-content">
                    <h3>Своя туалетная бумага</h3>
                    <p>
                      Возможно, самый важный совет: во многих общественных местах бумаги нет, и все носят свою. Заодно
                      будьте готовы к «дырчатым» туалетам — в отелях и торговых центрах обычно западный вариант, а на
                      вокзалах бывает по-разному.
                    </p>
                    <Shot
                      src="/assets/china-50-things/toilet.jpg"
                      alt="Туалет с напольной чашей в Китае"
                      width={3024}
                      height={4032}
                      caption="Такие туалеты встречаются по всей стране — носите с собой бумагу"
                    />
                  </div>
                </div>
                <div className="gp-step">
                  <div className="gp-step-num">35</div>
                  <div className="gp-step-content">
                    <h3>Прочие полезные мелочи</h3>
                    <p>
                      Привычные лекарства, витамины и средства гигиены из дома, антисептик, пластыри и солнцезащитный
                      крем. Если что-то забыли — не страшно: в Miniso, Watson’s или WuMart легко докупить бытовые мелочи,
                      а персонал отеля подскажет ближайший магазин.
                    </p>
                    <Shot
                      src="/assets/china-50-things/miniso.webp"
                      alt="Магазин Miniso с товарами для дома и мелочами"
                      width={797}
                      height={531}
                      caption="Miniso и подобные магазины есть почти в любом городе"
                    />
                  </div>
                </div>
                <div className="gp-step">
                  <div className="gp-step-num">36</div>
                  <div className="gp-step-content">
                    <h3>Розетки и напряжение</h3>
                    <p>
                      Напряжение в Китае такое же, как в России — 220 В, 50 Гц, так что техника не пострадает. А вот
                      вилки другие: типы A, C и I. Универсальный переходник решает вопрос.
                    </p>
                    <Shot
                      src="/assets/china-50-things/sockets.webp"
                      alt="Типы розеток, используемых в Китае"
                      width={546}
                      height={278}
                      caption="Типы A, C и I — заранее подберите универсальный переходник"
                    />
                  </div>
                </div>
                <div className="gp-step">
                  <div className="gp-step-num">37</div>
                  <div className="gp-step-content">
                    <h3>Powerbank — обязателен</h3>
                    <p>
                      Телефон в Китае — это деньги, карта, билеты и переводчик в одном флаконе. Если он сядет, вы
                      останетесь без оплаты и навигации. Берите пауэрбанк всегда с собой.
                    </p>
                  </div>
                </div>
                <div className="gp-step">
                  <div className="gp-step-num">38</div>
                  <div className="gp-step-content">
                    <h3>Китай — шумный</h3>
                    <p>
                      Громкие разговоры в поездах и на улицах — норма. Если чутко спите, пригодятся беруши и наушники,
                      особенно в дороге.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 9. Еда */}
            <div className="gp-block" id="9">
              <h2>Еда и напитки</h2>
              <div className="gp-steps">
                <div className="gp-step">
                  <div className="gp-step-num">39</div>
                  <div className="gp-step-content">
                    <h3>Не пейте воду из-под крана</h3>
                    <p>
                      Воду из-под крана не фильтруют — её не стоит пить. Местные кипятят воду (чайник есть почти везде)
                      или покупают бутилированную. То же касается и льда в сомнительных местах.
                    </p>
                  </div>
                </div>
                <div className="gp-step">
                  <div className="gp-step-num">40</div>
                  <div className="gp-step-content">
                    <h3>Пробуйте разную региональную кухню</h3>
                    <p>
                      Кухня меняется от провинции к провинции и даже от города к городу: сычуаньская — острая, дунбэйская
                      — сытная, кантонская — мягкая и сладковатая. Изучите, чем известен ваш маршрут, и пробуйте
                      смелее.
                    </p>
                    <Shot
                      src="/assets/china-50-things/food.jpg"
                      alt="Коллаж блюд китайской кухни"
                      width={1000}
                      height={1500}
                      caption="Китайская кухня — это десятки непохожих традиций, а не одно меню"
                    />
                  </div>
                </div>
                <div className="gp-step">
                  <div className="gp-step-num">41</div>
                  <div className="gp-step-content">
                    <h3>Ищите, где сидят местные</h3>
                    <p>
                      Лучшие приёмы пищи — не в дорогих отелях, а в маленьких семейных заведениях на боковых улицах.
                      Оглянитесь: где очередь из местных — туда и стоит зайти. И не удивляйтесь, если соседи шумно хрумкают
                      лапшу: это комплимент повару.
                    </p>
                  </div>
                </div>
                <div className="gp-step">
                  <div className="gp-step-num">42</div>
                  <div className="gp-step-content">
                    <h3>Вегетарианцам — заранее</h3>
                    <p>
                      Есть только растительную пищу сложнее, чем кажется, но возможно. Подготовьте карточки с фразами о
                      ваших ограничениях на китайском и не удивляйтесь, если что-то потеряется в переводе. В крупных
                      городах есть веги-рестораны.
                    </p>
                  </div>
                </div>
                <div className="gp-step">
                  <div className="gp-step-num">43</div>
                  <div className="gp-step-content">
                    <h3>Международная еда тоже есть</h3>
                    <p>
                      Если соскучились по привычному, в большинстве городов найдутся KFC, McDonald’s, Pizza Hut и
                      Starbucks, а также корейская, японская и итальянская кухня. Но местную всё же стоит попробовать —
                      это часть страны.
                    </p>
                    <Shot
                      src="/assets/china-50-things/fastfood.webp"
                      alt="Вывески международных сетей быстрого питания в Китае"
                      width={1000}
                      height={666}
                      caption="Привычные бренды есть почти везде — но не ими едиными"
                    />
                  </div>
                </div>
                <div className="gp-step">
                  <div className="gp-step-num">44</div>
                  <div className="gp-step-content">
                    <h3>Пить на улице можно</h3>
                    <p>
                      Публичное употребление алкоголя в Китае разрешено, а магазины продают спиртное круглосуточно. Но
                      помните: вы в чужой стране, ведите себя спокойно и уважайте правила — разбирательство с полицией
                      здесь мало кому помогает.
                    </p>
                  </div>
                </div>
                <div className="gp-step">
                  <div className="gp-step-num">45</div>
                  <div className="gp-step-content">
                    <h3>За столом — свои правила</h3>
                    <p>
                      Часто едят «по-семейному» за большим круглым столом, деля блюда на всех. Не втыкайте палочки
                      вертикально в рис — это плохая примета. А почётное место за столом — напротив входа.
                    </p>
                    <Shot
                      src="/assets/china-50-things/round-table.jpg"
                      alt="Круглый стол с блюдами, традиционный для семейного ужина в Китае"
                      width={550}
                      height={309}
                      caption="Большой круглый стол и общие блюда — привычный формат застолья"
                    />
                  </div>
                </div>
                <div className="gp-step">
                  <div className="gp-step-num">46</div>
                  <div className="gp-step-content">
                    <h3>Возьмите снеки с собой</h3>
                    <p>
                      Перекусы пригодятся в долгой дороге, а также если вы привередливы в еде или едете с детьми. В
                      крупных городах есть 7/11 и Family Mart, в небольших — обычные продуктовые, где всегда можно
                      взять лапшу, воду и кофе.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 10. Прочие советы */}
            <div className="gp-block" id="10">
              <h2>Прочие советы</h2>
              <div className="gp-steps">
                <div className="gp-step">
                  <div className="gp-step-num">47</div>
                  <div className="gp-step-content">
                    <h3>Китайцы очень приветливы</h3>
                    <p>
                      Везде — от отелей до улиц — встречаются радушные и любопытные люди. Иногда могут задавать очень
                      прямые вопросы: это не бестактность, а часть культуры и искренний интерес к вам.
                    </p>
                  </div>
                </div>
                <div className="gp-step">
                  <div className="gp-step-num">48</div>
                  <div className="gp-step-content">
                    <h3>Учитывайте смог</h3>
                    <p>
                      В крупных городах качество воздуха иногда оставляет желать лучшего, особенно если вы чувствительны
                      к пыли. Актуальнее всего это для Пекина в отдельные дни. Проверяйте индекс AQI в приложении и
                      держите маску под рукой. За последние годы ситуация заметно улучшилась.
                    </p>
                  </div>
                </div>
                <div className="gp-step">
                  <div className="gp-step-num">49</div>
                  <div className="gp-step-content">
                    <h3>Вас могут попросить сфотографироваться</h3>
                    <p>
                      Особенно у известных достопримечательностей: местным просто интересно, и фото с иностранцем — это
                      дружелюбие, а не что-то странное. Отнеситесь к этому с юмором.
                    </p>
                    <Shot
                      src="/assets/china-50-things/photo.jpg"
                      alt="Туристы фотографируются у достопримечательности в Китае"
                      width={1440}
                      height={1080}
                      caption="Фото с иностранцем — обычный знак интереса и дружелюбия"
                    />
                  </div>
                </div>
                <div className="gp-step">
                  <div className="gp-step-num">50</div>
                  <div className="gp-step-content">
                    <h3>И главное — принимайте приключение</h3>
                    <p>
                      Не бойтесь задавать вопросы и знакомиться. В Китае очень много неожиданного и интересного, если
                      просто соглашаться на то, что предлагает дорога.
                    </p>
                    <Shot
                      src="/assets/china-50-things/embrace.jpg"
                      alt="Пейзаж Китая в лучах света"
                      width={1440}
                      height={1800}
                      caption="Китай щедр на впечатления — было бы желание их замечать"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="gp-cta">
              <h2>Собираетесь в Китай из России?</h2>
              <p>
                Поможем пополнить Alipay юанями — им удобно оплачивать метро, такси, еду и покупки. Российские карты в
                Китае не работают, а баланс в кошельке нужен с первого дня: наш курс, переводы через Т-Банк.
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
