'use client'

import Link from 'next/link'
import Image from 'next/image'
import { TgIcon } from './shared'

export function TbankGuidePage() {
  return (
    <main className="gp">
      <section className="gp-hero">
        <div className="wrap">
          <Link href="/#top" className="gp-back">
            ← Вернуться на главную
          </Link>
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
            </div>

            {/* Steps */}
            <div className="gp-steps">
              <h2>Пошаговая инструкция</h2>

              {/* Step 1 */}
              <div className="gp-step">
                <div className="gp-step-num">1</div>
                <div className="gp-step-content">
                  <h3>Оформляем дебетовую карту Т-Банк</h3>
                  <p>
                    Если Вы ещё не клиент Т-Банка, оформите карту онлайн за 2-5 минут. Кэшбэк до 30%, поддержка 24/7,
                    бонус 500₽ при оформлении.
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
                    ОБЯЗАТЕЛЬНО проверьте, установлено ли у Вас на телефоне актуальное официальное приложение Т-Банка.
                  </p>

                  <div className="gp-grid-2">
                    <div className="gp-platform">
                      <h4>Android</h4>
                      <p>Скачиваем актуальную версию из Google Play</p>
                    </div>
                    <div className="gp-platform">
                      <h4>iPhone (iOS)</h4>
                      <p>
                        В связи с тем, что приложение часто удаляют из AppStore, Т-банк сделал отдельную инструкцию для
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
                      <strong>ВНИМАНИЕ!</strong> Только официальное приложение, установленное из Google Play или AppStore
                      позволяет отправлять чеки напрямую от Т-Банка (то есть с официальной почты Банка, а не с Вашей
                      личной). Именно поэтому нам не подходят Web-версии.
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
                    После получения Вашей заявки и её подтверждения, мы пришлём Вам реквизиты счета (номер телефона или
                    карты) куда необходимо отправить деньги в счет обмена.
                  </p>

                  <div className="gp-alert gp-alert-danger">
                    <p>
                      <strong>ВНИМАНИЕ!</strong> Перевод только с Т-Банка и одним платежом
                    </p>
                  </div>

                  <div className="gp-alert gp-alert-danger">
                    <p>
                      <strong>ВНИМАНИЕ!!</strong> Перевод СТРОГО на тот банк который мы укажем. В случае если Вам было
                      сказано отправить деньги к примеру на СБЕР, но Вы ошибочно отправили на другой банк — к сожалению
                      мы не сможем совершить обмен.
                    </p>
                    <p>
                      В большинстве случаев мы физически не сможем вернуть Вам деньги, поскольку обычно тот банк уже
                      заблокирован.
                    </p>
                    <p>
                      <strong>ПОЭТОМУ НЕ СПЕШИМ, спокойно выбираем нужный банк, проверяем сумму и только тогда
                        отправляем деньги.</strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="gp-step">
                <div className="gp-step-num">4</div>
                <div className="gp-step-content">
                  <h3>Отправляем чек из приложения</h3>
                  <p>В зависимости от устройства (Android или iPhone) отправка чека осуществляется следующим образом:</p>

                  <div className="gp-tabs">
                    <div className="gp-tab">
                      <h4>📱 Инструкция для iOS (iPhone)</h4>
                      <ol>
                        <li>Перейдите в историю переводов и нажмите на нужный платеж</li>
                        <li>Нажмите на "Документы по операции"</li>
                        <li>Откроется чек, нажмите на иконку "Поделиться" справа сверху</li>
                        <li>В появившемся снизу меню выберите "Отправить по почте"</li>
                        <li>Затем нажмите на пункт "Другой e-mail"</li>
                        <li>Вставьте электронную почту которую вам предоставили</li>
                        <li>Нажмите "Готово"</li>
                      </ol>
                      <div className="gp-screenshot">
                        <Image 
                          src="/assets/guide-alipay.jpg" 
                          alt="Инструкция для iPhone" 
                          width={400} 
                          height={600}
                          className="gp-screenshot-img"
                        />
                      </div>
                    </div>

                    <div className="gp-tab">
                      <h4>🤖 Инструкция для Android</h4>
                      <ol>
                        <li>Перейдите в историю переводов и нажмите на нужный платеж</li>
                        <li>После оплаты нажмите на ссылку «Справка»</li>
                        <li>Затем нажмите на иконку «Поделиться»</li>
                        <li>В появившемся снизу меню выберите кнопку «Т-Банк - Отправить на email»</li>
                        <li>В разделе «Получатель» выберите «Другой e-mail»</li>
                        <li>Вставьте электронную почту которую вам предоставили</li>
                        <li>Нажмите "Готово"</li>
                      </ol>
                      <div className="gp-screenshot">
                        <Image 
                          src="/assets/guide-poizon.png" 
                          alt="Инструкция для Android" 
                          width={400} 
                          height={600}
                          className="gp-screenshot-img"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="gp-alert">
                    <p>
                      <strong>Важно!</strong> После отправки чека на почту, дублируйте скрин чека в нашу переписку в
                      Telegram
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 5 */}
              <div className="gp-step">
                <div className="gp-step-num">5</div>
                <div className="gp-step-content">
                  <h3>Получение QR-кода и пополнение Alipay</h3>
                  <p>Это самый последний шаг! После проверки Вашего платежа, мы пришлём Вам ссылку или QR-код.</p>

                  <div className="gp-substeps">
                    <div className="gp-substep">
                      <h4>Шаг 5.1: Найдите раздел "Оплатить и получить"</h4>
                      <p>На главной странице Alipay нажмите на кнопку "Оплатить и получить"</p>
                      <div className="gp-screenshot gp-screenshot-sm">
                        <Image 
                          src="/assets/guide-alipay-en.jpg" 
                          alt="Шаг 5.1" 
                          width={360} 
                          height={280}
                          className="gp-screenshot-img"
                        />
                      </div>
                    </div>

                    <div className="gp-substep">
                      <h4>Шаг 5.2: Выберите "Прием платежей"</h4>
                      <p>В открывшемся меню выберите "Прием платежей"</p>
                      <div className="gp-screenshot gp-screenshot-sm">
                        <Image 
                          src="/assets/guide-alipay-en.jpg" 
                          alt="Шаг 5.2" 
                          width={360} 
                          height={280}
                          className="gp-screenshot-img"
                        />
                      </div>
                    </div>

                    <div className="gp-substep">
                      <h4>Шаг 5.3: Сохраните QR-код</h4>
                      <p>Ваш личный QR-код для получения платежей. Нажмите "Сохранить изображение"</p>
                      <div className="gp-screenshot gp-screenshot-sm">
                        <Image 
                          src="/assets/guide-alipay-en.jpg" 
                          alt="Шаг 5.3" 
                          width={360} 
                          height={280}
                          className="gp-screenshot-img"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="gp-alert gp-alert-success">
                    <p>
                      <strong>Готово!</strong> После оплаты обмен завершен. Обычно деньги приходят в течение нескольких
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
