/* =========================================================
 * src/components/BookmarkReport.jsx
 * 북마크 그룹 리스트 위 "최저가 리포트" 박스 — PC .bm-refresh-row 매칭.
 *
 * PC 디자인 명세 (sidepanel.css):
 *  - bg #F1EFE8 / border 1px #E0DCCE / radius 8px / padding 8px 10px
 *  - 헤더: ◎ 아이콘(14x14) + "최저가 리포트" 텍스트 (12px / weight 800 / accent)
 *  - 본문 line-primary: #333 / weight 600 / 11px (신규 목표가/최저가 발견)
 *  - 본문 line: #555 / 11px (가격 갱신 시점)
 *
 * PWA 한정 단순화 (사용자 결정 2026-04-30):
 *  - "지금 갱신하기" 버튼 제거 (Phase 1 read-only 정책)
 *  - "| 다음 N시간 후" 제거 (자동 갱신 정보 없음)
 *  - "신규 목표가 0개, 최저가 0개 발견" 항상 0 (PWA가 cycle 카운트 안 함, 디자인 정합용)
 *  - "N개 상품 가격 갱신 N분 전 완료": 모든 그룹 bookmarks 합 + 가장 최근 last_price_check_at
 *
 * Phase 2: cycle 카운트 미러링 추가 시 실제 발견 수 표시.
 * ========================================================= */
import { formatRelative } from "../lib/relativeTime";

/** ◎ 타겟/bullseye 아이콘 — PC .bm-rep-icon 매핑 */
function ReportIcon() {
  return (
    <svg
      width="14"
      height="14"
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
  // 가장 최근 last_price_check_at 계산
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
      className="
        flex flex-col gap-1
        mb-2
        px-2.5 py-2
        bg-mosaic-surface-hover
        border border-mosaic-line-card
        rounded-lg
      "
    >
      {/* 헤더: ◎ + "최저가 리포트" */}
      <div className="flex items-center gap-1 min-h-[22px]">
        <span className="text-mosaic-accent flex-shrink-0 flex items-center justify-center w-4 h-4">
          <ReportIcon />
        </span>
        <span className="text-[12px] font-extrabold text-mosaic-accent tracking-[0.1px]">
          최저가 리포트
        </span>
      </div>

      {/* 본문 1줄 — primary (신규 목표가 / 최저가 발견 수) */}
      <div className="
        flex items-center pl-1.5
        text-[11px] leading-[1.5]
        text-[#333333] font-semibold
      ">
        • 신규 목표가 0개, 최저가 0개 발견
      </div>

      {/* 본문 2줄 — 가격 갱신 시점 */}
      <div className="
        flex items-center pl-1.5
        text-[11px] leading-[1.5]
        text-mosaic-text-content
      ">
        • {totalItems}개 상품 가격 갱신 {recentText}
      </div>
    </div>
  );
}
