import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

// Реальные даты правки для sitemap: берём дату коммита, а для ещё не
// закоммиченных файлов — время изменения на диске. Так поисковики видят
// фактическую историю страницы, а не дату сборки проекта.

const REPO = process.cwd()

let commitCache: Map<string, number> | null = null
let dirtyCache: Set<string> | null = null

function git(args: string[]): string | null {
  try {
    return execFileSync('git', args, {
      cwd: REPO,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      maxBuffer: 32 * 1024 * 1024,
    })
  } catch {
    return null
  }
}

// Дата последнего коммита по каждому файлу (в списке git log первым идёт самый свежий).
function commitDates(): Map<string, number> {
  if (commitCache) return commitCache
  commitCache = new Map()

  const out = git(['log', '--pretty=format:%cI', '--name-only', '--diff-filter=ACMR'])
  if (!out) return commitCache

  let stamp = 0
  for (const raw of out.split(/\r?\n/)) {
    const line = raw.trim()
    if (!line) continue

    if (/^\d{4}-\d{2}-\d{2}T/.test(line)) {
      stamp = Date.parse(line)
      continue
    }
    if (stamp && !commitCache.has(line)) {
      commitCache.set(line, stamp)
    }
  }

  return commitCache
}

// Файлы с незакоммиченными правками — у них честнее взять время с диска.
function dirtyFiles(): Set<string> {
  if (dirtyCache) return dirtyCache
  dirtyCache = new Set()

  const out = git(['status', '--porcelain', '--untracked-files=all'])
  if (!out) return dirtyCache

  for (const raw of out.split(/\r?\n/)) {
    if (raw.length < 4) continue
    let file = raw.slice(3).trim()
    // «Переименование» приходит как «старое -> новое».
    const arrow = file.indexOf(' -> ')
    if (arrow !== -1) file = file.slice(arrow + 4)
    file = file.replace(/^"|"$/g, '')
    dirtyCache.add(file.replace(/\\/g, '/'))
  }

  return dirtyCache
}

function mtime(file: string): number {
  try {
    return fs.statSync(path.join(REPO, file)).mtimeMs
  } catch {
    return 0
  }
}

export function lastModified(files: string[], fallback = '2026-01-01'): Date {
  const commits = commitDates()
  const dirty = dirtyFiles()
  let latest = 0

  for (const file of files) {
    const rel = file.replace(/\\/g, '/')
    const modified = dirty.has(rel) || !commits.has(rel)
    const candidate = modified ? Math.max(mtime(rel), commits.get(rel) ?? 0) : commits.get(rel)!
    if (candidate > latest) latest = candidate
  }

  return new Date(latest || Date.parse(fallback))
}
