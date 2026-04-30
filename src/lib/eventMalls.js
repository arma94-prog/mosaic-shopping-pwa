/* =========================================================
 * src/lib/eventMalls.js
 * 이벤트 (핫딜) mall 마스터 데이터 fetch + 메모리 캐싱.
 *
 * 데이터 소스: PC 사이드패널과 공유 — `mosaic-events.json`.
 * 구조: { iconBase, categories: [{ id, name, items: [{ icon, name, url, urlMobile? }] }] }
 *  - PC 사이드패널의 `currentEventData`와 동일 구조 (sidepanel.js line 537~538).
 *  - searchMalls와 같은 schema. 다른 점은 URL만.
 *  - mall.url 클릭 시 mall의 이벤트/핫딜 페이지로 이동 (검색어 placeholder 없음).
 *
 * 캐싱: 모듈 레벨 메모리 + in-flight Promise 공유.
 *
 * Phase 1 정체성 (메모리 #21):
 *  - PC가 capture, PWA가 view → 같은 JSON 공유.
 *  - read-only: PWA에서 mall 추가/제거 X.
 *
 * Phase 2:
 *  - user_settings.custom_event_malls 병합
 *  - user_settings.disabled_malls.event 필터링
 * ========================================================= */

const SOURCE_URL =
  "https://arma94-prog.github.io/mosaic-shopping/mosaic-events.json";

let _cache = null;
let _inFlight = null;

export async function fetchEventMalls() {
  if (_cache) return _cache;
  if (_inFlight) return _inFlight;

  _inFlight = (async () => {
    try {
      const res = await fetch(SOURCE_URL, { cache: "default" });
      if (!res.ok) {
        throw new Error(`이벤트 데이터 로드 실패 (HTTP ${res.status})`);
      }
      const data = await res.json();
      if (!data || !Array.isArray(data.categories)) {
        throw new Error("이벤트 데이터 형식 오류");
      }
      _cache = data;
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
