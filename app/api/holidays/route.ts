import { NextResponse } from 'next/server'
// @ts-ignore - fast-xml-parser 타입 정의
import { XMLParser } from 'fast-xml-parser'
import { readFileSync } from 'fs'
import { join } from 'path'

interface HolidayItem {
  dateKind: string // 01: 국경일, 02: 기념일, 03: 24절기, 04: 잡절
  dateName: string
  isHoliday: string // Y: 공휴일, N: 비공휴일
  locdate: number // 날짜 (8자리, 예: 20150301)
  seq: number
}

interface ApiResponse {
  response: {
    header: {
      resultCode: string
      resultMsg: string
    }
    body: {
      items: HolidayItem[]
      numOfRows: number
      pageNo: number
      totalCount: number
    }
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const year = searchParams.get('year') || new Date().getFullYear().toString()
  const month = searchParams.get('month') || (new Date().getMonth() + 1).toString()
  const pageNo = searchParams.get('pageNo') || '1'
  const numOfRows = searchParams.get('numOfRows') || '100' // 한 달에 공휴일이 많지 않으므로 충분히 큰 값 설정

  const apiKey = process.env.PUBLIC_DATA_API_KEY

  // 백업 데이터 사용 함수
  const useBackupData = () => {
    try {
      const yearNum = parseInt(year)
      const monthNum = parseInt(month)
      
      // 백업 데이터 파일 읽기
      const backupFilePath = join(process.cwd(), 'app', 'data', 'backup-holidays.json')
      const backupData = JSON.parse(readFileSync(backupFilePath, 'utf-8'))
      const backupYear = backupData[yearNum.toString()]
      
      if (backupYear && backupYear[monthNum.toString()]) {
        const backupMonthData = backupYear[monthNum.toString()] as Array<{
          date: number
          name: string
          isHoliday: boolean
          dateKind: string
          dateKindName: string
          seq: number
        }>
        
        console.log(`백업 데이터 사용: ${year}년 ${month}월`)
        return NextResponse.json({
          year: yearNum,
          month: monthNum,
          holidays: backupMonthData.filter(item => item.isHoliday),
        })
      } else {
        return NextResponse.json(
          { error: `백업 데이터에 ${year}년 ${month}월 공휴일 정보가 없습니다.` },
          { status: 500 }
        )
      }
    } catch (backupError) {
      console.error('백업 데이터 읽기 오류:', backupError)
      return NextResponse.json(
        { error: '공휴일 정보를 가져오는 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }
  }

  // API 키가 없으면 바로 백업 데이터 사용
  if (!apiKey) {
    console.log('API 키가 없어 백업 데이터를 사용합니다.')
    return useBackupData()
  }

  try {
    // 공공데이터포털 한국천문연구원_특일정보 API
    // 참고: OpenAPI활용가이드_한국천문연구원_천문우주정보_특일_정보제공_서비스_v1.4
    // 엔드포인트: https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService
    // 공휴일 정보 조회 (getRestDeInfo)
    // 필수 파라미터: serviceKey (소문자), solYear, solMonth
    // 선택 파라미터: numOfRows (한페이지 결과 수, 기본값: 10)
    // dateKind 분류: 01-국경일, 02-기념일, 03-24절기, 04-잡절
    // 참고: API는 XML 형식으로 응답 (JSON 파라미터 지원하지 않음)
    const solMonthFormatted = month.padStart(2, '0') // 월은 2자리 형식 (예: 09)
    const url = `https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getRestDeInfo?serviceKey=${encodeURIComponent(apiKey)}&solYear=${year}&solMonth=${solMonthFormatted}`

    console.log(encodeURIComponent(apiKey), year, solMonthFormatted);

    const response = await fetch(url, {
      next: { revalidate: 86400 } // 24시간 캐시
    })

    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status}`)
    }

    // 응답 텍스트 가져오기
    const responseText = await response.text()
    
    // 응답이 XML인지 JSON인지 확인
    let data: ApiResponse
    
    if (responseText.trim().startsWith('{') || responseText.trim().startsWith('[')) {
      // JSON 응답
      try {
        data = JSON.parse(responseText)
      } catch (e) {
        throw new Error('JSON 파싱 실패')
      }
    } else {
      // XML 응답 파싱
      // 실제 XML 구조: <response><header><resultCode>00</resultCode>...</header><body><items><item>...</item></items>...</body></response>
      const parser = new XMLParser({
        ignoreAttributes: true, // 속성 무시 (텍스트만 추출)
        trimValues: true, // 공백 제거
        parseTagValue: false, // 태그 값을 파싱하지 않음 (문자열 그대로)
        parseNodeValue: false, // 노드 값을 파싱하지 않음
        isArray: (name: string) => {
          // item 태그는 항상 배열로 처리
          if (name === 'item') return true
          return false
        },
      } as any)
      
      const xmlData = parser.parse(responseText)
      
      // 디버깅: 파싱된 XML 데이터 구조 확인
      console.log('XML 파싱 결과:', JSON.stringify(xmlData, null, 2))
      
      // XML 구조를 JSON 구조로 변환
      // fast-xml-parser는 텍스트 노드를 직접 값으로 반환
      const responseData = xmlData.response || xmlData
      const header = responseData.header || {}
      const body = responseData.body || {}
      
      // 디버깅: header와 body 구조 확인
      console.log('Header:', header)
      console.log('Body:', body)
      
      // resultCode와 resultMsg 추출 (fast-xml-parser는 텍스트를 직접 값으로 반환)
      const getTextValue = (value: any): string => {
        if (value === null || value === undefined) return ''
        if (typeof value === 'string') return value.trim()
        if (typeof value === 'number') return String(value)
        if (typeof value === 'object') {
          // 객체인 경우 다양한 가능성 확인
          return value['#text'] || value.text || value.value || value.toString() || ''
        }
        return String(value || '')
      }
      
      const resultCode = getTextValue(header.resultCode)
      const resultMsg = getTextValue(header.resultMsg)
      
      // 디버깅: 추출된 값 확인
      console.log('resultCode:', resultCode, 'resultMsg:', resultMsg)
      
      // items 처리 - XML에서는 <items><item>...</item><item>...</item></items> 구조
      let items: any[] = []
      if (body.items) {
        if (body.items.item) {
          // item이 배열인 경우 (여러 개) 또는 단일 객체인 경우 (1개)
          items = Array.isArray(body.items.item) ? body.items.item : [body.items.item]
        }
      }
      
      // 각 item의 값 추출 헬퍼 함수
      const getItemValue = (item: any, key: string): string => {
        const value = item[key]
        return getTextValue(value)
      }
      
      data = {
        response: {
          header: {
            resultCode: resultCode,
            resultMsg: resultMsg,
          },
          body: {
            items: items.map((item: any) => ({
              dateKind: getItemValue(item, 'dateKind'),
              dateName: getItemValue(item, 'dateName'),
              isHoliday: getItemValue(item, 'isHoliday'),
              locdate: parseInt(getItemValue(item, 'locdate') || '0', 10),
              seq: parseInt(getItemValue(item, 'seq') || '0', 10),
            })),
            numOfRows: parseInt(getTextValue(body.numOfRows) || '0', 10),
            pageNo: parseInt(getTextValue(body.pageNo) || '0', 10),
            totalCount: parseInt(getTextValue(body.totalCount) || '0', 10),
          },
        },
      }
    }

    if (data.response.header.resultCode !== '00') {
      return NextResponse.json(
        { error: data.response.header.resultMsg },
        { status: 400 }
      )
    }

    const holidays = data.response.body.items || []
    
    // items가 배열이 아닌 단일 객체로 올 수 있으므로 처리
    const holidayList = Array.isArray(holidays) ? holidays : [holidays]

    // dateKind 분류: 01-국경일, 02-기념일, 03-24절기, 04-잡절
    const getDateKindName = (dateKind: string): string => {
      const kindMap: Record<string, string> = {
        '01': '국경일',
        '02': '기념일',
        '03': '24절기',
        '04': '잡절',
      }
      return kindMap[dateKind] || '기타'
    }

    return NextResponse.json({
      year: parseInt(year),
      month: parseInt(month),
      holidays: holidayList
        .filter(item => item.isHoliday === 'Y') // 공휴일만 필터링
        .map(item => ({
          date: item.locdate,
          name: item.dateName,
          isHoliday: item.isHoliday === 'Y',
          dateKind: item.dateKind,
          dateKindName: getDateKindName(item.dateKind),
          seq: item.seq,
        })),
    })
  } catch (error) {
    console.error('공휴일 API 오류:', error)
    
    // API 실패 시 백업 데이터 사용
    console.log('API 호출 실패, 백업 데이터를 사용합니다.')
    return useBackupData()
  }
}

