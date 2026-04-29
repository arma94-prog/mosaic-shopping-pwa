# PWA Phase 1 — 세션 2: 통합 검색 (검색바 헤더 통합 + 6열 격자)

## 작업 범위 요약

| 항목 | 결과 |
|---|---|
| 검색바를 헤더로 이전 | ✅ Header.jsx 수정 + SearchBar.jsx 신규 |
| URL `?q=` 양방향 동기화 | ✅ SearchBar (새로고침/뒤로가기 안전) |
| 히스토리 view ↔ 결과 view 분기 | ✅ Search.jsx (URL이 진실) |
| 핀고정/최근검색 클릭 → 결과로 전환 | ✅ Section의 onItemClick |
| 6열 격자 결과 화면 | ✅ SearchResults.jsx (라벨 미표시, 아이콘만) |
| `mosaic-search-malls.json` fetch + 캐싱 | ✅ searchMalls.js |
| 격자 셀 클릭 → 외부 브라우저 (모달 1회) | ✅ useExternalNavigate 통합 |

## 파일 구조

```
src/
├── components/
│   ├── Header.jsx                       ← 수정 (/search일 때 SearchBar 렌더)
│   ├── SearchBar.jsx                    ← 신규 (헤더용 검색바)
│   └── SearchResults.jsx                ← 신규 (6열 격자)
├── lib/
│   └── searchMalls.js                   ← 신규 (JSON fetch + 캐싱)
└── pages/
    └── Search.jsx                       ← 수정 (URL 분기 + 클릭 핸들러)
```

zip에 포함되지 **않은** 파일 (변경 없음):
- 세션 1 파일들 모두 (App.jsx, AppShell.jsx, BottomNav.jsx, HamburgerMenu.jsx, Events.jsx, ExternalLinkModal.jsx, externalLinkContext.jsx, index.css)
- supabase.js, auth.jsx, AuthGate.jsx
- Bookmarks.jsx (세션 3 작업 대상)
- Privacy.jsx

## 적용 방법

### 1단계: 덮어쓰기

PWA 로컬 폴더에 5개 파일 덮어쓰기:

```
mosaic-shopping-pwa/src/
├── components/
│   ├── Header.jsx                       ← 덮어쓰기
│   ├── SearchBar.jsx                    ← 신규
│   └── SearchResults.jsx                ← 신규
├── lib/
│   └── searchMalls.js                   ← 신규
└── pages/
    └── Search.jsx                       ← 덮어쓰기
```

### 2단계: dev 서버 재시작

```
npm run dev
```

(HMR 안전을 위해 신규 import 추가된 파일 있으면 재시작 권장.)

### 3단계: 브라우저 테스트

| 시나리오 | 기대 동작 |
|---|---|
| `/search` 진입 | 헤더에 검색바 표시. 본문에 핀고정 + 최근검색 |
| 검색바 입력 + 엔터 | URL이 `?q=청소기`로 변경 → 결과 화면 (6열 격자) |
| 핀고정 키워드 클릭 | URL `?q={keyword}` → 결과 화면 |
| 최근 검색 항목 클릭 | URL `?q={keyword}` → 결과 화면 |
| 격자 셀 클릭 (첫 회) | 외부 링크 안내 모달 → 확인 → 새 탭 열림 |
| 격자 셀 클릭 (이후) | 즉시 새 탭 |
| 검색바 X 버튼 | URL `?q=` 제거 → 히스토리 view 복귀 |
| 새로고침 | URL이 `?q=청소기` 상태면 결과 view 유지 |
| 다른 탭 → /search 복귀 | 마지막 검색어 그대로 (URL state 보존) |

### 4단계: 외부 링크 모달 검증

세션 1에서 만든 모달이 처음으로 실제 트리거됩니다:

1. 검색어 입력 → 결과 화면
2. 아무 셀 클릭
3. 모달 표시: "쇼핑몰 사이트로 이동하기 위해 / 인터넷 브라우저가 열려요"
4. "확인 (다시 보지 않기)" 클릭 → 새 탭에서 해당 쇼핑몰 검색 결과 페이지 열림
5. 다른 셀 클릭 → 모달 없이 바로 새 탭

> 💡 dev에서는 새 탭이 일반 Chrome 탭으로 열림. 모바일 PWA standalone 모드에서는 OS 기본 브라우저로 자동 처리됨.

