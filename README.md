# PWA mall filter — PC user_settings 정합

## 사용자 catch — 진단 정확

> "이벤트/핫딜 사이트와 검색 결과 사이트에서 고객이 on/off한게 supabase에는 들어가 있는거 같은데, 화면에서 적용이 안된것 같아"

**진단 정확** — PWA의 Events.jsx + SearchResults.jsx **둘 다 user_settings 자체를 fetch 안 함**. PC에서 OFF한 mall/카테고리가 PWA에 그대로 표시.

## 진단 검증

| 컴포넌트 | user_settings fetch | disabled_malls 필터 | custom_malls 병합 |
|---|---|---|---|
| Events.jsx (v3 이전) | ❌ | ❌ | ❌ |
| SearchResults.jsx (v9 이전) | ❌ | ❌ | ❌ |
| **PC sidepanel.js** | ✅ chrome.storage 직접 | ✅ filterDisabled() | ✅ mergeWithCustom() |

**PC supabase 미러링은 정상** (supabase-sync.js audit 완료):
- `user_settings.disabled_malls.event` ✅
- `user_settings.disabled_malls.search` ✅
- `user_settings.disabled_cats.event` ✅
- `user_settings.disabled_cats.search` ✅
- `user_settings.custom_event_malls` ✅
- `user_settings.custom_search_malls` ✅
- `user_settings.custom_cat_names` ✅

= **데이터는 supabase에 정확히 있는데 PWA가 안 읽었음**.

## CTO 결정 — 즉시 fix (TECH_DEBT 안 미룸)

