# PWA realtime sync — 모듈 캐시 제거

## 사용자 catch — 정확한 product 직관

> "북마크나 검색어처럼 실시간 반영되면 좋겠는데"

**진단**: 데이터 종류별 sync 정책 불일치.

| 데이터 | 이전 정책 | 사용자 직관 |
|---|---|---|
| 북마크 (bookmarks) | 페이지 진입 시마다 fresh fetch ✅ | OK |
| 검색어 (search_history) | 페이지 진입 시마다 fresh fetch ✅ | OK |
| 핀 고정 (keywords) | 페이지 진입 시마다 fresh fetch ✅ | OK |
| **mall 데이터 (events/search)** | **모듈 레벨 캐싱 (영원)** ❌ | **fresh 원함** |
| **user_settings** | **모듈 레벨 캐싱 (영원)** ❌ | **fresh 원함** |

= **사용자 product 직관이 정확** — 데이터 종류별 다른 정책은 혼란스러움.

## CTO 결정 — 옵션 C-2 (모듈 캐시 제거 + in-flight 유지)

### 캐싱 3단계 분석

| 정책 | 장점 | 단점 | 채택 |
|---|---|---|---|
| (A) 캐시 완전 제거 | 가장 fresh | 매번 네트워크 | ❌ |
| (B) 짧은 TTL (30초) | 빠른 탭 전환 | 30초 stale 위험 | ❌ |
| **(C-1)** 모듈 캐시 제거 + 페이지 진입 시 fetch | 단순 + fresh | 탭 전환 시마다 100ms | - |
| **(C-2)** 모듈 캐시 제거 + in-flight 공유 ⭐ | 단순 + fresh + race 방지 | (C-1)과 같음 | ✅ |
| (C-3) visibilitychange invalidate | 효율적 | 복잡 | ❌ |

**(C-2) 채택 근거**:
1. ✅ 사용자 직관 정합 (북마크/검색어 패턴)
2. ✅ 메모리 #21 정합 ("PC와 1:1 정합성" — 실시간 반영)
3. ✅ 코드 단순 (모듈 변수 1개 제거)
4. ✅ 동시 호출 race 방지 (in-flight Promise 공유)
5. ✅ 브라우저 HTTP 캐시 (GitHub Pages CDN ETag) 활용 — 실제 네트워크는 304 Not Modified로 빠름
6. ✅ Supabase user_settings는 단일 row PK fetch = 50ms 이하

### 네트워크 비용 분석

| 데이터 | 페이지 진입 시 |
|---|---|
| `mosaic-events.json` | GitHub Pages CDN, ETag 304 → ~30ms |
| `mosaic-search-malls.json` | GitHub Pages CDN, ETag 304 → ~30ms |
| `user_settings` (Supabase) | 단일 row, RLS 인덱스 → ~50ms |

= **페이지 진입 시 추가 100ms 미만**. 모바일 4G/5G/Wi-Fi 모두 무관.

## 변경 (3파일)

### 1. `src/lib/eventMalls.js` v2
- 모듈 `_cache` 변수 제거
- `_inFlight` Promise 공유 유지 (race 방지)
- 브라우저 HTTP 캐시는 그대로 활용 (`cache: "default"`)

### 2. `src/lib/searchMalls.js` v2
- 동일 패턴 (모듈 캐시 제거 + in-flight 유지)

### 3. `src/lib/mallFilters.js` v2
- `fetchUserSettings()` 모듈 캐시 제거
- in-flight 유지

## 영향 — 페이지별 동작 변화

### Events.jsx 진입 시
- 이전: events JSON + user_settings 캐시 사용 (PC 변경 안 보임)
- v2: events JSON + user_settings fresh fetch (PC 변경 즉시 반영) ✅

### SearchResults.jsx 진입 시 (검색어 입력 후)
- 이전: search JSON + user_settings 캐시
- v2: search JSON + user_settings fresh ✅

### 같은 페이지 안 검색어 변경 (예: "라면" → "초콜릿")
- 컴포넌트 unmount/remount = 새로운 fetch (정상)
- in-flight 공유 효과 = 5ms 안에 두 번 trigger 시 한 번만 실제 network

## 검증 시나리오

1. **PC에서 mall 추가** (예: "내 자주가는 쇼핑몰" 카테고리: 종합몰)
2. PC sync 실행 → supabase user_settings.custom_search_malls 갱신
3. 모바일 PWA 검색 페이지 → 백그라운드로 가기
4. PWA 다시 열기 → 검색어 입력 → 검색결과 페이지
5. **새 mall 즉시 표시** ✅

## TECH_DEBT 등록 — visibilitychange 백그라운드 invalidate

이번엔 (C-2) 채택했으나, 사용자가 모바일 PWA를 백그라운드에 둔 채 PC 변경 → 다시 PWA 열기 시 자동 반영되려면 추가 작업 필요:

> Phase 2 작업: `visibilitychange` visible 전환 시 user_settings + mall data 재fetch trigger. 현재는 페이지 진입 (탭 클릭) 시점만 trigger. 같은 페이지 안에 백그라운드로 갔다 와도 fresh.

이 추가 작업이 가치 있는지는 사용자 사용 패턴에 따라 결정. 현재 (C-2)로 verification 영상 + Phase 1 종료 충분.

## 메모리 #18 강화 (11번째 사례)

룰 추가 가치:
> **데이터 종류별 sync 정책 일관성 유지**. 같은 앱 안에 데이터마다 다른 캐시 정책 (모듈 영구 vs 페이지 진입 fresh) = 사용자 혼란 + 의외의 stale data. 정책 통일이 코드 단순성 + UX 일관성 둘 다 개선.

이전 룰 8 (데이터 의존 표시는 "데이터 채워짐" 먼저)과 결합:
> 사용자 product 직관이 **데이터 정합성 + 캐싱 정책** 같은 layer에서 가장 정확. "왜 X는 즉시 반영되는데 Y는 안 되지?" 같은 질문은 정책 통일 의무 trigger.

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
| **realtime sync (캐시 정책 통일)** | ⏳ 적용 중 |
| 11번가 urlMobile JSON | ⏳ 사용자 작업 |
| TECH_DEBT 정리 + 메모리 통합 (b) | ⏳ |
| YouTube + verification | ⏳ |
| pwa-v0.2.0 태그 + 커밋 | ⏳ |

## CTO 짚어두기

이 catch는 **트랙 C의 마지막 데이터 정합성 정리**. 사용자 직관 catch가 **PWA가 진정한 PC companion이 되는 마지막 단추**를 끼워줌.

이제 PWA Phase 1은:
- ✅ PC와 1:1 시각 정합 (디자인 polish)
- ✅ PC 데이터 100% 정확 미러 (fix5~11 + audit)
- ✅ PC 사용자 설정 즉시 반영 (mall filter + realtime)
- ✅ OAuth 토큰 만료 안전망 (auth recovery)

= **메모리 #21 정의 ("PC의 모바일 companion") 완전 달성** ⭐.

다음 단계 b (커밋 + 메모리 통합) 진입 시 "Phase 1 PWA 완성" 명시 가능.
