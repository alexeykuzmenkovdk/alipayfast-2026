import type { Metadata } from 'next'
import '@/components/site/guides.css'
import { AlipayUnblockGuidePage } from '@/components/site/AlipayUnblockGuidePage'
import { GuideBreadcrumbs } from '@/components/site/GuideBreadcrumbs'
import { RelatedGuides } from '@/components/site/RelatedGuides'
import { pageMetadata, articleGraph, jsonLd } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: "Как снять блокировку Alipay: пошаговая инструкция",
  description: "Что делать, если Alipay заблокировал аккаунт: признаки ограничения, снятие через Центр безопасности по шагам, верификация и сроки блокировки.",
  path: "/guides/alipay-unblock",
  image: "/assets/alipay-unblock/cover.png",
  type: 'article',
})

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(articleGraph({ title: "Как снять блокировку Alipay: пошаговая инструкция", description: "Что делать, если Alipay заблокировал аккаунт: признаки ограничения, снятие через Центр безопасности по шагам, верификация и сроки блокировки.", path: "/guides/alipay-unblock", image: "/assets/alipay-unblock/cover.png" })) }}
      />
      <GuideBreadcrumbs title={
        "Как снять блокировку Alipay"
      } />
      <AlipayUnblockGuidePage />
      <RelatedGuides path="/guides/alipay-unblock" />
    </>
  )
}
