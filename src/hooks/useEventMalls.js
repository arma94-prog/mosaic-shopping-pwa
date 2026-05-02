/* =========================================================
 * src/hooks/useEventMalls.js
 * Events 페이지 데이터 훅 — event-malls (GitHub Pages) + user-mall-settings (Supabase) 결합.
 *
 * Phase 1.7 신규 (2026-05):
 *  - SWR로 두 데이터 캐시 + 백그라운드 revalidate (Stale-While-Revalidate).
 *  - applyMallFilters로 최종 categories 계산.
 *  - 최종 categories 변경 시 토스트 발화 (옵션 B — 어느 한쪽이 변해도 1개 토스트).
 *
 * 반환:
 *   categories: applyMallFilters 적용 결과 (로딩 중이면 null)
 *   iconBase:   아이콘 base URL
 *   isLoading:  둘 중 하나라도 첫 로드 중이면 true (캐시 hit 시 false)
 *   error:      어느 한쪽이라도 에러 발생 시
 * ========================================================= */
import { useMemo } from "react";
import useSWR from "swr";
import { fetchEventMalls } from "../lib/eventMalls.js";
import { applyMallFilters } from "../lib/mallFilters.js";
import { useUserMallSettings } from "./useUserMallSettings.js";
import { useChangeNotify } from "./useChangeNotify.js";

export function useEventMalls() {
  // mall 마스터 데이터 — GitHub Pages JSON. 사용자 무관 → key 단일.
  const malls = useSWR("event-malls", fetchEventMalls);
  // user_settings — 사용자별. 내부에서 user.id 분리.
  const settings = useUserMallSettings();

  // 최종 categories 계산 — 둘 다 있어야 의미 있음.
  const categories = useMemo(() => {
    if (!malls.data || !settings.data) return null;
    return applyMallFilters(malls.data, "event", settings.data);
  }, [malls.data, settings.data]);

  // 변경 감지 — 페이지 진입 시점부터. 첫 진입은 토스트 X.
  useChangeNotify(categories, "쇼핑몰 목록이 갱신됨");

  return {
    categories,
    iconBase: malls.data?.iconBase || "",
    isLoading: malls.isLoading || settings.isLoading,
    error: malls.error || settings.error,
  };
}
