/* =========================================================
 * src/components/BookmarkGroup.jsx
 * 북마크 그룹 카드 — PC .bm-group 톤.
 *
 * v2 변경 (2026-04-30, 단계 4):
 *  - 정렬 + rank 부여 로직 (current_price 오름차순, null 뒤로).
 *  - 펼치기 정책 구현:
 *      기본 표시 = 최저가 1개 + NEW (24h 이내 created) — 사용자 결정.
 *      나머지는 "+N개 더보기" 버튼으로 펼침.
 *      mall 1개뿐이면 펼치기 버튼 없음.
 *  - Pill 컴포넌트 사용 (target-achieved / target-default).
 *  - 미설정 그룹도 "목표가 미설정" Pill 표시 (PC 정합).
 *  - 토큰 마이그레이션 + line-card 사용.
 *
 * PC 디자인 매핑:
 *  - .bm-group: border line-card / radius 8px / bg surface
 *  - .bm-q: 12px / weight 800 / text
 *  - 그룹 헤더: 핀(active 시 accent) + 제목 + 배지
 *  - 항상 펼침 상태 X — PWA에서 펼치기 정책 적용
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

export default function BookmarkGroup({ group, bookmarks }) {
  const [expanded, setExpanded] = useState(false);

  // 1. 정렬: current_price 오름차순 (null/0은 뒤로)
  const sorted = (bookmarks || []).slice().sort((a, b) => {
    const ap = a.current_price;
    const bp = b.current_price;
    const aValid = ap != null && ap > 0;
    const bValid = bp != null && bp > 0;
    if (!aValid && !bValid) return 0;
    if (!aValid) return 1;
    if (!bValid) return -1;
    return ap - bp;
  });

  // 2. rank 부여 (정렬 후 1, 2, 3...)
  const ranked = sorted.map((bm, idx) => ({ ...bm, _rank: idx + 1 }));

  // 3. NEW 식별 (created_at 24시간 이내)
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

  // 4. 기본 표시 = 최저가(rank 1) + NEW (있으면, 중복 제외)
  const defaultDisplayed = [];
  if (ranked.length > 0) {
    defaultDisplayed.push(ranked[0]); // 최저가
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
                isLowest={bm._rank === 1}
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
