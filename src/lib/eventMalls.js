/* =========================================================
 * src/lib/eventMalls.js
 * 이벤트 (핫딜) mall 마스터 데이터 fetch.
 *
 * v2 변경 (2026-04-30, 사용자 catch):
 *  - 🐛 모듈 캐싱 제거 — 페이지 진입 시마다 fresh fetch.
 *    이전: 첫 fetch 후 캐싱 → PC events JSON 업데이트 후에도 PWA 새로고침 필요.
 *    이후: 북마크/검색어와 같이 페이지 진입 시 fresh fetch.
 *  - in-flight Promise 공유 유지 (race 방지).
 *  - 브라우저 HTTP 캐시 (Cache-Control)는 그대로 활용 — GitHub Pages CDN.
 *
 * 데이터 소스: PC 사이드패널과 공유 — `mosaic-events.json`.
 * 구조: { iconBase, categories: [{ key, label, items: [{ icon, name, url, urlMobile? }] }] }
 *
 * Phase 2:
 *  - mode = "event" 시점에 mall_filters와 통합.
 * ========================================================= */

const SOURCE_URL =
  "https://arma94-prog.github.io/mosaic-shopping/mosaic-events.json";

let _inFlight = null;

export async function fetchEventMalls() {
  if (_inFlight) return _inFlight;

  _inFlight = (async () => {
    try {
      // cache: "default" — 브라우저 HTTP 캐시 활용 (GitHub Pages ETag 기반 304 가능).
      // 모듈 캐싱은 안 하지만 브라우저 디스크 캐시는 활용.
      const res = await fetch(SOURCE_URL, { cache: "default" });
      if (!res.ok) {
        throw new Error(`이벤트 데이터 로드 실패 (HTTP ${res.status})`);
      }
      const data = await res.json();
      if (!data || !Array.isArray(data.categories)) {
        throw new Error("이벤트 데이터 형식 오류");
      }
      return data;
    } finally {
      _inFlight = null;
    }
  })();

  return _inFlight;
}

/**
 * 아이콘 절대 URL 빌드 (searchMalls와 동일 정책).
 */
export function buildIconUrl(iconBase, iconFile) {
  if (!iconBase || !iconFile) return "";
  const base = iconBase.endsWith("/") ? iconBase : iconBase + "/";
  return base + iconFile;
}

/**
 * mall의 이벤트 URL 결정 — 모바일 환경에서 urlMobile 우선 (사용자 catch).
 * 11번가 등 PC 페이지를 모바일에서 띄우는 mall 보호.
 */
export function pickEventUrl(mall) {
  if (!mall) return "";
  const isMobile = /iPhone|iPad|iPod|Android/i.test(
    typeof navigator !== "undefined" ? navigator.userAgent : ""
  );
  return (isMobile && mall.urlMobile) ? mall.urlMobile : (mall.url || "");
}
