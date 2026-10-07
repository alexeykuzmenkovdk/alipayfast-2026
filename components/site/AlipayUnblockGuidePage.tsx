'use client'

import Link from 'next/link'
import Image from 'next/image'
import { TgIcon } from './shared'

const STEPS = [
  {
    n: 1,
    title: 'Откройте раздел «Мои»',
    text: 'На главном экране приложения нажмите кнопку «Мои» в правом нижнем углу (обведена на скриншоте).',
    img: '/assets/alipay-unblock/step-1.jpg',
    alt: 'Alipay: кнопка «Мои» в правом нижнем углу',
  },
  {
    n: 2,
    title: 'Перейдите в настройки',
    text: 'В открывшемся профиле нажмите на значок шестерёнки (⚙) в правом верхнем углу экрана.',
    img: '/assets/alipay-unblock/step-2.jpg',
    alt: 'Alipay: значок шестерёнки в профиле',
  },
  {
    n: 3,
    title: 'Откройте «Счёт и безопасность»',
    text: 'В меню «Настроить» выберите самый первый пункт — «Счёт и безопасность».',
    img: '/assets/alipay-unblock/step-3.jpg',
    alt: 'Alipay: пункт «Счёт и безопасность» в меню настроек',
  },
  {
    n: 4,
    title: 'Зайдите в «Центр безопасности»',
    text: 'В разделе «Аккаунт и безопасность» прокрутите вниз и нажмите на пункт «Центр безопасности» (регистрация утраты, освобождение ограничения, жалоба учётной записи и другие безопасные услуги).',
    img: '/assets/alipay-unblock/step-4.jpg',
    alt: 'Alipay: пункт «Центр безопасности»',
  },
  {
    n: 5,
    title: 'Выберите «Снять ограничение»',
    text: 'В «Службе безопасности» нажмите на иконку с открытым замком — «Снять ограничение» (на скриншоте обведена).',
    img: '/assets/alipay-unblock/step-5.jpg',
    alt: 'Alipay: иконка «Снять ограничение» с открытым замком',
  },
]

const SIGNS = [
  'Не проходят платежи или переводы, появляется сообщение об ошибке.',
  'При входе система требует дополнительное подтверждение.',
  'Появляется уведомление о временном ограничении функций.',
  'Не открывается доступ к балансу, карте или кошельку.',
]

export function AlipayUnblockGuidePage() {
  return (
    <main className="gp">
      <section className="gp-hero">
        <div className="wrap">
          <Link href="/#top" className="gp-back">
            ← Вернуться на главную
          </Link>
          <div className="gp-hero-content">
            <div>
              <h1>Как снять блокировку Alipay</h1>
              <p className="gp-sub">
                Ограничение чаще всего временное: показываем, как проверить статус аккаунта и снять ограничение через
                Центр безопасности.
              </p>
            </div>
            <div className="gp-hero-icon">🔓</div>
          </div>
        </div>
      </section>

      <section className="gp-content">
        <div className="wrap">
          <article className="gp-article">
            <div className="gp-block">
              <figure className="gp-figure gp-figure-wide">
                <Image
                  src="/assets/alipay-unblock/cover.png"
                  alt="Как снять блокировку Alipay"
                  width={1248}
                  height={832}
                  sizes="(max-width: 760px) 100vw, 720px"
                  priority
                  className="gp-shot"
                />
              </figure>

              <p>
                Блокировка аккаунта в Alipay чаще всего носит временный характер и связана с проверками безопасности —
                например, вход с нового устройства, подозрительная операция или необходимость повторной верификации. В
                большинстве случаев ограничение снимается сразу после прохождения предложенных приложением шагов,
                обычно это повторная верификация личности. Иногда система показывает конкретный срок, на который
                наложено ограничение.
              </p>
            </div>

            <div className="gp-block">
              <h2>Как понять, что аккаунт заблокирован</h2>
              <p>Признаки того, что на аккаунт наложено ограничение:</p>
              <ul className="gp-list">
                {SIGNS.map((sign) => (
                  <li key={sign}>{sign}</li>
                ))}
              </ul>
              <p>
                Если вы столкнулись хотя бы с одним из этих признаков — переходите к проверке через Центр безопасности.
              </p>
            </div>

            <div className="gp-steps">
              <h2>Пошаговая инструкция</h2>

              {STEPS.map((step) => (
                <div className="gp-step" key={step.n}>
                  <div className="gp-step-num">{step.n}</div>
                  <div className="gp-step-content">
                    <h3>
                      Шаг {step.n}. {step.title}
                    </h3>
                    <p>{step.text}</p>
                    <figure className="gp-screenshot gp-screenshot-sm">
                      <Image
                        src={step.img}
                        alt={step.alt}
                        width={588}
                        height={1280}
                        sizes="(max-width: 760px) 90vw, 320px"
                        className="gp-screenshot-img"
                      />
                    </figure>
                  </div>
                </div>
              ))}
            </div>

            <div className="gp-block">
              <h2>Что делать дальше</h2>
              <p>После нажатия «Снять ограничение» возможны два варианта развития событий:</p>

              <div className="gp-substeps">
                <div className="gp-substep">
                  <h4>Система предложит пройти верификацию</h4>
                  <p>Это самый частый случай. Как правило, нужно будет:</p>
                  <ul className="gp-list">
                    <li>подтвердить номер телефона по SMS-коду;</li>
                    <li>
                      подтвердить личность — иногда потребуется фото паспорта или документа либо распознавание лица;
                    </li>
                    <li>ответить на контрольные вопросы.</li>
                  </ul>
                  <p>После успешной проверки ограничение обычно снимается сразу.</p>
                </div>

                <div className="gp-substep">
                  <h4>Система покажет срок блокировки</h4>
                  <p>
                    Если ограничение наложено на определённый период, вы увидите, на какое время заблокирован аккаунт и
                    когда он разблокируется автоматически. В этом случае нужно просто дождаться окончания срока.
                  </p>
                </div>
              </div>
            </div>

            <div className="gp-block">
              <h2>Если ничего не помогло</h2>
              <p>Если после прохождения всех шагов ограничение не снимается:</p>
              <ul className="gp-list">
                <li>
                  обратитесь в поддержку через раздел «Мой оператор клиентского сервиса» — он есть в профиле «Мои»;
                </li>
                <li>либо используйте пункт «Центр жалоб» в той же «Службе безопасности»;</li>
                <li>
                  попробуйте раздел «Заявить об…» (заявить об ограничении) рядом с кнопкой «Снять ограничение».
                </li>
              </ul>
            </div>

            <div className="gp-cta">
              <h2>Остались вопросы?</h2>
              <p>
                Напишите нам в Telegram — поможем и подскажем по вашему случаю. Если после разблокировки нужно пополнить
                баланс, обменяем рубли на юани и зачислим на Alipay.
              </p>
              <div className="gp-contacts">
                <a href="https://t.me/alipayfast" target="_blank" rel="noopener noreferrer" className="btn btn-red">
                  <TgIcon size={18} /> Telegram
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
