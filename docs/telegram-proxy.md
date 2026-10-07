# Telegram через прокси с сервера в РФ

Сайт размещается на российском сервере, а `api.telegram.org` оттуда доступен
нестабильно или закрыт. Чтобы заявки из калькулятора и уведомления
мини-приложения доходили, весь трафик к Telegram идёт через один адрес.

## Важно: VLESS/XTTP — не HTTP-прокси

Приложение не умеет говорить на VLESS напрямую. Нужен локальный клиент,
который принимает обычный SOCKS5 или HTTP и выпускает трафик через ваш
VLESS-сервер:

```
Telegram API  ←  приложение  →  127.0.0.1:10808 (SOCKS5)  →  xray (VLESS/XTTP)  →  ваш VPS  →  Telegram
```

Приложению указывается только локальный порт:

```env
TELEGRAM_PROXY_URL=socks5://127.0.0.1:10808
# или
TELEGRAM_PROXY_URL=http://127.0.0.1:10809
```

Поддерживаются `http://`, `https://`, `socks5://`, `socks5h://`.
Пустое значение — запросы идут напрямую.

## Пример конфигурации xray (клиент на сервере сайта)

Подставьте свои значения из панели, где выдается VLESS-ссылка.

```json
{
  "inbounds": [
    {
      "tag": "socks-in",
      "listen": "127.0.0.1",
      "port": 10808,
      "protocol": "socks",
      "settings": { "auth": "noauth", "udp": false }
    }
  ],
  "outbounds": [
    {
      "tag": "proxy",
      "protocol": "vless",
      "settings": {
        "vnext": [
          {
            "address": "ВАШ_СЕРВЕР",
            "port": 443,
            "users": [
              { "id": "ВАШ_UUID", "encryption": "none", "flow": "" }
            ]
          }
        ]
      },
      "streamSettings": {
        "network": "xhttp",
        "security": "tls",
        "tlsSettings": { "serverName": "ВАШ_SNI", "allowInsecure": false },
        "xhttpSettings": { "path": "ВАШ_ПУТЬ", "mode": "auto" }
      }
    }
  ]
}
```

Запуск (пример):

```bash
xray run -c /etc/xray/client.json
```

Если в вашей панели есть готовый JSON или ссылка `vless://...`, проще
воспользоваться штатным клиентом (xray, sing-box, v2ray) и включить в нём
локальный SOCKS/HTTP-порт.

## Проверка

1. Убедитесь, что локальный клиент слушает порт:

```bash
curl --socks5 127.0.0.1:10808 https://api.telegram.org/
```

2. Пропишите `TELEGRAM_PROXY_URL` в `.env.local` и перезапустите сайт.

3. Откройте диагностику (нужен токен админки):

```
GET /api/telegram/diagnose?token=<токен>
```

Ответ покажет: задан ли прокси, работает ли прямой путь, работает ли путь
через прокси и сколько заявок ждёт отправки.

## Если Telegram недоступен

Заявка с сайта **не теряется**: она сохраняется в `data/site-orders.json`
и помечается как `pending`. Дослать очередь:

```
POST /api/telegram/flush-queue?token=<токен>
```

Очередь также досылается автоматически при каждой новой заявке. Список заявок
и размер очереди — `GET /api/telegram/flush-queue?token=<токен>`.

Статусы заявки: `sent` — ушла, `pending` — ждёт отправки, `failed` — бот не
настроен (заявка сохранена, но уведомление отправить некуда).
