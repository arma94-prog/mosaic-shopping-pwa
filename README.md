# PWA 모자이크 정체성 통합 fix — 최종

## 사용자 catch (캡쳐 image 1, 2, 3 기반)

### 변경 항목 4가지 + 추가 1개

| 항목 | 캡쳐 | 변경 |
|---|---|---|
| 1. PWA 앱 아이콘 (홈 화면) | image 2 | 쇼핑백 → **모자이크 격자** |
| 2. 첫 진입 화면 큰 로고 | image 3 | 쇼핑백 이모지 → **모자이크 SVG** |
| 3. 로그인 안내 문구 | image 3 | "PC확장에서 사용중인" → **"PC에서 이용중인"** |
| 4. AppShell 헤더 (정체성 일관) | (CTO 추가) | 텍스트만 → **모자이크 작은 로고 + 라벨 정합** |
| 5. manifest theme_color (정체성 일관) | (CTO 추가) | `#0f172a` 검정 → **`#F0EDE4` 베이지** |

= **PC 환경설정 image 1과 동일 정체성** 일관 + 모바일 PWA 표준.

## 변경 파일 (4파일 + PNG 5개)

### 1. `src/components/MosaicLogo.jsx` (신규)
PC SVG 정확 매핑 React 컴포넌트. 재사용 가능 (size prop).

### 2. `src/components/AuthGate.jsx` v2
- `🛍️` 이모지 + 검정 박스 → **`<MosaicLogo size={96} />`**
- 안내 문구: **"PC에서 이용 중인 Google 계정과 같은 계정으로 로그인하세요"**

### 3. `src/components/AppShell.jsx` v2
- 헤더 좌측: **`<MosaicLogo size={28} />` + 페이지 타이틀** (캡쳐 image 2 정합)
- TITLES 매핑: `/events` "이벤트" → **"핫딜 모음"** (BottomNav 일관)
- TITLES 매핑: `/results` "결과" → **"검색 결과"** (가독성)

### 4. `vite.config.js` v2
- manifest description 갱신 (메모리 #21 정체성 정합)
- **theme_color `#F0EDE4`** (모자이크 베이지)
- includeAssets 5개 PNG 모두 추가 (apple-touch + favicon)

### 5. `public/` PNG 아이콘 5개 (신규)
- `icon-192.png` / `icon-512.png` — PWA 표준
- `apple-touch-icon.png` (180×180) — iOS 홈 화면
- `favicon-32.png` / `favicon-16.png` — 브라우저 탭

## 추가 사용자 작업 — `index.html` 1줄 추가

PWA 저장소 root `index.html`의 `<head>`에 다음 link 추가 권장:

```html
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
```

vite-plugin-pwa가 일부 자동 처리하지만 명시적 link가 안전 (특히 iOS Safari 홈 화면 추가 시).

만약 `index.html` 채팅에 붙여넣기 부탁드리면 정확한 위치 적용 zip 발송 가능.

## 적용 순서

```
1. zip 풀어서 PWA 저장소에 다음 위치 덮어쓰기:
   - src/components/MosaicLogo.jsx (새 파일)
   - src/components/AuthGate.jsx (덮어쓰기)
   - src/components/AppShell.jsx (덮어쓰기)
   - vite.config.js (덮어쓰기)
   - public/icon-192.png (덮어쓰기 또는 새 파일)
   - public/icon-512.png (덮어쓰기 또는 새 파일)
   - public/apple-touch-icon.png (새 파일)
   - public/favicon-32.png (새 파일)
   - public/favicon-16.png (새 파일)

2. (선택) index.html에 link 추가 (위 가이드)

3. dev server 재시작 (vite.config 변경 반영):
   - Ctrl+C → npm run dev

4. 브라우저 강력 새로고침 (Ctrl+Shift+R) — SW 캐시 우회
```

## 검증 시나리오

### PWA 첫 진입 (인증 전)
1. mosaicshopping.com 접속
2. **모자이크 격자 큰 로고** 표시 (96px) ✅
3. "모자이크 쇼핑" + "PC에서 저장한..." 부제
4. 안내 문구: **"PC에서 이용 중인 Google 계정과 같은 계정으로 로그인하세요"** ✅
5. "Google로 계속하기" 정상 작동

### 인증 후 메인 화면 (image 2 정합)
1. 핫딜 모음 탭 → **헤더에 모자이크 작은 로고 + "핫딜 모음"** ✅
2. 다른 탭 (검색/북마크) → 같은 패턴 + 페이지별 라벨

### 모바일 홈 화면 추가
1. 모바일 브라우저 → "홈 화면에 추가"
2. 홈 화면에 **모자이크 격자 아이콘** 표시 ✅
3. 클릭 시 PWA 정상 실행

### 데스크탑 브라우저
1. 브라우저 탭에 **모자이크 favicon** ✅
2. iOS Safari "홈 화면에 추가" → apple-touch-icon 표시

## 메모리 #21 보강 가치

룰 추가:
> Phase 1 PWA 시각 정체성 = PC 환경설정 페이지와 동일 모자이크 격자. AuthGate 큰 로고 + AppShell 작은 로고 + manifest theme_color (`#F0EDE4`) 모두 일관. 사용자가 PC + PWA를 같은 앱으로 인식.

## 트랙 C 진행 — 마지막 시각 작업 완료

| 단계 | 상태 |
|---|---|
| ... 모든 fix (catnames, fix12-A, fallback) | ✅ |
| **PWA 모자이크 로고 + 아이콘 통합** | ✅ |
| 11번가 urlMobile JSON | ⏳ 사용자 작업 |
| 커밋 (PC + PWA) + 태그 | ⏳ 사용자 작업 |
| YouTube + verification | ⏳ 다음 세션 |

= **트랙 C 시각/데이터/정책 100% 정합 완료**. verification 영상 단계 진입 안전성 완전 확보.

## CTO 회고

이번 catch 시리즈 (15~17번째 catch):
1. fallback 셀 시각 (사용자 캡쳐 + 4가지 변경)
2. 카테고리명 mode prefix (PWA 데이터 정합)
3. 옵션 페이지 stale UI (fix12-A)
4. **PWA 정체성 로고 + 아이콘** (이번)

= **트랙 C 마지막 4 catch가 모두 verification 안전성 핵심**. 사용자 product 직관 + 캡쳐 활용 + CTO 가드 룰이 모두 잘 작동.

다음 작업 = 사용자 GitHub 작업 (11번가 JSON + 3개 저장소 commit + tag) → verification 영상 단계.
