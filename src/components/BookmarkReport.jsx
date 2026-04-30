/* =========================================================
 * src/components/BookmarkReport.jsx
 * 북마크 그룹 리스트 위 "최저가 리포트" 박스.
 *
 * v4 변경 (2026-04-30, 트랙 E):
 *  - 폰트 +0.5pt 모바일 가독성 추가 강화.
 *    타이틀 14 → 14.5px, 본문 13 → 13.5px.
 *
 * v3 (유지): 폰트 +1pt 누적.
 * v2 (유지): PC #E8762B 주황 타이틀 + #F1EFE8 베이지 bg.
 * ========================================================= */
import { formatRelative } from "../lib/relativeTime";

function ReportIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function BookmarkReport({ groups, totalItems }) {
  let mostRecentTs = null;
  for (const g of groups || []) {
    for (const bm of g.bookmarks || []) {
      if (!bm.last_price_check_at) continue;
      const ts = new Date(bm.last_price_check_at).getTime();
      if (!Number.isFinite(ts)) continue;
      if (mostRecentTs == null || ts > mostRecentTs) {
        mostRecentTs = ts;
      }
    }
  }

  const recentText =
    mostRecentTs != null
      ? `${formatRelative(new Date(mostRecentTs).toISOString())} 완료`
      : "아직 갱신되지 않았어요";

  return (
    <div
      className="flex flex-col gap-1 mb-2 px-2.5 py-2 rounded-lg"
      style={{
        background: "#F1EFE8",
        border: "1px solid #E0DCCE",
      }}
    >
      <div className="flex items-center gap-1 min-h-[26px]">
        <span
          className="flex-shrink-0 flex items-center justify-center"
          style={{ color: "#E8762B", width: "18px", height: "18px" }}
        >
          <ReportIcon />
        </span>
        <span
          className="font-extrabold tracking-[0.1px]"
          style={{ fontSize: "14.5px", color: "#E8762B" }}
        >
          최저가 리포트
        </span>
      </div>

      <div
        className="flex items-center pl-1.5 leading-[1.5] font-semibold"
        style={{ fontSize: "13.5px", color: "#333333" }}
      >
        • 신규 목표가 0개, 최저가 0개 발견
      </div>

      <div
        className="flex items-center pl-1.5 leading-[1.5]"
        style={{ fontSize: "13.5px", color: "#555555" }}
      >
        • {totalItems}개 상품 가격 갱신 {recentText}
      </div>
    </div>
  );
}
