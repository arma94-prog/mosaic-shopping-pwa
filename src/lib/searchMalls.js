/* =========================================================
 * src/lib/searchMalls.js
 * 검색몰 마스터 데이터 fetch + 메모리 캐싱.
 *
 * 데이터 소스: GitHub Pages 정적 파일.
 * 구조: { version, iconBase, categories: [{ id, name, items: [{ icon, name, url, isDefault }] }] }
 *  - url 안의 `{kw}`는 검색어 placeholder. 클라이언트에서 encodeURIComponent로 치환.
 *  - iconBase + item.icon = 아이콘 URL.
 *
 * 캐싱 정책:
 *  - 모듈 레벨 메모리 캐싱. 페이지 새로고침 전까진 1회만 fetch.
 *  - PWA Service Worker (vite-plugin-pwa)가 디스크 캐싱은 자동 처리.
 *  - 동시 다중 호출 시 in-flight Promise 공유 (race condition 방지).
 *
 * Phase 2 후속:
 *  - user_settings.disabled_malls / disabled_cats 필터링
 *  - user_settings.custom_search_malls 병합
 * ========================================================= */

const SOURCE_URL =
  "https://arma94-prog.github.io/mosaic-shopping/mosaic-search-malls.json";

let _cache = null;
let _inFlight = null;

export async function fetchSearchMalls() {
  if (_cache) return _cache;
  if (_inFlight) return _inFlight;

  _inFlight = (async () => {
    try {
      const res = await fetch(SOURCE_URL, { cache: "default" });
      if (!res.ok) {
        throw new Error(`검색몰 데이터 로드 실패 (HTTP ${res.status})`);
      }
      const data = await res.json();
      // 최소 검증
      if (!data || !Array.isArray(data.categories)) {
        throw new Error("검색몰 데이터 형식 오류");
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
 * 모든 카테고리의 모든 mall을 카테고리 순서대로 평탄화하여 반환.
 * 6열 격자에 일렬로 표시할 때 사용.
 *
 * @returns {Array<{icon, name, url, isDefault, _categoryId, _categoryName}>}
 */
export function flattenMalls(data) {
  if (!data || !Array.isArray(data.categories)) return [];
  const out = [];
  for (const cat of data.categories) {
    if (!cat || !Array.isArray(cat.items)) continue;
    for (const item of cat.items) {
      if (!item || !item.url) continue;
      out.push({
        ...item,
        _categoryId: cat.id || "",
        _categoryName: cat.name || "",
      });
    }
  }
  return out;
}

/**
 * mall.url 안의 {kw} placeholder를 검색어로 치환.
 * 검색어는 encodeURIComponent로 안전하게 인코딩.
 */
export function buildSearchUrl(mallUrl, query) {
  if (!mallUrl) return "";
  return mallUrl.replace(/\{kw\}/g, encodeURIComponent(query || ""));
}

/**
 * 아이콘 절대 URL 빌드.
 */
export function buildIconUrl(iconBase, iconFile) {
  if (!iconBase || !iconFile) return "";
  // iconBase가 슬래시로 끝나는지 보장
  const base = iconBase.endsWith("/") ? iconBase : iconBase + "/";
  return base + iconFile;
}
