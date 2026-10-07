import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'
import { getUploadsDir } from '@/lib/uploads'

// Next.js в продакшене раздаёт из public/ только файлы, существовавшие на момент
// сборки. Загруженные в рантайме чеки и картинки поэтому отдают 404. Здесь отдаём
// их с диска напрямую — этот роут работает и в dev, и в next start.

export const dynamic = 'force-dynamic'

const CONTENT_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.avif': 'image/avif',
  '.pdf': 'application/pdf',
}

export async function GET(_request: Request, { params }: { params: { path: string[] } }) {
  const segments = params.path ?? []
  if (segments.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const dir = getUploadsDir()
  const target = path.resolve(dir, ...segments)

  // Защита от обхода каталога: итоговый путь обязан лежать внутри uploads.
  if (target !== dir && !target.startsWith(dir + path.sep)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  try {
    const data = await readFile(target)
    const ext = path.extname(target).toLowerCase()
    const type = CONTENT_TYPES[ext] ?? 'application/octet-stream'
    return new NextResponse(data, {
      status: 200,
      headers: {
        'Content-Type': type,
        'Content-Length': String(data.byteLength),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}