## 의미 검증 (가드 룰 1번 적용)

세션 2 시작 전 합의했던 의미:

> "검색 탭 진입 시 핀고정+최근검색이 보이고, 검색바에 입력하거나 키워드 클릭으로 6열 격자 결과 화면으로 전환되며, 격자 셀 클릭 시 외부 브라우저로 해당 쇼핑몰 검색 결과로 이동"

이 의미가 코드에 정확히 반영됐는지 검증 포인트:

- ✅ 검색 탭 진입 → 핀고정+최근검색 (Search.jsx의 SearchHistory)
- ✅ 검색바 입력 → setSearchParams({ q }) → SearchResults 렌더
- ✅ 키워드 클릭 → setSearchParams({ q: keyword }) → SearchResults 렌더
- ✅ 6열 격자 → SearchResults의 `grid-cols-6`
- ✅ 셀 클릭 → useExternalNavigate(buildSearchUrl(...)) → 모달 → 새 탭

## 책임 분리 (가드 룰 2번 적용)

| 파일 | 책임 |
|---|---|
| `Header.jsx` | 헤더 UI + /search일 때 SearchBar 위치 제공 |
| `SearchBar.jsx` | 입력 + URL ?q= 동기화 (입력 → URL, URL → 입력) |
| `Search.jsx` | URL ?q= 분기 + Supabase read (히스토리) |
| `SearchResults.jsx` | searchMalls 데이터로 격자 렌더 + 클릭 → 외부 |
| `searchMalls.js` | fetch + 캐싱 + URL 빌드 헬퍼 (순수 함수) |
| `externalLinkContext.jsx` | 외부 이동 + 모달 (세션 1에서 구현) |

각 파일이 명확한 단일 책임을 가짐. 변경 시점/검증 시점/표시 시점이 모두 분리됨.

## 알려진 한계 (TECH_DEBT 후보)

### 1. user_settings 통합 미적용

현재 모든 mall이 무조건 표시됩니다. 향후:
- `user_settings.disabled_malls` 필터링 (사용자가 PC에서 끈 mall 제외)
- `user_settings.disabled_cats` 필터링 (사용자가 PC에서 끈 카테고리 제외)
- `user_settings.custom_search_malls` 병합 (사용자 추가 mall 표시)

→ 세션 3 또는 4에서 통합.

### 2. 카테고리 헤더 없음 (의도)

10개 카테고리의 mall이 일렬로 섞여 표시됩니다. 사용자 결정에 따른 의도이지만, 사용해보고 어색하면:
- (a) 카테고리별 줄바꿈 (헤더 없이 빈 줄로 구분)
- (b) 작은 카테고리 헤더 추가
- (c) 환경설정 토글로 헤더 표시 옵션 제공

→ 세션 4 또는 dogfood 후 결정.

### 3. 아이콘 로드 실패 시 fallback

이미지 로드 실패 시 mall 이름 첫 2글자 표시. 더 정교한 fallback (회색 박스 + 도메인) 가능하지만 MVP에서 생략.

### 4. 검색 카운트 표시

"3개 쇼핑몰" 식으로 표시. user_settings 통합 후 정확화.

## 다음 세션 (세션 3) — 북마크

- 그룹 카드 + 그룹 안 상품 리스트 (PC 최저가 리포트 톤)
- `bookmark_groups` + `bookmarks` Supabase read
- `last_price_check_at` 활용 ("최근 가격 확인 N시간 전")
- 외부 링크 클릭 → useExternalNavigate

세션 2 검증 끝나면 알려주세요. 곧바로 세션 3 진입.

## 트랙 C 흐름

| 단계 | 상태 |
|---|---|
| 1~5 | ✅ |
| 6-1. PWA 세션 1 (골격) | ✅ |
| **6-2. PWA 세션 2 (통합 검색)** | ⏳ 적용 중 |
| 6-3. PWA 세션 3 (북마크) | ⏳ 다음 |
| 6-4. PWA 세션 4 (마무리) | ⏳ |
| 7. YouTube 영상 + verification 신청 | ⏳ |
| 8. 모바일 PWA 설치 검증 | ⏳ |
| 9. pwa-v0.2.0 태그 | ⏳ |
