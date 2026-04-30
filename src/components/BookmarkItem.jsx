/* =========================================================
 * src/components/BookmarkItem.jsx
 * 북마크 그룹 안 단일 상품 행 — PC .bm-mall 정확 매핑.
 *
 * v4 변경 (2026-04-30, 사용자 catch):
 *  - PC 정확 hex 색 직접 지정 (Tailwind 토큰 의존 제거):
 *    - .bm-mall border-top #F5F3EC (PC 검증, 사용자가 본 검정 라인 → 베이지 베이지)
 *    - .bm-m-rank #1A1A1A 11px (PC 10 +1)
 *    - .bm-m-title #555555 12.5px (PC 11.5 +1) — 상품 제목
 *    - .bm-m-mall #1A1A1A weight 800 12px (PC 11 +1)
 *    - .bm-m-price #6B6B6B 12px (PC 11 +1)
 *    - .bm-m-change 11px (PC 10 +1) + 색은 status별
 *  - 한 줄 레이아웃 + 솔드아웃 처리 + 배지 인라인 (v3 유지).
 * ========================================================= */
import { useExternalNavigate } from "../lib/externalLinkContext";
import Pill from "./Pill";

// PC sidepanel.css .bm-m-change.stale 정확 매핑
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

  // 가격 변동 텍스트 + PC 정확 색 매핑
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
      changeColor = "#E8762B";  // PC .down accent
      changeWeight = 600;
    } else {
      changeText = `(+${(cur - prev).toLocaleString()}원 상승)`;
      changeColor = "#6B6B6B";  // PC .up muted
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
        // PC .bm-mall + .bm-mall border-top #F5F3EC
        borderTop: "1px solid #F5F3EC",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "#FAFAF7";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
      }}
    >
      {/* rank — PC 10px → PWA 11px */}
      {rank != null && (
        <span
          className="flex-shrink-0 mt-[2px] flex items-center justify-center"
          style={{
            width: "16px",
            fontSize: "11px",
            color: "#1A1A1A",
            fontWeight: 400,
            lineHeight: 1.3,
          }}
        >
          {rank}
        </span>
      )}

      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        {/* 상품 제목 — PC #555 11.5px → PWA 12.5px */}
        <div
          className="line-clamp-2 break-all"
          style={{
            fontSize: "12.5px",
            color: "#555555",
            lineHeight: 1.35,
          }}
        >
          {bookmark.title || "(제목 없음)"}
        </div>

        {/* 메타 — mall + (가격+변동 또는 stale) + 배지 [한 줄 flex-wrap] */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {mallDisplay && (
            <span
              className="truncate flex-none"
              style={{
                fontSize: "12px",
                color: "#1A1A1A",
                fontWeight: 800,
                maxWidth: "50%",
              }}
            >
              {mallDisplay}
            </span>
          )}

          {stale ? (
            // 솔드아웃 / 실패 — PC 정확 색
            <span
              className="flex-none"
              style={{
                fontSize: "12px",
                color: stale.color,
                fontStyle: stale.style,
                textDecoration: stale.textDecoration,
              }}
            >
              {stale.text}
            </span>
          ) : (
            // 정상 — 가격 + 변동
            <>
              {cur != null && (
                <span
                  className="flex-none"
                  style={{ fontSize: "12px", color: "#6B6B6B", fontWeight: 400 }}
                >
                  {cur.toLocaleString()}원
                </span>
              )}
              {changeText && (
                <span
                  className="flex-none"
                  style={{
                    fontSize: "11px",
                    color: changeColor,
                    fontWeight: changeWeight,
                  }}
                >
                  {changeText}
                </span>
              )}
            </>
          )}

          {/* 배지 — 한 줄 인라인 (PC .bm-m-lowest, .bm-new-badge) */}
          {isLowest && <Pill variant="lowest">최저가</Pill>}
          {isNew && <Pill variant="new">NEW</Pill>}
        </div>
      </div>
    </button>
  );
}
