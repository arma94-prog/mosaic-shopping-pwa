/* =========================================================
 * src/components/BookmarkItem.jsx
 * 북마크 그룹 안 단일 상품 행 — PC .bm-mall 정합.
 *
 * v5 변경 (2026-04-30, 사용자 catch):
 *  - 폰트 +1pt 추가 (전체 +2pt 누적). 모바일 가독성 강화.
 *    PC 11.5px 제목 → v5 13.5px (PC +2)
 *    PC 11px mall/가격 → v5 13px
 *    PC 10px 변동 → v5 12px
 *    PC 10px rank → v5 12px
 *    솔드아웃 라벨 13px
 *
 *  - v4 (PC 정확 hex 색 + 한 줄 레이아웃 + 솔드아웃) 유지.
 * ========================================================= */
import { useExternalNavigate } from "../lib/externalLinkContext";
import Pill from "./Pill";

const STALE_DISPLAY = {
  sold_out: { text: "(판매 중단)", color: "#8A8A8A", style: "normal", textDecoration: "none" },
  not_found: { text: "(상품 없음)", color: "#8A8A8A", style: "normal", textDecoration: "line-through" },
  blocked: { text: "(접속 차단)", color: "#B55216", style: "italic", textDecoration: "none" },
};

function getStaleDisplay(status) {
  if (!status || status === "ok") return null;
  return STALE_DISPLAY[status] || {
    text: "(확인 실패)",
    color: "#A8A699",
    style: "italic",
    textDecoration: "none",
  };
}

export default function BookmarkItem({ bookmark, rank, isLowest, isNew }) {
  const navigate = useExternalNavigate();

  const handleClick = () => {
    if (bookmark?.url) navigate(bookmark.url);
  };

  const mallDisplay = bookmark.mall_name || bookmark.mall_id || "";
  const stale = getStaleDisplay(bookmark.last_check_status);

  const cur = bookmark.current_price != null ? Number(bookmark.current_price) : null;
  const prev = bookmark.previous_price != null ? Number(bookmark.previous_price) : null;

  let changeText = null;
  let changeColor = "#A8A699";
  let changeWeight = 500;
  if (!stale && cur != null && prev != null && cur > 0 && prev > 0) {
    if (cur === prev) {
      changeText = "(변동없음)";
      changeColor = "#A8A699";
      changeWeight = 500;
    } else if (cur < prev) {
      changeText = `(-${(prev - cur).toLocaleString()}원 하락)`;
      changeColor = "#E8762B";
      changeWeight = 600;
    } else {
      changeText = `(+${(cur - prev).toLocaleString()}원 상승)`;
      changeColor = "#6B6B6B";
      changeWeight = 500;
    }
  }

  return (
    <button
      onClick={handleClick}
      aria-label={`${bookmark.title || "상품"} - ${mallDisplay}`}
      className="w-full flex items-start gap-2 py-[7px] pl-2 pr-2 text-left transition-colors"
      style={{
        background: "transparent",
        borderTop: "1px solid #F5F3EC",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "#FAFAF7";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
      }}
    >
      {/* rank — PC 10px → v5 12px */}
      {rank != null && (
        <span
          className="flex-shrink-0 mt-[2px] flex items-center justify-center"
          style={{
            width: "16px",
            fontSize: "12px",
            color: "#1A1A1A",
            fontWeight: 400,
            lineHeight: 1.3,
          }}
        >
          {rank}
        </span>
      )}

      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        {/* 상품 제목 — PC 11.5px → v5 13.5px */}
        <div
          className="line-clamp-2 break-all"
          style={{
            fontSize: "13.5px",
            color: "#555555",
            lineHeight: 1.35,
          }}
        >
          {bookmark.title || "(제목 없음)"}
        </div>

        {/* 메타 — mall + (가격+변동 또는 stale) + 배지 */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {mallDisplay && (
            <span
              className="truncate flex-none"
              style={{
                fontSize: "13px",
                color: "#1A1A1A",
                fontWeight: 800,
                maxWidth: "50%",
              }}
            >
              {mallDisplay}
            </span>
          )}

          {stale ? (
            <span
              className="flex-none"
              style={{
                fontSize: "13px",
                color: stale.color,
                fontStyle: stale.style,
                textDecoration: stale.textDecoration,
              }}
            >
              {stale.text}
            </span>
          ) : (
            <>
              {cur != null && (
                <span
                  className="flex-none"
                  style={{ fontSize: "13px", color: "#6B6B6B", fontWeight: 400 }}
                >
                  {cur.toLocaleString()}원
                </span>
              )}
              {changeText && (
                <span
                  className="flex-none"
                  style={{
                    fontSize: "12px",
                    color: changeColor,
                    fontWeight: changeWeight,
                  }}
                >
                  {changeText}
                </span>
              )}
            </>
          )}

          {isLowest && <Pill variant="lowest">최저가</Pill>}
          {isNew && <Pill variant="new">NEW</Pill>}
        </div>
      </div>
    </button>
  );
}
