import type { Metadata } from 'next'
import '@/components/site/guides.css'
import { AlipayGuidePage } from '@/components/site/AlipayGuidePage'
import { GuideBreadcrumbs } from '@/components/site/GuideBreadcrumbs'
import { RelatedGuides } from '@/components/site/RelatedGuides'
import { pageMetadata, articleGraph, jsonLd } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: "Alipay: установка, регистрация и настройка",
  description: "Подробный гайд по Alipay: как скачать и установить приложение, зарегистрироваться, пройти верификацию, настроить пароль, переводить и получать деньги.",
  path: "/guides/alipay",
  image: "/assets/covers/alipay-setup.jpg",
  type: 'article',
})

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(articleGraph({ title: "Alipay: установка, регистрация и настройка", description: "Подробный гайд по Alipay: как скачать и установить приложение, зарегистрироваться, пройти верификацию, настроить пароль, переводить и получать деньги.", path: "/guides/alipay", image: "/assets/covers/alipay-setup.jpg" })) }}
      />
      <GuideBreadcrumbs title={
        "Как установить и настроить Alipay"
      } />
      <AlipayGuidePage />
      <RelatedGuides path="/guides/alipay" />
    </>
  )
}
