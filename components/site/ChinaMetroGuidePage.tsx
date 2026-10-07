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
  ['1', 'Раздел «Транспорт»'],
  ['2', 'Выбираем город'],
  ['3', 'Универсальный код вместо «только метро»'],
  ['4', 'Соглашение и защита платежа'],
  ['5', 'Готовый QR-код'],
  ['6', 'Виджет на рабочий стол (iPhone)'],
  ['7', 'Готовим коды других городов заранее'],
  ['8', 'Правило двух сканирований'],
]

export function ChinaMetroGuidePage() {
  return (
    <main className="gp">
      <section className="gp-hero">
        <div className="wrap">
          <div className="gp-hero-content">
            <div>
              <h1>Как оплачивать метро в Китае через Alipay: настраиваем код из дома</h1>
              <p className="gp-sub">
                Пошаговая настройка транспортного QR-кода: выбираем город, активируем универсальный проездной и
                проходим турникеты одним касанием телефона.
              </p>
            </div>
            <div className="gp-hero-icon">🚇</div>
          </div>
        </div>
      </section>

      <section className="gp-content">
        <div className="wrap">
          <article className="gp-article">
            {/* Вступление */}
            <div className="gp-block">
              <Shot
                src="/assets/covers/metro.jpg"
                alt="Обложка: метро в Китае через Alipay"
                width={1248}
                height={832}
                priority
              />
              <h2>Коротко о сути</h2>
              <p>
                Чтобы расплатиться за проезд в китайском метро, не нужны ни жетоны, ни бумажные билеты, ни наличные.
                Достаточно открыть в Alipay транспортный QR-код и поднести телефон к сканеру на турникете.
              </p>
              <p>
                Разовая поездка стоит около <strong>3 юаней</strong> — это примерно 35 рублей. Причём цена зависит от
                расстояния: система считает, где вы вошли и где вышли, поэтому итог обычно укладывается в диапазон{' '}
                <strong>3–7 юаней</strong>.
              </p>
              <p>
                Самое приятное: всё это настраивается заранее, ещё дома, за несколько минут. Потом в поездке остаётся
                только достать телефон у турникета.
              </p>

              <div className="gp-alert">
                <p>
                  <strong>Что понадобится.</strong> Установленный Alipay с положительным балансом. Пополнить кошелёк
                  можно через Сбер или Т-Банк, а также привязанной картой Visa или Mastercard. Если Alipay ещё не
                  настроен, начните с нашей{' '}
                  <Link href="/guides/alipay" className="gp-link">
                    подробной инструкции по Alipay
                  </Link>
                  .
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
                  <h3>Находим раздел «Транспорт» в Alipay</h3>
                  <p>
                    Откройте Alipay. На главном экране найдите иконку с автобусом — это раздел{' '}
                    <strong>Transport</strong> («Транспорт»). Именно здесь живут все проездные коды.
                  </p>
                  <Shot
                    src="/assets/china-metro/step-01.jpg"
                    alt="Раздел Транспорт на главном экране Alipay"
                    width={692}
                    height={899}
                    caption="Шаг 1. Иконка «Транспорт» на главном экране"
                  />
                  <div className="gp-alert">
                    <p>
                      <strong>Совет.</strong> Держите нужные приложения в отдельной папке на телефоне — в поездке возле
                      турникета не придётся листать все экраны в поисках Alipay.
                    </p>
                  </div>
                </div>
              </div>

              {/* 2 */}
              <div className="gp-step" id="2">
                <div className="gp-step-num">2</div>
                <div className="gp-step-content">
                  <h3>Проверяем город в левом верхнем углу</h3>
                  <p>
                    Сначала посмотрите на левый верхний угол экрана: там указан текущий город. По умолчанию приложение
                    может подставить, например, Ханчжоу (杭州).
                  </p>
                  <p>
                    Нажмите на название города и выберите тот, который нужен, — например, латиницей{' '}
                    <strong>Shanghai</strong> (上海). Экран обновится, и дальше работаем уже с кодами этого города.
                  </p>
                  <Shot
                    src="/assets/china-metro/step-02.jpg"
                    alt="Проверка и смена города в транспортном разделе Alipay"
                    width={591}
                    height={800}
                    caption="Шаг 2. Город указан в левом верхнем углу — меняем на нужный"
                  />
                </div>
              </div>

              {/* 3 */}
              <div className="gp-step" id="3">
                <div className="gp-step-num">3</div>
                <div className="gp-step-content">
                  <h3>Выбираем универсальный код, а не «только метро»</h3>
                  <p className="gp-warning">⚠️ Главный лайфхак этого гайда — на этом шаге</p>
                  <p>
                    Когда дело дойдёт до выпуска карты, приложение предложит несколько вариантов. Первым в списке обычно
                    идёт код только для метро — его брать не стоит.
                  </p>
                  <p>
                    Ищите второй пункт — универсальный код общественного транспорта (в Шанхае он называется{' '}
                    <strong>上海公共交通乘车码</strong>). Он открывает турникеты метро, подходит для автобусов и даже для
                    городского парома. Нажмите кнопку активации напротив него.
                  </p>
                  <Shot
                    src="/assets/china-metro/step-03.jpg"
                    alt="Список транспортных карт с выделенным универсальным кодом"
                    width={1181}
                    height={1836}
                    caption="Шаг 3. Нужен второй пункт — единый код города"
                  />
                </div>
              </div>

              {/* 4 */}
              <div className="gp-step" id="4">
                <div className="gp-step-num">4</div>
                <div className="gp-step-content">
                  <h3>Подтверждаем соглашение и включаем защиту</h3>
                  <p>
                    На экране соглашения поставьте галочку и нажмите большую синюю кнопку{' '}
                    <strong>Agree and obtain card</strong> («Согласиться и получить карту»).
                  </p>
                  <p>
                    Деньги за проезд списываются прямо с баланса кошелька или с привязанной зарубежной карты, поэтому
                    приложение попросит включить защиту: задать платёжный пароль и настроить вход по лицу (Face ID). Шаг
                    обязательный — введите код и посмотрите в камеру.
                  </p>
                  <Shot
                    src="/assets/china-metro/step-04.jpg"
                    alt="Соглашение и кнопка получения транспортной карты"
                    width={1181}
                    height={972}
                    caption="Шаг 4. Принимаем условия и получаем карту"
                  />
                </div>
              </div>

              {/* 5 */}
              <div className="gp-step" id="5">
                <div className="gp-step-num">5</div>
                <div className="gp-step-content">
                  <h3>Готовый QR-код на экране</h3>
                  <p>
                    После активации на экране появится ваш личный QR-код — тот самый проездной. В нашем случае это{' '}
                    <strong>上海公共交通乘车码</strong>, единый код городского транспорта Шанхая.
                  </p>
                  <p>
                    Код живой: он обновляется автоматически. Поэтому скриншот не сработает — на турникете нужен именно
                    активный код в приложении.
                  </p>
                  <Shot
                    src="/assets/china-metro/step-05.jpg"
                    alt="Персональный транспортный QR-код в Alipay"
                    width={692}
                    height={1024}
                    caption="Шаг 5. Персональный обновляющийся QR-код"
                  />
                </div>
              </div>

              {/* 6 */}
              <div className="gp-step" id="6">
                <div className="gp-step-num">6</div>
                <div className="gp-step-content">
                  <h3>Выносим код на рабочий стол (для iPhone)</h3>
                  <p>
                    Чтобы у турникета не ждать загрузки приложения, добавьте код на домашний экран как отдельное
                    веб-приложение. Alipay сам предложит это сделать — нажмите кнопку <strong>立即添加</strong>{' '}
                    («Добавить прямо сейчас»).
                  </p>
                  <Shot
                    src="/assets/china-metro/step-06.jpg"
                    alt="Окно добавления кода на рабочий стол в Alipay"
                    width={684}
                    height={1200}
                    caption="Шаг 6.1. Alipay предлагает вынести код на рабочий стол"
                  />
                  <p>
                    Так как у вас iPhone, откроется страница в Safari с пошаговой инструкцией:
                  </p>
                  <ol>
                    <li>нажмите на нижнюю кнопку «…» (три точки) в браузере;</li>
                    <li>выберите «Поделиться» во всплывающем меню;</li>
                    <li>пролистайте список и выберите «Добавить на главный экран».</li>
                  </ol>
                  <Shot
                    src="/assets/china-metro/step-06b.jpg"
                    alt="Инструкция для iPhone по добавлению кода на главный экран"
                    width={618}
                    height={1200}
                    caption="Шаг 6.2. Три шага в Safari: «…» → «Поделиться» → «Добавить на главный экран»"
                  />
                  <p>
                    На рабочем столе появится синяя иконка с автобусом — <strong>支付宝乘车码</strong>. Один тап в Китае,
                    и код сразу на экране.
                  </p>
                  <Shot
                    src="/assets/china-metro/step-06c.jpg"
                    alt="Иконка транспортного кода на рабочем столе телефона"
                    width={1097}
                    height={1200}
                    caption="Шаг 6.3. Готовая иконка «支付宝乘车码» на рабочем столе"
                  />
                </div>
              </div>

              {/* 7 */}
              <div className="gp-step" id="7">
                <div className="gp-step-num">7</div>
                <div className="gp-step-content">
                  <h3>Готовим коды других городов заранее</h3>
                  <p>
                    Единого проездного на всю страну нет: в Пекине, Сучжоу и Ханчжоу действуют свои коды. Зато их можно
                    выпустить все сразу, пока вы ещё дома.
                  </p>
                  <ol>
                    <li>Откройте виджет транспорта прямо с рабочего стола.</li>
                    <li>В самом верху нажмите на название города со стрелочкой (например, 公交地铁 · 上海).</li>
                    <li>Введите в поиск следующий город по маршруту — например, Beijing.</li>
                    <li>
                      Подтвердите согласие: паспорт и Face ID уже привязаны, поэтому новый код создастся за секунду.
                    </li>
                  </ol>
                  <p>
                    Повторите для всех городов маршрута, а потом вернитесь к первому. Все коды сохранятся в аккаунте — в
                    поездке останется только переключать город вверху экрана одним нажатием.
                  </p>
                  <Shot
                    src="/assets/china-metro/step-07.png"
                    alt="Схема переключения города в транспортном разделе"
                    width={900}
                    height={1200}
                    caption="Шаг 7. Переключение города одним нажатием"
                  />
                </div>
              </div>

              {/* 8 */}
              <div className="gp-step" id="8">
                <div className="gp-step-num">8</div>
                <div className="gp-step-content">
                  <h3>Правило двух сканирований на станции</h3>
                  <p>
                    На станции забудьте про верхние круглые датчики — они нужны только для пластиковых карт. Для
                    смартфонов на турникетах есть отдельные считыватели.
                  </p>
                  <div className="gp-substeps">
                    <div className="gp-substep">
                      <h4>На входе</h4>
                      <p>
                        Откройте виджет с кодом нужного города, поднесите телефон экраном к вертикальному стеклянному
                        окошку сканера (на тумбе оно обычно выделено яркой рамкой) и держите на расстоянии 5–10 см.
                        Прозвучит сигнал, загорится зелёная стрелка — проходите.
                      </p>
                    </div>
                    <div className="gp-substep">
                      <h4>На выходе</h4>
                      <p>
                        На станции назначения точно так же отсканируйте тот же код на выходном турникете.
                      </p>
                    </div>
                  </div>
                  <Shot
                    src="/assets/china-metro/step-08.png"
                    alt="Схема сканирования QR-кода на турникете метро"
                    width={900}
                    height={1200}
                    caption="Шаг 8. Сканируем код и на входе, и на выходе"
                  />
                  <div className="gp-alert gp-alert-danger">
                    <p>
                      <strong>Почему это важно.</strong> Фиксированной цены за проезд нет — стоимость зависит от
                      расстояния. Система должна понять, где вы вошли и где вышли, чтобы рассчитать сумму. Если не
                      отсканировать код на выходе, турникет не выпустит, а поездка останется «зависшей» с максимальным
                      тарифом.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="gp-cta">
              <h2>Едете в Китай?</h2>
              <p>
                Поможем пополнить Alipay — из него списывается оплата метро, автобусов и паромов. Наш курс без скрытых комиссий.
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
