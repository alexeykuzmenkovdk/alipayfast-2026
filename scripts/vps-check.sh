#!/usr/bin/env bash
set -uo pipefail

SINCE="${1:-24 hours ago}"
APP_DIR="${APP_DIR:-/opt/alipayfast}"
DOMAIN="${DOMAIN:-alipayfast.ru}"
FAILS=0

hr() { printf '\n=== %s ===\n' "$1"; }
ok() { printf '  ok    %s\n' "$1"; }
warn() { printf '  WARN  %s\n' "$1"; FAILS=$((FAILS + 1)); }
bad() { printf '  FAIL  %s\n' "$1"; FAILS=$((FAILS + 2)); }

printf 'AlipayFast: проверка %s, окно "%s"\n' "$(date -u '+%Y-%m-%d %H:%M UTC')" "$SINCE"

hr "Сайт: чем запущен"
UNIT=""
PM2_OK=0
for u in alipayfast alipayfast-2026 alipayfast2026 ali2026 site nextjs; do
  if systemctl cat "${u}.service" >/dev/null 2>&1; then
    UNIT="${u}.service"
    break
  fi
done

if [ -n "$UNIT" ]; then
  state=$(systemctl is-active "$UNIT" 2>/dev/null || true)
  restarts=$(systemctl show -p NRestarts --value "$UNIT" 2>/dev/null || echo "?")
  printf '  systemd: %s — %s, перезапусков: %s\n' "$UNIT" "$state" "$restarts"
  [ "$state" = "active" ] || bad "юнит $UNIT не active"
  if [ "${restarts:-0}" != "0" ] && [ "${restarts:-?}" != "?" ]; then
    warn "приложение перезапускалось ($restarts раз) — смотрите journalctl"
  fi
else
  printf '  systemd-юнита сайта нет\n'
fi

if command -v pm2 >/dev/null 2>&1; then
  pm2_out=$(pm2 jlist 2>/dev/null || true)
  if [ -n "$pm2_out" ] && [ "$pm2_out" != "[]" ]; then
    printf '%s' "$pm2_out" | python3 -c 'import json,sys
apps=json.load(sys.stdin)
for a in apps:
    e=a.get("pm2_env",{})
    print("  pm2: %s — %s, restarts=%s, cwd=%s" % (a.get("name"), e.get("status"), e.get("restart_time"), e.get("pm_cwd")))' || warn "не удалось разобрать pm2 jlist"
    if printf '%s' "$pm2_out" | python3 -c 'import json,sys
apps=json.load(sys.stdin)
sys.exit(0 if any(a.get("name")=="alipayfast" and a.get("pm2_env",{}).get("status")=="online" for a in apps) else 1)'; then
      PM2_OK=1
    fi
  fi
fi

if [ -z "$UNIT" ] && [ "$PM2_OK" -eq 0 ]; then
  bad "сайт не найден ни в systemd, ни в pm2"
fi

port=$(ss -tlnp 2>/dev/null | grep -E ':(3000|3001)[[:space:]]' || true)
if [ -n "$port" ]; then
  printf '  порт: %s\n' "$port"
  if printf '%s' "$port" | grep -qE '(\*|0\.0\.0\.0):3000'; then
    warn "приложение слушает 0.0.0.0:3000 — запускайте с -H 127.0.0.1 или закройте порт файрволом"
  fi
else
  bad "никто не слушает 3000/3001 — сайт не поднят"
fi

