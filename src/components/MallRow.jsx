/* =========================================================
 * src/components/MallRow.jsx
 * 카테고리 row — Events + SearchResults 공용.
 *
 * 분기:
 *  - items.length <= iconCount: 일반 grid (스와이프 없음, fit)
 *  - items.length > iconCount: scroll-snap 가로 스와이프 (mandatory, 1셀씩 sticky)
 *
 * cell width:
 *  - container width 100% / iconCount (gap 포함 계산).
 *  - 모든 카테고리에서 cell width 동일 → column 위치 자동 정렬.
 *
 * scroll-snap 동작:
 *  - scroll-snap-type: x mandatory — 자연스럽게 1셀 단위로 멈춤.
 *  - scroll-snap-align: start — 각 cell이 row 좌측에 정확히 정렬.
 *  - 스크롤바 숨김 (모바일 표준 UX).
 * ========================================================= */
import SharedMallCell from "./MallCell";

export default function MallRow({ items, iconBase, iconCount, onClickItem, keyPrefix }) {
  if (!items || items.length === 0) return null;

  const isOverflow = items.length > iconCount;

  // gap-2 = 8px. cell width = (100% - 8 * (iconCount - 1)) / iconCount.
  // 좌우 padding px-4 (16px씩) 고려해야 함.
  // grid의 경우 grid-template-columns로 자동 처리되니 N만 지정.
  // scroll-snap의 경우 각 cell width를 동일하게 명시 필요.

  if (!isOverflow) {
    // grid 방식: items 갯수 ≤ iconCount → grid에 빈 칸 없이 fit
    return (
      <div
        className="grid gap-2 px-4"
        style={{
          gridTemplateColumns: `repeat(${iconCount}, minmax(0, 1fr))`,
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
    );
  }

  // overflow 방식: scroll-snap 가로 스와이프
  return (
    <div
      className="overflow-x-auto px-4 mosaic-scroll-snap"
      style={{
        scrollSnapType: "x mandatory",
        WebkitOverflowScrolling: "touch", // iOS momentum
        scrollbarWidth: "none", // Firefox
        msOverflowStyle: "none", // Edge legacy
      }}
    >
      <div
        className="grid gap-2"
        style={{
          // grid auto-flow: column → 가로 배치 + 자동 column 갯수
          gridAutoFlow: "column",
          // 각 cell width = (container width - gap * (N-1)) / N
          // viewport 기반: (100vw - px-4*2 - gap*(N-1)) / N
          // 모바일에서 100vw === 화면 너비. 단, 스크롤바 영향 X (모바일).
          gridAutoColumns: `calc((100vw - 32px - ${(iconCount - 1) * 8}px) / ${iconCount})`,
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
  );
}