**근거**:
1. ✅ verification 영상 안전성 (PC + PWA 같은 mall 표시 자연스러움)
2. ✅ 사용자 PC 설정이 PWA에 즉시 반영 (메모리 #21 정합)
3. ✅ 코드 작업 작음 (~30분, 1 헬퍼 + 2 컴포넌트)

## 변경 파일 (3파일)

### 1. `src/lib/mallFilters.js` (신규)

PC sidepanel.js의 두 함수 정확 매핑 + Supabase user_settings fetch:

| 함수 | PC 매핑 | 책임 |
|---|---|---|
| `fetchUserSettings()` | (chrome.storage 직접) → Supabase fetch + 메모리 캐싱 | user_settings JSONB 읽기 |
| `mergeWithCustom()` | sidepanel.js line 440 정확 매핑 | 원격 + 사용자 커스텀 mall 병합 |
| `filterDisabled()` | sidepanel.js line 388 정확 매핑 | disabled mall/cat 제거 |
| `applyCustomCatNames()` | sidepanel.js custom_cat_names 매핑 | 사용자 정의 카테고리 라벨 |
| `applyMallFilters()` | sidepanel.js renderCurrent() 정확 매핑 | 통합 파이프라인 (병합→필터→라벨) |

**핵심 키 형식 (PC 정확 매핑)**:
```js
disabled_cats[mode][cat.key] = true                        // 카테고리 OFF
disabled_malls[mode][cat.key + ":" + item.name] = true     // mall OFF (colon-separated!)
```

### 2. `src/pages/Events.jsx` (v4)

이전 (v3): `mosaic-events.json` fetch만 → 모든 mall 표시
이후 (v4): events JSON + user_settings 병렬 fetch → `applyMallFilters("event")` 적용

```js
const [data, settings] = await Promise.all([
  fetchEventMalls(),
  fetchUserSettings(),
]);
const categories = applyMallFilters(data, "event", settings);
```

### 3. `src/components/SearchResults.jsx` (v10)

같은 패턴, mode = "search":

```js
const [data, settings] = await Promise.all([
  fetchSearchMalls(),
  fetchUserSettings(),
]);
const categories = applyMallFilters(data, "search", settings);
```

## 적용

zip 풀어서 3파일 PWA 폴더에 추가:
- `src/lib/mallFilters.js` (새 파일)
- `src/pages/Events.jsx` (덮어쓰기)
- `src/components/SearchResults.jsx` (덮어쓰기)

HMR 자동 반영 → 핫딜 모음 / 검색결과 둘 다 PC 설정 반영.

## 검증 시나리오

### 1. 기본 작동
- PC에서 모든 mall 켜진 상태 → PWA에 모든 mall 표시 ✅

### 2. mall OFF 시나리오
- PC 옵션 페이지에서 "G마켓" OFF
- supabase user_settings에 `disabled_malls.search."종합몰:G마켓" = true` 미러링됨
- PWA 검색결과에서 G마켓 셀 사라짐 ✅
- PWA 핫딜 모음의 G마켓도 사라짐 (있다면) ✅

### 3. 카테고리 OFF 시나리오
- PC에서 "디지털" 카테고리 OFF
- supabase user_settings에 `disabled_cats.search."디지털" = true`
- PWA 검색결과에서 "디지털" 카테고리 자체 사라짐 ✅

### 4. 커스텀 mall 시나리오
- PC에서 "내 자주가는 쇼핑몰" 추가 (category="종합몰")
- supabase `custom_search_malls`에 미러링
- PWA 검색결과의 종합몰 카테고리 끝에 사용자 mall 추가 표시 ✅

### 5. 카테고리 라벨 변경 시나리오
- PC에서 "직구" → "해외직구" 라벨 변경
- supabase `custom_cat_names."직구" = "해외직구"`
- PWA에 "해외직구"로 표시 ✅

## TECH_DEBT 4 일부 해결

이 fix는 **d 단계 audit의 TECH_DEBT 4** (user_settings 5개 키 누락) 중 6개 키는 **이미 미러링되고 있었음** (custom_event/search_malls, disabled_malls, disabled_cats, custom_cat_names, default_mall) — PWA가 안 읽었을 뿐.

남은 5개 키 (openMode, bmExpandCount, priceRefreshRecentN, autoRefreshFreq, showTips)는 Phase 2에서 처리.

## 캐싱 정책

`fetchUserSettings()` 모듈 레벨 메모리 캐싱:
- 페이지 새로고침 전까진 1회만 fetch
- mall 추가/삭제는 PC에서만 가능 = 실시간 변경 X = 캐싱 안전
- Phase 2 양방향 sync에서 모바일도 mall 추가 가능 시점에 invalidation 정책 추가 필요 (TECH_DEBT)

## 회고 — 메모리 #18 강화 (10번째 사례)

이번 catch는 **사용자 데이터 정합성 직관**이 정확한 사례:
- "supabase에 있는데 화면에 안 나오는 것 같아" 한 줄 → 30분 작업으로 해결
- **PC 미러링 정상 + PWA 미사용** 패턴 = audit으로 빨리 catch

룰 강화 가치:
> **PWA Phase 1 작업 시 'PC가 보유한 사용자 설정을 PWA가 읽고 적용하는가?'를 화면별 체크리스트로 검증**. 누락 시 사용자 PC product 결정이 PWA에 무효 = 정합성 어긋남.

다음 라운드 (b 단계 커밋 시점)에 메모리 통합 후보로.

## 트랙 C 진행

| 단계 | 상태 |
|---|---|
| PWA seamless 1~4 | ✅ |
| fix5~11 | ✅ |
| 디자인 polish + 아이콘 | ✅ |
| supabase audit + fix11 (d) | ✅ |
| 핫딜 모음 페이지 (c) | ✅ v3 |
| auth recovery | ✅ |
| **mall filter (PC 설정 정합)** | ⏳ 적용 중 |
| 11번가 urlMobile JSON | ⏳ 사용자 작업 |
| TECH_DEBT 정리 + 메모리 통합 (b) | ⏳ |
| YouTube + verification | ⏳ |
| pwa-v0.2.0 태그 + 커밋 | ⏳ |

## CTO 짚어두기

이번 catch는 **트랙 C 마무리 시점에 가장 중요한 데이터 정합성 fix** 중 하나. 만약 그대로 verification 영상 진행했으면:
- PC 사이드패널 캡쳐: G마켓 OFF (사용자 설정)
- PWA 모바일 캡쳐: G마켓 표시됨 (필터 미적용)
- = 시각 불일치 → reviewer "동일 앱 맞나?" 의심 가능

사용자 catch가 **verification 안전성 보장**.

다음 권장 순서: 적용/검증 → b 단계 (커밋 + 메모리 통합 + verification 영상 단계).
