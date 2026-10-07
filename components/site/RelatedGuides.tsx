import Link from 'next/link'
import Image from 'next/image'
import { relatedGuides } from '@/lib/guides'

// Блок «Читайте также» — перелинковка между гайдами.
export function RelatedGuides({ path }: { path: string }) {
  const items = relatedGuides(path, 3)
  if (items.length === 0) return null

  return (
    <section className="gp-related">
      <div className="wrap">
        <h2 className="gp-related-h">Читайте также</h2>
        <div className="gp-related-grid">
          {items.map((item) => (
            <Link key={item.path} href={item.path} className="gp-related-card">
              <div className="gp-related-img">
                <Image src={item.image} alt={`Обложка: ${item.title}`} width={480} height={320} sizes="(max-width: 760px) 100vw, 340px" />
              </div>
              <span className="gp-related-tag">
                {item.tag} · {item.minutes} мин
              </span>
              <b>{item.title}</b>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
