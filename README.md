# PWA fix — `noreferrer` 제거 (외부 링크 referrer 복원)

## 변경 1줄

`src/lib/externalLinkContext.jsx`의 `_open` 함수:

```diff
- window.open(url, "_blank", "noopener,noreferrer");
+ window.open(url, "_blank", "noopener");
```

## 의미

- **`noopener` 유지** — 탭 하이재킹 방지 (보안 필수)
- **`noreferrer` 제거** — Referer 헤더 정상 전달

## 효과

| 항목 | 영향 |
|---|---|
| 지마켓/일부 쇼핑몰 봇 체크 | 빈도 ↓ (referrer 복원으로 정상 트래픽 패턴) |
| 쿠팡 파트너스 affiliate 추적 | 정확화 (보너스) |
| PWA standalone webview 자체 동작 | 변화 없음 (OS 정책) |
| 보안 (탭 하이재킹) | 변화 없음 (`noopener` 유지) |

## 적용

1. zip 풀어서 `src/lib/externalLinkContext.jsx` 1파일 덮어쓰기
2. dev 서버 재시작 권장 (HMR로 자동 반영도 되지만 명시적 재시작이 안전)
3. 검색 결과에서 셀 클릭 → 새 탭 → 지마켓 검색 결과로 정상 진입하는지 확인

## TECH_DEBT — Phase 2 Capacitor 빌드

PWA standalone에서 외부 링크는 Chrome Custom Tabs / SFSafariViewController로 열림 (OS 표준 동작).
"진짜 외부 브라우저 앱으로 강제"는 Phase 2 Capacitor 빌드에서 `Browser.open()` 또는 `App.openUrl()` API로 구현 예정.

이번 fix는 PWA Phase 1 범위 안에서 가능한 최선의 개선.
