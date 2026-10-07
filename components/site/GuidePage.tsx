'use client'

import Image from 'next/image'
import { TgIcon } from './shared'

export function TbankGuidePage() {
  return (
    <main className="gp">
      <section className="gp-hero">
        <div className="wrap">
          <div className="gp-hero-content">
            <div>
              <h1>Как перевести деньги через Т-Банк</h1>
              <p className="gp-sub">Подробная инструкция для пополнения Alipay. Пошагово, со скриншотами, на русском.</p>
            </div>
            <div className="gp-hero-icon">💳</div>
          </div>
        </div>
      </section>

      <section className="gp-content">
        <div className="wrap">
          <article className="gp-article">
            {/* Why T-Bank */}
            <div className="gp-block">
              <figure className="gp-figure gp-figure-wide">
                <Image
                  src="/assets/covers/tbank.jpg"
                  alt="Перевод через Т-Банк для пополнения Alipay"
                  width={1248}
                  height={832}
                  sizes="(max-width: 760px) 100vw, 720px"
                  priority
                  className="gp-shot"
                />
              </figure>
              <h2>Почему мы работаем только с Т-Банком</h2>
              <p>
                Мы сознательно ограничили список банков и принимаем переводы исключительно через Т-Банк. Это не прихоть,
                а мера безопасности — и для нас, и для клиентов.
              </p>
              <p>
                Т-Банк — практически единственный банк, который позволяет отправлять чек напрямую из банковского
                приложения, без использования личной почты.
              </p>
              <p>Такой чек приходит официальным письмом от банка, а не как файл или скриншот.</p>
              <p>Это полностью исключает риск скама и поддельных («отрисованных») чеков.</p>
              <p>
                С учётом большого количества карт физически невозможно проверить каждую вручную. Поэтому мы опираемся на
                официальные подтверждения от самого банка, которым можно доверять.
              </p>
              <p>Это вынужденная, но обоснованная мера, позволяющая:</p>

              <div className="gp-grid-3">
                <div className="gp-benefit">
                  <div className="gp-benefit-icon">🛡️</div>
                  <h3>Минимизировать риски</h3>
                  <p>Защита от мошенничества</p>
                </div>
                <div className="gp-benefit">
                  <div className="gp-benefit-icon">⚡</div>
                  <h3>Ускорить обработку</h3>
                  <p>Быстрая проверка заявок</p>
                </div>
                <div className="gp-benefit">
                  <div className="gp-benefit-icon">✓</div>
                  <h3>Обеспечить прозрачность</h3>
                  <p>Безопасность обменов</p>
                </div>
              </div>

              <p>
                <strong>Безопасность операций для нас — приоритет. Именно поэтому Т-Банк.</strong>
              </p>
            </div>

            {/* Steps */}
            <div className="gp-steps">
              <h2>Пошаговая инструкция</h2>

              {/* Step 1 */}
              <div className="gp-step">
                <div className="gp-step-num">1</div>
                <div className="gp-step-content">
                  <h3>Оформляем дебетовую карту Т-Банк «Black»</h3>
                  <p>Кэшбэк до 30%, поддержка 24/7. Пополнение, переводы и обслуживание — от 0 ₽.</p>
                  <p>
                    Оформляя по ссылке ниже, вы потратите 2–5 минут онлайн и сразу сможете приступить к переводам. За
                    оформление начислят 500 ₽ — мелочь, а приятно.
                  </p>
                  <a
                    href="https://tbank.ru/baf/97eQXBjyY2P"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-red"
                  >
                    Оформить карту Т-Банк →
                  </a>
                </div>
              </div>

              {/* Step 2 */}
              <div className="gp-step">
                <div className="gp-step-num">2</div>
                <div className="gp-step-content">
                  <h3>Устанавливаем официальное приложение Т-Банк</h3>
                  <p className="gp-warning">⚠️ Важно! Только официальное приложение, не веб-версия</p>
                  <p>
                    Если вы уже клиент Т-Банка или только что прошли шаг 1, обязательно проверьте, установлено ли у вас на
                    телефоне актуальное официальное приложение Т-Банка.
                  </p>

                  <div className="gp-grid-2">
                    <div className="gp-platform">
                      <h4>Android</h4>
                      <p>Скачиваем актуальную версию из Google Play</p>
                    </div>
                    <div className="gp-platform">
                      <h4>iPhone (iOS)</h4>
                      <p>
                        В связи с тем, что приложение часто удаляют из AppStore, Т-Банк сделал отдельную инструкцию для
                        установки
                      </p>
                      <a
                        href="https://tbank.ru/baf/8lBoxTL05GW"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="gp-link"
                      >
                        Инструкция для iOS →
                      </a>
                    </div>
                  </div>

                  <div className="gp-alert">
                    <p>
                      <strong>ВНИМАНИЕ!</strong> Только официальное приложение, установленное из Google Play или
                      AppStore, позволяет отправлять чеки напрямую от Т-Банка — то есть с официальной почты банка, а не с
                      вашей личной. Именно поэтому нам не подходят web-версии, когда доступ к банку идёт через обычный
                      браузер.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="gp-step">
                <div className="gp-step-num">3</div>
                <div className="gp-step-content">
                  <h3>Переводим деньги</h3>
                  <p>
                    После получения вашей заявки и её подтверждения оператор пришлёт реквизиты счёта — номер телефона или
                    карты, куда нужно отправить деньги в счёт обмена, а также адрес электронной почты, на который надо
                    отправить чек <strong>ИЗ ПРИЛОЖЕНИЯ Т-БАНК</strong>.
                  </p>

                  <div className="gp-alert gp-alert-danger">
                    <p>
                      <strong>ВНИМАНИЕ!</strong> Перевод только с Т-Банка и одним платежом.
                    </p>
                  </div>

                  <div className="gp-alert gp-alert-danger">
                    <p>
                      <strong>ВНИМАНИЕ!!</strong> Перевод строго на тот банк, который укажет оператор. Если вам было
                      сказано отправить деньги, например, на Сбер, а вы по ошибке отправили на другой банк — к сожалению,
                      совершить обмен мы не сможем.
                    </p>
                    <p>
                      Более того, в 99% случаев вернуть деньги физически невозможно: посторонний банк, который вы выбрали
                      сами и по ошибке, как правило, уже заблокирован, и технически произвести возврат практически
                      нереально.
                    </p>
                    <p>
                      <strong>Поэтому не спешим: спокойно выбираем нужный банк, проверяем сумму и только тогда отправляем
                        деньги.</strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="gp-step">
                <div className="gp-step-num">4</div>
                <div className="gp-step-content">
                  <h3>Отправляем чек</h3>
                  <p>
                    В зависимости от устройства (Android или iPhone) отправка чека <strong>из приложения Т-Банк</strong>{' '}
                    выглядит так:
                  </p>

                  <figure className="gp-screenshot">
                    <Image
                      src="/assets/tbank/step-4-cheque.jpg"
                      alt="Где найти чек по операции в приложении Т-Банк"
                      width={585}
                      height={832}
                      sizes="(max-width: 760px) 100vw, 420px"
                      className="gp-screenshot-img"
                    />
                  </figure>

                  <div className="gp-tabs">
                    <div className="gp-tab">
                      <h4>📱 Инструкция для iOS (iPhone)</h4>
                      <ol>
                        <li>Перейдите в историю переводов и нажмите на нужный платёж</li>
                        <li>Нажмите на «Документы по операции»</li>
                        <li>Откроется чек, нажмите на иконку «Поделиться» справа сверху</li>
                        <li>
                          В появившемся снизу меню выберите «Отправить по почте» — именно этот пункт, а не приложение
                          «Почта»
                        </li>
                        <li>Затем нажмите на пункт «Другой e-mail»</li>
                        <li>Вставьте электронную почту, которую вам прислал оператор</li>
                        <li>Нажмите «Готово»</li>
                      </ol>
                    </div>

                    <div className="gp-tab">
                      <h4>🤖 Инструкция для Android</h4>
                      <ol>
                        <li>Перейдите в историю переводов и нажмите на нужный платёж</li>
                        <li>После оплаты нажмите на ссылку «Справка»</li>
                        <li>Затем нажмите на иконку «Поделиться»</li>
                        <li>В появившемся снизу меню выберите кнопку «Т-Банк — Отправить на email»</li>
                        <li>В разделе «Получатель» выберите «Другой e-mail»</li>
                        <li>Вставьте электронную почту, которую вам прислал оператор</li>
                        <li>Нажмите «Готово»</li>
                      </ol>
                    </div>
                  </div>

                  <div className="gp-alert">
                    <p>
                      <strong>Важно!</strong> После отправки чека на почту продублируйте скриншот чека в нашу переписку в
                      Telegram.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 5 */}
              <div className="gp-step">
                <div className="gp-step-num">5</div>
                <div className="gp-step-content">
                  <h3>Ожидание и отправка QR-кода</h3>
                  <p>
                    Это самый последний шаг! В переписке оператор пришлёт вам ссылку или QR-код для пополнения вашего
                    Alipay.
                  </p>
                  <p>
                    <strong>Порядок действий:</strong>
                  </p>
                  <ol>
                    <li>Открываете QR или переходите по ссылке</li>
                    <li>Попадаете на страницу оплаты в кошельке Alipay с уже указанной суммой</li>
                    <li>
                      Обязательно делаете скриншот страницы, на которую попали при переходе, или скриншот QR-кода
                    </li>
                    <li>Отправляете скриншот в переписку в Telegram</li>
                    <li>Нажимаете «Оплатить»</li>
                  </ol>
                  <p className="gp-hint">
                    Если QR-код нужно получить самостоятельно, путь в приложении Alipay такой:
                  </p>

                  <div className="gp-substeps">
                    <div className="gp-substep">
                      <h4>Шаг 5.1: Найдите раздел «Оплатить и получить»</h4>
                      <p>На главной странице Alipay нажмите на кнопку «Оплатить и получить»</p>
                      <figure className="gp-screenshot gp-screenshot-sm">
                        <Image
                          src="/assets/tbank/step-5-1.jpg"
                          alt="Alipay: кнопка «Оплатить и получить»"
                          width={736}
                          height={1600}
                          sizes="(max-width: 760px) 90vw, 320px"
                          className="gp-screenshot-img"
                        />
                      </figure>
                    </div>

                    <div className="gp-substep">
                      <h4>Шаг 5.2: Выберите «Приём платежей»</h4>
                      <p>В открывшемся меню выберите «Приём платежей»</p>
                      <figure className="gp-screenshot gp-screenshot-sm">
                        <Image
                          src="/assets/tbank/step-5-2.jpg"
                          alt="Alipay: раздел «Приём платежей»"
                          width={736}
                          height={1600}
                          sizes="(max-width: 760px) 90vw, 320px"
                          className="gp-screenshot-img"
                        />
                      </figure>
                    </div>

                    <div className="gp-substep">
                      <h4>Шаг 5.3: Сохраните QR-код</h4>
                      <p>Ваш личный QR-код для получения платежей. Нажмите «Сохранить изображение»</p>
                      <figure className="gp-screenshot gp-screenshot-sm">
                        <Image
                          src="/assets/tbank/step-5-3.jpg"
                          alt="Alipay: личный QR-код для получения платежей"
                          width={736}
                          height={1600}
                          sizes="(max-width: 760px) 90vw, 320px"
                          className="gp-screenshot-img"
                        />
                      </figure>
                    </div>
                  </div>

                  <div className="gp-alert gp-alert-success">
                    <p>
                      <strong>Готово!</strong> После оплаты обмен завершён. Обычно деньги приходят в течение нескольких
                      секунд. Спасибо за ваше доверие!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="gp-cta">
              <h2>Остались вопросы?</h2>
              <p>Свяжитесь с нами в Telegram или WhatsApp — мы всегда готовы помочь!</p>
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
