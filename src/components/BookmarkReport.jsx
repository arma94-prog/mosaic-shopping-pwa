/* =========================================================
 * src/components/BookmarkReport.jsx
 * 북마크 그룹 리스트 위 "최저가 리포트" 박스 — PC .bm-refresh-row 정확 매핑.
 *
 * v2 변경 (2026-04-30, 사용자 catch):
 *  - 색상을 PC와 100% 정합. Tailwind 토큰 의존 우회 위해 hex 직접 지정.
 *  - 폰트 +1pt (모바일 가독성). PC 12px → PWA 13px, PC 11px → PWA 12px.
 *  - 타이틀 주황 색 정확히 (PC #E8762B), 이전 파란색 토큰 매칭 실패 의심.
 *
 * PC 정확 명세 (sidepanel.css):
 *  - .bm-refresh-row: bg #F1EFE8 / border 1px #E0DCCE / radius 8px / padding 8px 10px
 *  - .bm-rep-title: 12px / weight 800 / color #E8762B / letter-spacing 0.1px
 *  - .bm-rep-line-primary: 11px / weight 600 / color #333333
 *  - .bm-rep-line: 11px / color #555555 / line-height 1.5
 * ========================================================= */
import { formatRelative } from "../lib/relativeTime";

function ReportIcon() {
  return (
    <svg
      width="15"
      height="15"
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
      {/* 헤더: ◎ + "최저가 리포트" — 주황 #E8762B, 13px (PC 12px +1) */}
      <div className="flex items-center gap-1 min-h-[24px]">
        <span
          className="flex-shrink-0 flex items-center justify-center w-4 h-4"
          style={{ color: "#E8762B" }}
        >
          <ReportIcon />
        </span>
        <span
          className="font-extrabold tracking-[0.1px]"
          style={{ fontSize: "13px", color: "#E8762B" }}
        >
          최저가 리포트
        </span>
      </div>

      {/* 본문 1줄 — primary (PC #333 weight 600, 12px = PC 11 +1) */}
      <div
        className="flex items-center pl-1.5 leading-[1.5] font-semibold"
        style={{ fontSize: "12px", color: "#333333" }}
      >
        • 신규 목표가 0개, 최저가 0개 발견
      </div>

      {/* 본문 2줄 — secondary (PC #555, 12px) */}
      <div
        className="flex items-center pl-1.5 leading-[1.5]"
        style={{ fontSize: "12px", color: "#555555" }}
      >
        • {totalItems}개 상품 가격 갱신 {recentText}
      </div>
    </div>
  );
}
