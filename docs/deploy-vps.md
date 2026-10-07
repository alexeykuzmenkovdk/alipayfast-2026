# Установка нового сайта на VPS вместо старого (AlipayFast)

Гайд рассчитан на сервер, где уже работает старый сайт alipayfast.ru из
прежнего репозитория (Ali2026), под управлением nginx. Задача: безопасно
снести старую сборку и поставить новую из репозитория `alipayfast-2026`,
не потеряв данные и не оставив сайт лежать.

Порядок специально такой: сначала инвентаризация и бэкап, потом остановка
старого, потом установка нового. Ничего не удаляем, пока новая версия не
проверена.

---

## 0. Переменные, которые понадобятся

Задайте их один раз в текущей сессии — дальше команды используют их:

```bash
export DOMAIN=alipayfast.ru
export APP_DIR=/opt/alipayfast          # куда встанет новый сайт
export APP_USER=alipayfast              # служебный пользователь
export PORT=3000                        # локальный порт приложения
export REPO=git@github.com:alexeykuzmenkovdk/alipayfast-2026.git
```

Если сервер арендован и вы заходите не под root, все команды с `sudo`
выполняются от пользователя с sudo-правами.

---

## 1. Что должно быть на сервере

Проверьте версии:

```bash
lsb_release -a            # ожидаем Ubuntu 22.04 или 24.04
nginx -v                  # по факту стоит 1.24
node -v || echo "node нет"
psql --version || echo "postgres нет"
free -h                   # сколько памяти
df -h /                   # сколько места
```

Требования нового сайта:

| Что | Минимум | Почему |
|---|---|---|
| Ubuntu | 22.04+ | Next.js 14, Node 20 |
| RAM | 1 ГБ (лучше 2 ГБ) | `next build` прожорлив, при 1 ГБ нужен swap |
| Диск | 5 ГБ свободно | node_modules ~500 МБ, .next ~200 МБ, картинки ~27 МБ |
| Node.js | 20 LTS | Next 14 требует ≥ 18.17 |
| PostgreSQL | 14+ | заявки, чат сделки, витрина |
| nginx | есть | реверс-прокси и HTTPS |
| git | есть | деплой из репозитория |

### Если памяти 1 ГБ — сразу добавьте swap

Без swap сборка часто падает с `Killed`:

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
free -h
```

---

## 2. Инвентаризация старого сайта

Прежде чем что-то трогать, выясните, чем запущен старый сайт и где он лежит.
Ниже — четыре команды, которые закрывают все типовые варианты.

### 2.1. Что слушает порты

```bash
sudo ss -tlnp | grep -E ':(80|443|3000|3001|5000|8000|8080)\s'
```

В колонке `users:(("nginx",...))` — nginx, а рядом увидите `node`, `php-fpm`,
`python` или `docker-proxy`. Это и есть процесс старого сайта.

### 2.2. Какие сервисы systemd существуют

```bash
systemctl list-units --type=service --all | grep -iE 'alipay|ali2026|node|next|site'
```

Обратите внимание на `loaded active running` — это работающие сервисы.

### 2.3. Есть ли PM2 или Docker

```bash
sudo -u www-data pm2 list 2>/dev/null || pm2 list 2>/dev/null || echo "pm2 не используется"
sudo docker ps 2>/dev/null || echo "docker не используется"
```

### 2.4. Конфиг nginx и каталог сайта

```bash
ls -la /etc/nginx/sites-enabled/
grep -rn "server_name\|root\|proxy_pass" /etc/nginx/sites-enabled/ | head -30
```

В `root ...` или `proxy_pass http://127.0.0.1:XXXX` — путь к старому сайту и
его порт. Дополнительно найдите каталог:

```bash
ls -la /var/www /opt /srv /home 2>/dev/null | head -40
```

Запишите найденное, дальше понадобятся: имя сервиса, каталог, порт, файл
конфига nginx. Например:

```
сервис:   ali2026.service
каталог:  /var/www/ali2026
порт:     3000
nginx:    /etc/nginx/sites-enabled/alipayfast.ru
```

---

