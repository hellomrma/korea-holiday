# 🇰🇷 대한민국 공휴일과 전세계 주요 이벤트

Next.js 14 기반의 대한민국 공휴일과 전세계 주요 이벤트를 한눈에 확인할 수 있는 웹 서비스입니다. 공공데이터포털의 한국천문연구원 특일정보 API를 활용하여 정확한 공휴일 정보를 제공하며, 스포츠, 우주/과학, 기술, 문화/예술, 정치/경제 등 다양한 분야의 글로벌 주요 이벤트 정보도 함께 제공합니다.

## ✨ 주요 기능

- 📅 **연도별 공휴일 조회** - 현재 년도 기준 앞 1년, 뒤 1년 탭으로 간편하게 탐색
- 📆 **연간 한눈에 보기** - 12개월을 3열 그리드로 한 화면에 표시
- 🏷️ **공휴일 분류 표시** - 국경일과 대체공휴일을 색상으로 구분
- 🎉 **연휴 정보 표시** - 주말을 포함한 연휴 기간 자동 계산 및 표시 (3일 이상)
- 🌍 **전세계 주요 이벤트** - 스포츠, 우주/과학, 기술, 문화/예술, 정치/경제, 환경 등 다양한 분야의 글로벌 이벤트
- 🎨 **이벤트 타입별 색상 구분** - 카테고리별 색상으로 직관적인 구분
- 📅 **월별 정렬** - 이벤트를 개최 날짜 순서로 자동 정렬
- 🌐 **다국어 지원** - 한국어(ko) / 영어(en) 지원, 브라우저 언어 자동 감지
- 📱 **반응형 디자인** - 모바일, 태블릿, 데스크톱 모든 기기 지원
- 🎯 **오늘 날짜 하이라이트** - 현재 날짜를 시각적으로 강조
- ⚡ **빠른 로딩** - 24시간 캐싱 및 백업 데이터로 최적화된 성능
- 🎨 **모던한 다크 테마** - Pretendard 폰트와 세련된 다크 테마 UI
- 🔍 **SEO/GEO 최적화** - 검색 엔진 및 생성형 AI 최적화
- 📊 **Google Analytics** - 사용자 분석 통합

## 📋 사전 요구사항

- **Node.js** 18.0 이상
- **npm** 9.0 이상 또는 **yarn** 1.22 이상
- **공공데이터포털 API 키** (선택사항, 백업 데이터 제공)

## 🛠️ 설치 및 실행

### 1. 저장소 클론

