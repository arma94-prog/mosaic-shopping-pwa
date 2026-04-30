/* =========================================================
 * src/components/BookmarkGroup.jsx
 * 북마크 그룹 카드 — PC .bm-group 톤.
 *
 * v3 변경 (2026-04-30, 사용자 catch 2건):
 *  - 🐛 isLowest 의미 정정 (단계 4 미스):
 *    이전: rank === 1 (그룹 안 가격 1위) — 잘못된 의미.
 *    이후: PC computePriceChangeInfo() 매핑 — 각 mall이 자기 역대 최저가 갱신했는지 판정.
 *      조건: status === "ok" AND current_price === lowest_price
 *           AND previous_price !== null AND previous_price !== current_price
 *      (PC 정확 매핑은 priceHistory unique values >= 2 검증인데
 *       PWA에서는 previous_price !== current_price로 99% 매칭 — Phase 2에서 priceHistory 미러링 시 정확화)
 *    한 그룹 안에 여러 mall이 동시에 isLowest 가능 (각자 자기 역대 최저면).
 *
 *  - 정렬 정책 (PWA 한정 — PC와 다름, 사용자 결정):
 *    이전: 가격 오름차순. status 무관.
 *    이후: ok mall (status === "ok" 또는 미정의) 먼저 가격 오름차순,
 *          그 후 stale mall (sold_out 등) 가격 오름차순.
 *    이유: 사용자가 솔드아웃 mall은 신뢰도 낮으므로 정렬 뒤로.
 *
 *  - 가격 동률 시 최신 createdAt 먼저 (PC 매핑 유지).
 *
 * 펼치기 정책 (이전 결정 유지, PC bmExpandCount=1과 일치):
 *  - 기본 표시 = sorted[0] (가장 싼 ok mall) + NEW (24h 이내 created_at)
 *  - 펼치기 = 모든 mall
 * ========================================================= */
import { useState } from "react";
import BookmarkItem from "./BookmarkItem";
import Pill from "./Pill";

const NEW_THRESHOLD_MS = 24 * 60 * 60 * 1000; // 24시간

function PinIcon() {
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

/** mall이 자기 역대 최저가를 갱신한 record low 상태인지 판정.
 *  PC computePriceChangeInfo() 매핑 (sidepanel.js Line 2362-2400).
 *  
 *  PC 정확 조건:
 *    - lastCheckStatus === "ok" (실패 상태에서는 false)
 *    - priceHistory.length >= 2
 *    - uniqueValues.size >= 2 (가격이 2개 이상 다른 값으로 변동된 적 있음)
 *    - currentPrice === minPrice
 *  
 *  PWA 매핑 (priceHistory 미러링 없이):
 *    - status === "ok"
 *    - current_price === lowest_price
 *    - previous_price !== null AND previous_price !== current_price
 *      (= 직전 가격과 현재 가격이 다름 = 가격 변동 이력 보장 = unique >= 2)
 */
function isLowestRecord(bm) {
  if (bm.last_check_status && bm.last_check_status !== "ok") return false;
  if (bm.current_price == null || bm.lowest_price == null) return false;
  if (bm.current_price !== bm.lowest_price) return false;
  if (bm.previous_price == null) return false;
  if (bm.previous_price === bm.current_price) return false;
  return true;
}

/** mall이 stale (정상 가격 추출 실패 — sold_out, not_found 등) 상태인지. */
function isStale(bm) {
  return !!(bm.last_check_status && bm.last_check_status !== "ok");
}

export default function BookmarkGroup({ group, bookmarks }) {
  const [expanded, setExpanded] = useState(false);

  // 1. 정렬: ok mall 먼저 가격 오름차순, stale mall은 맨 뒤 (사용자 결정).
  const sorted = (bookmarks || []).slice().sort((a, b) => {
    const aStale = isStale(a);
    const bStale = isStale(b);
    if (aStale !== bStale) return aStale ? 1 : -1;
    // 같은 status 그룹 안: 가격 오름차순 (null/0은 뒤로)
    const ap = a.current_price;
    const bp = b.current_price;
    const aValid = ap != null && ap > 0;
    const bValid = bp != null && bp > 0;
    if (!aValid && !bValid) return 0;
    if (!aValid) return 1;
    if (!bValid) return -1;
    if (ap !== bp) return ap - bp;
    // 가격 동률: 최신 createdAt 먼저 (PC 매핑)
    const aCreated = new Date(a.created_at || 0).getTime();
    const bCreated = new Date(b.created_at || 0).getTime();
    return bCreated - aCreated;
  });

  // 2. rank 부여 (정렬 순서 1, 2, 3...)
  const ranked = sorted.map((bm, idx) => ({ ...bm, _rank: idx + 1 }));

  // 3. NEW 식별 (created_at 24h 이내)
  const now = Date.now();
  const newIds = new Set(
    ranked
      .filter((bm) => {
        if (!bm.created_at) return false;
        const ts = new Date(bm.created_at).getTime();
        return Number.isFinite(ts) && now - ts < NEW_THRESHOLD_MS;
      })
      .map((bm) => bm.id),
  );

  // 4. 기본 표시 = sorted[0] (가장 싼 ok mall) + NEW (있으면, 중복 제외)
  //    PC 매핑: bmExpandCount=1, slice(0,1) + newest 추가.
  const defaultDisplayed = [];
  if (ranked.length > 0) {
    defaultDisplayed.push(ranked[0]);
  }
  ranked.forEach((bm) => {
    if (newIds.has(bm.id) && !defaultDisplayed.includes(bm)) {
      defaultDisplayed.push(bm);
    }
  });

  // 5. 표시 결정
  const displayed = expanded ? ranked : defaultDisplayed;
  const hiddenCount = ranked.length - defaultDisplayed.length;
  const canExpand = hiddenCount > 0;

  // 6. 그룹 헤더 배지 결정
  const hasTarget = group.target_price != null && Number(group.target_price) > 0;

  return (
    <article
      className="
        border border-mosaic-line-card
        rounded-lg
        bg-mosaic-surface
        overflow-hidden
      "
    >
      {/* 그룹 헤더 — PC .bm-g-hd 매핑 */}
      <header className="flex items-center gap-1 px-2 py-2">
        {group.is_pinned && <PinIcon />}

        <h3 className="flex-1 min-w-0 text-[12px] font-extrabold text-mosaic-text truncate">
          {group.name || "(이름 없음)"}
        </h3>

        {/* 목표가 배지 — PC 정합 (미설정도 표시) */}
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
          <div className="border-t border-mosaic-line">
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

          {/* 펼치기/접기 버튼 */}
          {canExpand && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="
                w-full py-2
                text-[10px] text-mosaic-text-soft
                border-t border-mosaic-line-soft
                hover:text-mosaic-text-muted
                hover:bg-mosaic-surface-hover
                active:bg-mosaic-surface-hover
                transition-colors
              "
            >
              {expanded ? "접기 ▲" : `+ ${hiddenCount}개 더보기 ▼`}
            </button>
          )}
        </>
      ) : (
        <div className="border-t border-mosaic-line py-3 px-2 text-center text-[11px] text-mosaic-text-soft">
          아직 등록된 상품이 없어요
        </div>
      )}
    </article>
  );
}
