/* =========================================================
 * src/components/MallRow.jsx
 * 카테고리 row — Events + SearchResults 공용.
 *
 * v9 변경 (2026-05-01, 트랙 E 3 — 사용자 catch):
 *  - 🐛 디폴트 로딩 시 가려진 cell 있으면 화살표 표시 보장.
 *    이전: useEffect 마운트 시점에 scrollWidth/clientWidth가 아직 안정 X
 *    (CSS calc 100vw 계산 전) → canRight false 가능성.
 *    fix: requestAnimationFrame로 layout 안정 후 한 번 더 update.
 *  - 🐛 scrollPaddingRight 제거. snap-align: end 단독으로 마지막 cell
 *    우측 정렬 보장. 일부 브라우저에서 scroll-padding-right와 end snap
 *    상호작용 미묘 catch 회피.
 *
 *  의미축:
 *    - 마지막 cell snap-align: end → container 우측에 정렬 (paddingRight 안쪽).
 *    - paddingRight: 16 = 우측 padding 16px → 마지막 cell과 viewport 우측 사이 16px 공간.
 *
 * v8 (유지): 마지막 cell snap-align: end.
 * v7 (제거): scrollPaddingRight.
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
  // v9: 초기 canRight true로 시작 (가려진 cell 있을 때 화살표 즉시 표시).
  // useEffect의 update가 false로 정정할 수 있음. items > iconCount 조건이라
  // 항상 가려진 cell 존재 → 디폴트 true가 안전.
  const [scrollState, setScrollState] = useState({ canLeft: false, canRight: true });

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const update = () => {
      const canLeft = el.scrollLeft > 4;
      const canRight = el.scrollLeft + el.clientWidth < el.scrollWidth - 4;
      setScrollState({ canLeft, canRight });
    };

    // v9: layout 안정 후 한 번 더 update (CSS calc 100vw 계산 보장).
    update();
    const raf = requestAnimationFrame(() => {
      update();
      // 추가 안전망: layout 추가 안정 후 한 번 더
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

  const lastIndex = items.length - 1;

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
          // v9: scrollPaddingRight 제거. snap-align: end가 우측 정렬 담당.
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
              style={{ scrollSnapAlign: i === lastIndex ? "end" : "start" }}
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
