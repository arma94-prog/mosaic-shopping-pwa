/* =========================================================
 * src/components/BookmarkGroup.jsx
 * 북마크 그룹 카드 — PC .bm-group 정확 매핑.
 *
 * v5 변경 (2026-04-30, 사용자 catch):
 *  - PC 정확 hex 색 직접 지정 (Tailwind 토큰 매칭 실패 의심 우회):
 *    - .bm-group border #E0DCCE
 *    - .bm-q (그룹명) #1A1A1A weight 800 13px (PC 12 +1)
 *  - 폰트 +1pt (모바일 가독성).
 *
 *  - v4 (NEW 판정 로직 PC 매핑) 유지.
 *  - v3 (정렬 + isLowest 정정) 유지.
 * ========================================================= */
import { useState } from "react";
import BookmarkItem from "./BookmarkItem";
import Pill from "./Pill";

function PinIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className="flex-shrink-0"
      style={{ color: "#E8762B" }}
    >
      <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" />
    </svg>
  );
}

function isLowestRecord(bm) {
  if (bm.last_check_status && bm.last_check_status !== "ok") return false;
  if (bm.current_price == null || bm.lowest_price == null) return false;
  if (bm.current_price !== bm.lowest_price) return false;
  if (bm.previous_price == null) return false;
  if (bm.previous_price === bm.current_price) return false;
  return true;
}

function isStale(bm) {
  return !!(bm.last_check_status && bm.last_check_status !== "ok");
}

export default function BookmarkGroup({ group, bookmarks, newestBookmarkId }) {
  const [expanded, setExpanded] = useState(false);

  // 1. 정렬: stale mall (sold_out 등) 맨 뒤 + ok mall은 가격 오름차순
  const sorted = (bookmarks || []).slice().sort((a, b) => {
    const aStale = isStale(a);
    const bStale = isStale(b);
    if (aStale !== bStale) return aStale ? 1 : -1;
    const ap = a.current_price;
    const bp = b.current_price;
    const aValid = ap != null && ap > 0;
    const bValid = bp != null && bp > 0;
    if (!aValid && !bValid) return 0;
    if (!aValid) return 1;
    if (!bValid) return -1;
    if (ap !== bp) return ap - bp;
    const aCreated = new Date(a.created_at || 0).getTime();
    const bCreated = new Date(b.created_at || 0).getTime();
    return bCreated - aCreated;
  });

  const ranked = sorted.map((bm, idx) => ({ ...bm, _rank: idx + 1 }));

  // 2. NEW — 전역 단 1개 (PC computeNewestBookmarkKey 매핑)
  const newIds = new Set();
  if (newestBookmarkId) {
    newIds.add(newestBookmarkId);
  }

  // 3. 기본 표시 = sorted[0] + NEW
  const defaultDisplayed = [];
  if (ranked.length > 0) {
    defaultDisplayed.push(ranked[0]);
  }
  ranked.forEach((bm) => {
    if (newIds.has(bm.id) && !defaultDisplayed.includes(bm)) {
      defaultDisplayed.push(bm);
    }
  });

  const displayed = expanded ? ranked : defaultDisplayed;
  const hiddenCount = ranked.length - defaultDisplayed.length;
  const canExpand = hiddenCount > 0;

  const hasTarget = group.target_price != null && Number(group.target_price) > 0;

  return (
    <article
      className="rounded-lg overflow-hidden"
      style={{
        background: "#FFFFFF",
        border: "1px solid #E0DCCE",
      }}
    >
      {/* 그룹 헤더 — PC .bm-g-hd: padding 8px, gap 4px, .bm-q 12px → 13px PWA */}
      <header className="flex items-center gap-1 px-2 py-2">
        {group.is_pinned && <PinIcon />}

        <h3
          className="flex-1 min-w-0 font-extrabold truncate"
          style={{ fontSize: "13px", color: "#1A1A1A" }}
        >
          {group.name || "(이름 없음)"}
        </h3>

        {hasTarget ? (
          group.target_achieved ? (
            <Pill variant="target-achieved">달성</Pill>
          ) : (
            <Pill variant="target-default">
              목표 {Number(group.target_price).toLocaleString()}원
            </Pill>
          )
        ) : (
          <Pill variant="target-default">목표가 미설정</Pill>
        )}
      </header>

      {/* 상품 리스트 */}
      {ranked.length > 0 ? (
        <>
          {/* PC .bm-malls border-top #EFECE3 */}
          <div style={{ borderTop: "1px solid #EFECE3" }}>
            {displayed.map((bm) => (
              <BookmarkItem
                key={bm.id || bm.url}
                bookmark={bm}
                rank={bm._rank}
                isLowest={isLowestRecord(bm)}
                isNew={newIds.has(bm.id)}
              />
            ))}
          </div>

          {/* 펼치기/접기 버튼 — PC .bm-malls-more: 9px → 10px PWA */}
          {canExpand && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full py-2 transition-colors"
              style={{
                fontSize: "10px",
                color: "#A8A699",
                borderTop: "1px solid #F5F3EC",
                background: "transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#666";
                e.currentTarget.style.background = "#FAFAF7";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#A8A699";
                e.currentTarget.style.background = "transparent";
              }}
            >
              {expanded ? "접기 ▲" : `+ ${hiddenCount}개 더보기 ▼`}
            </button>
          )}
        </>
      ) : (
        <div
          className="py-3 px-2 text-center"
          style={{
            fontSize: "12px",
            color: "#A8A699",
            borderTop: "1px solid #EFECE3",
          }}
        >
          아직 등록된 상품이 없어요
        </div>
      )}
    </article>
  );
}
