# PWA fix — 클릭 navigate + 폰트 +1pt + NEW 로직 재점검

## 사용자 catch 4건

### 🐛 catch 1: 최근 검색어 클릭 미작동
**원인**: 단계 4 작업 시 핀고정/최근검색 키워드에 onClick 핸들러 누락. 클릭 무반응.

**해결**: `Search.jsx` 키워드 항목에 onClick 추가. `/search?q={keyword}` navigate.

### 🐛 catch 2: 북마크 그룹명 클릭 미작동
**원인**: BookmarkGroup의 그룹명 `<h3>`에 onClick 없음. PC `.bm-q-text`는 클릭 가능했음.

**해결**: 그룹명을 `<button>`으로 변경 + onClick → `/search?q={group.name}` navigate.

### 폰트 +1pt 추가
**v5 (이전 fix) 적용 후에도 사용자가 더 키우길 원함**.

| 영역 | PC | v5 | **v6 (이번)** |
|---|---|---|---|
| BookmarkReport 타이틀 | 12 | 13 | **14** |
| BookmarkReport 본문 | 11 | 12 | **13** |
| 그룹명 | 12 | 13 | **14** |
| 상품 제목 | 11.5 | 12.5 | **13.5** |
| mall 이름 | 11 | 12 | **13** |
| 가격 | 11 | 12 | **13** |
| 변동 텍스트 | 10 | 11 | **12** |
| rank 숫자 | 10 | 11 | **12** |
| 펼치기 | 9 | 10 | **11** |
| 배지 (NEW/최저가/목표가) | 9 | 10 | **11** |

PC 대비 +2pt 누적. 모바일 가독성 명확.

### 🐛 catch 3: NEW 로직 재점검
**의미**: 사용자가 "다시 점검" 요청 = 이전 newfix 적용 안 됐거나 NEW 여전히 잘못 표시 의심.

**검증 결과**: newfix Bookmarks.jsx의 `computeNewestBookmarkId`가 PC `computeNewestBookmarkKey()`와 100% 매칭 ✅.

PC 정확 의미:
1. 모든 그룹의 모든 mall 중 가장 최근 created_at 1개 식별
2. 24h 이내일 때만 ID 반환, 아니면 null
3. → 단 1개의 mall에만 NEW 표시 (24h 지나면 0개)

**가능 원인**: 사용자가 newfix Bookmarks.jsx를 적용 안 했을 수 있음. 본 zip의 Bookmarks.jsx에 동일 로직 포함. **이번 zip 적용 후 정상 작동 확인 부탁**.

검증 시나리오:
- 가장 최근 북마크가 24시간 이내 → 그 1개만 NEW ✅
- 가장 최근 북마크가 24시간 지남 → NEW 0개 ✅
- 그 외 모든 mall → NEW 표시 안 됨 ✅

## 변경 파일 (5파일)

| 파일 | 변경 |
|---|---|
| `src/pages/Search.jsx` | 키워드 클릭 → navigate + PC 정합 시각 |
| `src/pages/Bookmarks.jsx` | newestBookmarkId 계산 + prop (newfix 그대로) |
| `src/components/BookmarkGroup.jsx` | 그룹명 클릭 → navigate + 폰트 +1pt |
| `src/components/BookmarkItem.jsx` | 폰트 +1pt |
| `src/components/BookmarkReport.jsx` | 폰트 +1pt |
| `src/components/Pill.jsx` | 폰트 +1pt |

## 적용

zip 풀어서 5파일 PWA 폴더에 덮어쓰기 → HMR 자동 반영 → PWA 새로고침.

## 검증 시나리오

### 1. 검색 페이지
- 최근 검색어 항목 탭 → `/search?q={keyword}`로 navigate ✅
- 핀 고정 키워드 탭 → 동일 동작 ✅
- 검색결과 페이지 표시 (SearchResults.jsx 컴포넌트)

### 2. 북마크 페이지
- 그룹명 ("우텐더 안심") 탭 → `/search?q=우텐더+안심`로 navigate ✅
- 검색결과로 이동
- 모든 폰트 +1pt 더 커짐 (모바일 가독성 명확)

### 3. NEW 마크
- 24시간 이내 가장 최근 mall 1개만 NEW ✅
- 그 mall이 24h 지나면 NEW 사라짐 ✅
- 다른 mall은 NEW 안 뜸 ✅

## 회고 — 메모리 #18 강화 (7번째 사례)

이번 catch는 **단계 4 누락 + 적용 누락 시너지** 사례:
1. 단계 4 작업 시 키워드/그룹명 클릭 navigate 처리 누락
2. 사용자가 "검색결과 이동 안 됨" catch
3. 추가로 NEW 로직도 newfix 적용 안 됐을 가능성

**룰 강화**: 사용자가 fix 결과를 caught하면, **사용자가 적용 단계까지 정확히 했는지** 함께 확인. "이미 적용했어"라는 가정으로 다른 진단으로 가지 않음.

다음번부터: 사용자 catch 시 **"먼저 어떤 zip 적용했는지" 확인 → 코드 정확성 검증 → 그 후 다음 단계** 순서.

## 트랙 C 진행

| 단계 | 상태 |
|---|---|
| PWA seamless 1~4 | ✅ |
| fix5/6/7/8/9 | ✅ |
| isLowest 정정 + 솔드아웃 정렬 | ✅ |
| NEW 판정 + Pill PC 정합 | ✅ |
| PC 시각 100% 정합 + 모바일 +1pt | ✅ |
| **클릭 navigate + 폰트 +1 더 + NEW 재점검** | ⏳ 적용 중 |
| 핫딜 모음 placeholder | ⏳ |
| TECH_DEBT 정리 | ⏳ |
| YouTube + verification | ⏳ |
