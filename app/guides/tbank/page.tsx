import type { Metadata } from 'next'
import '@/components/site/guides.css'
import { TbankGuidePage } from '@/components/site/GuidePage'
import { GuideBreadcrumbs } from '@/components/site/GuideBreadcrumbs'
import { RelatedGuides } from '@/components/site/RelatedGuides'
import { pageMetadata, articleGraph, jsonLd } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: "Как перевести деньги через Т-Банк для Alipay",
  description: "Пошаговая инструкция со скриншотами: оформление карты, установка приложения, перевод и отправка чека для пополнения Alipay.",
  path: "/guides/tbank",
  image: "/assets/covers/tbank.jpg",
  type: 'article',
})

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(articleGraph({ title: "Как перевести деньги через Т-Банк для Alipay", description: "Пошаговая инструкция со скриншотами: оформление карты, установка приложения, перевод и отправка чека для пополнения Alipay.", path: "/guides/tbank", image: "/assets/covers/tbank.jpg" })) }}
      />
      <GuideBreadcrumbs title={
        "Как перевести деньги через Т-Банк"
      } />
      <TbankGuidePage />
      <RelatedGuides path="/guides/tbank" />
    </>
  )
}