## 3. Бэкап (обязательно)

### 3.1. Сайт целиком

```bash
export OLD_DIR=/var/www/ali2026            # подставьте свой путь
sudo mkdir -p /root/backup-$(date +%F)
sudo tar czf /root/backup-$(date +%F)/old-site.tar.gz -C "$(dirname $OLD_DIR)" "$(basename $OLD_DIR)"
ls -lh /root/backup-$(date +%F)/
```

Если в каталоге есть `node_modules` и `.next` — их можно исключить, чтобы
архив был легче:

```bash
sudo tar czf /root/backup-$(date +%F)/old-site.tar.gz \
  --exclude=node_modules --exclude=.next \
  -C "$(dirname $OLD_DIR)" "$(basename $OLD_DIR)"
```

### 3.2. Настройки старого сайта

```bash
sudo cp /etc/nginx/sites-available/alipayfast.ru /root/backup-$(date +%F)/ 2>/dev/null
sudo cp -a /etc/nginx/sites-enabled /root/backup-$(date +%F)/sites-enabled-copy
sudo cp "$OLD_DIR/.env" /root/backup-$(date +%F)/old.env 2>/dev/null || echo "старый .env не найден"
```

**Сохраните старый `.env` — в нём токены Telegram, пароли и ключи старого сайта.**
Он пригодится, чтобы не заводить бота и чат заново.

### 3.3. База данных старого сайта

Сначала узнайте имя базы из старого `.env` (`DATABASE_URL`), затем:

```bash
sudo -u postgres pg_dump -Fc ИМЯ_СТАРОЙ_БАЗЫ > /root/backup-$(date +%F)/old-db.dump
sudo -u postgres psql -l | head -20        # список баз, если имя не нашли
```

Проверьте, что дамп не пустой:

```bash
ls -lh /root/backup-$(date +%F)/old-db.dump
```

Базу **не удаляем** до конца работ: если понадобится, старый сайт можно
вернуть за пару минут.

---

## 4. Остановка старого сайта

### 4.1. Если это systemd-сервис

```bash
sudo systemctl stop ali2026.service
sudo systemctl disable ali2026.service
systemctl status ali2026.service --no-pager | head -5
```

### 4.2. Если это PM2

```bash
sudo -u www-data pm2 delete ИМЯ_ПРОЦЕССА
sudo -u www-data pm2 save
```

### 4.3. Если это Docker

```bash
sudo docker ps                                   # узнайте имя контейнера
cd КАТАЛОГ_С_DOCKER_COMPOSE
sudo docker compose down
```

### 4.4. Проверка, что старый сайт действительно остановлен

```bash
sudo ss -tlnp | grep -E ":$PORT\s" || echo "порт $PORT свободен — можно ставить новый сайт"
curl -sI http://127.0.0.1:$PORT | head -3 || echo "на порту $PORT никто не отвечает"
```

Порт должен освободиться. Если занят — вернитесь к шагу 2.1 и найдите, кто
его держит: `sudo lsof -i :$PORT`.

### 4.5. Убрать старый сайт из nginx

Сайт пока не удаляем, но конфиг отключаем, чтобы новый занял место:

```bash
sudo unlink /etc/nginx/sites-enabled/alipayfast.ru
sudo nginx -t
sudo systemctl reload nginx
```

На этом этапе домен временно отдаёт 404/502 — это нормально, дольше пары
минут так держать не нужно.

---

## 5. Установка окружения

