import path from 'path'

// Каталог загрузок (чеки, картинки в чате). Запись и чтение обязаны смотреть
// в одно место, поэтому путь считается здесь одинаково для обоих роутов.
// Относительный UPLOADS_DIR разрешается от рабочего каталога процесса.
export function getUploadsDir() {
  return process.env.UPLOADS_DIR
    ? path.resolve(process.env.UPLOADS_DIR)
    : path.join(process.cwd(), 'public', 'uploads')
}

export function getUploadsBaseUrl() {
  const base = process.env.UPLOADS_BASE_URL ?? '/uploads'
  return base.endsWith('/') ? base.slice(0, -1) : base
}
