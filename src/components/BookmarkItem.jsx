/* =========================================================
 * src/components/BookmarkItem.jsx
 * 북마크 그룹 안 단일 상품 행 — PC .bm-mall 정합.
 *
 * v6 변경 (2026-04-30, fix-1):
 *  - 🐛 변동폭 계산 PC computePriceChangeInfo 정합.
 *    이전 (v5): cur vs prev (직전가) 비교.
 *    이후 (v6): cur vs initial (최초 등록가) 비교.
 *    PC sidepanel.js Line 2390 baseline = priceHistory[0].value 동일 의미.
 *
 *  - 변수명 prev → initial. 필드명 previous_price → initial_price.
 *  - 출력 텍스트는 그대로: "(-N원 하락)" / "(변동없음)" / "(+N원 상승)".
 *
 * v5 (유지): 폰트 +2pt 모바일 가독성.
 * v4 (유지): PC 정확 hex 색 + 한 줄 레이아웃 + 솔드아웃.
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
  // v6 (fix-1): previous_price → initial_price. 변동폭 기준이 직전가 → 최초 등록가.
  const initial = bookmark.initial_price != null ? Number(bookmark.initial_price) : null;

  let changeText = null;
  let changeColor = "#A8A699";
  let changeWeight = 500;
  if (!stale && cur != null && initial != null && cur > 0 && initial > 0) {
    if (cur === initial) {
      changeText = "(변동없음)";
      changeColor = "#A8A699";
      changeWeight = 500;
    } else if (cur < initial) {
      changeText = `(-${(initial - cur).toLocaleString()}원 하락)`;
      changeColor = "#E8762B";
      changeWeight = 600;
    } else {
      changeText = `(+${(cur - initial).toLocaleString()}원 상승)`;
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
