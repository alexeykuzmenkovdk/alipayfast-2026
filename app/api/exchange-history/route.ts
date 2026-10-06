import { NextResponse } from 'next/server'
import { readHistory } from '@/lib/exchange-history'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const history = readHistory()
    return NextResponse.json({ success: true, history })
  } catch (error) {
    console.error('[SERVER] Ошибка при получении истории курса:', error)
    return NextResponse.json({ success: false, message: 'Ошибка при получении истории курса' }, { status: 500 })
  }
}