### 5.1. Node.js 20 LTS

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git
node -v && npm -v          # ожидаем v20.x
```

### 5.2. PostgreSQL

Если PostgreSQL уже стоит (старый сайт его использовал) — пропустите установку,
но проверьте, что он работает: `sudo systemctl status postgresql --no-pager`.

```bash
sudo apt-get install -y postgresql postgresql-contrib
sudo systemctl enable --now postgresql
pg_isready
```

Создайте пользователя и базу под новый сайт (пароль придумайте длинный):

```bash
sudo -u postgres psql <<'SQL'
CREATE ROLE alipayfast WITH LOGIN PASSWORD 'ЗАМЕНИТЕ_НА_СВОЙ_ПАРОЛЬ';
CREATE DATABASE alipayfast OWNER alipayfast;
GRANT ALL PRIVILEGES ON DATABASE alipayfast TO alipayfast;
SQL
```

Проверка подключения:

```bash
psql "postgres://alipayfast:ЗАМЕНИТЕ_НА_СВОЙ_ПАРОЛЬ@127.0.0.1:5432/alipayfast" -c 'select 1;'
```

Таблицы создавать руками не нужно — приложение делает это само при первом
запросе (`ensureSchema()` в `lib/db.ts`).

### 5.3. Пользователь для сервиса

```bash
sudo useradd --system --create-home --shell /usr/sbin/nologin "$APP_USER" || true
id "$APP_USER"
```

### 5.4. jq (пригодится для проверок Telegram)

```bash
sudo apt-get install -y jq
```

---

## 6. Получение кода

Репозиторий приватный, поэтому нужен доступ. Выберите один из вариантов.

### Вариант A — deploy key (рекомендуется)

```bash
sudo -u "$APP_USER" -H ssh-keygen -t ed25519 -N "" -f "/home/$APP_USER/.ssh/id_ed25519"
sudo cat "/home/$APP_USER/.ssh/id_ed25519.pub"
```

Полученный ключ добавьте в GitHub: репозиторий → Settings → Deploy keys →
Add deploy key (галочку «Allow write access» ставить не нужно).

Затем проверьте доступ и клонируйте:

```bash
sudo -u "$APP_USER" -H ssh -o StrictHostKeyChecking=accept-new -T git@github.com || true
sudo git clone "$REPO" "$APP_DIR"
sudo chown -R "$APP_USER:$APP_USER" "$APP_DIR"
```

**Клонируйте полной историей, без `--depth 1`** — от git-истории зависят даты
`lastmod` в sitemap (см. `lib/dates.ts`).

### Вариант B — по HTTPS с токеном

Создайте на GitHub Personal Access Token (права `repo`) и используйте его в URL:

```bash
sudo git clone https://ЛОГИН:ТОКЕН@github.com/alexeykuzmenkovdk/alipayfast-2026.git "$APP_DIR"
sudo chown -R "$APP_USER:$APP_USER" "$APP_DIR"
sudo -u "$APP_USER" git -C "$APP_DIR" remote set-url origin "$REPO"
```

Последняя команда убирает токен из конфига репозитория, чтобы он не остался
в открытом виде.

---

## 7. Файл окружения `.env`

```bash
sudo -u "$APP_USER" touch "$APP_DIR/.env"
sudo chmod 600 "$APP_DIR/.env"
sudo -u "$APP_USER" nano "$APP_DIR/.env"
```

Минимально необходимый набор:

```env
# ── База данных ────────────────────────────────────────────
DATABASE_URL=postgres://alipayfast:ЗАМЕНИТЕ_НА_СВОЙ_ПАРОЛЬ@127.0.0.1:5432/alipayfast

# ── Админка ────────────────────────────────────────────────
ADMIN_PASSWORD=ДЛИННЫЙ_НОВЫЙ_ПАРОЛЬ

# ── Сайт и заявки из калькулятора ─────────────────────────
TELEGRAM_SITE_BOT_TOKEN=токен_бота_сайта
TELEGRAM_SITE_CHAT_ID=ваш_telegram_id

# ── Мини-приложение ───────────────────────────────────────
TELEGRAM_MINI_APP_BOT_TOKEN=токен_бота_мини_приложения
# Если панель оператора открывается из другого бота — его токен (необязательно)
TELEGRAM_ADMIN_BOT_TOKEN=
ADMIN_USER_ID=ваш_telegram_id
TELEGRAM_WEBHOOK_SECRET=случайная_строка_32_символа
MINI_APP_URL=https://alipayfast.ru/telegram-mini-app
ADMIN_MINI_APP_URL=https://alipayfast.ru/admin/tg
TELEGRAM_MINI_APP_LINK=https://t.me/AlipayFastBot/alipayfast

