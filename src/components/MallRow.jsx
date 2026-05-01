/* =========================================================
 * src/components/MallRow.jsx
 * 카테고리 row — Events + SearchResults 공용.
 *
 * v3 변경 (2026-05-01, 트랙 E 3):
 *  - 🐛 cell width = iconCount 기준 가변 (v2 6 고정 방식 폐기).
 *    5개 설정 → cell 자체가 커져서 5개가 화면에 꽉 차게.
 *    6개 설정 → cell 적당히 작아져서 6개가 화면에 꽉 차게.
 *    같은 iconCount 내에서 모든 카테고리 cell width 동일 → column 정합.
 *  - 🆕 좌우 화살표 유지 (스와이프 가능 시 회색 < > 표시).
 *
 * v2 (제거): 6 기준 고정 — 사용자 catch.
 * v1 (회귀): 가변 width 방식.
 * ========================================================= */
import { useEffect, useRef, useState } from "react";
import SharedMallCell from "./MallCell";

const GAP_PX = 8;
const PADDING_X_PX = 16;

export default function MallRow({ items, iconBase, iconCount, onClickItem, keyPrefix }) {
  if (!items || items.length === 0) return null;

  const isOverflow = items.length > iconCount;

  // cell width = iconCount 기준 가변. 5개 설정 시 더 큼, 6개 설정 시 더 작음.
  const cellWidth = `calc((100vw - ${PADDING_X_PX * 2}px - ${(iconCount - 1) * GAP_PX}px) / ${iconCount})`;

  if (!isOverflow) {
    // 일반 grid — items ≤ iconCount, 스와이프 X.
    return (
      <div className="px-4">
        <div
          className="grid gap-2"
          style={{
            gridTemplateColumns: `repeat(${iconCount}, ${cellWidth})`,
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
    />
  );
}

function SwipeRow({ items, iconBase, keyPrefix, onClickItem, cellWidth }) {
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
          className="grid gap-2"
          style={{
            gridAutoFlow: "column",
            gridAutoColumns: cellWidth,
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
