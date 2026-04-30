# PWA seamless 단계 4 — 화면 재작성

## 작업 요약

단계 1 (PC 미러링: mall_name + previous_price) + 단계 2 (디자인 토큰 + Pill) + 단계 3 (정체성) 토대 위에서 모든 화면 재작성.

## 산출물 (7파일)

| 파일 | 변경 정도 |
|---|---|
| `src/lib/relativeTime.js` | 신규/유지 |
| `src/pages/Search.jsx` | URL 분기 + 토큰 마이그레이션 |
| `src/pages/Bookmarks.jsx` | mall_name + previous_price + created_at fetch 추가 |
| `src/components/SearchBar.jsx` | 토큰 마이그레이션 |
| `src/components/SearchResults.jsx` | 토큰 마이그레이션 |
| `src/components/BookmarkGroup.jsx` | **큰 변경** — 정렬/rank/펼치기 + Pill |
| `src/components/BookmarkItem.jsx` | **큰 변경** — mall_name + 가격 변동 + Pill + rank |

## 의존성

- ✅ 단계 1 적용됨 (Supabase에 mall_name + previous_price 미러링 중)
- ✅ 단계 2 적용됨 (`Pill.jsx`, `index.css`, `DESIGN.md`)
- ✅ 단계 3 합의됨 (정체성 정의 — 메모리 #21)

## 적용

1. zip 풀어서 폴더 구조 그대로 덮어쓰기 (7파일)
2. **dev 서버 재시작** (신규 import 추가)
3. PWA 진입 → 검색/북마크 모두 검증

## 검증 시나리오

### 검색 화면 (`/search`)

| 시나리오 | 기대 결과 |
|---|---|
| 빈 화면 진입 | 핀 고정 키워드 + 최근 검색 (PC 데이터 표시) |
| 헤더 검색바에 "우텐더" 입력 | URL `?q=우텐더`로 변경 → 6열 격자 |
| 카테고리 헤더 색 | 약한 회색 (`#9F9F9F`, PC `.lbl` 일치) |
| 아이콘 70% 셀 안 차지 | 미니멀 톤 |
| 카테고리 사이 간격 | 컴팩트 (mt-1.5) |

### 북마크 화면 (`/bookmarks`) — 핵심 변화

| 시나리오 | 기대 결과 |
|---|---|
| **그룹 정렬** | 핀 그룹 위 → 달성 그룹 → 최신 |
| **그룹 안 mall 정렬** | 현재가 오름차순 (싼 것 1위) |
| **좌측 rank 숫자** | "1", "2", "3" 표시 |
| **mall 이름** | 한글 ("네이버", "G마켓", "육교시" 등 — PC 한글 미러) |
| **가격 변동 색** | 하락=오렌지 강조 / 상승=회색 약함 / 변동없음=매우 약함 |
| **펼치기 정책** | 기본 = 최저가 1개 + NEW (있으면) / "+N개 더보기" 버튼 |
| **Pill 사용** | 최저가, NEW, 달성, 목표 N원, 미설정 모두 일관 |
| **목표가 미설정 그룹** | "목표가 미설정" pill 회색 표시 (PC 정합) |

### 우텐더 안심 그룹 (사용자 캡쳐 검증)

기본 (펼침 전):
- 1번 mall (최저가) 표시
- 더보기 버튼 "+2개 더보기 ▼"

펼침 후:
- 1. 네이버 52,900원 (+11,000원 상승) — 최저가 배지 + 회색 변동 텍스트
- 2. 육교시 53,900원 (변동없음) — 회색 변동 텍스트
- 3. G마켓 95,900원 (+49,190원 상승) — 회색 변동 텍스트

## 가격 변동 색 매핑 (PC 정합)

| 케이스 | 색 | 이유 |
|---|---|---|
| 가격 하락 (`cur < prev`) | `text-mosaic-accent font-semibold` (오렌지) | 사용자 이득 강조 |
| 가격 상승 (`cur > prev`) | `text-mosaic-text-muted` (회색) | 약함 (사용자 손해) |
| 변동 없음 (`cur === prev`) | `text-mosaic-text-soft` (매우 약함) | 정보로만 |
| 직전가 없음 (`prev null`) | 표시 안 함 | 비교할 수 없음 |

## NEW 정책

- `bookmark.created_at`이 24시간 이내인 mall → NEW 배지
- 사용자 데이터: 현재 시점에 24시간 이내 추가된 mall 없을 가능성 — NEW 배지 시각 검증은 PC에서 새 북마크 추가 후 sync로 가능

## 토큰 마이그레이션 완료

이번 단계에서 모든 컴포넌트가 canonical 토큰만 사용:
- ❌ `text-mosaic-muted` → ✅ `text-mosaic-text-muted`
- ❌ `text-mosaic-muted-2` → ✅ `text-mosaic-text-label`
- ❌ `text-mosaic-muted-3` → ✅ `text-mosaic-text-soft`
- ❌ `border-mosaic-line-2` → ✅ `border-mosaic-line-strong`
- ❌ `bg-mosaic-min-bg` → ✅ Pill `variant="lowest"` 내부 토큰
- ❌ `text-mosaic-min-text` → ✅ Pill `variant="lowest"` 내부 토큰
- ❌ `bg-mosaic-target-bg` / `text-mosaic-target-text` → ✅ Pill `variant="target-achieved"` 내부 토큰
- ❌ `bg-mosaic-hover-bg` → ✅ `bg-mosaic-surface-hover`

→ deprecated alias는 `index.css`에서 다음 단계 (verification 신청 후)에 제거 예정.

## 트랙 C 흐름

| 단계 | 상태 |
|---|---|
| 1~5 | ✅ |
| PWA seamless 단계 1 (PC 미러링) | ✅ |
| PWA seamless 단계 2 (디자인 시스템) | ✅ |
| PWA seamless 단계 3 (정체성) | ✅ |
| **PWA seamless 단계 4 (화면 재작성)** | ⏳ 적용 중 |
| 7. YouTube 영상 + verification 신청 | ⏳ |
| 8. 모바일 PWA 설치 검증 | ⏳ |
| 9. pwa-v0.2.0 태그 | ⏳ |

## 다음

검증 결과 알려주세요. OK이면:
- TECH_DEBT 정리 (deprecated 토큰 제거 등)
- 핫딜 모음 placeholder 다듬기 (Phase 2 안내)
- PWA manifest 점검
- verification 영상 + Search Console 신청

> 💡 한 가지 짚어두기 — 이번 단계가 PWA 시각/UX 정합성의 "결과 화면". 이전 단계들이 토대였다면, 이번 단계가 사용자가 처음으로 "PC와 같은 서비스"를 모바일에서 보는 순간. 검증 시 PC 사이드패널과 직접 비교해보시면 정합성 확인하기 좋아요.
