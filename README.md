# SEO Bundle (2026-05-01)

PWA SEO 메타 태그 + sitemap 작업.

## 변경 파일 (5개) + 신규 파일 (2개)

```
seo-bundle/
├── index.html               (v3 → v4)  사이트 종합 메타
├── public/
│   ├── robots.txt           [신규]     크롤러 허용 + sitemap 위치
│   └── sitemap.xml          [신규]     /, /about, /privacy
└── src/
    ├── App.jsx              (v3 → v4)  HelmetProvider 래핑
    └── pages/
        ├── About.jsx        (v1 → v2)  Helmet 추가
        └── Privacy.jsx      (v1 → v2)  Helmet 추가
```

## ⚠️ 배포 전 필수 작업 — npm install

`react-helmet-async` 의존성을 추가해야 합니다.

```bash
cd /path/to/mosaic-shopping-pwa
npm install react-helmet-async
```

또는 `package.json`에 직접 추가 후 `npm install`:

```json
{
  "dependencies": {
    "react-helmet-async": "^2.0.5"
  }
}
```

설치 안 하고 배포하면 **Vercel 빌드 에러** 발생.

## 배포 순서

1. zip 압축 해제 → 5개 파일 덮어쓰기 (위 표 참조)
2. `npm install react-helmet-async`
3. 로컬 테스트 (선택): `npm run dev` → 페이지 이동 시 `<title>` 변경 확인
4. Git commit + push → Vercel 자동 빌드

## 검증 시나리오 (배포 후)

### 1. 메타 태그 변경 확인 (DevTools)

| URL | DevTools `<title>` | DevTools `<meta description>` |
|---|---|---|
| `/` | "모자이크 쇼핑 - 쿠팡 네이버 등 쇼핑몰 통합 검색..." | 사이트 종합 |
| `/about` | "모자이크 쇼핑 소개 - 쿠팡 네이버 등 통합 쇼핑..." | About 전용 |
| `/privacy` | "개인정보 처리방침 - 모자이크 쇼핑" | Privacy 전용 |

### 2. robots.txt + sitemap.xml 접근

- `https://mosaicshopping.com/robots.txt` → 텍스트 정상 표시
- `https://mosaicshopping.com/sitemap.xml` → XML 정상 표시

### 3. Google Search Console 작업 (배포 후)

1. Search Console 접속 (도메인 소유권 이미 등록됨)
2. 좌측 "Sitemaps" → "새 사이트맵 추가" → `sitemap.xml` 입력 → 제출
3. "URL 검사" 도구로 `/about`, `/privacy` 인덱싱 요청

### 4. 카카오톡 미리보기 테스트 (선택)

- 카카오톡에 `https://mosaicshopping.com/about` 메시지 작성
- 미리보기 카드에 "모자이크 쇼핑 소개" + 설명 표시 확인
- ⚠️ OG 이미지(`og-image.png`) 없으면 이미지 자리 빈 박스. 정상.

## 미작업 (후속 트랙)

- **OG 이미지 제작** (1200×630 PNG) — 카카오톡 공유 미리보기 완성
- **canonical redirect 검증** — `www.mosaicshopping.com` → apex로 자동 redirect 되는지
- **PWA manifest.json** — 별도 작업 (모바일 홈화면 추가 시 아이콘/이름)

## 참고

- `react-helmet-async` 공식: https://github.com/staylor/react-helmet-async
- Google SEO 기초: https://developers.google.com/search/docs/fundamentals/seo-starter-guide
