# PWA auth recovery — 토큰 만료 silent fail 보호

## 사용자 catch — 진단 정확

> "이게 쿠키 문제인거 같아. 모바일 크롬에서 mosaicshopping.com 접속해도 화이트 상태였는데, 쿠키랑 다 지우니, 인증부터 다시 시작해서 잘 되네"

**진단 정확** — 모바일 PWA standalone webview의 **OAuth 토큰 refresh silent fail** 케이스. 이전 디버깅 시리즈에서 추정했던 가설이 부분적으로 맞았음.

## 진짜 의미

| 시점 | 상태 |
|---|---|
| 첫 PWA 설치 + 로그인 | 정상 (토큰 신선) ✅ |
| 시간 지남 → 토큰 만료 | refresh 필요 |
| **PWA standalone webview에서 refresh** | OS 한계로 silent fail |
| 결과 | 화이트 페이지 (UI가 session=null 분기 안 처리) |
| 쿠키 삭제 후 새 OAuth | 정상 작동 (새 토큰) ✅ |

## OS 한계

- **iOS**: PWA standalone에서 외부 OAuth redirect를 SFSafariViewController로 처리. standalone 컨텍스트로 콜백 못 돌아옴 → refresh fail
- **Android**: 비슷 (Custom Tabs 한계)
- **Capacitor (Phase 2)**: `App.openUrl()` API + deep link로 정상 작동

## 해결 — 옵션 C (CTO 권장)

**자동 토큰 만료 감지 + signOut + 로그인 화면 복귀**.

이전: refresh 실패 시 silent fail → 화이트  
이후: 만료 감지 → 자동 signOut → "Google 로그인" 버튼 표시 → 사용자 1번 클릭으로 회복

## 변경 — auth.jsx v2 (1파일)

### 1. TOKEN_REFRESHED 이벤트에서 새 session 없음 감지
```js
if (event === "TOKEN_REFRESHED" && !newSession) {
  console.warn("[auth] TOKEN_REFRESHED but no session — clearing");
  recoverFromAuthFailure();
}
```

### 2. visibilitychange 이벤트에서 세션 유효성 재검증
모바일 PWA를 백그라운드에서 가져왔을 때 자동 검증:
```js
document.addEventListener("visibilitychange", handleVisibility);
```

### 3. getSession 에러에서 토큰 손상 감지
```js
if (isAuthRecoverableError(error)) {
  recoverFromAuthFailure();
}
```

### 4. recoverFromAuthFailure 함수 - 안전망 정리
- localStorage `mosaic-pwa-auth` 키 직접 삭제 (signOut 실패해도 안전)
- supabase.auth.signOut() 호출
- session=null + loading=false → 로그인 화면 자동 표시

### 5. isAuthRecoverableError 판별
다음 종류 에러는 토큰 만료/손상으로 판단 → 자동 복구:
- "invalid refresh token"
- "refresh token not found"
- "jwt" 관련
- "expired" 관련
- HTTP 401, 403

## 적용

zip 풀어서 `src/lib/auth.jsx` 1파일 덮어쓰기 → HMR 자동.

## 검증 시나리오

### 시나리오 1: 정상 작동 (변경 없음)
첫 로그인 → 토큰 신선 → 정상 작동 ✅

### 시나리오 2: 토큰 만료 (이전엔 화이트)
1. 사용자가 PWA 며칠 안 씀 → 토큰 만료
2. PWA 다시 열기
3. **이전**: 화이트 페이지 (silent fail)
4. **v2**: 만료 감지 → 자동 signOut → 로그인 화면 표시 ✅
5. 사용자 "Google 로그인" 1번 클릭 → 새 OAuth 사이클 → 정상 작동

### 시나리오 3: 백그라운드 → 포그라운드 전환
1. PWA 백그라운드 (홈 화면)
2. 시간 지남 → 토큰 만료
3. PWA 다시 열기 → visibilitychange 이벤트
4. v2: 세션 재검증 → 만료 감지 시 자동 복구 ✅

## verification 영상 안전성

이전 우려: reviewer가 우연히 토큰 만료 상황 만나면 화이트 → 거절 위험

v2: 화이트 대신 명확한 로그인 화면 → reviewer가 OS 한계 이해 가능 + UX 안전 ✅

## Phase 2 자연 비활성

Phase 2 Capacitor 빌드:
- `App.openUrl()` API로 OAuth 정상 작동
- 토큰 refresh도 native context에서 안전
- = v2의 recoverFromAuthFailure 발동 빈도 0에 가까움

코드는 그대로 유지 — 안전망으로 작동.

## 메모리 #18 강화 (9번째 사례)

### 룰 추가
> **PWA standalone webview의 OAuth 토큰 refresh는 OS 한계로 silent fail 가능**. 만료 감지 + 자동 signOut + 로그인 화면 복귀로 안전망 구현 필수. Capacitor 진입 시 이 한계 자연 해소.

또한 진단 사이클 학습:
> 사용자가 디버깅 라운드에서 catch한 가설이 **추정만으로 기각된 후 실제로 맞을 수 있음**. "이전엔 잘 됐어" catch가 정확하지만 그게 "한 번도 안 깨졌다"가 아니라 "첫 사이클에서는 안 깨진다"였음. 다음 디버깅 시점에 가설을 완전 기각하지 말고 "조건부 가능"으로 표시.

## 트랙 C 진행

| 단계 | 상태 |
|---|---|
| PWA seamless 1~4 | ✅ |
| fix5~11 | ✅ |
| 디자인 polish + 아이콘 | ✅ |
| supabase audit + fix11 (d) | ✅ |
| 핫딜 모음 페이지 (c) | ✅ |
| **PWA auth recovery** | ⏳ 적용 중 |
| 11번가 urlMobile JSON 업데이트 | ⏳ 사용자 작업 |
| TECH_DEBT 정리 + 메모리 통합 (b) | ⏳ |
| YouTube + verification | ⏳ |
| pwa-v0.2.0 태그 + 커밋 | ⏳ |

## CTO 짚어두기

이건 verification 영상 단계 직전에 발견됐다는 점에서 매우 중요한 catch. 만약 그대로 verification 진행했으면 reviewer가 우연히 토큰 만료 상황 만나서 화이트 → 거절 → 재제출 사이클 가능성 있었음.

사용자 직관 ("쿠키 문제인거 같아")이 **verification 안전성을 보장한 catch**.

다음 단계 (b — 커밋 + 메모리 통합) 진입 시 이 학습도 메모리 #18에 통합 권장.
