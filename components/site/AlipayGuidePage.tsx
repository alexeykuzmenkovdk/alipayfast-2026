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
  ['1', 'Скачивание и установка приложения'],
  ['2', 'Регистрация аккаунта'],
  ['3', 'Международная версия интерфейса'],
  ['4', 'Верификация личности'],
  ['5', 'Платёжный пароль'],
  ['6', 'Электронная почта'],
  ['7', 'Увеличение дневного лимита'],
  ['8', 'Русский язык в приложении'],
  ['9', 'Если забыли платёжный пароль'],
  ['10', 'Как устроен Alipay'],
  ['11', 'Как оплачивать покупки'],
  ['12', 'Как вывести деньги'],
  ['13', 'Переводы внутри Alipay'],
  ['14', 'Как получать деньги'],
  ['15', 'Лимиты и ограничения'],
]

export function AlipayGuidePage() {
  return (
    <main className="gp">
      <section className="gp-hero">
        <div className="wrap">
          <Link href="/#top" className="gp-back">
            ← Вернуться на главную
          </Link>
          <div className="gp-hero-content">
            <div>
              <h1>Alipay: установка, регистрация и настройка</h1>
              <p className="gp-sub">
                Полный разбор приложения: от скачивания и верификации до переводов, оплаты покупок на китайских
                площадках и работы с лимитами.
              </p>
            </div>
            <div className="gp-hero-icon">💰</div>
          </div>
        </div>
      </section>

      <section className="gp-content">
        <div className="wrap">
          <article className="gp-article">
            {/* Вступление */}
            <div className="gp-block">
              <Shot
                src="/assets/alipay-guide/cover.jpg"
                alt="Приложение Alipay"
                width={1680}
                height={1057}
              />
              <h2>Что такое Alipay и зачем он нужен</h2>
              <p>
                Alipay — это платёжное приложение и целая экосистема сервисов, принадлежащая Alibaba Group. Один кошелёк
                открывает доступ к маркетплейсам Taobao, Tmall, 1688, а также к площадкам вроде Poizon и Goofish:
                зарегистрировавшись в одном месте, вы получаете доступ и к остальным сервисам группы.
              </p>
              <p>
                Чтобы создать и подтвердить аккаунт, понадобится мобильный телефон, действующий загранпаспорт и около
                десяти минут свободного времени. Без загранпаспорта верификацию не пройти — именно она подтверждает
                вашу личность и снимает часть ограничений.
              </p>
              <p>
                С подтверждённым аккаунтом вы сможете сами оплачивать покупки на китайских площадках, переписываться с
                продавцами, отслеживать посылки и пользоваться множеством дополнительных функций приложения.
              </p>

              <div className="gp-alert">
                <p>
                  <strong>Запомните!</strong> Пароль для входа и платёжный пароль лучше сразу сохранить в надёжном
                  месте. Иногда восстановить их не получается, и тогда доступ к кошельку будет потерян.
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
                  <h3>Скачивание и установка приложения</h3>
                  <p>
                    Приложение Alipay бесплатно доступно в App Store для iPhone и в Play Market для Android. Откройте
                    магазин приложений, введите в поиске <strong>«Alipay»</strong> и нажмите кнопку установки.
                  </p>
                  <Shot
                    src="/assets/alipay-guide/01-download.jpg"
                    alt="Поиск приложения Alipay в магазине приложений"
                    width={1300}
                    height={1300}
                    caption="Найдите Alipay в магазине приложений и установите его"
                  />
                </div>
              </div>

              {/* 2 */}
              <div className="gp-step" id="2">
                <div className="gp-step-num">2</div>
                <div className="gp-step-content">
                  <h3>Регистрация аккаунта</h3>
                  <p>
                    Откройте приложение. На стартовом экране со строкой для номера телефона нажмите на код страны
                    <strong> «+86»</strong>, найдите в списке <strong>Россию (+7)</strong>, введите свой номер и
                    нажмите <strong>«Sign up»</strong>.
                  </p>
                  <Shot
                    src="/assets/alipay-guide/02-signup-phone.jpg"
                    alt="Ввод номера телефона при регистрации в Alipay"
                    width={1680}
                    height={1129}
                  />
                  <p>
                    Затем примите сервисное соглашение по кнопке <strong>«Agree»</strong>, пройдите проверку капчи и
                    подтвердите её кнопкой <strong>«Confirm»</strong>.
                  </p>
                  <Shot
                    src="/assets/alipay-guide/03-signup-agree.jpg"
                    alt="Принятие соглашения и прохождение капчи"
                    width={1680}
                    height={1129}
                  />
                  <p>
                    Последний шаг — подтверждение номера телефона. На указанный номер придёт сообщение с шестизначным
                    кодом: введите его, а в открывшемся окне выберите Россию в качестве страны или региона.
                  </p>
                  <Shot
                    src="/assets/alipay-guide/04-signup-sms.jpg"
                    alt="Подтверждение номера телефона кодом из СМС"
                    width={1680}
                    height={1129}
                  />
                  <div className="gp-alert gp-alert-success">
                    <p>
                      <strong>Готово.</strong> Первичная регистрация завершена — можно переходить к настройке и
                      верификации аккаунта.
                    </p>
                  </div>
                </div>
              </div>

              {/* 3 */}
              <div className="gp-step" id="3">
                <div className="gp-step-num">3</div>
                <div className="gp-step-content">
                  <h3>Переключение интерфейса на международную версию</h3>
                  <p>
                    Сразу после регистрации приложение обычно само предлагает перейти на международную версию — интерфейс
                    в ней понятнее и проще. Нажмите внизу экрана <strong>«Switch»</strong>, смените режим с
                    <strong> «Standard»</strong> на <strong>«International»</strong> и сохраните выбор кнопкой
                    <strong> «Save»</strong>.
                  </p>
                  <Shot
                    src="/assets/alipay-guide/05-switch-international.jpg"
                    alt="Переключение на международную версию интерфейса"
                    width={1680}
                    height={1129}
                  />
                  <p>
                    Если вы не успели нажать «Switch», ничего страшного: то же самое делается в настройках. Откройте
                    раздел <strong>«Me / Account»</strong> на нижней панели, нажмите на шестерёнку в правом верхнем углу
                    и зайдите в <strong>«Switch Version»</strong>, где версия приложения меняется тем же способом.
                  </p>
                  <Shot
                    src="/assets/alipay-guide/06-switch-version-settings.jpg"
                    alt="Смена версии приложения через настройки"
                    width={1300}
                    height={1300}
                  />
                </div>
              </div>

              {/* 4 */}
              <div className="gp-step" id="4">
                <div className="gp-step-num">4</div>
                <div className="gp-step-content">
                  <h3>Верификация личности</h3>
                  <p className="gp-warning">⚠️ Для верификации обязательно нужен действующий загранпаспорт</p>
                  <p>
                    Откройте настройки, затем раздел <strong>«Account and Security»</strong> и выберите
                    <strong> «Identity information»</strong>.
                  </p>
                  <Shot
                    src="/assets/alipay-guide/07-identity-info.jpg"
                    alt="Раздел Identity information в настройках"
                    width={1934}
                    height={1300}
                  />
                  <p>
                    Укажите страну или регион (Russia) и тип документа (Passport), после чего по порядку заполните
                    обязательные поля:
                  </p>
                  <ol>
                    <li>Фамилия и имя латиницей — точно как в загранпаспорте</li>
                    <li>Номер паспорта</li>
                    <li>Пол</li>
                    <li>Дата рождения</li>
                    <li>Срок действия паспорта</li>
                  </ol>
                  <Shot
                    src="/assets/alipay-guide/08-identity-fields.jpg"
                    alt="Заполнение паспортных данных"
                    width={1300}
                    height={1300}
                  />
                  <p>
                    Вместо ручного ввода можно отсканировать паспорт — тогда поля заполнятся автоматически. Поместите
                    документ в рамку и сделайте фото, чтобы приложение считало данные.
                  </p>
                  <Shot
                    src="/assets/alipay-guide/09-passport-scan.jpg"
                    alt="Сканирование загранпаспорта"
                    width={1300}
                    height={1300}
                  />
                  <Shot
                    src="/assets/alipay-guide/10-passport-frame.jpg"
                    alt="Паспорт в рамке для сканирования"
                    width={620}
                    height={1300}
                  />
                  <p>
                    Обязательно проверьте считанные данные: если всё верно, нажмите <strong>«Submit»</strong>.
                  </p>
                  <p>
                    Далее снова зайдите в <strong>«Identity information»</strong> и откройте
                    <strong> «Basic identify information»</strong>.
                  </p>
                  <Shot
                    src="/assets/alipay-guide/11-basic-identity.jpg"
                    alt="Раздел Basic identify information"
                    width={1300}
                    height={1300}
                  />
                  <p>
                    В поле <strong>«Occupation type»</strong> (род деятельности) выберите <strong>«Other»</strong>.
                  </p>
                  <Shot
                    src="/assets/alipay-guide/12-occupation.jpg"
                    alt="Выбор рода деятельности"
                    width={1300}
                    height={1300}
                  />
                  <p>
                    В разделе <strong>«Address»</strong> укажите адрес проживания латиницей — для перевода удобно
                    воспользоваться любым онлайн-переводчиком.
                  </p>
                  <Shot
                    src="/assets/alipay-guide/13-address.jpg"
                    alt="Ввод адреса проживания латиницей"
                    width={1300}
                    height={1300}
                  />
                  <p>
                    Осталось подтвердить личность по лицу. Вернитесь в <strong>«Identity information»</strong>, нажмите
                    <strong> «Real-name verification status»</strong> и <strong>«complete»</strong>.
                  </p>
                  <Shot
                    src="/assets/alipay-guide/14-verification-status.jpg"
                    alt="Статус верификации по лицу"
                    width={650}
                    height={650}
                  />
                  <p>
                    В открывшемся окне выберите рекомендуемый вариант и нажмите <strong>«Verify Now»</strong>.
                  </p>
                  <Shot
                    src="/assets/alipay-guide/15-verify-now.jpg"
                    alt="Запуск проверки по лицу"
                    width={1300}
                    height={1300}
                  />
                  <p>
                    Далее несколько секунд смотрите в камеру, пока идёт сканирование лица. Дождитесь сообщения об
                    успешном завершении.
                  </p>
                  <Shot
                    src="/assets/alipay-guide/16-face-scan.jpg"
                    alt="Сканирование лица"
                    width={1300}
                    height={1300}
                  />
                  <p>
                    У полностью подтверждённого аккаунта рядом с именем появится отметка <strong>«Verified»</strong>.
                  </p>
                  <Shot
                    src="/assets/alipay-guide/17-verified.jpg"
                    alt="Отметка Verified у аккаунта"
                    width={620}
                    height={1300}
                  />
                </div>
              </div>

              {/* 5 */}
              <div className="gp-step" id="5">
                <div className="gp-step-num">5</div>
                <div className="gp-step-content">
                  <h3>Установка платёжного пароля</h3>
                  <p>
                    Платёжный пароль подтверждает переводы, покупки и другие операции. Это шесть цифр, которые мы
                    советуем сразу записать и надёжно сохранить — восстановить их бывает непросто.
                  </p>
                  <p>
                    Чтобы задать пароль, откройте настройки, затем <strong>«Payment Settings»</strong> и раздел
                    <strong> «Payment Password»</strong>. На некоторых экранах приложение запрещает запись, но сам шаг
                    простой и сложностей не вызывает.
                  </p>
                  <div className="gp-alert">
                    <p>
                      <strong>Совет.</strong> Используйте разные цифры без повторов — так пароль надёжнее и приложение
                      с большей вероятностью его примет.
                    </p>
                  </div>
                  <Shot
                    src="/assets/alipay-guide/18-payment-password.jpg"
                    alt="Раздел Payment Password в настройках"
                    width={1300}
                    height={1300}
                  />
                </div>
              </div>

              {/* 6 */}
              <div className="gp-step" id="6">
                <div className="gp-step-num">6</div>
                <div className="gp-step-content">
                  <h3>Добавление электронной почты</h3>
                  <p>
                    Почта повышает безопасность аккаунта и заметно упрощает восстановление платёжного пароля, если вы
                    его забудете.
                  </p>
                  <p>
                    Откройте <strong>«Настройки»</strong>, затем <strong>«Account and Security»</strong> и раздел
                    <strong> «Email Address»</strong>.
                  </p>
                  <Shot
                    src="/assets/alipay-guide/19-email.jpg"
                    alt="Раздел Email Address"
                    width={650}
                    height={650}
                  />
                  <p>
                    Введите адрес и нажмите <strong>«Get verification code»</strong>. Код придёт по СМС на привязанный
                    номер: укажите его, нажмите <strong>«Next»</strong> — появится уведомление, что почта добавлена.
                  </p>
                  <Shot
                    src="/assets/alipay-guide/20-email-code.jpg"
                    alt="Подтверждение электронной почты кодом"
                    width={1680}
                    height={1129}
                  />
                </div>
              </div>

              {/* 7 */}
              <div className="gp-step" id="7">
                <div className="gp-step-num">7</div>
                <div className="gp-step-content">
                  <h3>Увеличение дневного лимита</h3>
                  <p>
                    Дневной лимит повышается установкой цифрового сертификата. Откройте <strong>«Настройки»</strong>,
                    <strong> «Account and Security»</strong> и перейдите в <strong>«Security Center»</strong>.
                  </p>
                  <Shot
                    src="/assets/alipay-guide/07-identity-info.jpg"
                    alt="Раздел Security Center в настройках"
                    width={1934}
                    height={1300}
                  />
                  <p>
                    Затем откройте <strong>«Digital Certificate»</strong> и нажмите
                    <strong> «Install the digital certificate»</strong>.
                  </p>
                  <Shot
                    src="/assets/alipay-guide/21-digital-certificate.jpg"
                    alt="Установка цифрового сертификата"
                    width={1300}
                    height={1300}
                  />
                  <p>
                    Для подтверждения личности введите номер загранпаспорта и подтвердите действие кодом из СМС.
                  </p>
                  <Shot
                    src="/assets/alipay-guide/22-certificate-passport.jpg"
                    alt="Подтверждение номера паспорта"
                    width={1300}
                    height={1300}
                  />
                  <p>
                    После ввода кода появится сообщение об успешной установке сертификата. Чтобы вернуться в главное
                    меню, нажмите на крестик в верхней части экрана.
                  </p>
                  <Shot
                    src="/assets/alipay-guide/23-certificate-done.jpg"
                    alt="Цифровой сертификат установлен"
                    width={620}
                    height={1300}
                  />
                </div>
              </div>

              {/* 8 */}
              <div className="gp-step" id="8">
                <div className="gp-step-num">8</div>
                <div className="gp-step-content">
                  <h3>Как включить русский язык</h3>
                  <p>
                    В приложении можно включить русский язык. Перевод местами не идеален, но пользоваться становится
                    заметно удобнее.
                  </p>
                  <p>
                    Откройте <strong>«Настройки»</strong>, затем <strong>«General»</strong> и
                    <strong> «Language»</strong>.
                  </p>
                  <Shot
                    src="/assets/alipay-guide/24-language.jpg"
                    alt="Раздел Language в настройках"
                    width={1300}
                    height={1300}
                  />
                  <p>
                    Выберите нужный язык из списка — в нашем случае русский — и нажмите <strong>«Save»</strong>.
                  </p>
                  <Shot
                    src="/assets/alipay-guide/25-language-save.jpg"
                    alt="Выбор языка и сохранение"
                    width={1300}
                    height={1300}
                  />
                </div>
              </div>

              {/* 9 */}
              <div className="gp-step" id="9">
                <div className="gp-step-num">9</div>
                <div className="gp-step-content">
                  <h3>Что делать, если забыли платёжный пароль</h3>
                  <p>
                    Забытый или устаревший платёжный пароль меняется через настройки: <strong>«Настройки»</strong> →
                    <strong> «Payment Settings»</strong> → <strong>«Payment Password»</strong>.
                  </p>
                  <Shot
                    src="/assets/alipay-guide/26-password-section.jpg"
                    alt="Раздел для изменения платёжного пароля"
                    width={1680}
                    height={1128}
                  />
                  <p>Дальше возможны два варианта.</p>
                  <div className="gp-grid-2">
                    <div className="gp-platform">
                      <h4>Вариант 1. Пароль помните</h4>
                      <p>
                        Нажмите <strong>«Yes»</strong>, введите текущий платёжный пароль — после этого приложение
                        разрешит задать новый и сохранить его.
                      </p>
                      <Shot
                        src="/assets/alipay-guide/27-password-remember.jpg"
                        alt="Изменение пароля при знании текущего"
                        width={713}
                        height={1495}
                      />
                    </div>
                    <div className="gp-platform">
                      <h4>Вариант 2. Пароль не помните</h4>
                      <p>
                        Нажмите <strong>«No»</strong>, введите код подтверждения из СМС, затем номер загранпаспорта для
                        подтверждения личности и нажмите <strong>«Next»</strong>. В редких случаях приложение может
                        попросить отсканировать паспорт.
                      </p>
                      <Shot
                        src="/assets/alipay-guide/28-password-forgot.jpg"
                        alt="Восстановление пароля без знания текущего"
                        width={2225}
                        height={1495}
                      />
                    </div>
                  </div>
                  <p>
                    После подтверждения можно задать новый платёжный пароль. На отдельных экранах приложение запрещает
                    снимки, поэтому ввод нового пароля на иллюстрациях не показан.
                  </p>
                </div>
              </div>

              {/* 10 */}
              <div className="gp-step" id="10">
                <div className="gp-step-num">10</div>
                <div className="gp-step-content">
                  <h3>Как устроен и как работает Alipay</h3>
                  <p>
                    Alipay устроен как обычный электронный кошелёк. Внутри есть баланс, который пополняется для
                    покупок, либо привязывается банковская карта (карты российских банков не принимаются).
                  </p>
                  <p>
                    После пополнения баланс можно тратить на любой китайской площадке. Кроме того, деньги можно
                    переводить другим пользователям приложения — это часто выручает при совместных заказах.
                  </p>
                  <p>
                    Помимо оплаты, переводов и переписки, у приложения есть дополнительные возможности: например, внутри
                    Alipay можно добавить трек-номер и следить сразу за несколькими посылками.
                  </p>
                  <p>
                    Пользоваться приложением несложно: есть встроенный переводчик, а интерфейс доступен полностью на
                    русском языке. Все основные действия — пополнение, перевод и сканирование QR-кодов — находятся на
                    главной странице, которую можно настроить под себя и вынести нужные мини-приложения.
                  </p>
                </div>
              </div>

              {/* 11 */}
              <div className="gp-step" id="11">
                <div className="gp-step-num">11</div>
                <div className="gp-step-content">
                  <h3>Как оплачивать через Alipay</h3>
                  <p>
                    Чтобы оплатить покупку, на кошельке должен быть положительный баланс. Если он есть, всё просто:
                    откройте приложение площадки, выберите товар и нажмите кнопку оплаты.
                  </p>
                  <p>
                    Появится меню выбора способа оплаты: Alipay или WeChat, оплата другим человеком, банковская карта и
                    так далее. Площадка сама определит и подтянет ваш Alipay — останется ввести платёжный пароль для
                    подтверждения операции.
                  </p>
                </div>
              </div>

              {/* 12 */}
              <div className="gp-step" id="12">
                <div className="gp-step-num">12</div>
                <div className="gp-step-content">
                  <h3>Как вывести деньги с Alipay</h3>
                  <p>
                    Вывод средств для российских пользователей — задача не самая простая, но решаемая. Есть несколько
                    путей, и можно выбрать наиболее удобный.
                  </p>
                  <p>
                    Первый вариант — онлайн-обменники: там можно найти выгодный курс и обменять юани на рубли. Второй —
                    телеграм-обменники, которые помимо прямого обмена нередко предлагают и обратный.
                  </p>
                  <p>
                    Наконец, юани можно обменять в тематических чатах о покупках в Китае: там людям часто нужны
                    небольшие суммы, которые обменники не берутся пополнять.
                  </p>
                </div>
              </div>

              {/* 13 */}
              <div className="gp-step" id="13">
                <div className="gp-step-num">13</div>
                <div className="gp-step-content">
                  <h3>Переводы денежных средств внутри Alipay</h3>
                  <p>Перевести деньги другому пользователю можно двумя основными способами.</p>

                  <div className="gp-substeps">
                    <div className="gp-substep">
                      <h4>Способ 1. По QR-коду</h4>
                      <p>
                        Получатель отправляет вам платёжный QR-код. На главной странице Alipay нажмите
                        <strong> «Scan»</strong> в левом верхнем углу, отсканируйте код камерой (или выберите его из
                        галереи), укажите сумму и подтвердите перевод платёжным паролем.
                      </p>
                      <Shot
                        src="/assets/alipay-guide/29-scan-qr.jpg"
                        alt="Сканирование QR-кода для перевода"
                        width={1680}
                        height={1128}
                      />
                      <p>
                        После ввода пароля деньги уходят получателю, а на экране появляется уведомление об успешном
                        переводе.
                      </p>
                      <Shot
                        src="/assets/alipay-guide/30-transfer-done.jpg"
                        alt="Уведомление об успешном переводе"
                        width={713}
                        height={1495}
                      />
                    </div>

                    <div className="gp-substep">
                      <h4>Способ 2. По номеру телефона</h4>
                      <p>
                        Откройте раздел <strong>«Pay / Receive»</strong> кнопкой в верхней части экрана, затем
                        <strong> «Transfer»</strong>.
                      </p>
                      <Shot
                        src="/assets/alipay-guide/31-pay-receive.jpg"
                        alt="Раздел Pay Receive"
                        width={713}
                        height={1495}
                      />
                      <p>
                        Нажмите <strong>«Transfer to Alipay»</strong>, введите номер получателя в формате
                        <strong> «7-123456789»</strong> и нажмите <strong>«Confirm»</strong>.
                      </p>
                      <Shot
                        src="/assets/alipay-guide/32-transfer-phone.jpg"
                        alt="Ввод номера телефона получателя"
                        width={1495}
                        height={1495}
                      />
                      <p>
                        Убедитесь, что найден верный пользователь, выберите его нажатием и отправьте средства.
                      </p>
                      <Shot
                        src="/assets/alipay-guide/33-transfer-select.jpg"
                        alt="Выбор получателя перевода"
                        width={1680}
                        height={1128}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 14 */}
              <div className="gp-step" id="14">
                <div className="gp-step-num">14</div>
                <div className="gp-step-content">
                  <h3>Как получать деньги от других пользователей</h3>
                  <p>
                    Вам могут перевести средства по номеру телефона в формате <strong>«7-123456789»</strong> либо по
                    платёжному QR-коду, который вы отправите.
                  </p>
                  <p>
                    Откройте раздел <strong>«Pay / Receive»</strong> и нажмите <strong>«Receive»</strong> — в
                    открывшемся окне будет QR-код, отсканировав который пользователи смогут отправить вам деньги на
                    баланс.
                  </p>
                  <Shot
                    src="/assets/alipay-guide/34-receive-qr.jpg"
                    alt="QR-код для получения средств"
                    width={1495}
                    height={1495}
                  />
                  <p>
                    Код можно отправить как скриншотом, так и сохранённым изображением — по кнопке
                    <strong> «Save Picture»</strong>.
                  </p>
                  <Shot
                    src="/assets/alipay-guide/35-receive-save.jpg"
                    alt="Сохранение QR-кода"
                    width={713}
                    height={1495}
                  />
                  <p>
                    Можно также задать конкретную сумму: нажмите <strong>«Specify Amount»</strong>, введите её и
                    подтвердите кнопкой <strong>«OK»</strong>. По такому коду получится перевести только указанную
                    сумму.
                  </p>
                  <Shot
                    src="/assets/alipay-guide/36-receive-amount.jpg"
                    alt="Указание суммы для получения"
                    width={1680}
                    height={1128}
                  />
                </div>
              </div>

              {/* 15 */}
              <div className="gp-step" id="15">
                <div className="gp-step-num">15</div>
                <div className="gp-step-content">
                  <h3>Лимиты и ограничения</h3>
                  <p>
                    Для иностранных пользователей платформа открывает широкие возможности, но стоит учитывать лимиты —
                    они зависят от уровня подтверждения аккаунта и влияют на пополнение, переводы, платежи и снятие
                    наличных.
                  </p>
                  <p>
                    У неподтверждённого аккаунта лимиты минимальны: разовое пополнение — не более 1 000 юаней, дневное —
                    не более 2 000 юаней. У аккаунтов, прошедших верификацию по загранпаспорту, лимиты заметно выше:
                    разовый платёж может доходить до 50 000 юаней, а годовой — до 200 000 юаней. Покупки и переводы
                    между пользователями подчиняются аналогичным ограничениям.
                  </p>
                  <p>
                    При этом ограничения могут отличаться в зависимости от привязанной карты и страны операции. Проверить
                    свои лимиты просто: откройте приложение, зайдите в настройки и выберите соответствующий пункт. Если
                    лимитов не хватает, их можно увеличить, пройдя полную верификацию — с загрузкой скана загранпаспорта,
                    актуальными контактными данными и привязкой международной карты.
                  </p>
                  <p>
                    В отдельных случаях приложение запрашивает дополнительную информацию: подтверждение адреса проживания
                    или банковские выписки. Если этого недостаточно, стоит обратиться в поддержку Alipay — там предложат
                    решение под вашу ситуацию.
                  </p>
                  <p>
                    Отдельно учитывайте, что за пределами Китая часть функций работает иначе, а лимиты на международные
                    переводы и платежи могут быть снижены. Чтобы избежать неожиданностей, лучше заранее проверить
                    условия и подготовить документы для повышения лимитов.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="gp-cta">
              <h2>Нужно пополнить Alipay?</h2>
              <p>
                Поможем с пополнением кошелька: курс ЦБ РФ плюс прозрачная надбавка, без скрытых комиссий. Зачисление
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