```bash
git clone https://github.com/hellomrma/korea-holiday.git
cd korea-holiday
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 변수 설정 (선택사항)

`.env.local` 파일을 생성하고 공공데이터포털 API 키를 설정하세요:

```env
PUBLIC_DATA_API_KEY=your_api_key_here
```

**참고**: API 키가 없어도 백업 데이터(2025-2027)를 사용하여 서비스를 이용할 수 있습니다.

**API 키 발급 방법:**
1. [공공데이터포털](https://www.data.go.kr) 접속
2. "한국천문연구원_특일정보" API 검색
3. 활용신청 후 API 키 발급
4. 발급받은 인증키(Encoding/Decoding 키)를 환경변수에 설정

**API 정보:**
- **엔드포인트**: `https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService`
- **서비스명**: 한국천문연구원_특일정보
- **오퍼레이션**: 공휴일 정보 조회 (getRestDeInfo)
- **데이터 포맷**: XML (JSON 변환)
- **참고 문서**: OpenAPI활용가이드_한국천문연구원_천문우주정보_특일_정보제공_서비스_v1.4
- **제공 정보**: 
  - 국경일 (01): 어린이날, 광복절, 개천절 등
  - 기념일 (02): 의병의 날, 정보보호의 날, 4·19 혁명 기념일 등
  - 24절기 (03): 청명, 경칩, 하지 등
  - 잡절 (04): 단오, 한식 등

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요. 자동으로 브라우저 언어에 맞는 페이지(`/ko` 또는 `/en`)로 리다이렉트됩니다.

## 📦 빌드

프로덕션 빌드:

```bash
npm run build
npm start
```

## 🚢 Vercel 배포

### 자동 배포

1. GitHub 저장소를 Vercel에 연결
2. 환경 변수 `PUBLIC_DATA_API_KEY` 설정 (선택사항)
3. 자동으로 배포됩니다

### 수동 배포

```bash
npm install -g vercel
vercel
```

배포 시 환경 변수를 Vercel 대시보드에서 설정해주세요.

## 🏗️ 프로젝트 구조

```
korea-holiday/
├── app/
│   ├── [locale]/              # 다국어 라우팅 (ko, en)
│   │   ├── layout.tsx         # 로케일별 레이아웃
│   │   └── page.tsx           # 메인 페이지
│   ├── api/
│   │   └── holidays/
│   │       └── route.ts      # 공휴일 API 라우트 (공공 API 연동)
│   ├── data/
│   │   ├── backup-holidays.json      # 백업 공휴일 데이터 (2025-2027)
│   │   ├── holiday-names.json        # 공휴일 이름 번역 데이터
│   │   ├── locales/
│   │   │   ├── ko.json        # 한국어 번역
│   │   │   └── en.json        # 영어 번역
│   │   ├── major-events-ko.json      # 한국어 주요 이벤트 데이터
│   │   └── major-events-en.json      # 영어 주요 이벤트 데이터
│   ├── styles/                # SCSS 모듈
│   │   ├── _variables.scss    # 색상 변수
│   │   ├── _mixins.scss       # 재사용 믹스인
│   │   ├── _base.scss         # 기본 스타일
│   │   ├── _hero.scss         # Hero 섹션
│   │   ├── _calendar.scss     # 캘린더 스타일
│   │   ├── _events.scss       # 이벤트 스타일
│   │   ├── _footer.scss       # 푸터 스타일
│   │   └── _responsive.scss   # 반응형 스타일
│   ├── globals.scss           # 전역 SCSS 스타일
│   ├── layout.tsx             # 루트 레이아웃 및 메타데이터
│   ├── page.tsx               # 루트 페이지 (언어 감지 및 리다이렉트)
│   └── page.module.scss       # 메인 페이지 SCSS (모듈 import)
├── public/                    # 정적 파일
├── .env.local                 # 환경 변수 (gitignore에 포함)
├── .eslintrc.json            # ESLint 설정
├── .gitignore                # Git 제외 파일
├── next.config.js            # Next.js 설정
├── package.json              # 의존성 관리
├── tsconfig.json             # TypeScript 설정
├── vercel.json               # Vercel 배포 설정
└── README.md                 # 프로젝트 문서
```

## 📝 사용된 기술

- **Next.js 14** - React 기반 풀스택 프레임워크 (App Router)
- **TypeScript** - 타입 안정성 보장
- **React 18** - 사용자 인터페이스 구축
- **SCSS** - 모듈화된 스타일시트 관리
- **Pretendard** - 한글 최적화 폰트
- **fast-xml-parser** - XML 응답 파싱
- **공공데이터포털 API** - 한국천문연구원_특일정보 서비스
- **Google Analytics** - 사용자 분석

## 🔧 개발 가이드

### API 라우트 구조

API 라우트는 `/app/api/holidays/route.ts`에 위치하며, 다음과 같은 기능을 제공합니다:

- **GET 요청**: `?year=2024&month=1`
- **응답 형식**: JSON
- **캐싱**: 24시간 (ISR)
- **백업 데이터**: API 실패 시 자동으로 백업 데이터 사용

### API 응답 예시

```json
{
  "year": 2024,
  "month": 1,
  "holidays": [
    {
      "date": 20240101,
      "name": "신정",
      "isHoliday": true,
      "dateKind": "01",
      "dateKindName": "국경일",
      "seq": 1
    }
  ]
}
```

### 주요 기능 상세

#### 연휴 정보 계산
- 공휴일이 3일 이상 연속되는 경우 자동으로 연휴 기간 계산
- 주말(토요일, 일요일) 포함 여부 자동 감지
- 연휴 기간의 첫 번째 공휴일에만 "주말 포함 X일 연휴" 표시
- 예: 설날이 월, 화, 수요일인 경우 → "주말 포함 5일 연휴" (토-일-월-화-수)

#### 공휴일 필터링
- 국경일(dateKind: '01')과 대체공휴일만 표시
- 기념일, 24절기, 잡절은 제외

#### 다국어 지원
- 브라우저 언어 자동 감지 (`Accept-Language` 헤더)
- URL 기반 라우팅: `/ko`, `/en`
- 공휴일 이름, UI 텍스트, 월/요일 이름 모두 번역 지원
- 주요 이벤트 데이터도 언어별로 분리 관리

#### UI 특징
- **Pretendard 폰트**: 한글 가독성 최적화
- **다크 테마**: 모던하고 세련된 다크 UI
- **색상 구분**: 
  - 국경일: 밝은 파란색 (#60a5fa)
  - 대체공휴일: 밝은 빨간색 (#f87171)
- **3열 그리드**: 데스크톱에서 월별 섹션을 3열로 표시
- **그라데이션 배경**: 은은한 그라데이션과 포인트 컬러
- **글래스모피즘**: backdrop-filter를 활용한 현대적 UI

#### SCSS 모듈화
- 변수와 믹스인을 별도 파일로 분리
- 기능별 스타일 모듈화로 유지보수성 향상
- 재사용 가능한 믹스인 제공

#### SEO/GEO 최적화
- JSON-LD 구조화 데이터 (WebApplication, FAQPage, HowTo, BreadcrumbList)
- 메타데이터 최적화 (Open Graph, Twitter Cards)
- 검색 엔진 및 생성형 AI 최적화

## 🐛 트러블슈팅

### API 키 오류

**문제**: API 호출 실패

**해결 방법:**
1. API 키가 없어도 백업 데이터로 서비스 이용 가능
2. `.env.local` 파일이 프로젝트 루트에 있는지 확인
3. 환경 변수 이름이 `PUBLIC_DATA_API_KEY`인지 확인
4. API 키가 올바르게 입력되었는지 확인 (공백 없이)
5. 개발 서버를 재시작 (`npm run dev`)

### API 응답 오류

**문제**: "공휴일 정보를 가져올 수 없습니다" 오류 발생

**해결 방법:**
1. 자동으로 백업 데이터로 전환됨 (2025-2027 데이터 제공)
2. 공공데이터포털에서 API 키가 활성화되어 있는지 확인
3. API 키의 인코딩/디코딩 버전을 사용하는지 확인
4. 네트워크 연결 상태 확인
5. API 일일 호출 제한 확인 (10,000건)

### 빌드 오류

**문제**: `npm run build` 실패

**해결 방법:**
1. Node.js 버전이 18 이상인지 확인: `node -v`
2. 의존성 재설치: `rm -rf node_modules && npm install`
3. TypeScript 오류 확인: `npm run lint`
4. SCSS 컴파일 오류 확인

### SCSS 오류

**문제**: SCSS 컴파일 오류

**해결 방법:**
1. `sass` 패키지가 설치되어 있는지 확인: `npm list sass`
2. SCSS 파일의 import 경로 확인
3. 변수 및 믹스인 정의 확인

## 📊 데이터 업데이트 주기

공공데이터포털 API의 데이터는 다음과 같이 업데이트됩니다:

- **특일정보**: 연 1회 업데이트 (1년치 데이터 일괄 업데이트)
- **차차년도 데이터**: 6~8월 경 과학기술정보통신부 월력요항 발표 후 업데이트
- **기념일, 24절기, 잡절**: 11월 경 업데이트
- **임시공휴일**: 최대 1일 이내 즉시 업데이트
- **대체공휴일**: 대통령령 공식 시행 후 업데이트

**백업 데이터**: 2025, 2026, 2027년 데이터를 JSON 파일로 제공하여 API 실패 시에도 서비스 이용 가능

## 🔒 보안 및 개인정보

- API 키는 서버 사이드에서만 사용되며 클라이언트에 노출되지 않습니다
- 개인정보를 수집하거나 저장하지 않습니다
- 모든 데이터는 공공데이터포털에서 제공하는 공개 정보입니다
- Google Analytics는 익명화된 사용 통계만 수집합니다

## 🌐 다국어 지원

### 지원 언어
- 한국어 (ko) - 기본
- 영어 (en)

### 번역 데이터
- UI 텍스트: `app/data/locales/ko.json`, `app/data/locales/en.json`
- 공휴일 이름: `app/data/holiday-names.json`
- 주요 이벤트: `app/data/major-events-ko.json`, `app/data/major-events-en.json`

### 언어 전환
- 브라우저 언어 자동 감지
- 상단 언어 전환 버튼 (KO/EN)
- URL 기반 라우팅: `/ko`, `/en`

## 🤝 기여하기

프로젝트 개선을 위한 기여를 환영합니다!

1. 이 저장소를 Fork 합니다
2. 새로운 기능 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add some amazing feature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성합니다

## 📞 문의 및 지원

- **이슈 등록**: [GitHub Issues](https://github.com/hellomrma/korea-holiday/issues)
- **기능 제안**: [GitHub Discussions](https://github.com/hellomrma/korea-holiday/discussions)

문제가 발생하거나 제안사항이 있으시면 언제든지 이슈를 등록해주세요!

## 👤 저자

**hellomrma**

- 📧 Email: hellomrma@gmail.com
- 🔗 GitHub: [@hellomrma](https://github.com/hellomrma)
- 💼 LinkedIn: [hellomrma](https://www.linkedin.com/in/hellomrma)
- 🐦 Twitter: [@hellomrma](https://twitter.com/hellomrma)

## 🙏 감사의 말

이 프로젝트는 다음 서비스를 활용합니다:

- [공공데이터포털](https://www.data.go.kr) - 한국천문연구원 특일정보 API 제공
- [Next.js](https://nextjs.org/) - 웹 프레임워크
- [Vercel](https://vercel.com/) - 배포 플랫폼
- [Pretendard](https://github.com/orioncactus/pretendard) - 한글 최적화 폰트

## 📄 라이선스

© 2026 hellomrma. All rights reserved.

MIT License
