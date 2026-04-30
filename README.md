# PWA fix — PC 시각 100% 정합 + 모바일 가독성 +1pt

## 사용자 결정 (옵션 a)

> "디자인부터 pc랑 맞추고, 모바일에선 글자 +1pt, 색상 동일, 북마크 라인 블랙 해결"

## 진단 — 검정 라인 원인

Tailwind 토큰 (`border-mosaic-line`)이 production 빌드에서 매칭 실패 가능성. 또는 토큰 자체는 OK인데 빌드 결과 CSS에 누락. 

**해결**: 모든 색을 **hex 직접 지정** (style 인라인 또는 임의값) — 토큰 의존 제거.

## 변경 5파일

### 1. `BookmarkReport.jsx` — 최저가 리포트 박스
- 타이틀 색: 파란색 (잘못) → **`#E8762B` 주황** ⭐
- bg: `#F1EFE8` 베이지 (PC 정확)
- border: `#E0DCCE` 베이지 (PC 정확)
- 폰트: 13px (PC 12 +1) 타이틀, 12px (PC 11 +1) 본문

### 2. `BookmarkGroup.jsx` — 그룹 카드
- 카드 background: `#FFFFFF`
- 카드 border: `#E0DCCE` 베이지 (검정 라인 → 베이지로 ⭐)
- 그룹명: `#1A1A1A` weight 800, 13px (PC 12 +1)
- mall 리스트 border-top: `#EFECE3` (PC 정확)
- 펼치기 버튼 border-top: `#F5F3EC` (PC 정확)
- 핀 아이콘: `#E8762B` 주황

### 3. `BookmarkItem.jsx` — mall 행 ⭐ 핵심 (검정 라인 진짜 해결)
- mall 행 사이 border-top: **`#F5F3EC` 베이지** (PC 정확, 사용자가 본 검정 → 베이지) ⭐
- 상품 제목: `#555555` 12.5px (PC 11.5 +1)
- mall 이름: `#1A1A1A` weight 800 12px (PC 11 +1)
- 가격: `#6B6B6B` 12px (PC 11 +1)
- 변동 텍스트: 11px (PC 10 +1)
  - 하락: `#E8762B` 주황 weight 600
  - 상승: `#6B6B6B` muted
  - 변동없음: `#A8A699` soft
- 솔드아웃: `#8A8A8A` 12px
- rank 숫자: `#1A1A1A` 11px (PC 10 +1)

### 4. `Pill.jsx` — 배지
- 모든 색 hex 직접 지정 (토큰 의존 제거)
- 폰트: 9px → **10px** (PC +1)
- NEW: `#F5B800` 앰버 / `#FFFFFF` 글자 / weight 600
- 최저가: `#FBE8D9` / `#E8762B` accent / weight 700
- 목표가-default: `#F0EFEA` / `#999` / weight 500
- 목표가-achieved: `#E1F5EE` / `#0F6E56` / weight 700

### 5. `Bookmarks.jsx` — 변경 없음 (newestBookmarkId 로직 그대로)

## 적용

zip 풀어서 5파일 PWA 폴더에 덮어쓰기 → HMR 자동 → PWA 새로고침.

## 검증 시나리오

### 우텐더 안심 그룹
이전:
- 그룹 외곽: 검정 (이슈)
- mall 사이 라인: 검정 (이슈)
- 글자 작음

이후:
- 그룹 외곽: 베이지 `#E0DCCE` ✅
- mall 사이 라인: 베이지 `#F5F3EC` ✅ (사용자 catch 해결)
- 글자 +1pt 가독성 ✅
- PC와 같은 색 톤 ✅

### 최저가 리포트 박스
이전:
- 타이틀 색 파란색 (이슈)

이후:
- 타이틀 `#E8762B` 주황 ✅ (PC 정합)
- 본문 12px (PC +1) ✅

## 회고 — 메모리 #18 강화 (6번째 사례)

이번 catch는 **Tailwind 토큰 의존의 함정** 사례:
- @theme 블록에 토큰 정의 OK
- 컴포넌트에 클래스 명시 OK
- 그러나 production 빌드 결과 CSS에서 매칭 실패 의심
- 사용자가 시각으로 catch (검정 라인, 파란 타이틀)

**룰 강화**: 핵심 디자인 (PC 정합 색)은 **토큰 의존 + style 인라인 hex 둘 다 작성** 또는 **임의값 클래스 (`text-[#XXX]`)** 사용으로 안전망. 토큰만 의존하지 않음.

다음 단계 (TECH_DEBT 정리 시점)에:
- index.css의 deprecated alias 정리
- 토큰 vs hex 직접 정책 통일

## 트랙 C 진행

| 단계 | 상태 |
|---|---|
| PWA seamless 1~4 | ✅ |
| fix5/6/7/8/9 | ✅ |
| isLowest 정정 + 솔드아웃 정렬 | ✅ |
| NEW 판정 + Pill PC 정합 | ✅ |
| **PC 시각 100% 정합 + 모바일 +1pt** | ⏳ 적용 중 |
| 핫딜 모음 placeholder | ⏳ |
| TECH_DEBT 정리 | ⏳ |
| YouTube + verification | ⏳ |
