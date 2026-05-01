/* =========================================================
 * src/components/MallRow.jsx
 * 카테고리 row — Events + SearchResults 공용.
 *
 * v13 변경 (2026-05-01, 트랙 E 3 — 사용자 catch):
 *  - 🐛 trailing spacer 13 → 6px.
 *
 * v12 (제거): 13.
 * v11 (유지): 모든 cell start snap + 끝 spacer.
 * ========================================================= */
import { useEffect, useRef, useState } from "react";
import SharedMallCell from "./MallCell";

const BASE_COLUMNS = 6;
const BASE_GAP_PX = 8;
const PADDING_X_PX = 16;
const TRAILING_SPACER_PX = 6; // v13: 13 → 6

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
  const [scrollState, setScrollState] = useState({ canLeft: false, canRight: true });

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const update = () => {
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
              style={{ scrollSnapAlign: "start" }}
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
        stroke="#C8C4B5"
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