# ── Представление оператора клиенту ───────────────────────
ADMIN_DISPLAY_NAME=alipayfast
ADMIN_CONTACT=@whaledator

# ── Курс и витрина ────────────────────────────────────────
SHOWCASE_EXCHANGE_RATE=12.5

# ── Загрузка чеков ────────────────────────────────────────
UPLOADS_DIR=./public/uploads
UPLOADS_BASE_URL=/uploads

# ── Верификация в поисковиках (коды из кабинета) ──────────
GOOGLE_VERIFICATION=
YANDEX_VERIFICATION=

# ── Telegram через прокси (только если сервер в РФ) ───────
# Подробности: docs/telegram-proxy.md
TELEGRAM_PROXY_URL=
```

Пояснения:

- `DATABASE_URL` — обязателен. Без него мини-приложение откроется, но заявки,
  чат сделки и витрина работать не будут.
- `PG_POOL_MAX` **не задавайте**: он нужен только для локальной разработки на
  PGlite. Для настоящего PostgreSQL пусть работает размер пула по умолчанию.
- `UPLOADS_DIR` относительный — считается от рабочего каталога сервиса,
  поэтому в systemd обязательно будет `WorkingDirectory=$APP_DIR`.
- Пароли и секреты не должны содержать пробелов и символа `#` — systemd читает
  этот файл по своим правилам.

Сгенерировать случайные значения:

```bash
openssl rand -hex 16      # для TELEGRAM_WEBHOOK_SECRET
openssl rand -base64 24   # для ADMIN_PASSWORD
```

---

## 8. Сборка

```bash
sudo -u "$APP_USER" -H bash -lc "cd $APP_DIR && npm ci"
sudo -u "$APP_USER" -H bash -lc "cd $APP_DIR && npm run build"
```

Важно:

- именно `npm ci` (ставит ровно те версии из `package-lock.json`), и **без**
  флага `--production`: в сборке участвуют `typescript` и `eslint`, потому что
  в `next.config.mjs` проверки типов и линта включены намеренно.
- если сборка упала с `Killed` — мало памяти, вернитесь к разделу про swap.
- если `sharp` не поставился: `sudo apt-get install -y build-essential python3`
  и повторите `npm rebuild sharp`.

Успешная сборка заканчивается строками вида `✓ Compiled successfully` и списком
маршрутов.

---

## 9. Автозапуск через systemd

```bash
sudo tee /etc/systemd/system/alipayfast.service > /dev/null <<EOF
[Unit]
Description=AlipayFast (Next.js)
After=network.target postgresql.service
Wants=postgresql.service

[Service]
Type=simple
User=$APP_USER
Group=$APP_USER
WorkingDirectory=$APP_DIR
EnvironmentFile=$APP_DIR/.env
Environment=NODE_ENV=production
Environment=PORT=$PORT
ExecStart=/usr/bin/node $APP_DIR/node_modules/next/dist/bin/next start -p $PORT

Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal
NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable --now alipayfast.service
sleep 3
sudo systemctl status alipayfast.service --no-pager | head -12
```

Проверка, что приложение поднялось:

```bash
curl -sI http://127.0.0.1:$PORT | head -3
curl -s http://127.0.0.1:$PORT/robots.txt
```

Если в ответе `HTTP/1.1 200 OK` и текст robots — приложение работает.

---

## 10. nginx

Возьмите готовый конфиг из `docs/seo-nginx.md` (там же редирект `www` → без
`www`, HTTPS, сжатие и кэш). Откройте справку на сервере:

```bash
sudo -u "$APP_USER" less "$APP_DIR/docs/seo-nginx.md"
```

и перенесите блок `server` в файл сайта:

```bash
sudo nano /etc/nginx/sites-available/alipayfast.ru
```

Вставьте содержимое блока `server` из справки, поправив при необходимости:

- `server_name alipayfast.ru www.alipayfast.ru;`
- путь к сертификату — тот же, что был у старого сайта
  (`/etc/letsencrypt/live/alipayfast.ru/...`), если сертификат уже выпущен;
- `proxy_pass http://127.0.0.1:3000;` — порт должен совпадать с `PORT`.

