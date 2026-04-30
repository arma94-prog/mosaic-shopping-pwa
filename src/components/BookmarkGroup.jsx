/* =========================================================
 * src/components/BookmarkGroup.jsx
 * 북마크 그룹 카드 — PC .bm-group 정합 + 클릭 가능 그룹명.
 *
 * v7 변경 (2026-04-30, fix-1):
 *  - 🐛 isLowestRecord 로직 PC computePriceChangeInfo 정합.
 *    이전 (v6): previous_price !== current_price (직전가 비교)
 *    이후 (v7): initial_price !== current_price (최초가 비교)
 *    의미: "최초 등록가에서 변동 + 현재가 = 최저가" → 최저가 신기록.
 *    PC 사이드패널의 unique 가격 종류 ≥ 2 조건과 product 의미 동일.
 *
 * v6 (유지): 그룹명 클릭 → 검색결과 navigate. 폰트 +2pt.
 * v5 (유지): PC 정확 hex 색.
 * v4 (유지): NEW 판정 PC 매핑.
 * v3 (유지): 정렬 + isLowest 정정.
 * ========================================================= */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BookmarkItem from "./BookmarkItem";
import Pill from "./Pill";

/* PC .bm-pin SVG 정확 path (sidepanel.js 1924-1925 검증).
 * - 핀 고정: filled (currentColor) + 색 #E8762B
 * - 핀 안 됨: outline + 색 #C8C4B5 (회색)
 * 모양은 책갈피 (bookmark) — pin이 아니라 bookmark icon으로 일관.
 * Phase 1: 클릭 미작동 (read-only). Phase 2: 핀 토글 활성. */
function BookmarkPinIcon({ pinned }) {
  if (pinned) {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="flex-shrink-0"
        style={{ color: "#E8762B" }}
      >
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
    );
  }
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="flex-shrink-0"
      style={{ color: "#C8C4B5" }}
    >
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

/** v7 (fix-1): 최저가 신기록 판정. PC computePriceChangeInfo 정합.
 *  조건: stale 아님 + 현재가/최저가/최초가 모두 정상 + 현재가 = 최저가 + 최초가 != 현재가.
 *  의미: 최초 등록가에서 가격이 변동했고, 현재가가 역대 최저가 → 최저가 신기록 배지.
 *  PC의 uniqueValues.size >= 2 조건과 product 의미 동일 (priceHistory 전체 못 받는 PWA 한계 내 근사).
 */
function isLowestRecord(bm) {
  if (bm.last_check_status && bm.last_check_status !== "ok") return false;
  if (bm.current_price == null || bm.lowest_price == null) return false;
  if (bm.current_price !== bm.lowest_price) return false;
  if (bm.initial_price == null) return false;
  if (bm.initial_price === bm.current_price) return false;
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
        {/* 북마크 아이콘 — PC .bm-pin과 동일. 핀 여부에 따라 filled/outline.
         * Phase 1: 클릭 미작동 (read-only). Phase 2: 핀 토글 활성 예정. */}
        <BookmarkPinIcon pinned={!!group.is_pinned} />

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
