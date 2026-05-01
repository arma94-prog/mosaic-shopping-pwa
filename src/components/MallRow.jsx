/* =========================================================
 * src/components/MallRow.jsx
 * 카테고리 row — Events + SearchResults 공용.
 *
 * v18 변경 (2026-05-01, 트랙 E 3 — 사용자 catch):
 *  - 🐛 TRAILING_GAP_RATIO 0.59 → 0.57.
 *  - 🐛 화살표 색 #C8C4B5 → #DDD8C8 (카테고리 라인 #EFECE3과 화살표 사이 톤).
 *    더 연한 인상. 방향 신호는 유지.
 *  - 🐛 디폴트 로딩 시 가려진 cell 있으면 '>' 표시 보장.
 *    update() 안에 layout 미완료 가드 (scrollWidth=0 시 무시).
 *    초기 state canRight: true → 첫 렌더에서 즉시 표시.
 *
 * v17 (제거): 0.59, #C8C4B5.
 * ========================================================= */
import { useEffect, useRef, useState } from "react";
import SharedMallCell from "./MallCell";

const BASE_COLUMNS = 6;
const BASE_GAP_PX = 8;
const PADDING_X_PX = 16;
const TRAILING_SPACER_PX = 4;
const TRAILING_GAP_RATIO = 0.57; // v18: 0.59 → 0.57
const ARROW_COLOR = "#DDD8C8"; // v18: 더 연한 톤 (라인 #EFECE3과 화살표 #C8C4B5 사이)

export default function MallRow({ items, iconBase, iconCount, onClickItem, keyPrefix }) {
  if (!items || items.length === 0) return null;

  const isOverflow = items.length > iconCount;

  const cellWidth = `calc((100vw - ${PADDING_X_PX * 2}px - ${(BASE_COLUMNS - 1) * BASE_GAP_PX}px) / ${BASE_COLUMNS})`;

  const gap =
    iconCount === BASE_COLUMNS
      ? `${BASE_GAP_PX}px`
      : `calc((100vw - ${PADDING_X_PX * 2}px - ${iconCount} * ((100vw - ${PADDING_X_PX * 2}px - ${(BASE_COLUMNS - 1) * BASE_GAP_PX}px) / ${BASE_COLUMNS})) / ${iconCount - 1})`;

  if (!isOverflow) {
    return (
      <div className="px-4">
        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${iconCount}, ${cellWidth})`,
            gap,
          }}
        >
          {items.map((mall, i) => (
            <SharedMallCell
              key={`${keyPrefix}-${mall.name}-${i}`}
              mall={mall}
              iconBase={iconBase}
              onClick={() => onClickItem(mall)}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <SwipeRow
      items={items}
      iconBase={iconBase}
      keyPrefix={keyPrefix}
      onClickItem={onClickItem}
      cellWidth={cellWidth}
      gap={gap}
    />
  );
}

function SwipeRow({ items, iconBase, keyPrefix, onClickItem, cellWidth, gap }) {
  const scrollRef = useRef(null);
  // 초기값: 가려진 cell 있음 (isOverflow) → canRight true.
  const [scrollState, setScrollState] = useState({ canLeft: false, canRight: true });

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const update = () => {
      // v18: layout 미완료 시 무시. scrollWidth=0이면 측정값 신뢰 X.
      if (!el.scrollWidth || !el.clientWidth) return;
      const canLeft = el.scrollLeft > 4;
      const canRight = el.scrollLeft + el.clientWidth < el.scrollWidth - 4;
      setScrollState({ canLeft, canRight });
    };

    update();
    const raf = requestAnimationFrame(() => {
      update();
      requestAnimationFrame(update);
    });

    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [items.length, cellWidth, gap]);

  const spacerMarginLeft = `calc(${gap} * -${1 - TRAILING_GAP_RATIO})`;

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className="overflow-x-auto mosaic-scroll-snap"
        style={{
          scrollSnapType: "x mandatory",
          paddingLeft: `${PADDING_X_PX}px`,
          paddingRight: `${PADDING_X_PX}px`,
          scrollPaddingLeft: `${PADDING_X_PX}px`,
          scrollPaddingRight: `${PADDING_X_PX}px`,
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <div
          className="grid"
          style={{
            gridAutoFlow: "column",
            gridAutoColumns: cellWidth,
            gap,
          }}
        >
          {items.map((mall, i) => (
            <div
              key={`${keyPrefix}-${mall.name}-${i}`}
              style={{
                scrollSnapAlign: "start",
                scrollSnapStop: "always",
              }}
            >
              <SharedMallCell
                mall={mall}
                iconBase={iconBase}
                onClick={() => onClickItem(mall)}
              />
            </div>
          ))}
          <div
            aria-hidden="true"
            style={{
              width: `${TRAILING_SPACER_PX}px`,
              marginLeft: spacerMarginLeft,
              flexShrink: 0,
              scrollSnapAlign: "none",
            }}
          />
        </div>
      </div>

      {scrollState.canLeft && <SwipeArrow direction="left" />}
      {scrollState.canRight && <SwipeArrow direction="right" />}
    </div>
  );
}

function SwipeArrow({ direction }) {
  const isLeft = direction === "left";
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute top-0 bottom-0 flex items-center"
      style={{
        [isLeft ? "left" : "right"]: 0,
        width: "16px",
        background: isLeft
          ? "linear-gradient(to right, #FAFAF7 30%, transparent)"
          : "linear-gradient(to left, #FAFAF7 30%, transparent)",
        justifyContent: isLeft ? "flex-start" : "flex-end",
        paddingLeft: isLeft ? "2px" : 0,
        paddingRight: isLeft ? 0 : "2px",
      }}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke={ARROW_COLOR}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {isLeft ? (
          <polyline points="15 18 9 12 15 6" />
        ) : (
          <polyline points="9 18 15 12 9 6" />
        )}
      </svg>
    </div>
  );
}
