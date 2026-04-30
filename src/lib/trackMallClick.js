/* =========================================================
 * src/lib/trackMallClick.js
 * mall click 시 이벤트 + People $add 통합 트랙.
 *
 * PC sidepanel.js의 mall click 흐름 정합:
 *  - event_mall_click → peopleAdd({total_event_clicks: 1})
 *  - search_mall_click → peopleAdd({total_search_clicks: 1})
 *  - bookmark_nav (peopleAdd 없음)
 *  - 추가: url이 coupang.com이면 coupang_hop_triggered + peopleAdd({total_coupang_hops})
 *
 * 사용:
 *   trackMallClick({ context: "event", mall, category });
 *   trackMallClick({ context: "search", mall, query, category });
 *   trackMallClick({ context: "bookmark", mall, query, daysSinceSaved });
 * ========================================================= */
import { analytics } from "./analytics";

/** PC normalizeMallKey 정합 — host 우선, 점→underscore */
function normalizeMallKey(mallName, mallHost) {
  if (mallHost) {
    // coupang.com → coupang_com
    return String(mallHost).replace(/\./g, "_").toLowerCase();
  }
  if (mallName) {
    return String(mallName).replace(/\s+/g, "").toLowerCase();
  }
  return "";
}

/** url이 쿠팡 어필리에이트인지 판정 */
function isCoupangUrl(url) {
  if (!url) return false;
  try {
    const host = new URL(url).hostname.toLowerCase();
    return /(?:^|\.)coupang\.com$/.test(host) || host === "link.coupang.com";
  } catch (_) {
    return false;
  }
}

/**
 * mall click 통합 트랙.
 *
 * @param {object} args
 * @param {"event"|"search"|"bookmark"} args.context
 * @param {object} args.mall  { name, host, mall_id, mall_name, url, ... }
 * @param {string} [args.query]  search/bookmark context 시
 * @param {string} [args.category]  event/search context 시
 * @param {number} [args.daysSinceSaved]  bookmark context 시
 */
export function trackMallClick({ context, mall, query, category, daysSinceSaved }) {
  if (!mall) return;

  // mall 객체 정규화 — Events.jsx (mall.name, mall.host), BookmarkItem.jsx (mall_name, mall_id)
  const mallName = mall.name || mall.mall_name || mall.displayName || "";
  const mallHost = mall.host || mall.mall_id || ""; // mall_id는 도메인 문자열 (PC bookmark schema)
  const mallKey = normalizeMallKey(mallName, mallHost);
  const url = mall.url || "";

  const baseProps = {
    mall_key: mallKey,
    mall_name: mallName,
  };

  // 1. context별 메인 이벤트 + peopleAdd
  if (context === "event") {
    analytics.track("event_mall_click", { ...baseProps, category: category || "" });
    analytics.peopleAdd({ total_event_clicks: 1 });
  } else if (context === "search") {
    analytics.track("search_mall_click", {
      ...baseProps,
      query: query || "",
      category: category || "",
    });
    analytics.peopleAdd({ total_search_clicks: 1 });
  } else if (context === "bookmark") {
    analytics.track("bookmark_nav", {
      ...baseProps,
      query: query || "",
      days_since_saved: daysSinceSaved ?? null,
    });
    // PC bookmark_nav에는 peopleAdd 없음 (sidepanel.js 2712 정합)
  }

  // 2. coupang hop 추가 트랙 (url이 쿠팡일 때)
  if (isCoupangUrl(url)) {
    analytics.track("coupang_hop_triggered", {
      ...baseProps,
      query: query || "",
      category: category || "",
    });
    analytics.peopleAdd({ total_coupang_hops: 1 });
  }
}
