# SEO-настройки nginx для alipayfast.ru

Конфиг для прод-сервера (nginx/1.24). Закрывает пункты аудита, которые нельзя
сделать в коде Next.js: склейка `www`, принудительный HTTPS, сжатие и кэш.

## Что важно не сломать

- `www.alipayfast.ru` должен отдавать **301** на `https://alipayfast.ru` (сейчас отдаёт 200 — это дубль).
- Один канонический вид URL: без слэша на конце (в Next.js `trailingSlash: false`).
- `/robots.txt` и `/sitemap.xml` должны отдаваться приложением, а не подменяться статикой.

## Конфиг

```nginx
# HTTP → HTTPS + склейка www
server {
    listen 80;
    listen [::]:80;
    server_name alipayfast.ru www.alipayfast.ru;
    return 301 https://alipayfast.ru$request_uri;
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;
    server_name www.alipayfast.ru;

    ssl_certificate     /etc/letsencrypt/live/alipayfast.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/alipayfast.ru/privkey.pem;

    return 301 https://alipayfast.ru$request_uri;
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;
    server_name alipayfast.ru;

    ssl_certificate     /etc/letsencrypt/live/alipayfast.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/alipayfast.ru/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    ssl_stapling on;
    ssl_stapling_verify on;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Сжатие
    gzip on;
    gzip_comp_level 6;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_vary on;
    gzip_types
        text/plain text/css text/xml
        application/javascript application/json application/xml
        application/rss+xml image/svg+xml;

    # Статика Next.js — хеш в имени файла, кэш на год
    location /_next/static/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        add_header Cache-Control "public, max-age=31536000, immutable" always;
        access_log off;
    }

    # Оптика next/image
    location /_next/image {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        add_header Cache-Control "public, max-age=2592000, stale-while-revalidate=86400" always;
    }

    # Локальные ассеты гайдов
    location /assets/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        add_header Cache-Control "public, max-age=2592000" always;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 90s;
    }
}
```

## Проверка после применения

```bash
curl -sI https://www.alipayfast.ru/ | head -1        # ожидаем 301
curl -sI http://alipayfast.ru/ | head -1             # ожидаем 301
curl -sI https://alipayfast.ru/ | grep -i strict     # ожидаем HSTS
curl -s  https://alipayfast.ru/robots.txt            # строка Sitemap: присутствует
curl -s  https://alipayfast.ru/sitemap.xml | head -5 # lastmod по реальным датам
curl -sI https://alipayfast.ru/_next/static/...      # Cache-Control: immutable
```

Затем в Яндекс.Вебмастере и Google Search Console выбрать главное зеркало
`https://alipayfast.ru` и переотправить карту сайта.
