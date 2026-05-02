/* =========================================================
 * src/lib/swrConfig.js
 * SWR 전역 설정 + localStorage cache provider.
 *
 * Phase 1.7 신규 (2026-05):
 *  - Stale-While-Revalidate 패턴 도입.
 *  - localStorage 기반 cache provider — 재방문 시 즉시 hydrate.
 *  - revalidateOnFocus: true → TECH_DEBT 🟢 visibilitychange invalidate 자동 해소.
 *
 * 정책:
 *  - TTL 없음 — SWR revalidate가 진실 보장.
 *  - 모듈 레벨 싱글톤 — StrictMode 더블 마운트 방어.
 *  - localStorage quota 초과 시 silent drop (try-catch).
 *  - 직렬화 형태: Array.from(map.entries()) (SWR 공식 패턴).
 *
 * SWR이 캐시할 항목 (Phase 1.7 적용):
 *  - event-malls, search-malls (GitHub Pages JSON)
 *  - user-mall-settings (Supabase user_settings)
 *  - keywords:pinned, search-history (Supabase)
 *
 * SWR 적용 안 함 (의도적 제외):
 *  - bookmarks (가격 정보 신뢰 정책 — 매번 fresh)
 *  - userPrefs (이미 localStorage 즉시 read)
 * ========================================================= */

const STORAGE_KEY = "mosaic-swr-cache";

let _map = null;
let _registered = false;

/**
 * SWR cache provider — localStorage hydrate + 모듈 레벨 싱글톤.
 * StrictMode에서 SWRConfig가 더블 마운트되어도 Map / listener는 1번만 생성.
 */
function getOrCreateCacheMap() {
  if (_map) return _map;

  // Hydrate from localStorage
  let initial = [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        initial = parsed;
      }
    }
  } catch (_) {
    // Corrupt cache → start fresh.
  }
  _map = new Map(initial);

  // Persist on unload (1회만 등록)
  if (!_registered && typeof window !== "undefined") {
    _registered = true;
    window.addEventListener("beforeunload", persistCache);
    // PWA / iOS Safari에서 beforeunload가 항상 발동하지 않으므로 visibilitychange 보강.
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") persistCache();
    });
  }

  return _map;
}

function persistCache() {
  if (!_map) return;
  try {
    const arr = Array.from(_map.entries());
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  } catch (_) {
    // Quota exceeded or serialization failure → silent drop.
  }
}

/**
 * SWRConfig 전역 옵션.
 *
 * - revalidateOnFocus: true → 탭 복귀 시 자동 revalidate (visibilitychange 부채 해소).
 * - revalidateOnReconnect: true → 네트워크 복구 시 자동 revalidate.
 * - dedupingInterval: 2000ms → 같은 key 중복 fetch 방지 (검색어 입력 등).
 * - errorRetryCount: 3 → 일시 네트워크 오류 자동 재시도.
 */
export const swrConfigValue = {
  provider: getOrCreateCacheMap,
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  dedupingInterval: 2000,
  errorRetryCount: 3,
  errorRetryInterval: 5000,
};
