# PWA + PC fix — NEW 데이터 + X 중복 + 북마크 아이콘 + 11번가 모바일 URL

## 사용자 catch 4건 + JSON 가이드 1개

### 🐛 catch 1: NEW 로직 — Supabase에 데이터 자체가 없음

**진단**: 사용자 의심 정확. PC `supabase-sync.js`가 `bookmarks` 테이블에 **`created_at` 컬럼에 값 미러링 자체를 안 함**.

| 시점 | created_at 값 |
|---|---|
| 첫 INSERT | Supabase default `now()` (즉 첫 sync 시점) — 실제 북마크 생성 시각 X |
| UPSERT (merge) | NULL 또는 첫 값 그대로 |

= 모든 북마크가 "첫 sync 시점"으로 동일 시간 (또는 NULL). 24h 이내 검사 의미 없음.

**해결**: PC `v1.24.3-fix10` — supabase-sync.js bookmarks UPSERT에 `created_at: m.createdAt ISO` 1줄 추가.

### 🐛 catch 2: X 버튼 중복 진짜 fix

**이전 fix 미작동 의심**: `index.css` 글로벌 처리가 production purge 또는 specificity 문제로 미적용.

**해결 v5**: 컴포넌트 내부 `<style>` 인라인 + class specificity 강화 + `!important`. production purge 회피.

추가: 디폴트 X (사용자 만든 ClearIcon) 크기 14 → **17px (+20%)**. 모바일 터치 영역 강화.

### catch 3: 핀 아이콘 → 북마크 아이콘 (PC 정합)

**PC 직접 검증** (sidepanel.js Line 1924):
```js
pin.innerHTML = group.pinned
  ? '<svg ... fill="currentColor" ...><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>'  // filled
  : '<svg ... fill="none" stroke="currentColor" ...><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>';  // outline
```

→ PC도 **북마크 아이콘**! 핀 안 됨도 outline으로 표시 (회색 `#C8C4B5`).

