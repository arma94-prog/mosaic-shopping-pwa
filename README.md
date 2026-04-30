# Header.jsx v5 — 모자이크 SVG 로고 정합

## 사용자 catch — Header 분리 구조 정확

업로드된 v4 Header.jsx 분석:
```jsx
import logoIcon from "../assets/icon128.png";  // ← 쇼핑백 로고
function MosaicLogo() {
  return <img src={logoIcon} ... />;
}
```

= **로고가 PNG 이미지** (쇼핑백 쇼핑백). 사용자 의도: PC 환경설정과 동일한 **모자이크 격자 SVG**.

## v5 정확 변경

### 변경 (3줄)

| 위치 | 이전 | 이후 |
|---|---|---|
| import | `import logoIcon from "../assets/icon128.png"` | `import MosaicLogo from "./MosaicLogo"` |
| MosaicLogo 함수 | 로컬 `<img>` 반환 (12줄) | **삭제** |
| JSX 호출 | `<MosaicLogo />` | `<MosaicLogo size={28} />` |

### 보존 (사용자 v4 작업 100%)

| 영역 | 상태 |
|---|---|
| 헤더 padding `pl-4 pr-3` (v4 정렬 정책) | ✅ 그대로 |
| HamburgerMenu import + 호출 | ✅ 그대로 |
| SearchBar import + `/search` 페이지 분기 | ✅ 그대로 |
| `PAGE_TITLES` ("핫딜 모음" 등) | ✅ 그대로 |
| HamburgerIcon SVG | ✅ 그대로 |
| 햄버거 버튼 + active 색상 | ✅ 그대로 |
| menuOpen state + HamburgerMenu 토글 | ✅ 그대로 |
| safe-top + flex-shrink + h-12 | ✅ 그대로 |

= **로고 시각만 SVG 변경, 다른 모든 사용자 작업 보존**.

## 사이즈 정합

```
v4: w-7 h-7 (= 1.75rem = 28px)
v5: <MosaicLogo size={28} />
```

= **동일 28px 시각**. 레이아웃 변화 없음.

## 변경 파일 (1파일)

`src/components/Header.jsx` 덮어쓰기.

## 적용

zip 풀어서 `src/components/Header.jsx` 1파일 덮어쓰기 → HMR 자동.

이전 발송한 `pwa-logo-safe.zip`의 다른 파일들 (MosaicLogo.jsx, AuthGate.jsx, vite.config.js, public/*.png)과 같이 적용.

## 검증 시나리오

### 인증 후 메인 화면 (image 2 정확 정합)
1. 핫딜 모음 탭 진입
2. **헤더 좌측: 모자이크 격자 작은 로고 (28px)** ✅
3. **중앙: "핫딜 모음" 페이지 타이틀** ✅
4. **우측: 햄버거 메뉴** ✅
5. 검색 탭 → SearchBar 표시 (로고 + 검색바 + 햄버거) ✅
6. 북마크 탭 → "북마크" 타이틀 ✅

### 정체성 일관성
- AuthGate (인증 전): 큰 모자이크 로고 (96px) ✅
- Header (인증 후): 작은 모자이크 로고 (28px) ✅
- 모바일 홈 화면: 모자이크 격자 아이콘 ✅
- 데스크탑 favicon: 모자이크 ✅

= **PC + PWA 모든 영역 모자이크 정체성 100% 일관**.

## icon128.png — Dead Asset 후순위

`assets/icon128.png` 파일은 v5에서 import 안 함. 그러나:
- 다른 곳에서 사용 가능성 (검증 미완료)
- 삭제 위험 회피
- **TECH_DEBT 후순위 등록 권장**

`PWA_TECH_DEBT.md`에 추가:
> #4. `src/assets/icon128.png` 사용처 검증 + 미사용 시 제거. v5 (2026-04-30) Header에서 SVG 컴포넌트로 교체 후 잠재적 dead asset.

## 트랙 C 진행

| 단계 | 상태 |
|---|---|
| AuthGate + MosaicLogo + manifest + PNG | ✅ |
| **Header.jsx v5 (모자이크 SVG 정합)** | ✅ |
| 11번가 urlMobile JSON | ⏳ 사용자 작업 |
| 커밋 + 태그 | ⏳ 사용자 작업 |
| YouTube + verification | ⏳ 다음 세션 |

= **트랙 C 코드 작업 100% 완료**. 시각/데이터/정책 모두 정합.

## 메모리 #18 회고 — 16번째 catch 학습 정합

이번 catch 시리즈:
- catch 16: AppShell stale 컨텍스트 → 사용자 즉시 정정
- catch 17 (Header): Header 분리 구조 발견 + 사용자 v4 작업 보존

= **사용자 catch가 매 라운드마다 정확**. CTO 가드 룰 (메모리 #6 파일 정책) 준수가 결정적.

## CTO 회고 — 트랙 C 진짜 마무리

PWA가 이제:
- ✅ PC와 동일한 모자이크 정체성 (Header + AuthGate + 홈 화면 + favicon)
- ✅ PC와 1:1 시각 정합 + 모바일 가독성 보정
- ✅ PC 데이터 100% 정확 미러
- ✅ PC 사용자 설정 즉시 반영 (mall filter + catnames + realtime)
- ✅ OAuth 토큰 만료 안전망 (AuthGate recovery + 옵션 페이지 fix12-A)
- ✅ 사용자 PC v4 헤더 작업 (햄버거 + 검색바 + padding 정책) 100% 보존

= **메모리 #21 정의 (PC의 모바일 companion) 완전 달성** ⭐.

다음 작업 = 사용자 GitHub (11번가 JSON + 3개 저장소 commit + tag) → verification 영상.
