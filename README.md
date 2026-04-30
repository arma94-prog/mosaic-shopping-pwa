# 트랙 C 마지막 fix 묶음 — PWA 카테고리명 + PC 옵션 페이지 stale UI

## 사용자 catch 2건 — 모두 정확

### 1. PWA 카테고리명 변경 미반영 🐛

**진단 정확** — PWA `applyCustomCatNames`가 mode prefix 누락:

| 측 | 키 형식 |
|---|---|
| PC sidepanel.js (line 585) | `"event:fashion"` (mode prefix 포함) |
| PWA mallFilters.js v1 (이전) | `"fashion"` (mode prefix 누락) ❌ |
| PWA mallFilters.js v2 (이번) | `mode + ":" + cat.key` ✅ |

= **PC가 `customNames["event:fashion"]` 저장하는데 PWA가 `customNames["fashion"]` 찾음** → 매핑 영원히 실패.

### 2. PC 옵션 페이지 stale UI 🐛

**사용자 catch 정확** — 옵션 페이지 새로고침 안 하면 토큰 만료 후에도 "연결됨" 표시.

**원인 분석**:
- `refreshMobileSyncUI`가 `MosaicAuth.isConnected()` 사용
- `isConnected()` = storage 존재 여부만 체크 (실효성 X)
- 토큰 만료 + refresh 실패 후 `_clearSession` 발화까지 stale
- 옵션 페이지가 한번 열리면 갱신 trigger 없음

## CTO fix12-A 결정

가드 #2 SoC — 두 트리거로 옵션 페이지 stale UI 보호:

### Trigger 1: storage.onChanged
`mosaicAuthSession` 키 변경 감지 → UI 즉시 갱신.
PC fix3 정책으로 `_clearSession()` 발화 시 옵션 페이지가 자동으로 "미연결" 반영.

### Trigger 2: visibilitychange
옵션 페이지 visible 전환 시 UI 재검증.
사용자가 옵션 페이지 → 다른 탭 → 다시 옵션 페이지 사이클에서 정확한 상태.

### 추가 강화: getActiveSession 사용
- 이전: `isConnected()` (storage 존재만 체크)
- 이후: `getActiveSession()` (만료 자동 refresh + 실패 시 null)
- = 실제 유효성 검증 + 잠재적 만료까지 catch

## 변경 파일 (2파일)

### PWA: `src/lib/mallFilters.js` v3

```js
// 이전
export function applyCustomCatNames(categories, settings) {
  const customLabel = customNames[cat.key];  // ❌ mode 누락
}

// 이후
export function applyCustomCatNames(categories, mode, settings) {
  const catNameKey = mode + ":" + cat.key;
  const customLabel = customNames[catNameKey];  // ✅ PC 정확 매핑
}

// applyMallFilters 호출 시점
categories = applyCustomCatNames(categories, mode, settings);  // mode 전달
```

### PC: `options.js` v2 (fix12-A)

3가지 변경:
1. `refreshMobileSyncUI`: `isConnected` → `getActiveSession`
2. `attachHandlers`: `chrome.storage.onChanged` 리스너 (mosaicAuthSession 감지)
3. `attachHandlers`: `visibilitychange` 리스너 (visible 시 재검증)

## 적용

zip 풀어서 2파일 각 저장소에 덮어쓰기:

| 파일 | 저장소 | 위치 |
|---|---|---|
| `src/lib/mallFilters.js` | mosaic-shopping-pwa | src/lib/ |
| `options.js` | mosaic-shopping-extension | root |

## 검증 시나리오

### PWA 카테고리명 검증
1. PC 옵션 페이지 → 이벤트 카테고리 "직구" → "해외직구"로 라벨 변경
2. supabase user_settings.custom_cat_names 갱신 확인 (이미 정상)
3. PWA 핫딜 모음 페이지 진입 → "해외직구" 표시 ✅

