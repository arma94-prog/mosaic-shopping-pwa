/* =========================================================
 * src/components/BookmarkItem.jsx
 * 북마크 그룹 안 단일 상품 행 — PC .bm-mall 톤.
 *
 * v2 변경 (2026-04-30, 단계 4):
 *  - mall_name 사용 (없으면 mall_id 도메인 fallback).
 *  - previous_price로 가격 변동 텍스트 계산 + 색 매핑 (PC .bm-m-change):
 *      - 하락 (cur < prev): "-N원 하락" / accent 강조 (사용자 이득)
 *      - 상승 (cur > prev): "+N원 상승" / muted 약함
 *      - 동일 (cur === prev): "변동없음" / soft 매우 약함
 *      - prev null: 표시 없음
 *  - Pill 사용 (lowest, new).
 *  - 좌측 rank 숫자 (PC .bm-m-rank: 16px / 10px / weight 400).
 *  - 토큰 마이그레이션.
 *
 * Props:
 *  - bookmark: { id, title, url, mall_id, mall_name, current_price, previous_price, ... }
 *  - rank: 그룹 안 가격 순위 (1, 2, 3...)
 *  - isLowest: rank === 1
 *  - isNew: 24시간 이내 추가됨
 *
 * 클릭: useExternalNavigate → 외부 webview.
 * ========================================================= */
import { useExternalNavigate } from "../lib/externalLinkContext";
import { formatRelative } from "../lib/relativeTime";
import Pill from "./Pill";

export default function BookmarkItem({ bookmark, rank, isLowest, isNew }) {
  const navigate = useExternalNavigate();

  const handleClick = () => {
    if (bookmark?.url) navigate(bookmark.url);
  };

  // mall 표시 이름: mall_name 우선, 없으면 mall_id (도메인) fallback
  const mallDisplay = bookmark.mall_name || bookmark.mall_id || "";

  // 가격 변동 계산
  const cur = bookmark.current_price != null ? Number(bookmark.current_price) : null;
  const prev = bookmark.previous_price != null ? Number(bookmark.previous_price) : null;

  let changeText = null;
  let changeClass = "text-mosaic-text-soft"; // 기본
  if (cur != null && prev != null && cur > 0 && prev > 0) {
    if (cur === prev) {
      changeText = "변동없음";
      changeClass = "text-mosaic-text-soft";
    } else if (cur < prev) {
      // 가격 하락 = 사용자 이득 → accent 강조
      changeText = `-${(prev - cur).toLocaleString()}원 하락`;
      changeClass = "text-mosaic-accent font-semibold";
    } else {
      // 가격 상승 → 약함
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

        {/* 메타 정보 행 — mall, 가격, 가격 변동 */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {mallDisplay && (
            <span className="
              text-[11px] font-extrabold text-mosaic-text
              truncate max-w-[50%] flex-none
            ">
              {mallDisplay}
            </span>
          )}

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
        </div>

        {/* 배지 행 (최저가, NEW) */}
        {(isLowest || isNew) && (
          <div className="flex items-center gap-1 mt-0.5 flex-wrap">
            {isLowest && <Pill variant="lowest">최저가</Pill>}
            {isNew && <Pill variant="new">NEW</Pill>}
          </div>
        )}

        {/* 가격 마지막 확인 시점 */}
        {bookmark.last_price_check_at && (
          <div className="text-[10px] text-mosaic-text-soft mt-0.5">
            {formatRelative(bookmark.last_price_check_at)} 확인
          </div>
        )}
      </div>
    </button>
  );
}
