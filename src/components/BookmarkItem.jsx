/* =========================================================
 * src/components/BookmarkItem.jsx
 * 북마크 그룹 안 단일 상품 행 — PC .bm-mall 톤 정확 매칭.
 *
 * PC 디자인 매핑:
 *  - .bm-mall: padding 7px 4px 7px 8px, gap 4, border-top #F5F3EC
 *  - .bm-m-title: 11.5px / #555 / line-height 1.35 / 2줄 ellipsis
 *  - .bm-m-mall: 11px / weight 800 / #1A1A1A / max-width 50%
 *  - .bm-m-price: 11px / weight 400 / #6B6B6B
 *  - .bm-m-lowest: bg #FBE8D9 / color #E8762B / 9px / weight 700 / pill
 *
 * 데이터:
 *  - bookmark.title (상품 제목)
 *  - bookmark.mall_id (도메인 형태, 예: "www.coupang.com")
 *  - bookmark.current_price / bookmark.lowest_price (숫자 또는 null)
 *  - bookmark.last_price_check_at (ISO datetime)
 *
 * 가격 표시 정책 (PWA 데이터 한계 내):
 *  - current === lowest → "최저가" 배지
 *  - current > lowest → "+N원" 차이 표시
 *  - 둘 다 null → 가격 미표시
 *
 * 클릭 시: useExternalNavigate → 외부 webview (모달 1회 → 새 창)
 * ========================================================= */
import { useExternalNavigate } from "../lib/externalLinkContext";
import { formatRelative } from "../lib/relativeTime";

export default function BookmarkItem({ bookmark }) {
  const navigate = useExternalNavigate();

  const handleClick = () => {
    if (bookmark?.url) navigate(bookmark.url);
  };

  const cur = bookmark.current_price != null ? Number(bookmark.current_price) : null;
  const low = bookmark.lowest_price != null ? Number(bookmark.lowest_price) : null;
  const isLowest = cur != null && low != null && cur === low;
  const priceDiff = cur != null && low != null && cur > low ? cur - low : null;

  return (
    <button
      onClick={handleClick}
      aria-label={`${bookmark.title || "상품"} - ${bookmark.mall_id || ""}`}
      className="
        w-full
        flex flex-col gap-0.5
        py-[7px] pl-2 pr-1
        text-left
        active:bg-[#FAFAF7]
        transition-colors
        border-t border-[#F5F3EC]
        first:border-t-0
      "
    >
      {/* 상품 제목 — 2줄 ellipsis */}
      <div
        className="
          text-[11.5px] leading-[1.35]
          text-[#555555]
          line-clamp-2 break-all
        "
      >
        {bookmark.title || "(제목 없음)"}
      </div>

      {/* 메타 정보 — mall, 가격, 배지, 시간 */}
      <div className="flex items-center gap-1.5 text-[10px] text-mosaic-muted-3 flex-wrap">
        {bookmark.mall_id && (
          <span className="text-[11px] font-extrabold text-mosaic-text truncate max-w-[50%] flex-none">
            {bookmark.mall_id}
          </span>
        )}

        {cur != null && (
          <span className="text-[11px] text-mosaic-muted flex-none">
            {cur.toLocaleString()}원
          </span>
        )}

        {isLowest && (
          <span className="
            inline-block flex-none
            bg-mosaic-min-bg text-mosaic-min-text
            text-[9px] font-bold
            px-1.5 py-[1px]
            rounded-full
            tracking-[0.3px] leading-[1.4]
          ">
            최저가
          </span>
        )}

        {priceDiff != null && (
          <span className="text-[10px] text-mosaic-muted font-medium flex-none">
            +{priceDiff.toLocaleString()}원
          </span>
        )}

        {bookmark.last_price_check_at && (
          <span className="text-[10px] text-mosaic-muted-3 flex-none">
            · {formatRelative(bookmark.last_price_check_at)} 확인
          </span>
        )}
      </div>
    </button>
  );
}
