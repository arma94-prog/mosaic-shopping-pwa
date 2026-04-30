/* =========================================================
 * src/components/BookmarkItem.jsx
 * 북마크 그룹 안 단일 상품 행 — PC .bm-mall 톤.
 *
 * v3 변경 (2026-04-30):
 *  - 솔드아웃/실패 status 표시: 가격 + 변동 자리에 "(판매 중단)" 등.
 *    PC sidepanel.js 표시 텍스트 매핑 (사용자 합의: "판매 중단" PC도 동일):
 *      - sold_out:    "(판매 중단)"  / 회색
 *      - not_found:   "(상품 없음)"  / 회색 + 취소선
 *      - blocked:     "(접속 차단)"  / 진한 갈색 italic
 *      - timeout/기타: "(확인 실패)" / 회색 italic
 *    솔드아웃 상품도 배지(최저가/NEW)는 그대로 표시 (정보 가치 유지).
 *
 *  - 한 줄 레이아웃 (사용자 결정): 가격 + 변동 + 배지를 한 줄에 (PC 정합).
 *    이전: 배지가 별도 줄로 분리됨.
 *    이후: flex-wrap으로 한 줄에 모두 + 자연 줄바꿈만.
 *
 *  - "n분 전 확인" 표시 제거: 그룹 위 BookmarkReport에 이미 표시됨 → 이중 표시 방지.
 *    (사용자 결정 — 이전 라운드 합의)
 *
 * 가격 변동 색 매핑 (PC .bm-m-change):
 *  - 하락 (cur < prev): accent 강조 (사용자 이득)
 *  - 상승 (cur > prev): muted 약함 (사용자 손해)
 *  - 변동 없음 (cur === prev): soft 매우 약함
 *  - prev null: 표시 없음
 *
 * Props:
 *  - bookmark: { id, title, url, mall_id, mall_name, current_price, previous_price,
 *                last_check_status, ... }
 *  - rank: 그룹 안 가격 순위 (1, 2, 3...)
 *  - isLowest: rank === 1
 *  - isNew: 24시간 이내 추가됨
 * ========================================================= */
import { useExternalNavigate } from "../lib/externalLinkContext";
import Pill from "./Pill";

// PC sidepanel.js 표시 텍스트 + 색 매핑.
// "stale" status (가격 정상 추출 실패) 모두 가격 자리에 라벨 표시.
// 색은 PC sidepanel.css .bm-m-change.stale 매핑 (Tier 4 임의값).
const STALE_DISPLAY = {
  sold_out: { text: "(판매 중단)", className: "text-[#8A8A8A]" },
  not_found: { text: "(상품 없음)", className: "text-[#8A8A8A] line-through" },
  blocked: { text: "(접속 차단)", className: "text-[#B55216] italic" },
};

function getStaleDisplay(status) {
  if (!status || status === "ok") return null;
  return STALE_DISPLAY[status] || {
    text: "(확인 실패)",
    className: "text-mosaic-text-soft italic",
  };
}

export default function BookmarkItem({ bookmark, rank, isLowest, isNew }) {
  const navigate = useExternalNavigate();

  const handleClick = () => {
    if (bookmark?.url) navigate(bookmark.url);
  };

  // mall 표시 이름: mall_name 우선, mall_id 도메인 fallback
  const mallDisplay = bookmark.mall_name || bookmark.mall_id || "";

  // status 분기 — 솔드아웃/실패 시 가격/변동 대신 라벨 표시
  const stale = getStaleDisplay(bookmark.last_check_status);

  // 가격 + 변동 계산 (status === "ok" 또는 미정의일 때만 사용)
  const cur = bookmark.current_price != null ? Number(bookmark.current_price) : null;
  const prev = bookmark.previous_price != null ? Number(bookmark.previous_price) : null;

  let changeText = null;
  let changeClass = "text-mosaic-text-soft";
  if (!stale && cur != null && prev != null && cur > 0 && prev > 0) {
    if (cur === prev) {
      changeText = "변동없음";
      changeClass = "text-mosaic-text-soft";
    } else if (cur < prev) {
      changeText = `-${(prev - cur).toLocaleString()}원 하락`;
      changeClass = "text-mosaic-accent font-semibold";
    } else {
      changeText = `+${(cur - prev).toLocaleString()}원 상승`;
      changeClass = "text-mosaic-text-muted";
    }
  }

  return (
    <button
      onClick={handleClick}
      aria-label={`${bookmark.title || "상품"} - ${mallDisplay}`}
      className="
        w-full
        flex items-start gap-2
        py-[7px] pl-2 pr-2
        text-left
        active:bg-mosaic-surface-hover
        transition-colors
        border-t border-mosaic-line-soft
        first:border-t-0
      "
    >
      {/* 좌측 rank 숫자 — PC .bm-m-rank 매핑 */}
      {rank != null && (
        <span className="
          flex-shrink-0
          w-4 mt-[2px]
          text-center text-[10px] text-mosaic-text
          leading-[1.3]
        ">
          {rank}
        </span>
      )}

      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        {/* 상품 제목 — PC .bm-m-title 매핑 (11.5px, content color, 2줄 ellipsis) */}
        <div className="
          text-[11.5px] leading-[1.35]
          text-mosaic-text-content
          line-clamp-2 break-all
        ">
          {bookmark.title || "(제목 없음)"}
        </div>

        {/* 메타 정보 — mall 이름 + (가격+변동 또는 stale 라벨) + 배지 [한 줄, flex-wrap] */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {mallDisplay && (
            <span className="
              text-[11px] font-extrabold text-mosaic-text
              truncate max-w-[50%] flex-none
            ">
              {mallDisplay}
            </span>
          )}

          {stale ? (
            // 솔드아웃 / 실패 — 가격 자리에 라벨만
            <span className={`text-[11px] flex-none ${stale.className}`}>
              {stale.text}
            </span>
          ) : (
            // 정상 — 가격 + 변동
            <>
              {cur != null && (
                <span className="text-[11px] text-mosaic-text-muted flex-none">
                  {cur.toLocaleString()}원
                </span>
              )}
              {changeText && (
                <span className={`text-[10px] flex-none ${changeClass}`}>
                  ({changeText})
                </span>
              )}
            </>
          )}

          {/* 배지 — 한 줄에 인라인 (사용자 결정, PC 정합) */}
          {isLowest && <Pill variant="lowest">최저가</Pill>}
          {isNew && <Pill variant="new">NEW</Pill>}
        </div>
      </div>
    </button>
  );
}
