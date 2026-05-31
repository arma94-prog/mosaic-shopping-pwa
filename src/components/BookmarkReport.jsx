/* =========================================================
 * src/components/BookmarkReport.jsx
 * 북마크 그룹 리스트 위 "최저가 리포트" 박스.
 *
 * v5 변경 (2026-05-31, 익스텐션 v1.34.245 요약 문구·집계 정합 — Arma):
 *  - 🐛 기존 요약 줄이 "신규 목표가 0개, 최저가 0개 발견" 하드코딩(스텁)이었음 → 실제 집계로 교체.
 *  - 🆕 문구 "현재 목표가 달성 {N}개, 최저가 갱신 {M}개" — '현재 상태' 집계(배치 이벤트 아님).
 *  - 🆕 N/M = bookmarkStatus.js 술어(groupTargetAchieved / groupHasLowestMall).
 *      화면 배지(목표가 달성 / 최저가 pill)와 동일 술어 → 숫자=배지 보장.
 *
 * v4 (유지): 폰트 +0.5pt. v3: +1pt 누적. v2: PC 주황 타이틀 + 베이지 bg.
 * ========================================================= */
import { formatRelative } from "../lib/relativeTime";
import {
  groupHasLowestMall,
  groupTargetAchieved,
} from "../lib/bookmarkStatus";

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

  // '현재 상태' 집계 — 화면 배지와 동일 술어 (익스텐션 sidepanel.js L1825~1827 정합).
  //   N = 목표가 달성 그룹 수, M = 가장 싼 몰이 역대최저인 그룹 수.
  const targetAchievedNow = (groups || []).filter(groupTargetAchieved).length;
  const lowestNowCount = (groups || []).filter(groupHasLowestMall).length;

  return (
    <div
      className="flex flex-col gap-1 mb-2 pl-[7px] pr-2.5 py-2 rounded-lg"
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
        className="flex items-center pl-[22px] leading-[1.5] font-semibold"
        style={{ fontSize: "14.5px", color: "#333333" }}
      >
        현재 목표가 달성 {targetAchievedNow}개, 최저가 갱신 {lowestNowCount}개
      </div>

      <div
        className="flex items-center pl-[22px] leading-[1.5]"
        style={{ fontSize: "13.5px", color: "#555555" }}
      >
        {totalItems}개 상품 가격 갱신 {recentText}
      </div>
    </div>
  );
}
