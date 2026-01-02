'use client'

import { useState, useEffect } from 'react'
import styles from './page.module.css'
import majorEventsData from './data/major-events.json'

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
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [holidaysByMonth, setHolidaysByMonth] = useState<HolidayByMonth[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchYearHolidays(selectedYear)
  }, [selectedYear])

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
        })
        return {
          month: index + 1,
          holidays: holidays,
        }
      })
      
      setHolidaysByMonth(grouped)
    } catch (err) {
      setError('공휴일 정보를 가져오는 중 오류가 발생했습니다.')
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
    const days = ['일', '월', '화', '수', '목', '금', '토']
    return days[date.getDay()]
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
    const months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']
    return months[month - 1]
  }

  const getTotalHolidays = (): number => {
    return holidaysByMonth.reduce((sum, monthData) => sum + monthData.holidays.length, 0)
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
      national: '#9ca3af', // 국경일 - gray light
      substitute: '#6b7280', // 대체공휴일 - gray darker
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
        const weekendText = hasWeekend ? '주말 포함 ' : ''
        return {
          days: diffDays,
          description: `${weekendText}${diffDays}일 연휴`
        }
      }
    }

    return null
  }

  // 주요 이벤트 데이터 가져오기 및 날짜 순 정렬
  const getMajorEvents = (): MajorEvent[] => {
    const yearStr = selectedYear.toString()
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
        본문으로 건너뛰기
      </a>
      <main id="main-content" className={styles.main} role="main" aria-label="대한민국 공휴일과 전세계 주요 이벤트">
        <div className={styles.container}>
          <header>
            <h1 className={styles.title}>대한민국 공휴일과 전세계 주요 이벤트</h1>
            <p className={styles.subtitle}>
              연도별, 월별 공휴일 조회 및 연휴 정보 제공. 전세계 주요 이벤트 정보 포함. 공공데이터포털 한국천문연구원 특일정보 API 기반.
            </p>
          </header>
        
        <nav className={styles.controls} aria-label="년도 선택">
          <div className={styles.yearTabs} role="tablist" aria-label="년도 선택 탭">
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
                aria-selected={selectedYear === year}
                aria-label={`${year}년 선택`}
                tabIndex={selectedYear === year ? 0 : -1}
              >
                {year}
              </button>
            ))}
          </div>
          {!loading && !error && (
            <div className={styles.yearSummary} aria-live="polite" aria-atomic="true">
              총 {getTotalHolidays()}개의 공휴일
            </div>
          )}
        </nav>

        {loading && (
          <div className={styles.loading} role="status" aria-live="polite" aria-label="로딩 중">
            <span aria-hidden="true">로딩 중...</span>
          </div>
        )}

        {error && (
          <div className={styles.error} role="alert" aria-live="assertive">
            <strong>오류:</strong> {error}
            <br />
            <small>공공데이터포털에서 API 키를 발급받아 환경변수에 설정해주세요.</small>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* 범례 레이블 */}
            <section className={styles.legend} aria-label="공휴일 범례">
              <div className={styles.legendItem}>
                <span 
                  className={styles.legendColor} 
                  style={{ backgroundColor: '#60a5fa' }}
                  aria-hidden="true"
                ></span>
                <span className={styles.legendLabel} style={{ color: '#60a5fa' }}>국경일</span>
              </div>
              <div className={styles.legendItem}>
                <span 
                  className={styles.legendColor} 
                  style={{ backgroundColor: '#f87171' }}
                  aria-hidden="true"
                ></span>
                <span className={styles.legendLabel} style={{ color: '#f87171' }}>대체공휴일</span>
              </div>
            </section>

            <section className={styles.yearHolidayList} aria-label={`${selectedYear}년 공휴일 목록`}>
            {holidaysByMonth.map((monthData) => (
              <article key={monthData.month} className={styles.monthSection}>
                <h2 className={styles.monthHeader}>
                  {getMonthName(monthData.month)} <span className={styles.monthCount}>({monthData.holidays.length}개)</span>
                </h2>
                {monthData.holidays.length === 0 ? (
                  <p className={styles.emptyMonth} aria-live="polite">
                    공휴일이 없습니다.
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
                              className={styles.dateKindBadge}
                              style={{
                                backgroundColor: holidayType === 'national' ? '#1e3a5f' : '#3a1a1a',
                                color: holidayType === 'national' ? '#60a5fa' : '#f87171',
                                borderColor: holidayType === 'national' ? '#2a4a6f' : '#4a2a2a',
                              }}
                              aria-label={`${holiday.dateKindName} 공휴일`}
                            >
                              {holiday.dateKindName}
                            </span>
                          )}
                        </div>
                        {isTodayHoliday && (
                          <span className={styles.todayBadge} aria-label="오늘">오늘</span>
                        )}
                      </li>
                      )
                    })}
                  </ul>
                )}
              </article>
            ))}
          </section>
          </>
        )}

        {/* 주요 이벤트 섹션 */}
        {!loading && !error && majorEvents.length > 0 && (
          <section className={styles.eventsSection} aria-label={`${selectedYear}년 주요 이벤트`}>
            <h2 className={styles.eventsTitle}>{selectedYear}년 주요 이벤트</h2>
            <div className={styles.eventsList}>
              {majorEvents.map((event, index) => (
                <article key={index} className={styles.eventItem} data-type={event.type}>
                  <div className={styles.eventHeader}>
                    <h3 className={styles.eventName}>{event.name}</h3>
                    <span className={styles.eventType} data-type={event.type}>{event.type}</span>
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
          <p>공공데이터포털 한국천문연구원_특일정보 API 활용</p>
          <div className={styles.copyright}>
            <p>© {new Date().getFullYear()} hellomrma. All rights reserved.</p>
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

