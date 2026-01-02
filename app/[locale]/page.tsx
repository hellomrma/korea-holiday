'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from '../page.module.scss'
import majorEventsKoData from '../data/major-events-ko.json'
import majorEventsEnData from '../data/major-events-en.json'
import koTranslations from '../data/locales/ko.json'
import enTranslations from '../data/locales/en.json'
import holidayNamesData from '../data/holiday-names.json'

type Language = 'ko' | 'en'
type Translations = typeof koTranslations

interface Holiday {
  date: number
  name: string
  isHoliday: boolean
  dateKind?: string
  dateKindName?: string
  seq?: number
}

interface HolidayByMonth {
  month: number
  holidays: Holiday[]
}

interface MajorEvent {
  name: string
  date: string
  endDate?: string
  type: string
  location: string
  description: string
}

export default function Home() {
  const params = useParams()
  const router = useRouter()
  const locale = (params?.locale as Language) || 'ko'
  const language: Language = locale === 'ko' || locale === 'en' ? locale : 'ko'
  
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [holidaysByMonth, setHolidaysByMonth] = useState<HolidayByMonth[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 번역 함수
  const t = (key: string, params?: Record<string, string | number>): string => {
    const translations = language === 'ko' ? koTranslations : enTranslations
    const keys = key.split('.')
    let value: any = translations
    for (const k of keys) {
      value = value?.[k]
    }
    if (typeof value !== 'string') return key
    
    // 파라미터 치환
    if (params) {
      return Object.entries(params).reduce((str, [paramKey, paramValue]) => {
        return str.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue))
      }, value)
    }
    return value
  }

  useEffect(() => {
    fetchYearHolidays(selectedYear)
  }, [selectedYear, language])

  const fetchYearHolidays = async (year: number) => {
    setLoading(true)
    setError(null)
    
    try {
      // 12개월 모두 조회
      const monthPromises = Array.from({ length: 12 }, (_, i) => 
        fetch(`/api/holidays?year=${year}&month=${i + 1}`)
          .then(res => res.json())
      )
      
      const results = await Promise.all(monthPromises)
      
      // 월별로 그룹화 및 필터링 (국경일, 대체공휴일만)
      const grouped: HolidayByMonth[] = results.map((data, index) => {
        const holidays = (data.holidays || []).filter((holiday: Holiday) => {
          // 국경일(dateKind: '01') 또는 대체공휴일만 필터링
          const isSubstitute = holiday.name.includes('대체') || holiday.name.includes('대체공휴일')
          return holiday.dateKind === '01' || isSubstitute
        }).map((holiday: Holiday) => {
          // 공휴일 이름 번역
          const holidayNames = holidayNamesData[language as 'ko' | 'en']
          let translatedName = holidayNames[holiday.name]
          
          // 번역이 없으면 복합 이름 처리
          if (!translatedName && language === 'en') {
            // "대체공휴일(공휴일명)" 패턴 처리 (예: "대체공휴일(삼일절)")
            const bracketMatch = holiday.name.match(/대체공휴일\(([^)]+)\)/)
            if (bracketMatch) {
              const baseName = bracketMatch[1]
              const baseTranslated = holidayNames[baseName]
              if (baseTranslated) {
                translatedName = `${baseTranslated} (Substitute)`
              }
            }
            // "공휴일명 대체공휴일" 패턴 처리 (예: "어린이날 대체공휴일")
            else if (holiday.name.includes('대체공휴일') || holiday.name.includes('대체')) {
              const baseName = holiday.name.replace(/\s*대체공휴일\s*/g, '').replace(/\s*대체\s*/g, '').trim()
              const baseTranslated = holidayNames[baseName]
              if (baseTranslated) {
                translatedName = `${baseTranslated} (Substitute)`
              }
            }
          }
          
          // dateKindName 번역
          const translations = language === 'ko' ? koTranslations : enTranslations
          let translatedDateKindName = holiday.dateKindName
          if (holiday.dateKindName) {
            if (holiday.dateKindName === '국경일') {
              translatedDateKindName = translations.dateKind.national
            } else if (holiday.dateKindName === '대체공휴일') {
              translatedDateKindName = translations.dateKind.substitute
            }
          }
          
          return {
            ...holiday,
            name: translatedName || holiday.name,
            dateKindName: translatedDateKindName || holiday.dateKindName
          }
        })
        return {
          month: index + 1,
          holidays: holidays,
        }
      })
      
      // 에러 체크: results 중 하나라도 error가 있으면 처리
      const hasError = results.some((result: any) => result.error)
      if (hasError) {
        const firstError = results.find((result: any) => result.error)
        setError(firstError?.error || t('common.errorMessage'))
      } else {
        setHolidaysByMonth(grouped)
      }
    } catch (err) {
      setError(t('common.errorMessage'))
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const changeYear = (year: number) => {
    setSelectedYear(year)
  }

  // 현재 년도 기준으로 앞 1년, 뒤 1년 포함한 년도 목록 생성
  const getYearList = (): number[] => {
    const currentYear = new Date().getFullYear()
    const years: number[] = []
    for (let i = -1; i <= 1; i++) {
      years.push(currentYear + i)
    }
    return years
  }

  const yearList = getYearList()

  const formatDate = (dateNum: number): string => {
    const dateStr = dateNum.toString()
    const y = dateStr.substring(0, 4)
    const m = dateStr.substring(4, 6)
    const d = dateStr.substring(6, 8)
    return `${y}-${m}-${d}`
  }

  const getDayOfWeek = (dateNum: number): string => {
    const dateStr = dateNum.toString()
    const y = parseInt(dateStr.substring(0, 4))
    const m = parseInt(dateStr.substring(4, 6)) - 1
    const d = parseInt(dateStr.substring(6, 8))
    const date = new Date(y, m, d)
    return t(`days.${date.getDay()}`)
  }

  const isToday = (dateNum: number): boolean => {
    const today = new Date()
    const dateStr = dateNum.toString()
    return (
      parseInt(dateStr.substring(0, 4)) === today.getFullYear() &&
      parseInt(dateStr.substring(4, 6)) === today.getMonth() + 1 &&
      parseInt(dateStr.substring(6, 8)) === today.getDate()
    )
  }

  const getMonthName = (month: number): string => {
    const translations = language === 'ko' ? koTranslations : enTranslations
    return translations.months[month.toString()] || `${month}월`
  }

  const getTotalHolidays = (): number => {
    return holidaysByMonth.reduce((sum, monthData) => sum + monthData.holidays.length, 0)
  }

  // 주말 개수 계산 (토요일 + 일요일)
  const getWeekendCount = (year: number): number => {
    let weekendCount = 0
    for (let month = 0; month < 12; month++) {
      const daysInMonth = new Date(year, month + 1, 0).getDate()
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day)
        const dayOfWeek = date.getDay()
        if (dayOfWeek === 0 || dayOfWeek === 6) { // 일요일(0) 또는 토요일(6)
          weekendCount++
        }
      }
    }
    return weekendCount
  }

  // 평일 공휴일 개수 계산 (주말이 아닌 공휴일)
  const getWeekdayHolidays = (): number => {
    let weekdayHolidayCount = 0
    holidaysByMonth.forEach(monthData => {
      monthData.holidays.forEach(holiday => {
        const dateStr = holiday.date.toString()
        const y = parseInt(dateStr.substring(0, 4))
        const m = parseInt(dateStr.substring(4, 6)) - 1
        const d = parseInt(dateStr.substring(6, 8))
        const date = new Date(y, m, d)
        const dayOfWeek = date.getDay()
        // 평일(월~금)인 경우만 카운트
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          weekdayHolidayCount++
        }
      })
    })
    return weekdayHolidayCount
  }

  // 총 휴일 수 계산 (주말 + 평일 공휴일)
  const getTotalDaysOff = (): number => {
    const weekendCount = getWeekendCount(selectedYear)
    const weekdayHolidayCount = getWeekdayHolidays()
    return weekendCount + weekdayHolidayCount
  }

  const getHolidayType = (holiday: Holiday): string => {
    // 대체공휴일 확인
    if (holiday.name.includes('대체') || holiday.name.includes('대체공휴일')) {
      return 'substitute'
    }
    // dateKind에 따라 분류
    switch (holiday.dateKind) {
      case '01':
        return 'national' // 국경일
      case '02':
        return 'memorial' // 기념일
      case '03':
        return 'solar' // 24절기
      case '04':
        return 'traditional' // 잡절
      default:
        return 'other'
    }
  }

  const getHolidayTypeColor = (type: string): string => {
    const colorMap: Record<string, string> = {
      national: '#2563eb', // 국경일 - 진한 파란색
      substitute: '#dc2626', // 대체공휴일 - 진한 빨간색
      other: '#9ca3af', // 기타 - gray light
    }
    return colorMap[type] || colorMap.other
  }

  // 연휴 정보 계산
  const calculateHolidayPeriod = (holiday: Holiday): { days: number; description: string } | null => {
    // 모든 공휴일 날짜 수집
    const allHolidayDates = new Set<number>()
    holidaysByMonth.forEach(monthData => {
      monthData.holidays.forEach(h => {
        allHolidayDates.add(h.date)
      })
    })

    const dateStr = holiday.date.toString()
    const y = parseInt(dateStr.substring(0, 4))
    const m = parseInt(dateStr.substring(4, 6)) - 1
    const d = parseInt(dateStr.substring(6, 8))
    const holidayDate = new Date(y, m, d)
    const dayOfWeek = holidayDate.getDay() // 0=일요일, 1=월요일, ..., 6=토요일

    // 날짜를 숫자로 변환하는 헬퍼
    const dateToNum = (date: Date): number => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return parseInt(`${year}${month}${day}`)
    }

    // 주말인지 확인
    const isWeekend = (date: Date): boolean => {
      const day = date.getDay()
      return day === 0 || day === 6 // 일요일 또는 토요일
    }

    // 특정 날짜가 공휴일 또는 주말인지 확인
    const isHolidayOrWeekend = (date: Date): boolean => {
      const dateNum = dateToNum(date)
      return allHolidayDates.has(dateNum) || isWeekend(date)
    }

    // 연휴 기간의 시작일 찾기 (가장 이른 날짜)
    let startDate = new Date(holidayDate)
    let endDate = new Date(holidayDate)
    let hasWeekend = false

    // 앞쪽으로 연속된 공휴일/주말 확인
    let checkDate = new Date(holidayDate)
    let foundStart = false
    for (let i = 0; i < 7; i++) {
      checkDate.setDate(checkDate.getDate() - 1)
      const checkDateNum = dateToNum(checkDate)
      
      if (isHolidayOrWeekend(checkDate)) {
        if (isWeekend(checkDate)) {
          hasWeekend = true
        }
        startDate = new Date(checkDate)
        foundStart = true
      } else {
        break
      }
    }

    // 뒤쪽으로 연속된 공휴일/주말 확인
    checkDate = new Date(holidayDate)
    for (let i = 0; i < 7; i++) {
      checkDate.setDate(checkDate.getDate() + 1)
      const checkDateNum = dateToNum(checkDate)
      
      if (isHolidayOrWeekend(checkDate)) {
        if (isWeekend(checkDate)) {
          hasWeekend = true
        }
        endDate = new Date(checkDate)
      } else {
        break
      }
    }

    // 공휴일 자체가 주말인지 확인
    if (isWeekend(holidayDate)) {
      hasWeekend = true
    }

    // 연휴 기간 계산 (시작일부터 종료일까지)
    const startDateNum = dateToNum(startDate)
    const endDateNum = dateToNum(endDate)
    const currentDateNum = holiday.date
    
    // 시작일부터 종료일까지의 일수 계산
    const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
    const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())
    const diffTime = end.getTime() - start.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1 // +1은 시작일 포함


    // 연휴가 3일 이상인 경우만 표시
    if (diffDays >= 3) {
      // 연휴 기간 내의 첫 번째 공휴일(주말 제외) 찾기
      let firstHolidayDate = startDate
      let checkFirstDate = new Date(startDate)
      while (checkFirstDate <= endDate) {
        const checkDateNum = dateToNum(checkFirstDate)
        if (allHolidayDates.has(checkDateNum) && !isWeekend(checkFirstDate)) {
          firstHolidayDate = new Date(checkFirstDate)
          break
        }
        checkFirstDate.setDate(checkFirstDate.getDate() + 1)
      }
      
      // 현재 공휴일이 첫 번째 공휴일(주말 제외)인 경우에만 표시
      const firstHolidayDateNum = dateToNum(firstHolidayDate)
      if (firstHolidayDateNum === currentDateNum) {
        return {
          days: diffDays,
          description: hasWeekend 
            ? t('holiday.holidayPeriod', { days: diffDays })
            : t('holiday.holidayPeriodShort', { days: diffDays })
        }
      }
    }

    return null
  }

  // 주요 이벤트 데이터 가져오기 및 날짜 순 정렬
  const getMajorEvents = (): MajorEvent[] => {
    const yearStr = selectedYear.toString()
    const majorEventsData = language === 'ko' ? majorEventsKoData : majorEventsEnData
    const events = (majorEventsData as Record<string, MajorEvent[]>)[yearStr] || []
    
    // 날짜 기준으로 정렬
    return events.sort((a, b) => {
      // 날짜 파싱 함수
      const parseDate = (dateStr: string): number => {
        if (!dateStr) return 99999999 // 날짜가 없으면 맨 뒤로
        
        // YYYY-MM-DD 형식
        if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
          return parseInt(dateStr.replace(/-/g, ''), 10)
        }
        
        // YYYY-MM 형식
        if (dateStr.match(/^\d{4}-\d{2}$/)) {
          return parseInt(dateStr.replace(/-/g, '') + '01', 10) // 월의 첫날로 처리
        }
        
        // YYYY 형식
        if (dateStr.match(/^\d{4}$/)) {
          return parseInt(dateStr + '0101', 10) // 연도의 첫날로 처리
        }
        
        return 99999999 // 알 수 없는 형식은 맨 뒤로
      }
      
      const dateA = parseDate(a.date)
      const dateB = parseDate(b.date)
      
      return dateA - dateB
    })
  }

  const majorEvents = getMajorEvents()

  return (
    <>
      <a href="#main-content" className={styles.skipLink}>
        {t('common.skipToContent')}
      </a>
      <main id="main-content" className={styles.main} role="main" aria-label={t('hero.title')}>
        {/* Key Message - Hero Section */}
        <section className={styles.heroSection}>
          <div className={styles.languageSwitcher}>
            <Link
              href="/ko"
              className={`${styles.langButton} ${language === 'ko' ? styles.langButtonActive : ''}`}
              aria-label="한국어로 전환"
              aria-pressed={language === 'ko'}
            >
              KO
            </Link>
            <Link
              href="/en"
              className={`${styles.langButton} ${language === 'en' ? styles.langButtonActive : ''}`}
              aria-label="Switch to English"
              aria-pressed={language === 'en'}
            >
              EN
            </Link>
          </div>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>{t('hero.title')}</h1>
            <p className={styles.heroSubtitle} dangerouslySetInnerHTML={{ __html: t('hero.subtitle') }} />
          </div>
        </section>

        <div className={styles.container}>
          {/* Calendar Section */}
          <section className={styles.calendarSection} id="calendar">
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>{t('calendar.title', { year: selectedYear })}</h2>
              <p className={styles.sectionDescription}>
                {t('calendar.description')}
              </p>
            </div>
        
            <nav className={styles.controls} aria-label={t('calendar.yearSelection')}>
          <div className={styles.yearTabs} role="tablist" aria-label={t('calendar.yearSelectionTabs')}>
            {yearList.map((year) => (
              <button
                key={year}
                onClick={() => changeYear(year)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    changeYear(year)
                  }
                }}
                className={`${styles.yearTab} ${selectedYear === year ? styles.yearTabActive : ''}`}
                role="tab"
                aria-selected={selectedYear === year ? true : false}
                aria-label={t('calendar.selectYear', { year })}
                tabIndex={selectedYear === year ? 0 : -1}
              >
                {year}
              </button>
            ))}
          </div>
          {!loading && !error && (
            <div className={styles.yearSummary} aria-live="polite" aria-atomic="true">
              {t('calendar.totalHolidays', { count: getTotalHolidays() })}
              <br />
              <span className={styles.totalDaysOff}>
                {t('calendar.totalDaysOff', { count: getTotalDaysOff() })}
              </span>
            </div>
          )}
        </nav>

        {loading && (
          <div className={styles.loading} role="status" aria-live="polite" aria-label={t('common.loading')}>
            <span aria-hidden="true">{t('common.loading')}</span>
          </div>
        )}

        {error && (
          <div className={styles.error} role="alert" aria-live="assertive">
            <strong>{t('common.error')}:</strong> {error}
            <br />
            <small>{t('common.errorApiKey')}</small>
          </div>
        )}

            {!loading && !error && (
              <>
                {/* 범례 레이블 */}
                <div className={styles.legend} aria-label="공휴일 범례">
                  <div className={styles.legendItem}>
                    <span 
                      className={styles.legendColor} 
                      style={{ backgroundColor: '#60a5fa' }}
                      aria-hidden="true"
                    ></span>
                    <span className={styles.legendLabel}>{t('legend.national')}</span>
                  </div>
                  <div className={styles.legendItem}>
                    <span 
                      className={styles.legendColor} 
                      style={{ backgroundColor: '#f87171' }}
                      aria-hidden="true"
                    ></span>
                    <span className={styles.legendLabel}>{t('legend.substitute')}</span>
                  </div>
                </div>

                <div className={styles.yearHolidayList} aria-label={t('calendar.title', { year: selectedYear })}>
            {holidaysByMonth.map((monthData) => (
              <article key={monthData.month} className={styles.monthSection}>
                <h2 className={styles.monthHeader}>
                  {getMonthName(monthData.month)} <span className={styles.monthCount}>({monthData.holidays.length}{language === 'ko' ? '개' : ''})</span>
                </h2>
                {monthData.holidays.length === 0 ? (
                  <p className={styles.emptyMonth} aria-live="polite">
                    {t('holiday.empty')}
                  </p>
                ) : (
                  <ul className={styles.monthHolidayList} role="list">
                    {monthData.holidays
                      .filter((holiday) => {
                        // 국경일(dateKind: '01') 또는 대체공휴일만 표시
                        const holidayType = getHolidayType(holiday)
                        return holidayType === 'national' || holidayType === 'substitute'
                      })
                      .map((holiday) => {
                        const holidayType = getHolidayType(holiday)
                        const typeColor = getHolidayTypeColor(holidayType)
                        const holidayPeriod = calculateHolidayPeriod(holiday)
                        const formattedDate = formatDate(holiday.date)
                        const dayOfWeek = getDayOfWeek(holiday.date)
                        const isTodayHoliday = isToday(holiday.date)
                        return (
                      <li 
                        key={holiday.date} 
                        className={`${styles.holidayItem} ${isTodayHoliday ? styles.today : ''}`}
                        style={{ borderLeftColor: typeColor }}
                        role="listitem"
                        aria-label={`${formattedDate} ${dayOfWeek}요일 ${holiday.name}${holidayPeriod ? ` ${holidayPeriod.description}` : ''}${isTodayHoliday ? ' 오늘' : ''}`}
                      >
                        <div className={styles.holidayDate}>
                          <time dateTime={formattedDate} className={styles.date}>
                            {formattedDate}
                          </time>
                          <span className={styles.dayOfWeek} aria-label={`${dayOfWeek}요일`}>
                            ({dayOfWeek})
                          </span>
                          {holidayPeriod && (
                            <span className={styles.holidayPeriod} aria-label="연휴 정보">
                              {holidayPeriod.description}
                            </span>
                          )}
                        </div>
                        <div className={styles.holidayInfo}>
                          <strong className={styles.holidayName}>{holiday.name}</strong>
                          {holiday.dateKindName && (
                            <span 
                              className={`${styles.dateKindBadge} ${styles[holidayType]}`}
                              aria-label={`${holiday.dateKindName} ${language === 'ko' ? '공휴일' : 'holiday'}`}
                            >
                              {holiday.dateKindName}
                            </span>
                          )}
                        </div>
                        {isTodayHoliday && (
                          <span className={styles.todayBadge} aria-label={t('holiday.today')}>{t('holiday.today')}</span>
                        )}
                      </li>
                      )
                    })}
                  </ul>
                )}
              </article>
                ))}
              </div>
              </>
            )}
          </section>

          {/* Key Message - Middle Section */}
          {!loading && !error && majorEvents.length > 0 && (
            <section className={styles.keyMessageSection}>
              <div className={styles.keyMessageContent}>
                <h2 className={styles.keyMessageTitle}>{t('keyMessage.title')}</h2>
                <p className={styles.keyMessageText} dangerouslySetInnerHTML={{ __html: t('keyMessage.text', { year: selectedYear }) }} />
              </div>
            </section>
          )}

          {/* Event List Section */}
          {!loading && !error && majorEvents.length > 0 && (
            <section className={styles.eventsSection} id="events" aria-label={t('events.title', { year: selectedYear })}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>{t('events.title', { year: selectedYear })}</h2>
                <p className={styles.sectionDescription}>
                  {t('events.description')}
                </p>
              </div>
              <div className={styles.eventsList}>
              {majorEvents.map((event, index) => (
                <article key={index} className={styles.eventItem} data-type={event.type}>
                  <div className={styles.eventHeader}>
                    <h3 className={styles.eventName}>{event.name}</h3>
                    <span className={styles.eventType} data-type={event.type}>{t(`eventTypes.${event.type}`) || event.type}</span>
                  </div>
                  <div className={styles.eventDetails}>
                    <time dateTime={event.date} className={styles.eventDate}>
                      {event.date.replace(/-/g, '.')}
                      {event.endDate && ` ~ ${event.endDate.replace(/-/g, '.')}`}
                    </time>
                    <span className={styles.eventLocation}>{event.location}</span>
                  </div>
                </article>
              ))}
              </div>
            </section>
          )}

          <footer className={styles.footer}>
            <p>{t('footer.apiSource')}</p>
            <div className={styles.copyright}>
            <p>{t('footer.copyright', { year: new Date().getFullYear() })}</p>
            <nav className={styles.footerLinks} aria-label="소셜 링크">
              <a 
                href="mailto:hellomrma@gmail.com" 
                className={styles.footerLink}
                aria-label="이메일로 연락하기"
              >
                hellomrma@gmail.com
              </a>
              <span className={styles.footerSeparator} aria-hidden="true">•</span>
              <a 
                href="https://github.com/hellomrma" 
                target="_blank" 
                rel="noopener noreferrer" 
                className={styles.footerLink}
                aria-label="GitHub 프로필 보기 (새 창)"
              >
                GitHub
              </a>
              <span className={styles.footerSeparator} aria-hidden="true">•</span>
              <a 
                href="https://www.linkedin.com/in/hellomrma" 
                target="_blank" 
                rel="noopener noreferrer" 
                className={styles.footerLink}
                aria-label="LinkedIn 프로필 보기 (새 창)"
              >
                LinkedIn
              </a>
              <span className={styles.footerSeparator} aria-hidden="true">•</span>
              <a 
                href="https://twitter.com/hellomrma" 
                target="_blank" 
                rel="noopener noreferrer" 
                className={styles.footerLink}
                aria-label="Twitter 프로필 보기 (새 창)"
              >
                @hellomrma
              </a>
            </nav>
            </div>
          </footer>
        </div>
      </main>
    </>
  )
}

