/* =========================================================
 * src/components/BookmarkGroup.jsx
 * 북마크 그룹 카드 — PC .bm-group 톤 정확 매칭.
 *
 * PC 디자인 매핑:
 *  - .bm-group: border 1px #E0DCCE / radius 8px / bg white
 *  - .bm-g-hd: padding 8px 8px / gap 4px
 *  - .bm-q: 12px / weight 800 / #1A1A1A / truncate
 *  - .bm-pin.on: color #E8762B (mosaic-accent)
 *  - .bm-g-target.achieved: bg #E1F5EE / color #0F6E56 / 9px / 700 / pill
 *  - .bm-g-target.active: bg #F0EFEA / color #666 (목표가 미달성)
 *  - .bm-malls: border-top #EFECE3
 *
 * 데이터:
 *  - group.name, group.is_pinned, group.target_price, group.target_achieved
 *  - bookmarks: 그룹에 속한 상품 배열 (position 정렬됨)
 *
 * 정책 (메모리 결정):
 *  - 항상 펼침 상태 (토글 없음)
 *  - 쇼핑몰 아이콘 미표시 (텍스트만)
 * ========================================================= */
import BookmarkItem from "./BookmarkItem";

function PinIcon({ active }) {
  // active 시 mosaic-accent (#E8762B), 비활성 시 자리 공백
  if (!active) return null;
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className="text-mosaic-accent flex-shrink-0"
    >
      <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" />
    </svg>
  );
}

export default function BookmarkGroup({ group, bookmarks }) {
  const hasTarget = group.target_price != null && Number(group.target_price) > 0;

  // 목표가 배지 스타일 분기 (PC .bm-g-target 매핑)
  let targetBadgeClass = "";
  let targetBadgeText = "";
  if (hasTarget) {
    if (group.target_achieved) {
      targetBadgeClass =
        "bg-mosaic-target-bg text-mosaic-target-text font-bold";
      targetBadgeText = "달성";
    } else {
      targetBadgeClass = "bg-[#F0EFEA] text-[#666666] font-semibold";
      targetBadgeText = `목표 ${Number(group.target_price).toLocaleString()}원`;
    }
  }

  return (
    <article
      className="
        border border-[#E0DCCE]
        rounded-lg
        bg-white
        overflow-hidden
      "
    >
      {/* 그룹 헤더 — PC .bm-g-hd */}
      <header className="flex items-center gap-1 px-2 py-2">
        <PinIcon active={!!group.is_pinned} />

        <h3
          className="
            flex-1 min-w-0
            text-[12px] font-extrabold text-mosaic-text
            truncate
          "
        >
          {group.name || "(이름 없음)"}
        </h3>

        {hasTarget && (
          <span
            className={`
              inline-block flex-shrink-0
              text-[9px]
              px-1.5 py-[2px]
              rounded-full
              tracking-[0.3px] leading-[1.4]
              ${targetBadgeClass}
            `}
          >
            {targetBadgeText}
          </span>
        )}
      </header>

      {/* 상품 리스트 — PC .bm-malls */}
      {bookmarks && bookmarks.length > 0 ? (
        <div className="border-t border-mosaic-line">
          {bookmarks.map((bm) => (
            <BookmarkItem
              key={bm.id || bm.url}
              bookmark={bm}
            />
          ))}
        </div>
      ) : (
        <div className="border-t border-mosaic-line py-3 px-2 text-center text-[11px] text-mosaic-muted-3">
          아직 등록된 상품이 없어요
        </div>
      )}
    </article>
  );
}
