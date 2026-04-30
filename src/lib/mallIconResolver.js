/* =========================================================
 * src/lib/mallIconResolver.js
 * mall 아이콘 URL 결정 로직 — PC sidepanel.js 정확 매핑.
 *
 * PC 패턴 (sidepanel.js line 696~702):
 *  1. item.icon 있음 (절대 URL: http/https 시작) → 그 URL 그대로
 *  2. item.icon 있음 (상대) → ICON_BASE + item.icon
 *  3. item.isCustom + item.url → extractCoreDomain(url) → ICON_BASE + core + ".png"
 *  4. 그 외 → null (호출자가 fallback 표시)
 *
 * 사용처:
 *  - SearchResults.jsx (검색몰 격자)
 *  - Events.jsx (핫딜 격자)
 *  - 둘 다 같은 로직 = SoC 공용 헬퍼.
 *
 * v1 (2026-04-30): 사용자 catch — 사용자 추가 mall에 PC 자동 추정 로직 누락.
 *  - 이전: PWA가 mall.icon 없으면 무조건 텍스트 fallback.
 *  - 이후: PC와 동일하게 도메인에서 자동 추정 (예: zigzag.kr → ICON_BASE/zigzag.png).
 * ========================================================= */

/**
 * URL에서 브랜드 도메인 코어 추출 — PC sidepanel.js line 671~686 정확 매핑.
 *
 * 예시:
 *  - https://www.zigzag.kr/search → "zigzag"
 *  - https://shop.coupang.com/abc → "coupang"
 *  - https://search.naver.com → "naver"
 *  - https://www.amazon.co.uk → "amazon" (다중 TLD .co.uk 제거)
 *
 * @param {string} url
 * @returns {string|null} 브랜드 도메인 코어 또는 null
 */
export function extractCoreDomain(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    let host = u.hostname.toLowerCase().replace(/^www\./, "");
    // 다중 TLD 먼저 제거 (co.kr, or.kr, co.jp, co.uk 등)
    host = host.replace(/\.(co|or|go|ne|ac|com)\.(kr|jp|uk|au|nz|in|za|cn)$/, "");
    // 단일 TLD 제거
    host = host.replace(/\.[a-z]{2,}$/, "");
    const parts = host.split(".").filter(Boolean);
    if (!parts.length) return null;
    // 가장 마지막(브랜드명에 가까운) 세그먼트 반환
    return parts[parts.length - 1];
  } catch (_) {
    return null;
  }
}

/**
 * mall 아이콘 URL 결정 — PC sidepanel.js line 696~702 정확 매핑.
 *
 * @param {Object} mall - { icon, url, isCustom, ... }
 * @param {string} iconBase - 이벤트/검색 JSON의 iconBase
 * @returns {string|null} 아이콘 URL 또는 null (fallback 표시)
 */
export function resolveMallIconUrl(mall, iconBase) {
  if (!mall) return null;

  // 1. item.icon 명시
  if (mall.icon) {
    if (/^https?:\/\//.test(mall.icon)) {
      // 절대 URL — 그대로 사용
      return mall.icon;
    }
    // 상대 경로 — iconBase + icon
    return buildIconUrl(iconBase, mall.icon);
  }

  // 2. 커스텀 mall + URL → 도메인 자동 추정
  if (mall.isCustom && mall.url) {
    const core = extractCoreDomain(mall.url);
    if (core) {
      return buildIconUrl(iconBase, core + ".png");
    }
  }

  // 3. 매칭 안 되면 null (fallback 표시)
  return null;
}

/**
 * iconBase + iconFile = 아이콘 절대 URL.
 */
export function buildIconUrl(iconBase, iconFile) {
  if (!iconBase || !iconFile) return "";
  const base = iconBase.endsWith("/") ? iconBase : iconBase + "/";
  return base + iconFile;
}
