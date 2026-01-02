import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '대한민국 공휴일 확인',
  description: '대한민국의 공휴일을 쉽고 빠르게 확인할 수 있는 서비스',
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
      <body>{children}</body>
    </html>
  )
}

