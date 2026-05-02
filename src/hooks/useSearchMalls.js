/* =========================================================
 * src/hooks/useSearchMalls.js
 * SearchResults 데이터 훅 — search-malls + user-mall-settings 결합.
 *
 * v2 변경 (2026-05, Phase 1.7 polish):
 *  - 🆕 아이콘 백그라운드 preload — useEventMalls와 동일 패턴.
 *    효과: 다음 검색 결과 진입 시 캐시 hit → 순차 깜빡임 제거.
 *
 * Phase 1.7 (유지):
 *  - useEventMalls와 동일 구조, mode = "search".
 *  - 검색어(query)는 본 훅 외부에서 처리.
 * ========================================================= */
import { useEffect, useMemo } from "react";
import useSWR from "swr";
import { fetchSearchMalls, buildIconUrl } from "../lib/searchMalls.js";
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

  // v2: 아이콘 preload — useEventMalls와 동일 정책.
  useEffect(() => {
    const data = malls.data;
    if (!data?.iconBase || !data.categories) return;
    const base = data.iconBase;
    for (const cat of data.categories) {
      for (const item of cat.items || []) {
        if (!item.icon) continue;
        const url = buildIconUrl(base, item.icon);
        if (!url) continue;
        const img = new Image();
        img.src = url;
      }
    }
  }, [malls.data]);

  return {
    categories,
    iconBase: malls.data?.iconBase || "",
    isLoading: malls.isLoading || settings.isLoading,
    error: malls.error || settings.error,
  };
}
