/* =========================================================
 * src/components/BookmarkItem.jsx
 * 북마크 그룹 안 단일 상품 행 — PC .bm-mall 정합.
 *
 * v9 변경 (2026-05-30, 배송비타입 노출 — PC 사이드패널 정합):
 *  - 🆕 메타 행: "쇼핑몰 가격 배송비타입 (변동)" — delivery_fee 기반 라벨 4종
 *    (배송비 포함 / 무료 배송 / 조건부 무료 / 배송비 별도). PC sidepanel.js 로직 미러.
 *  - 유료배송(fee>0) 가격 = 합산가(상품가+배송비), PC 표시가와 100% 일치 (Arma 결정 2026-05-30).
 *  - 가격 폰트 +1pt(13.5→14.5px). 배송비타입은 변동(changeText)과 동일 12.5px, 색 #A8A699.
 *
 * v8 변경 (2026-04-30, 트랙 E — 디자인 + Mixpanel):
 *  - 🐛 사용자 catch 2번: 행 콘텐츠 vertical-center.
 *    items-start → items-center. rank + 본문 영역 모두 행의 정확 가운데 정렬.
 *    rank의 mt-[2px] 제거 (items-center로 자동 정렬).
 *  - 🆕 mall click 시 trackMallClick("bookmark", ...) 호출.
 *    PC bookmark_nav 정합 (mall_key, mall_name, query, days_since_saved).
 *    + url이 쿠팡이면 coupang_hop_triggered + peopleAdd({total_coupang_hops: 1}).
 *
 * v7 (유지): 폰트 +0.5pt 누적.
 * v6 (유지): 변동폭 cur vs initial (PC computePriceChangeInfo 정합).
 * ========================================================= */
import { useExternalNavigate } from "../lib/externalLinkContext";
import { trackMallClick } from "../lib/trackMallClick";
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

/** PC bookmark_nav의 days_since_saved 계산 — created_at 기준 */
function calcDaysSinceSaved(createdAt) {
  if (!createdAt) return null;
  try {
    const ts = new Date(createdAt).getTime();
    if (!Number.isFinite(ts)) return null;
    const days = Math.floor((Date.now() - ts) / (24 * 60 * 60 * 1000));
    return days >= 0 ? days : null;
  } catch (_) {
    return null;
  }
}

export default function BookmarkItem({ bookmark, rank, isLowest, isNew, groupName }) {
  const navigate = useExternalNavigate();

  const handleClick = () => {
    if (!bookmark?.url) return;

    trackMallClick({
      context: "bookmark",
      mall: bookmark, // bookmark schema: mall_id, mall_name, url 모두 보유
      query: groupName || "",
      daysSinceSaved: calcDaysSinceSaved(bookmark.created_at),
    });

    navigate(bookmark.url);
  };

  const mallDisplay = bookmark.mall_name || bookmark.mall_id || "";
  const stale = getStaleDisplay(bookmark.last_check_status);

  const cur = bookmark.current_price != null ? Number(bookmark.current_price) : null;
  const initial = bookmark.initial_price != null ? Number(bookmark.initial_price) : null;

  // 배송비타입 + 합산가 — PC sidepanel.js #shipping-inclusive-price 정합.
  //   delivery_fee: N>0 유료 / 0 무료 / -1 조건부무료 / null 불명.
  //   유료(N>0)면 가격 = 상품가+배송비(합산가), 라벨 "배송비 포함" (PC 표시 100% 일치).
  //   배송비는 시간 불변 가정(#358) → 변동폭(changeText) 금액은 상품가 기준과 동일 (회귀 없음).
  const fee = bookmark.delivery_fee != null ? Number(bookmark.delivery_fee) : null;
  let priceText = null;
  let shipLabel = "";
  if (!stale && cur != null && cur > 0) {
    if (fee === -1) {
      priceText = `${cur.toLocaleString()}원`;
      shipLabel = "조건부 무료";
    } else if (fee != null && fee > 0) {
      priceText = `${(cur + fee).toLocaleString()}원`;
      shipLabel = "배송비 포함";
    } else if (fee === 0) {
      priceText = `${cur.toLocaleString()}원`;
      shipLabel = "무료 배송";
    } else {
      priceText = `${cur.toLocaleString()}원`;
      shipLabel = "배송비 별도";
    }
  }

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
      // v8 (트랙 E): items-start → items-center. 행 콘텐츠 vertical-center 정렬.
      className="w-full flex items-center gap-2 py-[7px] pl-2 pr-2 text-left transition-colors"
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
      {/* rank — v8: mt-[2px] 제거 (items-center로 자동 정렬) */}
      {rank != null && (
        <span
          className="flex-shrink-0 flex items-center justify-center"
          style={{
            // 타이틀↔상품명 left-align 위해 폭 2px 축소 (16 → 14px).
            width: "14px",
            fontSize: "12.5px",
            color: "#1A1A1A",
            fontWeight: 400,
            lineHeight: 1.3,
          }}
        >
          {rank}
        </span>
      )}

      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        {/* 상품 제목 */}
        <div
          className="line-clamp-2 break-all"
          style={{
            fontSize: "14.5px",
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
                fontSize: "13.5px",
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
                fontSize: "13.5px",
                color: stale.color,
                fontStyle: stale.style,
                textDecoration: stale.textDecoration,
              }}
            >
              {stale.text}
            </span>
          ) : (
            <>
              {priceText && (
                <span
                  className="flex-none"
                  // 가격 +1pt (13.5 → 14.5px). 유료배송이면 합산가.
                  style={{ fontSize: "14.5px", color: "#6B6B6B", fontWeight: 400 }}
                >
                  {priceText}
                </span>
              )}
              {shipLabel && (
                <span
                  className="flex-none"
                  // 배송비타입 — 변경사항과 동일 폰트 사이즈(12.5px), PC .bm-m-ship 색(#A8A699).
                  style={{ fontSize: "12.5px", color: "#A8A699", fontWeight: 400 }}
                >
                  {shipLabel}
                </span>
              )}
              {changeText && (
                <span
                  className="flex-none"
                  style={{
                    fontSize: "12.5px",
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
