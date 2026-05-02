/* =========================================================
 * src/hooks/useEventMalls.js
 * Events 페이지 데이터 훅 — event-malls + user-mall-settings 결합.
 *
 * v2 변경 (2026-05, Phase 1.7 polish):
 *  - 🆕 아이콘 백그라운드 preload — mall data 도착 직후 모든 mall 아이콘을
 *    `new Image()`로 fetch. 브라우저 HTTP 캐시 데우기.
 *    효과: 다음 Events 진입 시 캐시 hit → 순차 깜빡임 제거.
 *    SW 캐시 강화는 vite.config.js 단계에서 진행.
 *
 * Phase 1.7 (유지):
 *  - SWR로 두 데이터 캐시 + 백그라운드 revalidate.
 *  - applyMallFilters로 최종 categories 계산.
 *  - 최종 categories 변경 시 토스트 발화 (옵션 B).
 * ========================================================= */
import { useEffect, useMemo } from "react";
import useSWR from "swr";
import { fetchEventMalls, buildIconUrl } from "../lib/eventMalls.js";
import { applyMallFilters } from "../lib/mallFilters.js";
import { useUserMallSettings } from "./useUserMallSettings.js";
import { useChangeNotify } from "./useChangeNotify.js";

export function useEventMalls() {
  const malls = useSWR("event-malls", fetchEventMalls);
  const settings = useUserMallSettings();

  const categories = useMemo(() => {
    if (!malls.data || !settings.data) return null;
    return applyMallFilters(malls.data, "event", settings.data);
  }, [malls.data, settings.data]);

  useChangeNotify(categories, "쇼핑몰 목록이 갱신됨");

  // v2: 아이콘 preload — 데이터 도착 직후 백그라운드 fetch.
  // new Image()로 로드 → 브라우저 HTTP 캐시 데우기 (디스크 캐시).
  // categories(필터링 후) 대신 malls.data.categories(원본 마스터) 기준 — filter로 가려진 mall도
  // 사용자가 PC에서 enable 시 즉시 캐시 hit 가능.
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
