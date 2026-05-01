/* =========================================================
 * src/components/MallRow.jsx
 * 카테고리 row — Events + SearchResults 공용.
 *
 * v2 변경 (2026-05-01, 트랙 E 3):
 *  - 🐛 cell width 항상 6열 기준으로 고정 (iconCount 무관).
 *    iconCount 5 시: cell 6개 width 그대로 + viewport에 5개만 보임 + 6번째 가려짐.
 *    좌측 padding/gap도 동일. 시각 일관성.
 *  - 🆕 좌우 스와이프 가능 시 화살표 (< >) 표시.
 *    scroll position 따라 양쪽/한쪽만 표시. 회색 #C8C4B5.
 *
 * 스크롤 동작:
 *  - scroll-snap-type: x mandatory — 1셀 단위로 sticky.
 *  - 위아래 카테고리 cell width 동일 → column 위치 자동 정합.
 * ========================================================= */
import { useEffect, useRef, useState } from "react";
import SharedMallCell from "./MallCell";

const BASE_COLUMNS = 6; // cell width 기준값 (iconCount 무관)
const GAP_PX = 8;
const PADDING_X_PX = 16;

export default function MallRow({ items, iconBase, iconCount, onClickItem, keyPrefix }) {
  if (!items || items.length === 0) return null;

  const isOverflow = items.length > iconCount;

  // cell width = 항상 6열 기준
  const cellWidth = `calc((100vw - ${PADDING_X_PX * 2}px - ${(BASE_COLUMNS - 1) * GAP_PX}px) / ${BASE_COLUMNS})`;

  if (!isOverflow) {
    // 일반 grid — items ≤ iconCount, 스와이프 X.
    // cell width는 6 기준으로 고정 (작은 카테고리도 다른 카테고리와 정렬).
    return (
      <div className="px-4">
        <div
          className="grid gap-2"
          style={{
            gridTemplateColumns: `repeat(${BASE_COLUMNS}, ${cellWidth})`,
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

  // 스와이프 — items > iconCount.
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

      {/* 좌측 화살표 — 좌측에 더 있을 때 */}
      {scrollState.canLeft && <SwipeArrow direction="left" />}
      {/* 우측 화살표 — 우측에 더 있을 때 */}
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
        // 살짝 그라디언트로 자연스럽게 (선택사항이지만 인상 좋음)
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
