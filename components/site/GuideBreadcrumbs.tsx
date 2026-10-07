import Link from 'next/link'
import { breadcrumbGraph, jsonLd } from '@/lib/seo'

// Хлебные крошки: видимый путь + разметка BreadcrumbList.
export function GuideBreadcrumbs({ title }: { title: string }) {
  const items = [
    { name: 'Главная', url: '/' },
    { name: 'Полезные материалы', url: '/materials' },
    { name: title },
  ]

  return (
    <>
      <nav className="gp-crumbs" aria-label="Хлебные крошки">
        <Link href="/">Главная</Link>
        <span aria-hidden="true">/</span>
        <Link href="/materials">Полезные материалы</Link>
        <span aria-hidden="true">/</span>
        <span className="gp-crumbs-cur" aria-current="page">
          {title}
        </span>
      </nav>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbGraph(items)) }} />
    </>
  )
}
