#!/usr/bin/env python3
"""AlipayFast poster bot.

Ежедневно публикует курс в группу и держит последнее сообщение в актуальном
состоянии.

Ключевое отличие от старой версии: курс больше НЕ считается внутри бота.
Бот берёт готовый ранжир из API сайта (``/api/exchange-rate``), поэтому цифры
в Telegram всегда совпадают с сайтом и мини-приложением, включая надбавку,
которую оператор меняет в ``/admin/exchange``.

Механика:
  * 16:00 по Владивостоку — новое сообщение с новой цитатой;
  * каждые SYNC_INTERVAL_SEC — опрос API сайта; если ранжир/дата изменились,
    последнее сообщение РЕДАКТИРУЕТСЯ (новое не публикуется);
  * цитаты — из text.txt, нумерованные строки, идут по кругу.

Telegram ходит через прокси из TELEGRAM_PROXY_URL (VLESS/XTTP → локальный
SOCKS5/HTTP-клиент), как и сайт. API сайта — локальный, без прокси.
"""

from __future__ import annotations

import asyncio
import json
import logging
import os
import re
import sqlite3
from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Awaitable, Callable, Optional
from zoneinfo import ZoneInfo

import aiohttp
from aiohttp import web
from aiogram import Bot, Dispatcher
from aiogram.client.default import DefaultBotProperties
from aiogram.client.session.aiohttp import AiohttpSession
from aiogram.exceptions import TelegramBadRequest, TelegramNetworkError
from aiogram.filters import Command
from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup, LinkPreviewOptions, Message
from dotenv import dotenv_values, load_dotenv

# =========================
# CONFIG
# =========================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))


def _env(name: str, default: str = "") -> str:
    return (os.getenv(name) or default).strip()


BOT_TOKEN = _env("BOT_TOKEN")
if not BOT_TOKEN:
    raise SystemExit("BOT_TOKEN не задан. Укажите его в bot/.env")

POST_CHAT_ID_RAW = _env("POST_CHAT_ID")
if not POST_CHAT_ID_RAW:
    raise SystemExit("POST_CHAT_ID не задан. Укажите ID группы/канала в bot/.env")

try:
    POST_CHAT_ID = int(POST_CHAT_ID_RAW)
except ValueError as exc:
    raise SystemExit(f"POST_CHAT_ID должен быть числом, получено: {POST_CHAT_ID_RAW}") from exc

ADMIN_USER_ID = int(_env("ADMIN_USER_ID", "0") or "0")

# Время ежедневного поста по Владивостоку (по умолчанию 16:00).
POST_HOUR = int(_env("POST_HOUR", "16") or "16")
POST_MINUTE = int(_env("POST_MINUTE", "0") or "0")

# Ранжир берём у сайта: по умолчанию локальный Next.js, без прокси.
SITE_API_URL = _env("SITE_API_URL", "http://127.0.0.1:3000/api/exchange-rate")

# Как часто сверять последнее сообщение с сайтом.
SYNC_INTERVAL_SEC = int(_env("SYNC_INTERVAL_SEC", "300") or "300")

# Telegram через VLESS: socks5://127.0.0.1:10808 или http://127.0.0.1:10809.
TELEGRAM_PROXY_URL = _env("TELEGRAM_PROXY_URL")
# Для локальных тестов (как в сайте).
TELEGRAM_API_BASE = _env("TELEGRAM_API_BASE")

# Ссылки в сообщении.
SITE_URL = _env("SITE_URL", "https://alipayfast.ru")
BOT_USERNAME = _env("BOT_USERNAME", "@alipayfastbot")
ADMIN_USERNAME = _env("ADMIN_USERNAME", "@whaledator")
MINI_APP_URL = _env("MINI_APP_URL", "https://t.me/AlipayFastBot/alipayfast")

# Цитаты и состояние.
WISDOM_FILE = _env("WISDOM_FILE", os.path.join(BASE_DIR, "text.txt"))
DB_PATH = _env("DB_PATH", os.path.join(BASE_DIR, "subscribers.db"))

