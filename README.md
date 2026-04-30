# PWA fix — NEW 배지 PC 정합 정정

## 사용자 catch 2건

### 🐛 catch 1: 24시간 지났는데 NEW 표시됨

**잘못된 의미** (단계 4 미스): 그룹 안에서 24h 이내 created_at인 모든 mall에 NEW.

**PC 진짜 의미** (sidepanel.js Line 1126-1139 검증):
```js
function computeNewestBookmarkKey() {
  let key = null;
  let ts = 0;
  for (const group of bookmarks) {
    for (const mall of group.malls) {
      if (mall.createdAt > ts) {
        ts = mall.createdAt;
        key = group.query + "\u0000" + mall.url;
      }
    }
  }
  if (!ts || Date.now() - ts >= NEW_WINDOW_MS) return null;
  return key;  // ← 24h 지나면 null → NEW 0개
}
```

| 항목 | 잘못 (단계 4) | PC 진짜 의미 |
|---|---|---|
| 범위 | 24h 이내 모든 북마크 | 전역 **단 1개** (가장 최근) |
| 24h 체크 | mall 개별 | 1개 전체 |
| 24h 지난 후 | 여전히 표시 | 자동 사라짐 |

블랙보리 쿠팡이 가장 최근이라도 24h 지났으면 PC는 NEW 0개. 사용자 catch 정확.

### 🐛 catch 2: NEW + 최저가 배지 PC와 다른 CSS

PC `.bm-new-badge` (sidepanel.css Line 297):
```css
background: #F5B800;     /* 앰버 옐로우 */
color: #fff;             /* 흰색 */
font-size: 9px;
font-weight: 600;        /* PC weight 600 */
padding: 1px 6px;
border-radius: 999px;
letter-spacing: 0.3px;
```

내 PWA (잘못):
- 배경 `#FFE8CC` (살구색) ← 완전히 다른 톤
- 글자 `#D06820` (갈색) ← 흰색 아님
- weight 700 ← PC는 600

PC `.bm-m-lowest` (Line 473):
```css
background: #FBE8D9;     /* 연한 살구 */
color: #E8762B;          /* accent */
font-weight: 700;
```

내 PWA: 정확 ✅ (토큰 일치)

## 변경 4가지

### 1. `index.css` — NEW 토큰 PC 정확 매핑
| 토큰 | 이전 (잘못) | 이후 (정확) |
|---|---|---|
| `--color-mosaic-new` | `#D06820` 갈색 | `#FFFFFF` 흰색 |
| `--color-mosaic-new-bg` | `#FFE8CC` 살구 | `#F5B800` 앰버 옐로우 |

### 2. `Pill.jsx` — variant별 weight 분기 + padding 정확

```jsx
// 이전: BASE에 font-bold 고정
const BASE_STYLES = "... font-bold py-[2px] ...";

// 이후: variant별 weight + padding 1px 정확
const BASE_STYLES = "... py-[1px] ...";
const VARIANT_STYLES = {
  lowest: "... font-bold",        // weight 700
  "target-achieved": "... font-bold",
  "target-default": "... font-bold",
  new: "... font-semibold",       // weight 600 (PC 정합)
};
```

### 3. `Bookmarks.jsx` — 전역 newestBookmarkId 계산
```js
function computeNewestBookmarkId(groups) {
  // 모든 그룹의 모든 bookmark 중 가장 최근 created_at 1개 식별
  // 24h 이내일 때만 ID 반환, 아니면 null
}

// render
const newestBookmarkId = computeNewestBookmarkId(state.groups);
<BookmarkGroup ... newestBookmarkId={newestBookmarkId} />
```

### 4. `BookmarkGroup.jsx` — prop 받아 NEW 표시
```jsx
// 이전: 그룹 안 24h 체크 (잘못)
const newIds = new Set(
  ranked.filter(bm => Date.now() - new Date(bm.created_at).getTime() < 24h).map(bm => bm.id)
);

// 이후: 전역 1개 ID prop 사용
const newIds = new Set();
if (newestBookmarkId) newIds.add(newestBookmarkId);
```

## 변경 파일 (4개)

| 파일 | 변경 |
|---|---|
| `src/index.css` | NEW 토큰 PC 정확 매핑 (1줄 영역) |
| `src/components/Pill.jsx` | NEW variant weight 600 + padding 1px |
| `src/pages/Bookmarks.jsx` | computeNewestBookmarkId 함수 + prop 전달 |
| `src/components/BookmarkGroup.jsx` | newestBookmarkId prop 받아 NEW 표시 |

## 적용

zip 풀어서 4파일 PWA 폴더에 덮어쓰기 → HMR 자동 반영 → PWA 새로고침.

## 검증 시나리오

### 블랙보리 쿠팡 (사용자 catch — 24h 지남)

| 이전 | 이후 |
|---|---|
| NEW 배지 표시 (잘못) | **NEW 배지 사라짐** ✅ |

### NEW 배지 시각 (가장 최근 1개 + 24h 이내일 때)

| 이전 | 이후 |
|---|---|
| 살구 배경 + 갈색 글자 + weight 700 | **앰버 옐로우 배경 + 흰색 글자 + weight 600** (PC 정합) ✅ |

### 최저가 배지 (검증)

| 이전 | 이후 |
|---|---|
| 연한 살구 + accent + weight 700 | 동일 (이미 정확) ✅ |

## 회고 — 메모리 #18 강화 (5번째 사례)

이번 catch도 **PC 코드 직접 검증 안 한 의미 추정 미스**:
- "NEW = 24시간 이내" 까지는 맞음
- 그러나 PC는 **"가장 최근 1개"** 라는 추가 조건
- 단계 4 작업 시 PC `computeNewestBookmarkKey()` grep 안 함

**룰 강화**: 의미 모호한 표시 (isLowest, isNew, sortKey 등)는 모두 **PC 판정 함수 직접 grep** 후 매핑. 메모리에 등록된 추정으로 가지 않음.

isLowest catch (메모리 #18 사례 #2)와 정확히 같은 패턴. 단계 4에서 두 번 같은 미스 — 다음 작업 시 의미 표시 매핑 시 의무 검증 강화 권장.

## 트랙 C 진행

| 단계 | 상태 |
|---|---|
| PWA seamless 1~4 | ✅ |
| fix5/6/7/8/9 (가격/솔드아웃 정책) | ✅ |
| isLowest 정정 + 솔드아웃 정렬 | ✅ |
| **NEW 판정 + PC CSS 정합** | ⏳ 적용 중 |
| 핫딜 모음 placeholder | ⏳ |
| TECH_DEBT | ⏳ |
| YouTube + verification | ⏳ |

<!-- 2026-04-30: NEW fix 재배포 검증 -->
