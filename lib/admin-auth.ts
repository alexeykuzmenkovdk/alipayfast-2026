// Проверка доступа к админке курса.
// Токен формата admin_<timestamp>_<random> (как в предыдущем сайте), либо пароль ADMIN_PASSWORD.

export function makeAdminToken(): string {
  return `admin_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

export function isAuthenticated(request: Request): boolean {
  try {
    const url = new URL(request.url)
    const tokenFromUrl = url.searchParams.get('token')
    const authHeader = request.headers.get('authorization')
    const tokenFromHeader = authHeader?.replace('Bearer ', '')
    const token = tokenFromUrl || tokenFromHeader

    if (!token) return false

    const parts = token.split('_')
    if (parts.length !== 3 || parts[0] !== 'admin') return false

    const timestamp = Number.parseInt(parts[1])
    if (!Number.isFinite(timestamp)) return false

    const maxAge = 24 * 60 * 60 * 1000 // 24 часа
    return Date.now() - timestamp <= maxAge
  } catch (error) {
    console.error('[ADMIN] Ошибка проверки токена:', error)
    return false
  }
}