Активируйте и проверьте:

```bash
sudo ln -s /etc/nginx/sites-available/alipayfast.ru /etc/nginx/sites-enabled/alipayfast.ru
sudo nginx -t
sudo systemctl reload nginx
```

`nginx -t` обязательно должен ответить `syntax is ok` / `test is successful`.
Если ошибка — исправьте файл и повторите, nginx продолжает работать на старой
конфигурации, пока вы не сделали `reload`.

### Сертификат

Если сертификата нет:

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d alipayfast.ru -d www.alipayfast.ru
```

Если сертификат уже был — ничего не делайте, он продолжит работать. Проверьте
автопродление: `sudo certbot renew --dry-run`.

---

## 11. Права на запись

Приложению нужно писать в два места: очередь заявок и каталог загрузок.

```bash
sudo -u "$APP_USER" mkdir -p "$APP_DIR/public/uploads" "$APP_DIR/data"
sudo chown -R "$APP_USER:$APP_USER" "$APP_DIR/public/uploads" "$APP_DIR/data"
sudo chmod -R 750 "$APP_DIR/data"
ls -la "$APP_DIR/public/uploads" "$APP_DIR/data"
```

- `public/uploads` — чеки и фото товаров из мини-приложения;
- `data/site-orders.json` — очередь заявок, когда Telegram недоступен
  (файл создастся сам, ему нужен доступ на запись в каталог `data`);
- `data/exchange-history.json` — история курса.

---

## 12. Проверка после установки

### 12.1. Локально на сервере

```bash
curl -sI http://127.0.0.1:$PORT | head -3
curl -s http://127.0.0.1:$PORT/sitemap.xml | head -8
```

### 12.2. Через домен

```bash
curl -sI https://alipayfast.ru/ | head -1        # 200
curl -sI https://www.alipayfast.ru/ | head -1    # 301 → без www
curl -sI http://alipayfast.ru/ | head -1         # 301 → https
curl -s https://alipayfast.ru/robots.txt
curl -s https://alipayfast.ru/sitemap.xml | grep -c "<url>"
```

Ожидаем: 200 на без-www, 301 на обоих редиректах, в robots строка `Sitemap:`,
в карте 14 адресов.

### 12.3. Проверка, что нет старых заглушек

Специально для этого проекта: в предыдущей сборке в коде оставались
плейсхолдеры. Убедитесь, что их больше нет:

```bash
curl -s https://alipayfast.ru/ | grep -E "XXX-XXX-XXXX|Примерная|690000|your-google-verification" && echo "НАЙДЕНЫ ЗАГЛУШКИ" || echo "заглушек нет"
curl -s https://alipayfast.ru/ | grep -o "<h1" | wc -l    # должно быть 1
```

### 12.4. Мини-приложение и админка

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://alipayfast.ru/telegram-mini-app
curl -s -o /dev/null -w "%{http_code}\n" https://alipayfast.ru/admin/orders
```

Обе страницы должны отдавать 200 (вход по паролю — уже в браузере).
Затем откройте `https://alipayfast.ru/admin/orders`, войдите с `ADMIN_PASSWORD`
и заведите тестовую заявку, чтобы проверить базу.

---

## 13. Telegram: вебхук и уведомления

Получите токен админки:

```bash
TOKEN=$(curl -s -X POST https://alipayfast.ru/api/admin/auth \
  -H 'Content-Type: application/json' \
  -d '{"password":"ВАШ_ADMIN_PASSWORD"}' | jq -r .token)
echo "$TOKEN"
```

Поставьте вебхук для бота мини-приложения:

```bash
curl -s -X POST "https://alipayfast.ru/api/telegram/webhook/setup?token=$TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://alipayfast.ru/api/telegram/webhook"}' | jq
```

Проверьте связь с Telegram и настройки:

```bash
curl -s "https://alipayfast.ru/api/telegram/diagnose?token=$TOKEN" | jq
```

В ответе ищите `ok: true` и доступность прокси. Если сервер в РФ и Telegram
недоступен напрямую, настройте локальный прокси по `docs/telegram-proxy.md`
и пропишите `TELEGRAM_PROXY_URL` в `.env`, затем перезапустите сервис:

