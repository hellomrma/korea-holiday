'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RootPage() {
  const router = useRouter()

  useEffect(() => {
    // 브라우저 언어 감지
    const browserLang = typeof window !== 'undefined' 
      ? (navigator.language || (navigator as any).userLanguage || 'ko')
      : 'ko'
    const lang = browserLang.toLowerCase().startsWith('ko') ? 'ko' : 'en'
    
    // 감지된 언어로 리다이렉트
    router.replace(`/${lang}`)
  }, [router])

  return null
}
