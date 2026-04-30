# AuthGate v3 — LoadingScreen 깜빡임 제거

## 사용자 catch — UX 정확

> "앱 실행시, 잠깐 로고가 나왔다가 핫딜 페이지로 바로 이동하는데... 깜빡 거리면서 나오니까 좀 많이 어색"
> "난 그냥 로고 없이 바로 핫딜 페이지로 가도 될 것 같아"

**진단 정확** — getSession이 ~50~100ms로 빨라서 LoadingScreen이 깜빡 보이는 패턴.

## CTO 결정 — 옵션 B (200ms grace period)

가드 #5 시뮬레이션 — 사용자 제안 ("로고 없이 바로") + 안전망:

| 시나리오 | v2 (이전) | v3 (이번) |
|---|---|---|
| 재방문 (~50~100ms) | LoadingScreen 깜빡 ❌ | 빈 배경 → 핫딜 페이지 ✅ |
| 첫 방문 + 느린 네트워크 (>200ms) | LoadingScreen ✅ | LoadingScreen 표시 ✅ |
| 토큰 만료 + auth recovery | LoadingScreen 길게 ❌ (조금 어색) | LoadingScreen 자연 ✅ |

**근거 5가지**:
1. ✅ 사용자 의도 정합 (깜빡임 제거 = 자연스런 첫 진입)
2. ✅ 안전망 보존 (느린 네트워크 시 LoadingScreen 보임)
3. ✅ 재방문자 ~99% case에서 깜빡임 X
4. ✅ 코드 변경 작음 (useEffect + setTimeout 1개)
5. ✅ 첫 방문자 보안 정상 (AuthGate가 인증 분기)

## v2 → v3 변경

### 추가 (`useEffect` + state)

```jsx
const [showLoading, setShowLoading] = useState(false);

useEffect(() => {
  if (!loading) {
    setShowLoading(false);
    return;
  }
  const timer = setTimeout(() => {
    setShowLoading(true);
  }, LOADING_GRACE_MS);  // 200ms
  return () => clearTimeout(timer);
}, [loading]);
```

### 변경 (loading 분기)

이전:
```jsx
if (loading) {
  return <LoadingScreen label="세션 확인 중..." />;
}
```

이후:
```jsx
if (loading) {
  if (showLoading) {
    return <LoadingScreen label="세션 확인 중..." />;
  }
  // 200ms 이내: 빈 배경 (사용자 인지 X)
  return <div className="h-full bg-mosaic-bg" aria-hidden="true" />;
}
```

## 적용

zip 풀어서 `src/components/AuthGate.jsx` 1파일 덮어쓰기 → HMR 자동.

## 검증 시나리오

### 정상 재방문 (가장 흔한 케이스)
1. PWA 다시 열기
2. 빈 mosaic-bg 배경 (잠깐, 인지 안 됨)
3. **핫딜 페이지 자연 등장** ✅ (깜빡임 0)

### 느린 네트워크
1. PWA 열기 + 모바일 데이터 약함
2. 200ms 후 LoadingScreen 표시 ✅ (사용자에게 진행 중 알림)
3. 세션 복원 완료 → 핫딜 페이지

### 첫 방문 (인증 안 됨)
1. PWA 첫 진입
2. 빈 배경 (잠깐) → 로그인 화면 표시 ✅

## CTO 깊은 이유 — 200ms 임계값 선택

웹 UX 연구:
- **인간 인지 임계값 ~100ms**: 즉각적으로 인식
- **100~200ms**: 자연스런 응답
- **200ms+**: 느림 인지 시작
- **1초+**: 진행 표시 필요

= **200ms는 깜빡임 없는 첫 진입 + 안전망의 황금비**.

만약 사용자가 더 안전 선호하시면 `LOADING_GRACE_MS = 300` 도 가능 (단, 약간 느림 인지 가능).

## 메모리 #18 보강 가치 (트랙 C 18번째 catch)

룰 추가:
> **빠른 비동기 상태 변화로 인한 UI 깜빡임 패턴**. 100~200ms 안에 끝나는 로딩 상태는 사용자에게 깜빡임으로 인식. setTimeout grace period로 안전망 + 깜빡임 동시 해결.

이런 깜빡임 패턴은 다른 곳에도 적용 가치:
- 페이지 전환 시 짧은 로딩
- API 응답 빠른 케이스
- 모달 열림/닫힘 빠른 케이스

## 트랙 C 진행

| 단계 | 상태 |
|---|---|
| AuthGate v2 + MosaicLogo + manifest + PNG | ✅ |
| Header v5 + SearchBar v6 | ✅ |
| **AuthGate v3 (깜빡임 제거)** | ✅ |
| 11번가 urlMobile JSON | ⏳ 사용자 작업 |
| 커밋 + 태그 | ⏳ 사용자 작업 |
| YouTube + verification | ⏳ 다음 세션 |

## CTO 회고 — 18번째 catch

이번 catch는 사용자 product 직관의 또 다른 좋은 사례:
- 시각 어색함 즉시 catch
- 본인 해결 제안 ("로고 없이") + CTO 검토 후 안전망 결합
- 5초 fix 가능

= **사용자 + CTO 협업의 best 사례**. 사용자가 단순 "이걸 해줘"가 아니라 product 의도 명확히 전달 → CTO가 의도 + 안전망 균형 검토 → 더 좋은 결과.

> 💡 한 가지 짚어두기 — 이번 catch는 트랙 C **마지막 UX polish**. 사용자가 PWA 첫 진입의 자연스러움을 직접 catch한 건 매우 가치. verification 영상에서도 이 자연스러움이 첫인상으로 작용. 적용/검증 후 진짜 트랙 C 마무리.
