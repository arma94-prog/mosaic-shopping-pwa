# PWA polish — 아이콘 시안 적용 + 검색 UX 개선

## 사용자 결정 적용

### 아이콘 메타포
- **핫딜 모음**: 시안 5 (가격 태그, monoline, 활성 시 살구 fill)
- **검색**: 시안 3 (돋보기, duotone outline ↔ filled)
- **북마크**: 시안 3 (책갈피, duotone outline ↔ filled)

### 추가 수정 5가지

#### 🐛 1. X 버튼 중복 catch
**원인**: `<input type="search">`의 native cancel 버튼 + Claude가 만든 ClearIcon 둘 다 표시.

**해결**: 
- `index.css`에 글로벌 CSS 추가: `input[type="search"]::-webkit-search-cancel-button { display: none }`
- PC `.sb input` 매핑 (PC도 동일 처리)

#### 2. SearchBar PC 정합 + 폰트 +1pt
PC `.sb` 정확 명세 매핑:
| 항목 | PC | PWA v4 |
|---|---|---|
| height | 28px | 32px (모바일 +1 사이즈) |
| border | `1px #E5E1D3` | 동일 |
| radius | 6px | 동일 |
| focus border | `#E8762B` + shadow `rgba(232,118,43,0.12)` | 동일 |
| 폰트 | `clamp(12,2.6vw,14)` | **15px** (PC +1) |

#### 3. 검색결과 카테고리 레이블 PC 정합
PC `.lbl` 정확 hex:
| 항목 | PC | PWA v3 |
|---|---|---|
| color | `#9F9F9F` | 동일 |
| weight | 400 | 동일 |
| size | `clamp(10,2.4vw,12)` | **12px** (PC +1) |
| letter-spacing | 0.2px | 동일 |

여백 -1px:
- section margin-top: 6px → **5px**
- CategoryHeader padding-bottom: 4px → **1px**

#### 4. Search 페이지 정리
- 안내 메시지 2개 모두 제거 ("PC에서 검색해주세요" + "Phase 1은 조회 전용...")
- 핀 고정 0개일 때 섹션 자체 미표시 (이전: "여기에 표시돼요" 빈 placeholder)
- 최근 검색 시간 표시 제거
- 헤더 SearchBar (활성)가 이미 있으므로 페이지 안 입력창 제거

#### 5. Phase 2 양방향 sync (메모리 #21 정합)
사용자 질문: "phase2에서 모바일에서 검색한 키워드가 pc로 싱크가 되겠지?"

**Answer: YES** — 메모리 #21 정의:
- Phase 1: PC capture / 모바일 view (현재)
- Phase 2: 대등 양방향 (Capacitor 네이티브 wrap, 모바일에서도 capture 가능)

따라서 Phase 2에서:
1. 모바일 PWA → Capacitor 네이티브 앱
2. 모바일에서 검색 → search_history Supabase upsert
3. PC 사이드패널이 양방향 sync로 모바일 검색 즉시 표시
4. 모바일에서 핀 고정도 가능 → keywords 양방향
5. 북마크 추가도 양방향

이게 메모리 #21의 핵심 약속. 메모리에 통합 권장 추가:
> Phase 2 양방향 sync 의미: Phase 1 단방향 sync 코드 (supabase-sync.js)를 양방향으로 확장. PC capture-only 가정 제거.

## 변경 파일 (5파일)

| 파일 | 변경 |
|---|---|
| `src/components/BottomNav.jsx` | 이모지 → SVG 인라인 (3개 시안 메타포) |
| `src/components/SearchBar.jsx` | PC `.sb` 정합 + native X 제거 + 폰트 +1pt |
| `src/components/SearchResults.jsx` | CategoryHeader 색 + 여백 -1px |
| `src/pages/Search.jsx` | placeholder 정리 + 핀 고정 빈 영역 제거 + 시간 제거 |
| `src/index.css` | native search X 글로벌 제거 CSS |

## 적용

zip 풀어서 5파일 PWA 폴더에 덮어쓰기 → HMR 자동 → PWA 새로고침.

## 검증 시나리오

### 1. 하단 네비게이션
- 핫딜 모음: 가격 태그 아이콘 (비활성 outline / 활성 살구 fill + 주황 stroke)
- 검색: 돋보기 (비활성 outline / 활성 fill)
- 북마크: 책갈피 (비활성 outline / 활성 fill)
- 활성 색 `#E8762B`, 비활성 `#A8A699`

### 2. 검색바 (헤더)
- 검색어 입력 → X 버튼 **하나만** 표시 ✅
- focus 시 주황 border + shadow ✅
- PC 사이드패널과 같은 형태 ✅

### 3. 검색 페이지
- 안내 메시지 사라짐 ✅
- 핀 고정 없으면 섹션 자체 사라짐 (최근 검색만 표시) ✅
- 최근 검색 시간 표시 사라짐 ✅
- 키워드 클릭 → 검색결과로 이동 ✅

### 4. 검색결과 페이지
- 카테고리 레이블 회색 톤 (`#9F9F9F`) ✅
- 카테고리 사이 여백 약간 줄어듦 (1px씩) ✅

## 트랙 C 진행

| 단계 | 상태 |
|---|---|
| PWA seamless 1~4 | ✅ |
| fix5/6/7/8/9 + isLowest + NEW | ✅ |
| PC 시각 100% 정합 + 모바일 +1pt | ✅ |
| 클릭 navigate + 폰트 +1 더 | ✅ |
| **하단 아이콘 + 검색 UX 개선** | ⏳ 적용 중 |
| 핫딜 모음 placeholder | ⏳ |
| TECH_DEBT 정리 | ⏳ |
| YouTube + verification | ⏳ |
