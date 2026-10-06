import { NextResponse } from 'next/server'
import { makeAdminToken } from '@/lib/admin-auth'

// Вход в админку курса по паролю из ADMIN_PASSWORD.
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const password = String(body?.password ?? '')
    const expected = process.env.ADMIN_PASSWORD ?? 'change_me'

    if (!password || password !== expected) {
      return NextResponse.json({ success: false, message: 'Неверный пароль' }, { status: 401 })
    }

    return NextResponse.json({ success: true, token: makeAdminToken() })
  } catch (error) {
    console.error('[SERVER] Ошибка при входе в админку:', error)
    return NextResponse.json({ success: false, message: 'Ошибка авторизации' }, { status: 500 })
  }
}
