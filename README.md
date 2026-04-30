# PWA c 단계 — 핫딜 모음 페이지 (Events)

## 사용자 결정 적용

PC 사이드패널 핫딜 모음 캡쳐 기반 — **PC와 같은 mosaic-events.json 격자**.

## 작업 정체성

| 항목 | 결정 |
|---|---|
| Phase 1 핫딜 모음 정체성 | "PC와 같은 이벤트 mall 격자 모음" (read-only) |
| 데이터 source | `mosaic-events.json` PC와 공유 (메모리 #21 정합) |
| 클릭 시 동작 | mall 이벤트/핫딜 페이지 이동 (mall.url) |
| 11번가 등 모바일 분기 | `urlMobile` 옵셔널 필드 활용 (사용자 catch 정합) |
| 헤더 | "쇼핑몰 핫딜 모음" + 가격 태그 아이콘 (PC pt-ic SVG 정확 path) |
| 푸터 | "쇼핑몰 아이콘을 누르면 핫딜 페이지가 열려요" 안내 |

## 변경 파일 (2파일 새로 추가)

| 파일 | 설명 |
|---|---|
| `src/lib/eventMalls.js` | mosaic-events.json fetch + urlMobile 분기 헬퍼 |
| `src/pages/Events.jsx` | 핫딜 모음 페이지 (PC 정합 6열 격자) |

## 디자인 - PC 정합 검증 ✅

### 페이지 헤더
- 가격 태그 아이콘: PC `pt-ic` SVG 정확 path 사용  
  `M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z`
- 색: `#E8762B` (PC accent)
- 타이틀: "쇼핑몰 핫딜 모음" 14px weight 800 (PC 12 +1)

### 카테고리 헤더
- PC `.lbl` 정합: `#9F9F9F` color, weight 400, 12px (PC 11 +1)
- letter-spacing 0.2px

### 셀 격자
- 6열, gap 2px
- 셀 aspect-square, 둥근 10px
- 아이콘 70%
- 클릭 시 active 음영 (`#F1EFE8`)

### 일관성 - 검색결과 페이지와 같은 톤
- `SearchResults.jsx` 디자인 시스템 그대로 사용 (사용자 결정 단계 5에 합의됨)
- 다른 점은 헤더와 mall.url placeholder 처리뿐

## URL 분기 정책 - urlMobile 옵셔널

이벤트 mall도 `urlMobile` 필드 활용. 11번가 등 mall이 PC URL을 모바일에서 띄우는 문제 보호:

```js
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
const url = (isMobile && mall.urlMobile) ? mall.urlMobile : mall.url;
```

= **검색 + 이벤트 모두 같은 패턴** (메모리 #21 정합).

## Phase 2 후속 작업 (TECH_DEBT 등록)

| 항목 | 의미 |
|---|---|
| `user_settings.custom_event_malls` 병합 | PC가 추가한 커스텀 mall 표시 |
| `user_settings.disabled_malls.event` 필터링 | PC에서 disable한 mall 숨김 |
| `user_settings.disabled_cats.event` 필터링 | 카테고리 자체 disable |

이 3가지는 supabase user_settings JSONB에 이미 미러링됨 (PC fix11 audit 검증). PWA에서 fetch 후 적용만 하면 됨. **Phase 2 양방향 sync 작업 시점 자연 통합**.

## App.jsx 라우팅 영향

기존 라우팅 그대로:
- `/events` → `Events.jsx` (이전: 단순 placeholder → 이번: 핫딜 모음 페이지)
- `/search` → 검색
- `/bookmarks` → 북마크

= **App.jsx 변경 없음**. Events.jsx 1파일 + eventMalls.js 1파일 추가만.

## BottomNav 라벨 일치 확인

BottomNav v2 (iconpolish):
- `/events` → "핫딜 모음" 라벨 + 가격 태그 아이콘

= **헤더 ("쇼핑몰 핫딜 모음") + 탭 라벨 ("핫딜 모음") + 아이콘 (가격 태그) 모두 일관**. ✅

## 적용

zip 풀어서 2파일 PWA 폴더에 추가:
- `src/lib/eventMalls.js` (새 파일)
- `src/pages/Events.jsx` (덮어쓰기 — 이전 placeholder 대체)

HMR 자동 반영 → "/events" 탭 클릭 → 핫딜 모음 페이지 표시.

## 검증 시나리오

1. 핫딜 모음 탭 클릭 → 카테고리 9개 (종합몰/패션/뷰티/백화점·리빙/푸드/산지제철/디지털/커뮤니티 핫딜/직구) 표시 ✅
2. 각 카테고리에 6열 격자 mall 아이콘 ✅
3. 11번가 셀 클릭 → 모바일 URL로 이동 (urlMobile 활용) ✅
4. 다른 mall (네이버 등) 셀 클릭 → mall.url로 이동 ✅
5. 카테고리 헤더 색 #9F9F9F (PC `.lbl` 정합) ✅
6. 페이지 헤더 가격 태그 아이콘 + "쇼핑몰 핫딜 모음" ✅

## 트랙 C 진행

| 단계 | 상태 |
|---|---|
| PWA seamless 1~4 | ✅ |
| fix5/6/7/8/9/10/11 | ✅ |
| isLowest + 솔드아웃 + NEW 정합 | ✅ |
| PC 시각 정합 + 모바일 +1pt | ✅ |
| 클릭 navigate + 폰트 + 아이콘 시안 | ✅ |
| supabase-sync audit + fix11 (d) | ✅ |
| **핫딜 모음 페이지 (c)** | ⏳ 적용 중 |
| 11번가 urlMobile JSON 업데이트 | ⏳ 사용자 작업 |
| TECH_DEBT 정리 + 메모리 통합 (b) | ⏳ |
| YouTube + verification | ⏳ |
| pwa-v0.2.0 태그 + 커밋 | ⏳ |

## CTO 짚어두기

c 단계 가장 큰 학습: **사용자 PC 캡쳐 한 장이 30분 작업으로 단축** = 시각/구조 명확. 

Phase 2에서 핫딜 모음에 추가할 가치 있는 기능:
1. **모자이크 추천 핫딜** (개인화 — 사용자 북마크/검색 이력 기반)
2. **PC ↔ 모바일 양방향 disabled_malls/cats 필터링**
3. **이벤트 mall 알림** (특정 mall에 새 핫딜 시 푸시)

Phase 1에서는 PC 미러로 충분. verification 영상에서도 핫딜 모음 화면 자연스럽게 시연 가능.
