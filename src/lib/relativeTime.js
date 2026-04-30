/* =========================================================
 * src/lib/relativeTime.js
 * ISO 시간 → "방금", "n분 전", "n시간 전", "n일 전" 변환.
 *
 * Bookmarks (last_price_check_at, updated_at) +
 * Search (search_history.last_searched_at) 공통 사용.
 *
 * 30일 이상은 절대 날짜 (ko-KR locale).
 * ========================================================= */

export function formatRelative(iso) {
  if (!iso) return "";
  const ts = new Date(iso).getTime();
  if (Number.isNaN(ts)) return "";
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "방금";
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}일 전`;
  return new Date(iso).toLocaleDateString("ko-KR");
}