```bash
sudo systemctl restart alipayfast.service
```

Отправить накопившиеся заявки из очереди:

```bash
curl -s -X POST "https://alipayfast.ru/api/telegram/flush-queue?token=$TOKEN" | jq
```

Затем напишите боту мини-приложения `/start` — он должен ответить меню.

---

## 14. Безопасность: обязательные шаги

### 14.1. Закрыть админку на уровне nginx

Токен админки в текущей реализации не подписан (`admin_<время>_<случайное>`,
см. `lib/admin-auth.ts`) — зная формат, его можно подделать. Поэтому веб-админку
надо прикрыть снаружи. Добавьте в блок `server` для `alipayfast.ru`:

```nginx
# Веб-админка за вторым паролем: /admin/orders, /admin/exchange
location /admin/ {
    auth_basic "AlipayFast admin";
    auth_basic_user_file /etc/nginx/.htpasswd-admin;
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

# Мини-приложение оператора /admin/tg: basic auth здесь ставить нельзя —
# браузер внутри Telegram не умеет показывать окно ввода пароля, и вход
# сломается. Доступ к нему проверяет само приложение: подпись initData от
# Telegram плюс совпадение Telegram ID с ADMIN_USER_ID (см. lib/admin-access.ts).
location = /admin/tg {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

Точное совпадение `location = /admin/tg` имеет приоритет над `location /admin/`,
поэтому достаточно именно такого порядка блоков.

Создайте пароль:

```bash
sudo apt-get install -y apache2-utils
sudo htpasswd -c /etc/nginx/.htpasswd-admin admin
sudo nginx -t && sudo systemctl reload nginx
```

Теперь без второго пароля `/admin/*` недоступен. Вебхук Telegram
(`/api/telegram/webhook`) остаётся публичным — его защищает
`TELEGRAM_WEBHOOK_SECRET`, который Telegram передаёт в заголовке.

Также закройте от посторонних служебные эндпоинты диагностики, если не
пользуетесь ими с телефона:

```nginx
location = /api/telegram/diagnose { allow ВАШ_IP; deny all; }
location = /api/telegram/flush-queue { allow ВАШ_IP; deny all; }
```

### 14.2. Пароли

- `ADMIN_PASSWORD` — новый, длинный. Пароль из старого репозитория
  (`Gjrhjdrf1991`) считать скомпрометированным.
- Пароль роли PostgreSQL — свой, не `postgres` и не из старого `.env`.
- `TELEGRAM_WEBHOOK_SECRET` — случайные 32 символа.

### 14.3. Файрвол

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status
```

Порт приложения (3000) и PostgreSQL (5432) наружу не открываем: приложение
слушает их на localhost. Проверьте:

```bash
sudo ss -tlnp | grep -E ':(3000|5432)'
```

Адрес должен быть `127.0.0.1`, а не `0.0.0.0`.

### 14.4. Автообновления безопасности

```bash
sudo apt-get install -y unattended-upgrades
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

---

## 15. Как обновлять сайт дальше

```bash
sudo -u "$APP_USER" -H bash -lc "cd $APP_DIR && git pull --ff-only"
sudo -u "$APP_USER" -H bash -lc "cd $APP_DIR && npm ci && npm run build"
sudo systemctl restart alipayfast.service
sleep 3 && curl -sI http://127.0.0.1:$PORT | head -1
```

Если после обновления что-то не так — смотрите логи:

```bash
sudo journalctl -u alipayfast.service -n 100 --no-pager
```

Удобно собрать это в скрипт `$APP_DIR/deploy.sh` и запускать одной командой.

---

## 16. Откат к старому сайту

Старый сайт мы не удаляли, поэтому откат занимает минуты.

```bash
# 1. Остановить новый
sudo systemctl stop alipayfast.service

# 2. Вернуть конфиг nginx
sudo unlink /etc/nginx/sites-enabled/alipayfast.ru
sudo ln -s /etc/nginx/sites-available/СТАРЫЙ_КОНФИГ /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# 3. Вернуть каталог старого сайта (если переносили)
sudo tar xzf /root/backup-ДАТА/old-site.tar.gz -C /var/www

# 4. Запустить старый сервис
sudo systemctl enable --now ali2026.service
```

Если старый сайт использовал свою базу и вы её не удаляли, данные на месте.
Восстановление из дампа, если понадобится:

```bash
sudo -u postgres createdb ИМЯ_БАЗЫ
sudo -u postgres pg_restore -d ИМЯ_БАЗЫ /root/backup-ДАТА/old-db.dump
```

Только после того, как новый сайт отработал неделю без нареканий, можно
удалить старый каталог и ненужные базы.

---

## 17. Частые проблемы

| Симптом | Причина | Что делать |
|---|---|---|
| `502 Bad Gateway` | сервис не запущен или порт не совпадает | `systemctl status alipayfast`, сверить `PORT` и `proxy_pass` |
| Сборка падает с `Killed` | мало RAM | добавить swap (шаг 1) |
| `npm ci` падает на `sharp` | нет компилятора | `apt-get install -y build-essential python3`, затем `npm rebuild sharp` |
| Мини-приложение пустое, «заявки недоступны» | неверный `DATABASE_URL` | проверить `psql "$DATABASE_URL" -c 'select 1'`, логи сервиса |
| Уведомления в Telegram не приходят | сервер в РФ, нет прокси | `docs/telegram-proxy.md`, `TELEGRAM_PROXY_URL`, затем `diagnose` |
| Чеки и картинки не открываются (404) | загрузки пишутся в `public/` в рантайме, а `next start` раздаёт оттуда только файлы сборки; либо `UPLOADS_DIR` не совпал с рабочим каталогом | отдача идёт через `/api/uploads/*` (rewrite `/uploads/*`), поэтому важно лишь, чтобы запись и чтение шли из одного каталога: проверьте `UPLOADS_DIR`, cwd процесса (`pm2` — задайте `cwd` в конфиге) и права на каталог загрузок |
| Логи `EACCES ... data/site-orders.json` | нет прав на `data` | `chown -R $APP_USER:$APP_USER $APP_DIR/data` |
| В sitemap все `lastmod` одинаковые (дата установки) | каталог не git-репозиторий или клон без истории | клонировать полной историей, не `--depth 1` |
| `www` отдаёт 200 вместо 301 | старый конфиг nginx всё ещё активен | проверить `sites-enabled`, применить `docs/seo-nginx.md` |
| Админка открывается без пароля | не настроен nginx basic auth | шаг 14.1 |

---

## 18. Чек-лист «всё готово»

- [ ] старый сервис остановлен и снят с автозапуска
- [ ] бэкап старого сайта, `.env` и дампа БД лежит в `/root/backup-ДАТА`
- [ ] новый сайт склонирован в `$APP_DIR` полной историей
- [ ] `.env` заполнен, права `600`, владелец `$APP_USER`
- [ ] `npm ci && npm run build` проходят без ошибок
- [ ] `systemctl status alipayfast` — `active (running)`
- [ ] `curl 127.0.0.1:3000` отдаёт 200
- [ ] nginx: `nginx -t` успешен, старый конфиг отключён
- [ ] HTTPS работает, `www` и http отдают 301
- [ ] `robots.txt` и `sitemap.xml` отдаются, в карте 14 адресов
- [ ] на главной один `<h1>`, заглушек из старой сборки нет
- [ ] вход в `/admin/orders` по `ADMIN_PASSWORD`, тестовая заявка создаётся
- [ ] вход в `/admin/tg` из бота по команде `/admin`
- [ ] вебхук Telegram установлен, `diagnose` возвращает `ok: true`
- [ ] заявка из калькулятора доходит до Telegram, очередь пуста
- [ ] `/admin/orders` и `/admin/exchange` закрыты вторым паролем (nginx basic auth), `/admin/tg` открывается из бота
- [ ] ufw включён, порты 3000 и 5432 недоступны снаружи
- [ ] Google Search Console и Яндекс.Вебмастер подтверждены, карта отправлена