local_code=$(curl -s -o /dev/null -m 10 -w '%{http_code}' http://127.0.0.1:3000/ || true)
[ "$local_code" = "200" ] && ok "127.0.0.1:3000 → 200" || bad "127.0.0.1:3000 → ${local_code:-нет ответа}"

site_code=$(curl -s -o /dev/null -m 15 -w '%{http_code}' "https://${DOMAIN}/" || true)
[ "$site_code" = "200" ] && ok "https://${DOMAIN} → 200" || bad "https://${DOMAIN} → ${site_code:-нет ответа}"

hr "Логи приложения ($SINCE)"
if [ -n "$UNIT" ]; then
  app_errs=$(journalctl -u "$UNIT" --since "$SINCE" --no-pager 2>/dev/null | grep -icE 'error|exception|econnrefused|eacces|unhandled|killed' || true)
  printf '  ошибок в journal: %s\n' "$app_errs"
  [ "${app_errs:-0}" -gt 0 ] && journalctl -u "$UNIT" --since "$SINCE" --no-pager 2>/dev/null | grep -iE 'error|exception|econnrefused|eacces|unhandled|killed' | tail -10 | sed 's/^/  /'
fi

pm2_err_files=$(compgen -G "$HOME/.pm2/logs/*-error.log" 2>/dev/null || true)
if [ -n "$pm2_err_files" ]; then
  for f in $pm2_err_files; do
    size=$(stat -c%s "$f" 2>/dev/null || echo 0)
    printf '  %s (%s байт)\n' "$f" "$size"
    tail -n 5 "$f" | sed 's/^/    /'
  done
fi

hr "Nginx: ответы клиентам"
files=()
for f in /var/log/nginx/access.log /var/log/nginx/access.log.1; do
  [ -f "$f" ] && files+=("$f")
done

if [ ${#files[@]} -eq 0 ]; then
  warn "логов nginx не найдено"
else
  awk '{print $9}' "${files[@]}" | grep -E '^[0-9]{3}$' | sort | uniq -c | sort -rn | sed 's/^/  /'
  five=$(awk '$9 ~ /^5[0-9][0-9]$/' "${files[@]}" | wc -l)
  if [ "$five" -eq 0 ]; then
    ok "ответов 5xx нет"
  else
    bad "ответов 5xx: $five (502 = приложение лежало)"
    awk '$9 ~ /^5[0-9][0-9]$/ {print "  " $4, $9, $1, $7}' "${files[@]}" | tail -10
  fi

  printf '  частые 401 (IP, путь):\n'
  awk '$9 == 401 {print $1, $7}' "${files[@]}" | sort | uniq -c | sort -rn | head -5 | sed 's/^/    /'
  printf '  частые 404 (IP, путь):\n'
  awk '$9 == 404 {print $1, $7}' "${files[@]}" | sort | uniq -c | sort -rn | head -5 | sed 's/^/    /'
fi

if [ -f /var/log/nginx/error.log ]; then
  nginx_errs=$(tail -n 500 /var/log/nginx/error.log | grep -cE '\[(error|crit|alert|emerg)\]' || true)
  if [ "${nginx_errs:-0}" -gt 0 ]; then
    warn "в error.log свежих ошибок: $nginx_errs"
    tail -n 500 /var/log/nginx/error.log | grep -E '\[(error|crit|alert|emerg)\]' | tail -5 | sed 's/^/  /'
  else
    ok "error.log чист"
  fi
fi

hr "Бот-постер"
if systemctl cat alipayfast-poster.service >/dev/null 2>&1; then
  bstate=$(systemctl is-active alipayfast-poster 2>/dev/null || true)
  printf '  сервис: %s\n' "$bstate"
  [ "$bstate" = "active" ] || bad "alipayfast-poster не active"

  blog=$(journalctl -u alipayfast-poster --since "$SINCE" --no-pager 2>/dev/null || true)
  net=$(printf '%s' "$blog" | grep -c 'TelegramNetworkError' || true)
  flood=$(printf '%s' "$blog" | grep -cE 'Flood control|hitting-limits|RetryAfter' || true)
  trace=$(printf '%s' "$blog" | grep -c 'Traceback' || true)
  printf '  таймаутов Telegram: %s, flood control: %s, traceback: %s\n' "$net" "$flood" "$trace"
  [ "${trace:-0}" -gt 0 ] && bad "в логе есть traceback — смотрите journalctl -u alipayfast-poster"
  [ "${flood:-0}" -gt 0 ] && warn "срабатывал flood control — проверьте, не запущен ли бот дважды"
  [ "${net:-0}" -gt 50 ] && warn "много таймаутов прокси — нестабилен VLESS/SOCKS"
  printf '%s' "$blog" | tail -6 | sed 's/^/    /'
else
  warn "сервиса alipayfast-poster нет"
fi

procs=$(pgrep -fc 'poster_bot.py' 2>/dev/null || echo 0)
printf '  процессов poster_bot.py: %s\n' "$procs"
[ "${procs:-0}" -gt 1 ] && bad "запущено несколько копий — конфликт getUpdates и flood control"

hr "Прокси до Telegram"
envf="$APP_DIR/bot/.env"
proxy=""
[ -f "$envf" ] && proxy=$(grep -E '^TELEGRAM_PROXY_URL=' "$envf" | tail -1 | cut -d= -f2- || true)
if [ -z "$proxy" ]; then
  warn "TELEGRAM_PROXY_URL не задан — Telegram напрямую (из РФ обычно не работает)"
else
  hostport="${proxy#*://}"
  case "$proxy" in
    socks5h://*|socks5://*|socks4://*|socks4a://*)
      code=$(curl -s -o /dev/null -m 15 -w '%{http_code}' --socks5-hostname "$hostport" https://api.telegram.org/ || true)
      ;;
    *)
      code=$(curl -s -o /dev/null -m 15 -w '%{http_code}' -x "$proxy" https://api.telegram.org/ || true)
      ;;
  esac
  if [ "$code" = "200" ] || [ "$code" = "404" ]; then
    ok "через $proxy Telegram доступен (HTTP $code)"
  else
    bad "через $proxy Telegram недоступен (код ${code:-000}) — проверьте xray/sing-box"
  fi
fi

hr "PostgreSQL"
if command -v pg_isready >/dev/null 2>&1; then
  pg_isready | sed 's/^/  /' || bad "PostgreSQL не отвечает"
fi
pg_errs=$(journalctl -u postgresql --since "$SINCE" --no-pager 2>/dev/null | grep -icE 'error|fatal|panic' || true)
[ "${pg_errs:-0}" -gt 0 ] && warn "в логах PostgreSQL ошибок: $pg_errs"
[ "${pg_errs:-0}" -eq 0 ] && ok "ошибок PostgreSQL нет"

hr "Ресурсы и обновления"
df -h / | tail -1 | awk '{print "  диск /: занято " $5 ", свободно " $4}'
free -h | awk 'NR==1{print "  " $0} NR==2{print "  " $0} NR==3{print "  " $0}'
uptime | sed 's/^/  /'
load1=$(cut -d' ' -f1 /proc/loadavg)
printf '  load1: %s\n' "$load1"
disk_pct=$(df --output=pcent / | tail -1 | tr -dc '0-9')
[ "${disk_pct:-0}" -ge 85 ] && bad "диск занят на ${disk_pct}%"
avail_mb=$(free -m | awk '/Mem:/{print $7}')
[ "${avail_mb:-999}" -lt 100 ] && warn "свободной памяти меньше 100 МБ"

[ -f /var/run/reboot-required ] && warn "сервер требует перезагрузки (/var/run/reboot-required)"
updates=$(apt list --upgradable 2>/dev/null | grep -c upgradable || true)
printf '  доступных обновлений пакетов: %s\n' "${updates:-?}"

hr "Итог"
if [ "$FAILS" -eq 0 ]; then
  echo "  критичных проблем не найдено"
elif [ "$FAILS" -lt 2 ]; then
  echo "  есть замечания — смотрите строки WARN выше"
else
  echo "  есть проблемы — смотрите строки FAIL выше"
fi

[ "$FAILS" -ge 2 ] && exit 2
[ "$FAILS" -eq 1 ] && exit 1
exit 0