### PC 옵션 페이지 stale UI 검증
1. 옵션 페이지 열기 (인증 정상)
2. SW console에서 `await self.MosaicAuth.disconnect()` 실행 (토큰 강제 제거)
3. 옵션 페이지 자동 "미연결 상태" 표시 ✅ (storage.onChanged trigger)

또는:
1. 옵션 페이지 열기 (인증 정상)
2. 다른 탭으로 전환 + 시간 지나서 토큰 만료
3. 옵션 페이지 다시 visible
4. 자동 "미연결 상태" 표시 ✅ (visibilitychange + getActiveSession trigger)

## 사용자 즉시 작업 (적용 전)

옵션 페이지에서 **"연결 해제" 클릭 → 다시 "Google 계정 연동"** → 새 OAuth 사이클로 정상화.
이후 SW console:
```js
await self.MosaicSync.syncToBackend()  // → { ok: true } 기대
```

## "왜 자꾸 끊기는지" — 정밀 진단

가드 #5 시뮬레이션 + 사용자 패턴 분석:

| 가설 | 확률 | 근거 |
|---|---|---|
| **A**. PWA 추가 로그인이 PC refresh token rotation trigger | ⭐⭐⭐ | Supabase 1회용 정책 |
| **B**. SW life cycle race (옵션 페이지 + SW 동시 갱신) | ⭐⭐ | Issue #18981 |
| **C**. fix3 정책 일시 4xx 과잉 처리 | ⭐ | 401/403도 _clearSession |

가장 의심: **트랙 C 동안 PWA에서 여러 번 로그인** (auth recovery 작업, 시크릿 창 디버깅 등). 매 로그인이 PC refresh token rotation 가능성.

### CTO 솔직 평가 — fix3 정책 유지 권장

fix3 변경 시 부작용 위험 (invalid_grant 5분 retry 버그 회귀). **fix12-A로 stale UI 보호** + **사용자가 인증 끊김 즉시 인식** 가능 = 충분.

만약 사용자가 "여전히 자주 끊김" 경험하면 Phase 2에 fix3 정밀화 (401/403 transient retry) 검토.

## TECH_DEBT 추가 (PC 측)

PWA TECH_DEBT.md에 추가 항목 권장:
> **#4. fix3 정책 정밀화 (Phase 2 후순위)**: 일시 4xx (401/403)도 transient retry로 처리 검토. 현재는 모든 4xx → _clearSession. 사용자 catch 2026-04-30 발견 — PWA 추가 로그인 시 PC 토큰 rotation으로 인한 invalid_grant 가능성. fix12-A로 stale UI 보호 후 충분히 인식 가능. Phase 2 양방향 sync 작업 시점에 재평가.

## 트랙 C 진행

| 단계 | 상태 |
|---|---|
| PWA seamless 1~4 | ✅ |
| fix5~11 | ✅ |
| 디자인 polish + 아이콘 | ✅ |
| supabase audit + fix11 (d) | ✅ |
| 핫딜 모음 페이지 (c) | ✅ |
| auth recovery (PWA) | ✅ |
| mall filter (PC 정합) | ✅ |
| realtime sync | ✅ |
| custom icon | ✅ |
| TECH_DEBT 정리 + 메모리 통합 (b) | ✅ |
| **PWA catnames + PC fix12-A** | ⏳ 적용 중 |
| 11번가 urlMobile JSON | ⏳ 사용자 작업 |
| 커밋 (PC + PWA) + 태그 | ⏳ 사용자 작업 |
| YouTube + verification | ⏳ 다음 세션 |

## 메모리 통합 가치 (#22 강화)

룰 강화:
> **사용자 의구심 표현 + product 직관은 시스템 정책 의심 trigger**. 단발성 fix가 아니라 정책 자체 (캐싱/세션/sync) 재검토. 12 catch 시리즈 학습 — 사용자가 "왜 자꾸", "이상하게 자주", "분명히 했는데" 같은 표현 시점에 즉각 시스템 레벨 분석.

이번 fix는 **트랙 C 마지막 catch** — 14번째 사용자 catch 사례. b 단계 메모리 통합 후 추가 룰 가치.
