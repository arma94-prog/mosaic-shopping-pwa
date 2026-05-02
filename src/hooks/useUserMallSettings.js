/* =========================================================
 * src/hooks/useUserMallSettings.js
 * Supabase user_settings SWR 훅 — Events / SearchResults 공유.
 *
 * Phase 1.7 신규 (2026-05):
 *  - 사용자 인증 후 본인 row를 SWR로 캐시.
 *  - cache key에 user.id 포함 → 계정 전환 시 자동 분리 격리.
 *  - 본 훅 자체는 토스트 발화 X — 호출처(useEventMalls/useSearchMalls)에서
 *    최종 categories를 useChangeNotify에 전달 (옵션 B 정책).
 *
 * 사용처: useEventMalls, useSearchMalls 내부에서 호출.
 *   직접 페이지에서 호출하지 말고, 위 두 훅을 통해 사용 권장.
 * ========================================================= */
import useSWR from "swr";
import { useAuth } from "../lib/auth";
import { fetchUserSettings } from "../lib/mallFilters.js";

export function useUserMallSettings() {
  const { user } = useAuth();
  // user 없을 때는 key=null → SWR이 fetch skip.
  const key = user?.id ? `user-mall-settings:${user.id}` : null;
  return useSWR(key, fetchUserSettings);
}
