/* =========================================================
 * src/lib/searchMalls.js
 * 검색몰 마스터 데이터 fetch + 메모리 캐싱.
 *
 * v5 변경 (2026-04-30):
 *  - flattenMalls 안 cat 필드명 정정: cat.id → cat.key, cat.name → cat.label.
 *    실제 mosaic-search-malls.json 구조와 정합성 회복.
 *  - 출력 객체의 _categoryId/_categoryName도 _categoryKey/_categoryLabel로 변경.
 *
 * 데이터 소스: GitHub Pages 정적 파일.
 * 실제 JSON 구조 (확정):
 *   {
 *     version: number,
 *     iconBase: string,        // 아이콘 base URL
 *     categories: [
 *       {
 *         key: string,         // 영문 ID (digital, general 등)
 *         label: string,       // 한글 라벨 (가격비교, 종합몰 등)
 *         items: [
 *           {
 *             icon: string,    // 아이콘 파일명 (naver.png 등)
 *             name: string,    // mall 한글명 (네이버 가격비교, 다나와 등)
 *             url: string,     // {kw} placeholder 포함 검색 URL
 *             isDefault?: bool // 카테고리 대표 mall (선택)
 *           }
 *         ]
 *       }
 *     ]
 *   }
 *
 * 캐싱 정책:
 *  - 모듈 레벨 메모리 캐싱. 페이지 새로고침 전까진 1회만 fetch.
 *  - PWA Service Worker가 디스크 캐싱은 자동 처리.
 *  - 동시 다중 호출 시 in-flight Promise 공유 (race condition 방지).
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
 * (현재 SearchResults.jsx에서는 카테고리별 섹션 표시로 사용 안 함.
 *  향후 다른 화면에서 일렬 표시 필요 시 사용.)
 *
 * @returns {Array<{icon, name, url, isDefault, _categoryKey, _categoryLabel}>}
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
        _categoryKey: cat.key || "",
        _categoryLabel: cat.label || "",
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