# Локальное управление (curl с сервера), только на 127.0.0.1.
CONTROL_TOKEN = _env("CONTROL_TOKEN")
CONTROL_PORT = int(_env("CONTROL_PORT", "8081") or "8081")

# Управление через ОТДЕЛЬНОГО бота (например, @alipayvdkbot).
# Отдельный токен нужен потому, что у бота-постера может быть вебхук —
# polling второго бота с ним не конфликтует.
CONTROL_BOT_TOKEN = _env("CONTROL_BOT_TOKEN")
# Кому разрешены команды: ID через запятую. Пусто — берётся ADMIN_USER_ID.
CONTROL_ADMIN_IDS_RAW = _env("CONTROL_ADMIN_IDS")

TZ = ZoneInfo("Asia/Vladivostok")

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger("poster")

# =========================
# BOT INIT
# =========================
_session_kwargs: dict = {}
if TELEGRAM_PROXY_URL:
    _session_kwargs["proxy"] = TELEGRAM_PROXY_URL
if TELEGRAM_API_BASE:
    from aiogram.client.telegram import TelegramAPIServer

    _session_kwargs["api"] = TelegramAPIServer.from_base(TELEGRAM_API_BASE)

def build_bot(token: str) -> Bot:
    return Bot(
        token=token,
        session=AiohttpSession(**_session_kwargs),
        default=DefaultBotProperties(parse_mode="Markdown"),
    )


# Бот, который публикует и правит сообщения в группе.
bot = build_bot(BOT_TOKEN)

_LINK_PREVIEW_OFF = LinkPreviewOptions(is_disabled=True)


def build_keyboard() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[[InlineKeyboardButton(text="⚡ Совершить обмен", url=MINI_APP_URL)]]
    )


