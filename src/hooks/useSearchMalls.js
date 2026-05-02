/* =========================================================
 * src/hooks/useSearchMalls.js
 * SearchResults 데이터 훅 — search-malls (GitHub Pages) + user-mall-settings (Supabase) 결합.
 *
 * Phase 1.7 신규 (2026-05):
 *  - useEventMalls와 동일 패턴, mode = "search"만 다름.
 *  - 검색어(query)는 본 훅 외부에서 처리 — handleClick에서 buildSearchUrl 호출.
 *    즉, 같은 mall data 캐시를 query 무관하게 공유 (효율적).
 *
 * 반환: useEventMalls와 동일 인터페이스.
 * ========================================================= */
import { useMemo } from "react";
import useSWR from "swr";
import { fetchSearchMalls } from "../lib/searchMalls.js";
import { applyMallFilters } from "../lib/mallFilters.js";
import { useUserMallSettings } from "./useUserMallSettings.js";
import { useChangeNotify } from "./useChangeNotify.js";

export function useSearchMalls() {
  const malls = useSWR("search-malls", fetchSearchMalls);
  const settings = useUserMallSettings();

  const categories = useMemo(() => {
    if (!malls.data || !settings.data) return null;
    return applyMallFilters(malls.data, "search", settings.data);
  }, [malls.data, settings.data]);

  useChangeNotify(categories, "쇼핑몰 목록이 갱신됨");

  return {
    categories,
    iconBase: malls.data?.iconBase || "",
    isLoading: malls.isLoading || settings.isLoading,
    error: malls.error || settings.error,
  };
}
