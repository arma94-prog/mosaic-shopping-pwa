/* =========================================================
 * src/components/MallRow.jsx
 * 카테고리 row — Events + SearchResults 공용.
 *
 * v7 변경 (2026-05-01, 트랙 E 3 — 사용자 catch):
 *  - 🐛 v6 spacer over-stretch fix.
 *    이전 v6: 끝 spacer (iconCount-1 cells 만큼) → 마지막 cell이 좌측 1번째
 *    위치까지 이동 가능 catch.
 *    fix: spacer 제거 + scrollPaddingRight 16px 복원.
 *    의도: iconCount 5 + items 6개 시, cell6는 5번째 (우측 끝) 위치까지만
 *    이동. 좌측 1번째까지 X. 5번째 위치 = 우측 padding 안쪽에 cell6 정렬.
 *
 *  의미축:
 *    scroll-snap-align: start 모든 cell.
 *    좌측 padding 16 = 첫 cell 시작점 (정렬 기준).
 *    우측 padding 16 = 끝점 limit (마지막 cell이 이 안쪽에 닿으면 스크롤 끝).
 *
 * v6 (제거): trailing spacer.
 * v5 (회귀): scrollPaddingRight 16.
 * ========================================================= */
import { useEffect, useRef, useState } from "react";
import SharedMallCell from "./MallCell";

const BASE_COLUMNS = 6;
const BASE_GAP_PX = 8;
const PADDING_X_PX = 16;

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
        className="overflow-x-auto mosaic-scroll-snap"
        style={{
          scrollSnapType: "x mandatory",
          paddingLeft: `${PADDING_X_PX}px`,
          paddingRight: `${PADDING_X_PX}px`,
          scrollPaddingLeft: `${PADDING_X_PX}px`,
          // v7: scrollPaddingRight 복원 — 마지막 cell이 우측 padding 안쪽에 정렬되면 끝.
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
