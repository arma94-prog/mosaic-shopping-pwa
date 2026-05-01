/* =========================================================
 * src/components/MallRow.jsx
 * 카테고리 row — Events + SearchResults 공용.
 *
 * v4 변경 (2026-05-01, 트랙 E 3):
 *  - 🐛 cell width 항상 6열 기준 고정.
 *    iconCount 5 시: cell width 동일 + gap만 넓어짐 → 5개 viewport 채움.
 *    iconCount 6 시: cell + gap 정확 fit (현재 동작).
 *  - 화살표는 v3 그대로 유지.
 *
 *  수학:
 *    cell width (고정) = (100vw - 32 - 5*8) / 6 = (100vw - 72) / 6
 *    gap (가변) = (100vw - 32 - iconCount * cellWidth) / (iconCount - 1)
 *    iconCount=6: gap = (100vw-32-6*(100vw-72)/6)/5 = (100vw-32-100vw+72)/5 = 40/5 = 8px ✓
 *    iconCount=5: gap = (100vw-32-5*(100vw-72)/6)/4 = (100vw/6 + 28)/4 ≈ 22px @ 360w
 *
 *  스와이프 (overflow):
 *    items > iconCount → 6번째 cell이 viewport 밖 → 우측 스와이프.
 *    cell width + gap 패턴 유지 → 위아래 column 정합.
 *
 * v3 (제거): cell width = iconCount 기준 가변. 사용자 catch.
 * v2 (제거): 6 기준 + 5번째까지만 보임. 사용자 catch.
 * ========================================================= */
import { useEffect, useRef, useState } from "react";
import SharedMallCell from "./MallCell";

const BASE_COLUMNS = 6;
const BASE_GAP_PX = 8;
const PADDING_X_PX = 16;

export default function MallRow({ items, iconBase, iconCount, onClickItem, keyPrefix }) {
  if (!items || items.length === 0) return null;

  const isOverflow = items.length > iconCount;

  // cell width = 6 기준 고정.
  // (100vw - 좌우 padding - 5개 gap) / 6
  const cellWidth = `calc((100vw - ${PADDING_X_PX * 2}px - ${(BASE_COLUMNS - 1) * BASE_GAP_PX}px) / ${BASE_COLUMNS})`;

  // gap = iconCount 따라 가변.
  // iconCount cells + (iconCount-1) gaps = (100vw - 32) (viewport 정확 채움)
  // → gap = ((100vw - 32) - iconCount * cellWidth) / (iconCount - 1)
  // iconCount=6 → gap = 8px (정확 일치)
  // iconCount=5 → gap = ((100vw-32) - 5*cellWidth) / 4 (큼)
  const gap =
    iconCount === BASE_COLUMNS
      ? `${BASE_GAP_PX}px`
      : `calc((100vw - ${PADDING_X_PX * 2}px - ${iconCount} * ((100vw - ${PADDING_X_PX * 2}px - ${(BASE_COLUMNS - 1) * BASE_GAP_PX}px) / ${BASE_COLUMNS})) / ${iconCount - 1})`;

  if (!isOverflow) {
    // 일반 grid — items ≤ iconCount, 스와이프 X.
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
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [items.length]);

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className="overflow-x-auto px-4 mosaic-scroll-snap"
        style={{
          scrollSnapType: "x mandatory",
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
