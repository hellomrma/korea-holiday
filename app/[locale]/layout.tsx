import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import koTranslations from '../data/locales/ko.json'
import enTranslations from '../data/locales/en.json'

type Language = 'ko' | 'en'

const translations = {
  ko: koTranslations,
  en: enTranslations,
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const locale = (params?.locale as Language) || 'ko'
  const language: Language = locale === 'ko' || locale === 'en' ? locale : 'ko'
  const t = translations[language]

  const title = t.hero.title
  const description = language === 'ko' 
    ? '대한민국의 공휴일과 전세계 주요 이벤트를 한눈에 확인할 수 있는 서비스. 연도별, 월별 공휴일 조회, 연휴 정보 및 스포츠, 우주, 기술, 문화 등 글로벌 이벤트 제공.'
    : 'Check Republic of Korea holidays and global major events at a glance. View holidays by year and month, holiday information, and global events including sports, space, technology, and culture.'

  const keywords = language === 'ko'
    ? ['공휴일', '한국 공휴일', '공휴일 캘린더', '연휴', '국경일', '대체공휴일', '설날', '추석', '한글날', '월드컵', '올림픽', 'NASA', '주요 이벤트', '글로벌 이벤트', '국제 이벤트', '스포츠 이벤트', '우주 탐사', '기술 컨퍼런스', '문화 행사']
    : ['holidays', 'Republic of Korea holidays', 'holiday calendar', 'long weekend', 'national holiday', 'substitute holiday', 'New Year', 'Chuseok', 'Hangul Day', 'World Cup', 'Olympics', 'NASA', 'major events', 'global events', 'international events', 'sports events', 'space exploration', 'tech conference', 'cultural events']

  const fullTitle = language === 'ko'
    ? `${title} | 한국 공휴일 캘린더`
    : `${title} | Republic of Korea Holiday Calendar`

  return {
    title: fullTitle,
    description,
    keywords,
    authors: [{ name: 'hellomrma' }],
    creator: 'hellomrma',
    publisher: 'hellomrma',
    openGraph: {
      title,
      description,
      type: 'website',
      locale: language === 'ko' ? 'ko_KR' : 'en_US',
      siteName: title,
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    viewport: {
      width: 'device-width',
      initialScale: 1,
      maximumScale: 5,
    },
    themeColor: '#0a0a0f',
  }
}

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  const locale = (params?.locale as Language) || 'ko'
  const language: Language = locale === 'ko' || locale === 'en' ? locale : 'ko'

  if (language !== 'ko' && language !== 'en') {
    notFound()
  }

  return <>{children}</>
}

