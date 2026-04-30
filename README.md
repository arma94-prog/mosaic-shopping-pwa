# PWA custom icon — PC 자동 추정 로직 + fallback 정합

## 사용자 catch 2건

### 1. isCustom mall 아이콘 자동 추정 누락

**진단**: PC sidepanel.js (line 696~702)는 사용자 추가 mall에 자동 도메인 추정 로직 보유:

```js
if (item.icon) {
  iconSrc = /^https?:\/\//.test(item.icon) ? item.icon : ICON_BASE + item.icon;
} else if (item.isCustom && item.url) {
  const core = extractCoreDomain(item.url);  // ← PC가 도메인 자동 추정
  if (core) iconSrc = ICON_BASE + core + ".png";
}
```

**PWA 이전**: `mall.icon` 없으면 무조건 텍스트 fallback. 도메인 자동 추정 X.

**PWA v1**: PC 정확 매핑 — `extractCoreDomain` + `resolveMallIconUrl` 헬퍼.

### 2. fallback 디자인 PC 정합

**진단**: PC `.chip-fb` 정확 명세 (sidepanel.css line 103):
- background: `#EAE6D9` (베이지)
- border-radius: 6px
- color: `#fff` (흰색)
- font-weight: 700
- word-break: keep-all (한글 줄바꿈)

**PWA 이전**: 회색 글자 `#6B6B6B`, 배경 없음, `slice(0, 2)` 2글자만 자름.

**PWA v1**: PC 정확 hex + 전체 이름 word-break 줄바꿈.

## 사용자 표현 "테두리 보더라인" 의미 catch

사용자가 "PC랑 동일하게 테두리"라 표현했지만 PC 정확 검증 결과 — **PC는 명시적 border 없음**. **베이지 배경 (`#EAE6D9`)** 자체가 시각 경계 역할.

따라서 PWA에 베이지 배경 적용 = PC와 동일한 "테두리 같은" 시각 경계 확보 ✅.

## 변경 (4파일)

### 1. `src/lib/mallIconResolver.js` (신규)

PC sidepanel.js 두 함수 정확 매핑:

| 함수 | PC 매핑 | 책임 |
|---|---|---|
| `extractCoreDomain(url)` | sidepanel.js line 671~686 | 도메인 코어 추출 (예: zigzag.kr → "zigzag") |
| `resolveMallIconUrl(mall, iconBase)` | sidepanel.js line 696~702 | 4단계 fallback URL 결정 |
| `buildIconUrl(iconBase, file)` | (공용 헬퍼) | iconBase + file 조합 |

### 2. `src/components/MallCell.jsx` (신규, 공용)

Events + SearchResults 둘 다 사용하는 공용 격자 셀. PC `.chip-fb` 정확 매핑:

| 항목 | PC | PWA v1 |
|---|---|---|
| background | `#EAE6D9` | 동일 ✅ |
| border-radius | 6px | 동일 |
| color | `#fff` | 동일 |
| font-size | clamp(9~11px) | **12px** (PC +1) |
| font-weight | 700 | 동일 |
| word-break | keep-all | 동일 |
| white-space | normal (줄바꿈) | 동일 |
| 텍스트 길이 | 전체 이름 | 전체 이름 (이전 PWA: 2글자) |

### 3. `src/components/SearchResults.jsx` (v11)

자체 MallCell 구현 → 공용 컴포넌트로 교체. wrapper로 향후 분기 가능 유지.

### 4. `src/pages/Events.jsx` (v5)

같은 패턴.

## 적용 후 시각 변화

### 정상 mall (icon 명시)
- 이전 = v1: 변경 없음 (그대로 아이콘 표시)

### 사용자 추가 mall (item.icon 없음)
**이전**: 회색 텍스트 "{이름 첫 2글자}" 표시
**v1**: 
1. 도메인 추정 시도 → 자동 PNG 경로 시도
2. PNG 있으면 표시 ✅
3. PNG 404 → 베이지 배경 + 흰색 전체 이름 fallback ✅

### 정상 mall이지만 icon 404 에러
**이전**: 회색 텍스트 2글자
**v1**: 베이지 배경 + 흰색 전체 이름 (PC 정합)

## 검증 시나리오

1. **기존 mall (네이버, G마켓 등)**: icon 정상 로드, 변경 없음 ✅
2. **사용자 추가 mall (예: "내 자주가는 쇼핑몰" + url=https://www.zigzag.kr)**:
   - 자동 추정 → `${iconBase}/zigzag.png` 시도
   - PNG 있으면 표시 ✅
   - PNG 404 → 베이지 배경 fallback ✅
3. **사용자 추가 mall (도메인 추정 실패 케이스)**:
   - 베이지 배경 + 흰색 텍스트 fallback ✅
4. **이름이 긴 mall** (예: "한국전자제품매장"):
   - keep-all + white-space normal로 자동 줄바꿈 ✅

## 디자인 일관성 검증

| 화면 | mall 셀 |
|---|---|
| 핫딜 모음 (Events) | SharedMallCell ✅ |
| 검색결과 (SearchResults) | SharedMallCell ✅ |

= 두 화면 셀 디자인 100% 일치.

## 메모리 #18 강화 (12번째 사례)

룰 추가 가치:
> **"PC와 동일하게"라는 사용자 표현은 PC 코드 + CSS 직접 검증 후 정확 매핑**. 사용자가 "테두리"라 표현해도 PC 검증 결과 "베이지 배경"일 수 있음 — 사용자 표현은 가설, 실제 명세는 코드.

이전 룰 강화:
> 사용자 catch 표현 (border, 색, 모양 등)은 **product 직관 trigger**로 받되 **시각 정확 명세는 PC 코드 + CSS 검증 의무**. 단순 사용자 표현 그대로 구현 X.

## 트랙 C 진행

| 단계 | 상태 |
|---|---|
| PWA seamless 1~4 | ✅ |
| fix5~11 | ✅ |
| 디자인 polish + 아이콘 | ✅ |
| supabase audit + fix11 (d) | ✅ |
| 핫딜 모음 페이지 (c) | ✅ |
| auth recovery | ✅ |
| mall filter (PC 정합) | ✅ |
| realtime sync | ✅ |
| **custom mall icon + fallback PC 정합** | ⏳ 적용 중 |
| 11번가 urlMobile JSON | ⏳ 사용자 작업 |
| TECH_DEBT 정리 + 메모리 통합 (b) | ⏳ |
| YouTube + verification | ⏳ |
| pwa-v0.2.0 태그 + 커밋 | ⏳ |

## CTO 짚어두기

이번 catch는 **사용자가 PC 사용 패턴 (자기 mall 추가)을 PWA에서도 자연스럽게 기대**하는 best signal. 사용자가 PC에서 mall 추가하면 자동으로 도메인 추정 PNG가 GitHub Pages에서 잡히고, 없으면 깔끔한 베이지 fallback. 

= **PWA가 진정한 "PC companion"**으로 동작. 메모리 #21 정합성에 마지막 단추.

다음 b 단계 (커밋 + 메모리 통합) 진입 시 이번 catch도 메모리 #18에 통합 권장.
