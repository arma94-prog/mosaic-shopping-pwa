/* =========================================================
 * src/components/BookmarkGroup.jsx
 * 북마크 그룹 카드 — PC .bm-group 정합 + 클릭 가능 그룹명.
 *
 * v6 변경 (2026-04-30, 사용자 catch):
 *  - 🐛 그룹명 클릭 시 검색결과로 navigate (사용자 catch).
 *    PC 사이드패널 .bm-q-text와 동일한 클릭 동작.
 *  - 폰트 +1pt 추가 (전체 +2pt 누적). 이전 v5: 13px → v6: 14px.
 *
 *  - v5 (PC 정확 hex 색) 유지.
 *  - v4 (NEW 판정 PC 매핑) 유지.
 *  - v3 (정렬 + isLowest 정정) 유지.
 * ========================================================= */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  // 그룹명 클릭 시 검색결과로 (group.name = 검색어 query)
  const handleNameClick = () => {
    if (group?.name) {
      navigate(`/search?q=${encodeURIComponent(group.name)}`);
    }
  };

  // 1. 정렬: stale mall (sold_out 등) 맨 뒤 + ok mall 가격 오름차순
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

  // 2. NEW — 전역 단 1개 prop
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
      {/* 그룹 헤더 */}
      <header className="flex items-center gap-1 px-2 py-2">
        {group.is_pinned && <PinIcon />}

        {/* 그룹명 — 클릭 가능 (검색결과로 navigate) */}
        <button
          type="button"
          onClick={handleNameClick}
          className="flex-1 min-w-0 truncate text-left"
          style={{
            fontSize: "14px",
            color: "#1A1A1A",
            fontWeight: 800,
            background: "transparent",
            border: "none",
            padding: 0,
            cursor: "pointer",
          }}
          aria-label={`${group.name} 검색 결과 보기`}
        >
          {group.name || "(이름 없음)"}
        </button>

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

      {ranked.length > 0 ? (
        <>
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

          {canExpand && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full py-2 transition-colors"
              style={{
                fontSize: "11px",
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
            fontSize: "13px",
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