**현재 PWA 미스**: 핀 고정만 아이콘 표시 (메모 #21 정합 X). 자물쇠 모양 path도 잘못.

**해결 v7**:
- 핀 고정: filled + `#E8762B` 주황
- 핀 안 됨: outline + `#C8C4B5` 회색 ⭐ (모든 그룹에 표시)
- Phase 1: 클릭 미작동 (read-only)
- Phase 2: 핀 토글 활성화

### 🆕 catch 4: 11번가 모바일 URL — JSON 옵셔널 필드

**사용자 발견**: 11번가가 PC 페이지를 모바일에서 띄움. 모바일 전용 URL 분기 필요.

**CTO 결정**: JSON에 `urlMobile` 옵셔널 필드 추가. 옵션 A 채택.

**SearchResults v9 분기**:
```js
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
const baseUrl = (isMobile && mall.urlMobile) ? mall.urlMobile : mall.url;
```

**확장성**: 11번가 외 다른 mall 같은 문제 발견 시 같은 필드 추가만.

**이벤트 페이지에도 동일 적용**: 이벤트 placeholder 작업 시점에 같은 패턴 사용.

---

## 변경 파일

### PC v1.24.3-fix10 (1파일)
| 파일 | 변경 |
|---|---|
| `supabase-sync.js` | bookmarks UPSERT에 `created_at` 1줄 추가 |

### PWA (3파일)
| 파일 | 변경 |
|---|---|
| `src/components/SearchBar.jsx` | native X 인라인 style + ClearIcon +20% |
| `src/components/BookmarkGroup.jsx` | BookmarkPinIcon (PC 정합) + 모든 그룹 표시 |
| `src/components/SearchResults.jsx` | mobile UA 감지 + urlMobile 분기 |

### JSON (사용자 작업)
`mosaic-shopping` GitHub Pages 저장소의 `mosaic-search-malls.json`에서 11번가 항목 수정.

---

## 적용 순서

### 1단계: PC fix10 적용
1. zip 풀어서 `supabase-sync.js` 1파일 덮어쓰기
2. `chrome://extensions/` 재로드
3. SW console: `await self.MosaicSync.syncToBackend()`
4. Supabase Table Editor에서 `bookmarks.created_at` 컬럼 확인:
   - 모든 행이 실제 북마크 생성 시각으로 갱신됐는지

### 2단계: JSON 업데이트 (사용자 직접)

`mosaic-shopping` 저장소 `mosaic-search-malls.json` 11번가 항목:

```json
{
  "name": "11번가",
  "icon": "11st.svg",
  "url": "https://search.11st.co.kr/Search.tmall?kwd={kw}",
  "urlMobile": "https://search.11st.co.kr/MW/search?searchKeyword={kw}"
}
```

(현재 `url` 값은 11번가 공식 PC URL이라 사용자 캡쳐의 `MW/...` URL을 `urlMobile`에 추가)

GitHub Desktop으로 commit + push → GitHub Pages 자동 배포 (1~2분).

### 3단계: PWA 적용
1. zip 풀어서 3파일 PWA 폴더 덮어쓰기
2. dev HMR 또는 build → push → Vercel 자동 배포

### 4단계: 검증
- 검색바 focus + 입력 → X 버튼 **하나만** 표시 ✅
- ClearIcon 크기 +20% ✅
- 북마크 그룹 모두 북마크 아이콘 표시 (핀 고정 = 주황 fill, 핀 안 됨 = 회색 outline) ✅
- NEW 배지: 24h 이내 가장 최근 1개 mall만 ✅ (PC fix10 + sync 후)
- 11번가 셀 클릭 → `MW/search?...` URL로 이동 ✅

---

## Phase 2 양방향 sync — 사용자 질문 답변

**YES, Phase 2에서 모바일 검색/핀고정 → PC 양방향 정확히 가능** (메모리 #21 정의):

| 동작 | Phase 1 | Phase 2 |
|---|---|---|
| 검색 | PC만 capture | PC + 모바일 둘 다 capture |
| 핀 토글 | PC만 | PC + 모바일 둘 다 |
| 북마크 추가 | PC만 | PC + 모바일 둘 다 |
| sync 방향 | PC → 모바일 단방향 | 양방향 |

이게 메모리 #21의 핵심 약속. 현재 fix들 모두 Phase 2 양방향으로 자연 확장 가능 (코드 정책 정합).

---

## 회고 — 메모리 #18 강화 (8번째 사례)

이번 catch 시리즈 학습:

> **NEW/created_at 같은 데이터 의존 표시는 "데이터가 정확히 들어가는가"를 코드 검증보다 먼저 봐야 함**. 이번엔 PWA NEW 로직 코드를 5번 검증했지만 데이터 자체가 없었던 게 진짜 원인.

다음 작업 시점에 "이 표시가 무엇을 의존하는가" → "그 데이터가 실제로 정확히 채워지는가" 순서로 검증.

또한 `created_at` 같은 Supabase default 컬럼은 **자동 채워질 거라고 가정하지 않음**. UPSERT는 default 적용 안 됨.

---

## 트랙 C 진행

| 단계 | 상태 |
|---|---|
| PWA seamless 1~4 | ✅ |
| fix5/6/7/8/9 | ✅ |
| isLowest + 솔드아웃 정렬 | ✅ |
| NEW + Pill PC 정합 | ✅ (코드만, 데이터 fix 필요) |
| PC 시각 정합 + 모바일 +1pt | ✅ |
| 클릭 navigate + 폰트 +1 더 | ✅ |
| 하단 아이콘 + 검색 UX | ✅ |
| **created_at + X 중복 + 북마크 아이콘 + urlMobile** | ⏳ 적용 중 |
| 핫딜 모음 placeholder | ⏳ |
| TECH_DEBT | ⏳ |
| YouTube + verification | ⏳ |
