/* =========================================================
 * src/hooks/useSearchMallsPrefetch.js
 * 검색몰 silent prefetch — SearchResults 진입 대비 백그라운드 캐시 데우기.
 *
 * Phase 1.7 polish2 신규 (2026-05):
 *  - 사용자 catch: SearchResults는 검색어 입력 시점에 mount → preload가 늦음.
 *    SearchHome 진입 시점에 미리 prefetch → 사용자가 입력하는 1-2초 동안
 *    백그라운드로 mall data + 아이콘 모두 캐시.
 *
 * useSearchMalls와의 차이:
 *  - 같은 SWR key ("search-malls") → 캐시 공유.
 *  - useChangeNotify 호출 X → 토스트 발화 X (silent).
 *  - applyMallFilters도 호출 X → SearchHome에 불필요한 계산 제거.
 *
 * 사용처: Search.jsx의 SearchHome 컴포넌트.
 *   향후 AppShell에서도 호출 가능 — Bookmarks → 키워드 직접 진입 케이스 커버용.
 * ========================================================= */
import { useEffect } from "react";
import useSWR from "swr";
import { fetchSearchMalls, buildIconUrl } from "../lib/searchMalls.js";

export function useSearchMallsPrefetch() {
  // useSearchMalls와 동일 key → 캐시 슬롯 공유.
  // SearchResults 진입 시 useSearchMalls가 즉시 캐시 hit.
  const { data } = useSWR("search-malls", fetchSearchMalls);

  // 아이콘 preload — useEventMalls/useSearchMalls와 동일 패턴.
  useEffect(() => {
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
  }, [data]);
}
