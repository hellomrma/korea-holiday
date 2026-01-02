import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'

export const metadata: Metadata = {
  title: '대한민국 공휴일과 전세계 주요 이벤트 | 한국 공휴일 캘린더',
  description: '대한민국의 공휴일과 전세계 주요 이벤트를 한눈에 확인할 수 있는 서비스. 연도별, 월별 공휴일 조회, 연휴 정보 및 스포츠, 우주, 기술, 문화 등 글로벌 이벤트 제공.',
  keywords: ['공휴일', '한국 공휴일', '공휴일 캘린더', '연휴', '국경일', '대체공휴일', '설날', '추석', '한글날', '월드컵', '올림픽', 'NASA', '주요 이벤트', '글로벌 이벤트', '국제 이벤트', '스포츠 이벤트', '우주 탐사', '기술 컨퍼런스', '문화 행사'],
  authors: [{ name: 'hellomrma' }],
  creator: 'hellomrma',
  publisher: 'hellomrma',
  openGraph: {
    title: '대한민국 공휴일과 전세계 주요 이벤트',
    description: '대한민국의 공휴일과 전세계 주요 이벤트를 한눈에 확인할 수 있는 서비스',
    type: 'website',
    locale: 'ko_KR',
    siteName: '대한민국 공휴일과 전세계 주요 이벤트',
  },
  twitter: {
    card: 'summary',
    title: '대한민국 공휴일과 전세계 주요 이벤트',
    description: '대한민국의 공휴일과 전세계 주요 이벤트를 한눈에 확인할 수 있는 서비스',
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
  themeColor: '#fafafa',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <body>
        {/* Structured Data (JSON-LD) for SEO and GEO */}
        <Script
          id="structured-data"
          type="application/ld+json"
          strategy="beforeInteractive"
        >
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: '대한민국 공휴일과 전세계 주요 이벤트',
            description: '대한민국의 공휴일과 전세계 주요 이벤트를 한눈에 확인할 수 있는 서비스. 연도별, 월별 공휴일 조회, 연휴 정보 및 글로벌 이벤트 제공.',
            applicationCategory: 'UtilityApplication',
            operatingSystem: 'Web',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'KRW',
            },
            author: {
              '@type': 'Person',
              name: 'hellomrma',
              email: 'hellomrma@gmail.com',
            },
            featureList: [
              '연도별 공휴일 조회',
              '월별 공휴일 조회',
              '연휴 기간 자동 계산',
              '국경일 및 대체공휴일 표시',
              '전세계 주요 이벤트 정보',
              '반응형 디자인',
            ],
            keywords: '공휴일, 한국 공휴일, 공휴일 캘린더, 연휴, 국경일, 대체공휴일, 설날, 추석, 한글날, 월드컵, 올림픽, NASA, 주요 이벤트, 글로벌 이벤트, 국제 이벤트, 스포츠 이벤트, 우주 탐사, 기술 컨퍼런스, 문화 행사',
          })}
        </Script>
        {/* FAQ Schema for GEO */}
        <Script
          id="faq-schema"
          type="application/ld+json"
          strategy="beforeInteractive"
        >
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: '대한민국 공휴일과 전세계 주요 이벤트는 어떻게 확인하나요?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: '이 웹사이트에서 연도별, 월별로 공휴일과 전세계 주요 이벤트를 확인할 수 있습니다. 상단의 년도 탭을 선택하여 원하는 연도의 정보를 조회하세요.',
                },
              },
              {
                '@type': 'Question',
                name: '연휴 기간은 어떻게 계산되나요?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: '공휴일이 3일 이상 연속되는 경우 자동으로 연휴 기간을 계산합니다. 주말(토요일, 일요일)을 포함한 연휴 기간도 자동으로 감지하여 표시합니다.',
                },
              },
              {
                '@type': 'Question',
                name: '어떤 공휴일이 표시되나요?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: '국경일(신정, 설날, 삼일절, 어린이날, 부처님오신날, 현충일, 광복절, 추석, 개천절, 한글날, 크리스마스)과 대체공휴일이 표시됩니다.',
                },
              },
            {
              '@type': 'Question',
              name: '공휴일 데이터는 어디서 가져오나요?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: '공공데이터포털의 한국천문연구원 특일정보 API를 활용하여 정확한 공휴일 정보를 제공합니다. 전세계 주요 이벤트는 BBC, CNN 등 주요 언론 매체의 정보를 바탕으로 제공됩니다.',
              },
            },
            {
              '@type': 'Question',
              name: '어떤 전세계 이벤트가 표시되나요?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: '스포츠(월드컵, 올림픽, 테니스 그랜드슬램 등), 우주/과학(NASA 미션, 우주 탐사), 기술(CES, WWDC, I/O), 문화/예술(영화제, 음악 페스티벌), 정치/경제(G7, G20), 환경(COP) 등 다양한 분야의 주요 이벤트가 표시됩니다.',
              },
            },
            ],
          })}
        </Script>
        {/* HowTo Schema for GEO */}
        <Script
          id="howto-schema"
          type="application/ld+json"
          strategy="beforeInteractive"
        >
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: '대한민국 공휴일과 전세계 주요 이벤트 확인 방법',
            description: '대한민국 공휴일과 전세계 주요 이벤트를 확인하는 방법을 안내합니다.',
            step: [
              {
                '@type': 'HowToStep',
                name: '연도 선택',
                text: '상단의 년도 탭에서 확인하고 싶은 연도를 선택합니다.',
              },
              {
                '@type': 'HowToStep',
                name: '공휴일 확인',
                text: '선택한 연도의 12개월 공휴일이 4열 그리드로 표시됩니다.',
              },
              {
                '@type': 'HowToStep',
                name: '연휴 정보 확인',
                text: '3일 이상 연속되는 연휴의 경우 "주말 포함 X일 연휴" 정보가 표시됩니다.',
              },
              {
                '@type': 'HowToStep',
                name: '전세계 주요 이벤트 확인',
                text: '공휴일 목록 아래에 해당 연도의 전세계 주요 이벤트가 월별로 정렬되어 표시됩니다.',
              },
            ],
          })}
        </Script>
        {/* BreadcrumbList Schema for GEO */}
        <Script
          id="breadcrumb-schema"
          type="application/ld+json"
          strategy="beforeInteractive"
        >
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: '홈',
                item: 'https://korea-holiday.vercel.app',
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: '대한민국 공휴일과 전세계 주요 이벤트',
                item: 'https://korea-holiday.vercel.app',
              },
            ],
          })}
        </Script>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-XPN0G32Z9Q"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XPN0G32Z9Q');
          `}
        </Script>
        {children}
      </body>
    </html>
  )
}

