/* =========================================================
 * src/lib/searchMalls.js
 * 검색몰 마스터 데이터 fetch.
 *
 * v2 변경 (2026-04-30, 사용자 catch):
 *  - 🐛 모듈 캐싱 제거 — 페이지 진입 시마다 fresh fetch (북마크/검색어 패턴 정합).
 *    이전: 첫 fetch 후 캐싱 → PC search JSON 업데이트 후 PWA 새로고침 필요.
 *    이후: 페이지 진입 시 fresh fetch.
 *  - in-flight Promise 공유 유지 (동시 호출 race 방지).
 *  - 브라우저 HTTP 캐시 (GitHub Pages CDN ETag 기반 304) 활용.
 *
 * 데이터 소스: GitHub Pages 정적 파일.
 * 구조: { version, iconBase, categories: [{ id, name, items: [{ icon, name, url, urlMobile?, isDefault }] }] }
 * ========================================================= */

const SOURCE_URL =
  "https://arma94-prog.github.io/mosaic-shopping/mosaic-search-malls.json";

let _inFlight = null;

export async function fetchSearchMalls() {
  if (_inFlight) return _inFlight;

  _inFlight = (async () => {
    try {
      const res = await fetch(SOURCE_URL, { cache: "default" });
      if (!res.ok) {
        throw new Error(`검색몰 데이터 로드 실패 (HTTP ${res.status})`);
      }
      const data = await res.json();
      if (!data || !Array.isArray(data.categories)) {
        throw new Error("검색몰 데이터 형식 오류");
      }
      return data;
    } finally {
      _inFlight = null;
    }
  })();

  return _inFlight;
}

/**
 * 모든 카테고리의 모든 mall을 카테고리 순서대로 평탄화하여 반환.
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
  const base = iconBase.endsWith("/") ? iconBase : iconBase + "/";
  return base + iconFile;
}