# =========================
# DB
# =========================
def _db() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def create_db() -> None:
    conn = _db()
    try:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS posts_log (
                post_date TEXT PRIMARY KEY,
                posted_at TEXT
            );

            CREATE TABLE IF NOT EXISTS wisdom_state (
                id INTEGER PRIMARY KEY CHECK(id=1),
                last_index INTEGER DEFAULT -1,
                last_date TEXT
            );
            INSERT OR IGNORE INTO wisdom_state (id, last_index, last_date) VALUES (1, -1, NULL);

            -- Последнее опубликованное сообщение: чтобы редактировать его,
            -- а не публиковать новое при изменении курса.
            CREATE TABLE IF NOT EXISTS last_post (
                id INTEGER PRIMARY KEY CHECK(id=1),
                chat_id INTEGER NOT NULL,
                message_id INTEGER NOT NULL,
                post_date TEXT,
                wisdom TEXT,
                last_text TEXT,
                updated_at TEXT
            );
            """
        )
        conn.commit()
    finally:
        conn.close()


def today_ymd() -> str:
    return datetime.now(TZ).strftime("%Y-%m-%d")


def was_posted_today() -> bool:
    conn = _db()
    try:
        row = conn.execute("SELECT 1 FROM posts_log WHERE post_date=?", (today_ymd(),)).fetchone()
        return row is not None
    finally:
        conn.close()


def mark_posted_today() -> None:
    conn = _db()
    try:
        conn.execute(
            "INSERT OR REPLACE INTO posts_log (post_date, posted_at) VALUES (?, ?)",
            (today_ymd(), datetime.now(TZ).strftime("%Y-%m-%d %H:%M:%S")),
        )
        conn.commit()
    finally:
        conn.close()


@dataclass
class LastPost:
    chat_id: int
    message_id: int
    post_date: str
    wisdom: str
    last_text: str


def get_last_post() -> Optional[LastPost]:
    conn = _db()
    try:
        row = conn.execute(
            "SELECT chat_id, message_id, post_date, wisdom, last_text FROM last_post WHERE id=1"
        ).fetchone()
    finally:
        conn.close()
    if not row:
        return None
    return LastPost(
        chat_id=int(row["chat_id"]),
        message_id=int(row["message_id"]),
        post_date=row["post_date"] or "",
        wisdom=row["wisdom"] or "",
        last_text=row["last_text"] or "",
    )


def save_last_post(chat_id: int, message_id: int, wisdom: str, text: str) -> None:
    conn = _db()
    try:
        conn.execute(
            """INSERT OR REPLACE INTO last_post
               (id, chat_id, message_id, post_date, wisdom, last_text, updated_at)
               VALUES (1, ?, ?, ?, ?, ?, ?)""",
            (
                chat_id,
                message_id,
                today_ymd(),
                wisdom,
                text,
                datetime.now(TZ).strftime("%Y-%m-%d %H:%M:%S"),
            ),
        )
        conn.commit()
    finally:
        conn.close()


def update_last_text(text: str) -> None:
    conn = _db()
    try:
        conn.execute(
            "UPDATE last_post SET last_text=?, updated_at=? WHERE id=1",
            (text, datetime.now(TZ).strftime("%Y-%m-%d %H:%M:%S")),
        )
        conn.commit()
    finally:
        conn.close()


def clear_last_post() -> None:
    conn = _db()
    try:
        conn.execute("DELETE FROM last_post WHERE id=1")
        conn.commit()
    finally:
        conn.close()


# =========================
# WISDOM (365 lines loop)
# =========================
def load_wisdoms(path: str) -> list[str]:
    if not os.path.exists(path):
        raise SystemExit(f"Файл цитат не найден: {path}")
    with open(path, "r", encoding="utf-8") as fh:
        lines = [ln.strip() for ln in fh.read().splitlines() if ln.strip()]
    if not lines:
        raise SystemExit("Файл цитат пуст.")
    return lines


def _get_last_wisdom_index() -> int:
    conn = _db()
    try:
        row = conn.execute("SELECT last_index FROM wisdom_state WHERE id=1").fetchone()
    finally:
        conn.close()
    return int(row["last_index"]) if row and row["last_index"] is not None else -1


def _set_last_wisdom_index(idx: int) -> None:
    conn = _db()
    try:
        conn.execute(
            "UPDATE wisdom_state SET last_index=?, last_date=? WHERE id=1",
            (idx, today_ymd()),
        )
        conn.commit()
    finally:
        conn.close()


def normalize_wisdom(value: str) -> str:
    """Убирает нумерацию: «1. …», «7) …», «001 — …», «12 - …», «7: …»."""
    value = (value or "").strip().strip("“”\"'").strip()
    return re.sub(r"^\s*\d+\s*([.)\-—:])\s*", "", value).strip()


def peek_next_wisdom(wisdoms: list[str]) -> tuple[int, str]:
    """Следующая цитата без сдвига счётчика — сдвигаем только после успешной отправки."""
    idx = (_get_last_wisdom_index() + 1) % len(wisdoms)
    return idx, normalize_wisdom(wisdoms[idx])


# =========================
# RATE (из API сайта)
# =========================
@dataclass
class RateTier:
    start: float  # «от» (в юанях); 0 для первого уровня
    end: float  # «до» (в юанях); для верхнего уровня — не используется
    rate: float  # ₽ за 1 ¥ уже с надбавкой


@dataclass
class RateSnapshot:
    cbr_date: str
    tiers: list[RateTier]


def _human_date(value: Optional[str]) -> str:
    if value:
        try:
            dt = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
            return dt.astimezone(TZ).strftime("%d.%m.%Y")
        except ValueError:
            pass
    return datetime.now(TZ).strftime("%d.%m.%Y")


async def fetch_site_snapshot() -> Optional[RateSnapshot]:
    """Берёт готовый ранжир из API сайта. None — если курс недостоверен."""
    timeout = aiohttp.ClientTimeout(total=15, connect=5, sock_read=10)
    try:
        async with aiohttp.ClientSession(timeout=timeout) as session:
            async with session.get(SITE_API_URL, headers={"Accept": "application/json"}) as resp:
                if resp.status != 200:
                    log.warning("API сайта вернул HTTP %s", resp.status)
                    return None
                data = await resp.json(content_type=None)
    except (aiohttp.ClientError, asyncio.TimeoutError) as exc:
        log.warning("Не удалось получить курс с сайта: %s", exc)
        return None
    except json.JSONDecodeError as exc:
        log.warning("API сайта вернул не JSON: %s", exc)
        return None

    if not isinstance(data, dict):
        return None

    # Сайт в режиме запасного курса (ЦБ недоступен) — не публикуем заведомо
    # неверные цифры, подождём следующей попытки.
    if data.get("fallbackRate"):
        log.warning("Сайт на запасном курсе (ЦБ недоступен) — пост откладывается")
        return None

    raw_tiers = data.get("tiers")
    if not isinstance(raw_tiers, list) or not raw_tiers:
        log.warning("В ответе сайта нет ранжира tiers")
        return None

    tiers: list[RateTier] = []
    for item in raw_tiers:
        try:
            tiers.append(
                RateTier(
                    start=float(item["from"]),
                    end=float(item["to"]),
                    rate=float(item["rate"]),
                )
            )
        except (KeyError, TypeError, ValueError):
            log.warning("Некорректный уровень ранжира: %r", item)
            return None

    return RateSnapshot(cbr_date=_human_date(data.get("cbrDate")), tiers=tiers)


async def fetch_with_retry(timeout_min: int = 60) -> Optional[RateSnapshot]:
    deadline = datetime.now(TZ) + timedelta(minutes=timeout_min)
    while datetime.now(TZ) < deadline:
        snapshot = await fetch_site_snapshot()
        if snapshot is not None:
            return snapshot
        await asyncio.sleep(60)
    return None


# =========================
# MESSAGE
# =========================
TIER_EMOJI = ["🐢", "🚶‍♂️", "🚴‍♂️", "🚀"]


def _fmt_int(value: float) -> str:
    return f"{int(value):,}".replace(",", " ")


def _tier_label(tier: RateTier, index: int) -> str:
    return f"до {_fmt_int(tier.end)}" if index == 0 else f"от {_fmt_int(tier.start)}"


def build_daily_post_text(snapshot: RateSnapshot, wisdom: str) -> str:
    banner = (
        "╭────────────────────╮\n"
        f"🧧 *Курс юаня на {snapshot.cbr_date}*\n"
        "╰────────────────────╯\n"
    )

    rate_lines = []
    for index, tier in enumerate(snapshot.tiers):
        emoji = TIER_EMOJI[index] if index < len(TIER_EMOJI) else "•"
        rate_lines.append(f"• *{_tier_label(tier, index)}* → *{tier.rate:.2f} ₽* {emoji}")

    rates = (
        "\n*💱 Курс по сумме заказа (CNY)*\n"
        "_Чем больше сумма — тем выгоднее курс_\n" + "\n".join(rate_lines) + "\n"
    )

    separator = "\n\n══════════════════\n\n"

    cta = (
        "*⚡ Быстрое пополнение*\n"
        "🧮 Удобные калькуляторы — считаем за вас 😉\n"
        f"🤖 {BOT_USERNAME}\n"
        f"🌐 {SITE_URL}\n"
        f"👤 {ADMIN_USERNAME}\n"
        "⏰ 24/7 *(Владивосток; иногда могу спать 😴)*\n"
    )

    wisdom_block = f"\n\n*🐉 Мудрость дня:*\n«{normalize_wisdom(wisdom)}»"

    return banner + rates + separator + cta + wisdom_block


async def _send_post(text: str) -> Message:
    try:
        return await bot.send_message(
            chat_id=POST_CHAT_ID,
            text=text,
            link_preview_options=_LINK_PREVIEW_OFF,
            reply_markup=build_keyboard(),
            parse_mode="Markdown",
        )
    except TelegramBadRequest as exc:
        if _is_parse_error(exc):
            log.warning("Markdown не разобрался, отправляю без разметки: %s", exc)
            return await bot.send_message(
                chat_id=POST_CHAT_ID,
                text=text,
                link_preview_options=_LINK_PREVIEW_OFF,
                reply_markup=build_keyboard(),
                parse_mode=None,
            )
        raise


def _is_parse_error(exc: TelegramBadRequest) -> bool:
    text = str(exc).lower()
    return "parse" in text or "entit" in text


async def publish_new_post(snapshot: RateSnapshot, wisdom: str) -> Message:
    text = build_daily_post_text(snapshot, wisdom)
    message = await _send_post(text)
    save_last_post(message.chat.id, message.message_id, wisdom, text)
    mark_posted_today()
    log.info("Опубликовано сообщение %s (курс на %s)", message.message_id, snapshot.cbr_date)
    return message


async def post_with_next_wisdom(snapshot: RateSnapshot) -> Message:
    """Публикует пост со следующей цитатой; счётчик двигает только после успеха."""
    idx, wisdom = peek_next_wisdom(_WISDOMS)
    message = await publish_new_post(snapshot, wisdom)
    _set_last_wisdom_index(idx)
    return message


async def sync_last_post(force: bool = False) -> str:
    """Приводит последнее сообщение к текущему курсу сайта (без нового поста)."""
    last = get_last_post()
    if not last:
        return "нет последнего поста"

    snapshot = await fetch_site_snapshot()
    if snapshot is None:
        return "курс недоступен"

    text = build_daily_post_text(snapshot, last.wisdom)
    if not force and text == last.last_text:
        return "без изменений"

    try:
        await bot.edit_message_text(
            text=text,
            chat_id=last.chat_id,
            message_id=last.message_id,
            link_preview_options=_LINK_PREVIEW_OFF,
            reply_markup=build_keyboard(),
            parse_mode="Markdown",
        )
    except TelegramBadRequest as exc:
        reason = str(exc).lower()
        if "message is not modified" in reason:
            update_last_text(text)
            return "без изменений"
        if (
            "not found" in reason
            or "can't be edited" in reason
            or "message_id_invalid" in reason
            or "no text in the message" in reason
        ):
            log.warning("Последнее сообщение недоступно для правки, сбрасываю привязку")
            clear_last_post()
            return "сообщение недоступно"
        if _is_parse_error(exc):
            try:
                await bot.edit_message_text(
                    text=text,
                    chat_id=last.chat_id,
                    message_id=last.message_id,
                    link_preview_options=_LINK_PREVIEW_OFF,
                    reply_markup=build_keyboard(),
                    parse_mode=None,
                )
            except TelegramBadRequest as exc2:
                if "message is not modified" in str(exc2).lower():
                    update_last_text(text)
                    return "без изменений"
                raise
        else:
            raise
    except TelegramNetworkError as exc:
        log.warning("Сеть Telegram недоступна при правке: %s", exc)
        return "сеть недоступна"

    update_last_text(text)
    log.info("Последнее сообщение обновлено по курсу сайта (курс на %s)", snapshot.cbr_date)
    return "обновлено"


# =========================
# SCHEDULER
# =========================
def seconds_until_next_post() -> int:
    now = datetime.now(TZ)
    target = now.replace(hour=POST_HOUR, minute=POST_MINUTE, second=0, microsecond=0)
    if target <= now:
        target += timedelta(days=1)
    return max(1, int((target - now).total_seconds()))


async def daily_post_loop() -> None:
    while True:
        wait_s = seconds_until_next_post()
        log.info("До следующего поста %s с", wait_s)
        await asyncio.sleep(wait_s)

        if was_posted_today():
            log.info("Сегодня уже публиковали — пропуск")
            await asyncio.sleep(60)
            continue

        snapshot = await fetch_with_retry(timeout_min=60)
        if snapshot is None:
            log.error("Курс недоступен час — сегодняшний пост отложен")
            await asyncio.sleep(60)
            continue

        try:
            await post_with_next_wisdom(snapshot)
        except (TelegramBadRequest, TelegramNetworkError) as exc:
            log.error("Не удалось опубликовать пост: %s", exc)

        await asyncio.sleep(60)


async def sync_loop() -> None:
    while True:
        await asyncio.sleep(SYNC_INTERVAL_SEC)
        try:
            result = await sync_last_post()
            if result == "обновлено":
                log.info("Синхронизация с сайтом: %s", result)
        except Exception:  # noqa: BLE001 — цикл не должен умирать
            log.exception("Ошибка синхронизации последнего сообщения")


# =========================
# LOCAL CONTROL (curl на сервере)
# =========================
def _control_ok(request: web.Request) -> bool:
    if not CONTROL_TOKEN:
        return False
    token = request.query.get("token") or request.headers.get("X-Control-Token") or ""
    return token == CONTROL_TOKEN


async def _handle_post_today(request: web.Request) -> web.Response:
    if not _control_ok(request):
        return web.json_response({"ok": False, "error": "forbidden"}, status=403)
    snapshot = await fetch_site_snapshot()
    if snapshot is None:
        return web.json_response({"ok": False, "error": "rate unavailable"}, status=503)
    message = await post_with_next_wisdom(snapshot)
    return web.json_response({"ok": True, "message_id": message.message_id})


async def _handle_sync(request: web.Request) -> web.Response:
    if not _control_ok(request):
        return web.json_response({"ok": False, "error": "forbidden"}, status=403)
    result = await sync_last_post(force=True)
    return web.json_response({"ok": True, "result": result})


async def run_control_server() -> None:
    app = web.Application()
    app.router.add_post("/post_today", _handle_post_today)
    app.router.add_post("/sync", _handle_sync)
    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, "127.0.0.1", CONTROL_PORT)
    await site.start()
    log.info("Локальное управление: http://127.0.0.1:%s (нужен CONTROL_TOKEN)", CONTROL_PORT)


# =========================
# CONTROL BOT (@alipayvdkbot)
# =========================
HELP_TEXT = (
    "Управление постером AlipayFast\n\n"
    "/status — курс с сайта и состояние последнего поста\n"
    "/sync — привести последнее сообщение к курсу сайта\n"
    "/post_today — опубликовать сейчас (следующая цитата)\n"
    "/help — это сообщение"
)


def _token_used_by_site(token: str) -> bool:
    """Не занят ли токен ботом сайта/мини-аппа (у них на сервере вебхук).

    Смотрим и переменные окружения, и `.env` сайта (``../.env``), чтобы защита
    работала, даже если бот запущен отдельным процессом без env сайта.
    """
    keys = ("TELEGRAM_MINI_APP_BOT_TOKEN", "TELEGRAM_SITE_BOT_TOKEN", "TELEGRAM_BOT_TOKEN")
    tokens = {_env(key) for key in keys}

    site_env = os.path.abspath(os.path.join(BASE_DIR, "..", ".env"))
    if os.path.exists(site_env):
        values = dotenv_values(site_env)
        tokens.update((values.get(key) or "").strip() for key in keys)

    tokens.discard("")
    return token in tokens


def _parse_admin_ids() -> set[int]:
    raw = CONTROL_ADMIN_IDS_RAW or _env("ADMIN_USER_ID")
    ids: set[int] = set()
    for part in raw.split(","):
        part = part.strip()
        if not part:
            continue
        try:
            ids.add(int(part))
        except ValueError:
            log.warning("Некорректный ID администратора: %s", part)
    return ids


async def start_control_polling() -> None:
    if not CONTROL_BOT_TOKEN:
        log.info("CONTROL_BOT_TOKEN не задан — Telegram-управление выключено")
        return
    if CONTROL_BOT_TOKEN == BOT_TOKEN:
        log.error("CONTROL_BOT_TOKEN совпадает с BOT_TOKEN — нужен отдельный бот")
        return
    if _token_used_by_site(CONTROL_BOT_TOKEN):
        log.error(
            "CONTROL_BOT_TOKEN принадлежит боту сайта/мини-аппа (у него вебхук). "
            "Возьмите токен отдельного бота @alipayvdkbot."
        )
        return

    admins = _parse_admin_ids()
    if not admins:
        log.error("Не задан ADMIN_USER_ID или CONTROL_ADMIN_IDS — управление выключено")
        return

    control_bot = build_bot(CONTROL_BOT_TOKEN)
    dp = Dispatcher()

    def from_admin(message: Message) -> bool:
        return bool(message.from_user and message.from_user.id in admins)

    async def deny(message: Message) -> None:
        await message.answer("⛔ Команда доступна только оператору.", parse_mode=None)

    @dp.message(Command("start", "help"))
    async def cmd_help(message: Message) -> None:
        if not from_admin(message):
            await deny(message)
            return
        await message.answer(HELP_TEXT, parse_mode=None)

    @dp.message(Command("status"))
    async def cmd_status(message: Message) -> None:
        if not from_admin(message):
            await deny(message)
            return
        lines = ["📊 Постер AlipayFast"]
        snapshot = await fetch_site_snapshot()
        if snapshot:
            lines.append(f"Курс на {snapshot.cbr_date}:")
            for index, tier in enumerate(snapshot.tiers):
                lines.append(f"  {_tier_label(tier, index)} → {tier.rate:.2f} ₽")
        else:
            lines.append("Курс сайта недоступен")
        last = get_last_post()
        if last:
            lines.append(f"Последний пост: {last.post_date or '—'} (message_id {last.message_id})")
        else:
            lines.append("Последнего поста ещё нет")
        wait_s = seconds_until_next_post()
        next_at = datetime.now(TZ) + timedelta(seconds=wait_s)
        lines.append(f"Следующий пост: {next_at.strftime('%d.%m.%Y %H:%M')} (Владивосток)")
        await message.answer("\n".join(lines), parse_mode=None)

    @dp.message(Command("sync"))
    async def cmd_sync(message: Message) -> None:
        if not from_admin(message):
            await deny(message)
            return
        result = await sync_last_post(force=True)
        await message.answer(f"🔄 {result}", parse_mode=None)

    @dp.message(Command("post_today"))
    async def cmd_post_today(message: Message) -> None:
        if not from_admin(message):
            await deny(message)
            return
        snapshot = await fetch_site_snapshot()
        if snapshot is None:
            await message.answer("Курс сайта недоступен, попробуйте позже.", parse_mode=None)
            return
        await post_with_next_wisdom(snapshot)
        await message.answer("✅ Сообщение опубликовано.", parse_mode=None)

    # У отдельного бота вебхука быть не должно — polling безопасен.
    # Снимаем на случай, если он остался от прежних экспериментов.
    try:
        await control_bot.delete_webhook(drop_pending_updates=False)
    except Exception as exc:  # noqa: BLE001 — не блокируем запуск управления
        log.warning("Не удалось снять вебхук у бота управления: %s", exc)

    log.info("Управление подключено: отдельный бот (команды /status, /sync, /post_today)")
    await dp.start_polling(control_bot)


# =========================
# MAIN
# =========================
_WISDOMS: list[str] = []


async def _supervise(name: str, factory: Callable[[], Awaitable[None]]) -> None:
    while True:
        try:
            await factory()
            return  # штатное завершение (например, polling отключён) — не крутим заново
        except asyncio.CancelledError:
            raise
        except Exception:  # noqa: BLE001
            log.exception("Задача %s упала, перезапуск через 10 с", name)
            await asyncio.sleep(10)


async def main() -> None:
    global _WISDOMS
    create_db()
    _WISDOMS = load_wisdoms(WISDOM_FILE)

    log.info(
        "Старт: пост в %02d:%02d Владивосток, курс из %s, прокси %s, управление %s",
        POST_HOUR,
        POST_MINUTE,
        SITE_API_URL,
        TELEGRAM_PROXY_URL or "нет (напрямую)",
        "отдельным ботом" if CONTROL_BOT_TOKEN else "локально/выключено",
    )

    tasks = [
        asyncio.create_task(_supervise("daily", daily_post_loop)),
        asyncio.create_task(_supervise("sync", sync_loop)),
    ]
    if CONTROL_TOKEN:
        tasks.append(asyncio.create_task(_supervise("control", run_control_server)))
    if CONTROL_BOT_TOKEN:
        tasks.append(asyncio.create_task(_supervise("control-bot", start_control_polling)))

    await asyncio.gather(*tasks)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except (KeyboardInterrupt, SystemExit):
        pass
