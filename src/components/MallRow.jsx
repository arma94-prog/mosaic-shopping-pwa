/* =========================================================
 * src/components/MallRow.jsx
 * 카테고리 row — Events + SearchResults 공용.
 *
 * v6 변경 (2026-05-01, 트랙 E 3 — 사용자 catch):
 *  - 🐛 마지막 cell이 좌측 padding에 정확 정렬되도록 끝에 spacer div 추가.
 *    이전: scrollWidth가 cell 합 + padding 만큼 → 마지막 cell이 좌측 정렬 못 함
 *    (우측 공간 부족). 끝까지 스와이프해도 마지막 cell이 우측 끝에 멈춤.
 *    fix: scrollPaddingRight 제거 + 마지막 cell 다음에 invisible spacer
 *    (width = clientWidth - cellWidth - 좌측 padding) → 마지막 cell 좌측 정렬 가능.
 *
 *  의도: "마지막 cell 옆에 빈 공간 보임 = 추가 스와이프 X" 인상.
 *
 * v5 (제거): scrollPaddingRight 16px (scrolling 끝점 제한 catch).
 * v4 (유지): cell width 6 기준 + gap 가변.
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
      iconCount={iconCount}
      keyPrefix={keyPrefix}
      onClickItem={onClickItem}
      cellWidth={cellWidth}
      gap={gap}
    />
  );
}

function SwipeRow({ items, iconBase, iconCount, keyPrefix, onClickItem, cellWidth, gap }) {
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

  // v6: 끝 spacer width = (iconCount - 1) cells + (iconCount - 1) gaps.
  // 즉 viewport 안에서 마지막 cell 외 나머지 칸들 만큼의 공간을 cell 뒤에 추가.
  // 마지막 cell이 좌측 padding 위치에 정확히 정렬됐을 때 우측에 (iconCount-1) cells 만큼 빈 공간.
  const trailingSpacerWidth = `calc((${iconCount - 1}) * ${cellWidth} + (${iconCount - 1}) * ${gap})`;

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
          // v6: scrollPaddingRight 제거. spacer가 우측 공간 담당.
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
          {/* v6: 끝 spacer — 마지막 cell이 좌측 정렬될 수 있도록 우측에 빈 공간 추가 */}
          <div
            aria-hidden="true"
            style={{
              width: trailingSpacerWidth,
              flexShrink: 0,
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
