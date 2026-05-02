/* =========================================================
 * src/pages/Bookmarks.jsx
 * 북마크 페이지 — 최저가 리포트 박스 + 그룹 카드 리스트.
 *
 * v0.5.0 변경 (2026-05, Phase 1.7 — SWR 도입):
 *  - 🆕 useBookmarks 훅 도입 — useState/useEffect 데이터 로드 로직 제거.
 *  - 🆕 SWR 캐시 hit 시 즉시 표시 → Events/Search와 UX 일관성.
 *    가격은 6시간 주기 갱신이라 캐시 stale risk = 사실상 0 (가격 신뢰 정책 위반 아님).
 *  - 🆕 데이터 변경 시 "북마크 갱신됨" 토스트.
 *  - 🆕 trackBookmarkTabViewDaily — useRef 가드로 첫 데이터 도착 시 1번만 호출.
 *    SWR revalidate에서 data가 갱신되어도 중복 호출 X (PC 정합 보장).
 *
 * v0.4.4 (유지): trackBookmarkTabViewDaily — bookmark_group_count, bookmark_target_count.
 * v0.4.3 (유지): select 컬럼 initial_price.
 * ========================================================= */
import { useEffect, useRef } from "react";
import { analytics } from "../lib/analytics.js";
import { useBookmarks } from "../hooks/useBookmarks.js";
import BookmarkGroup from "../components/BookmarkGroup";
import BookmarkReport from "../components/BookmarkReport";

const NEW_WINDOW_MS = 24 * 60 * 60 * 1000;

function computeNewestBookmarkId(groups) {
  let id = null;
  let ts = 0;
  for (const g of groups || []) {
    for (const bm of g.bookmarks || []) {
      if (!bm.created_at) continue;
      const t = new Date(bm.created_at).getTime();
      if (!Number.isFinite(t)) continue;
      if (t > ts) {
        ts = t;
        id = bm.id;
      }
    }
  }
  if (!ts || Date.now() - ts >= NEW_WINDOW_MS) return null;
  return id;
}

export default function Bookmarks() {
  const { data, groups, isLoading, error } = useBookmarks();
  const trackedRef = useRef(false);

  // v0.5.0: trackBookmarkTabViewDaily — 첫 데이터 도착 시 1번만 호출.
  // SWR revalidate로 data가 새 배열 참조가 되어도 trackedRef로 가드.
  // 페이지 unmount → 재 mount 시 trackedRef 초기화 → 다시 추적 (PC "탭 진입 시" 정합).
  useEffect(() => {
    if (data == null || trackedRef.current) return;
    trackedRef.current = true;
    try {
      const groupCount = groups.length;
      const targetCount = groups.filter(
        (g) => g.target_price != null && Number(g.target_price) > 0
      ).length;
      analytics.trackBookmarkTabViewDaily({
        bookmark_group_count: groupCount,
        bookmark_target_count: targetCount,
      });
    } catch (_) {}
  }, [data, groups]);

  // 첫 진입 (캐시 없음) — 로딩 UI
  if (isLoading && groups.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-sm text-mosaic-text-muted">
        불러오는 중...
      </div>
    );
  }

  // 첫 진입 + 에러
  if (error && groups.length === 0) {
    return (
      <div className="px-4 py-4">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-700">북마크 조회 실패</p>
          <p className="mt-1 text-xs text-red-600 break-all">
            {error.message || String(error)}
          </p>
        </div>
      </div>
    );
  }

  // 진짜 북마크 없음 (data 도착 + 빈 배열)
  if (groups.length === 0) {
    return (
      <div className="px-4 py-4">
        <div className="rounded-xl border border-dashed border-mosaic-line p-8 text-center">
          <p className="text-2xl">🔖</p>
          <p className="mt-2 text-sm font-medium">아직 북마크가 없어요</p>
          <p className="mt-1 text-xs text-mosaic-text-muted leading-relaxed">
            PC 확장에서 상품을 북마크하면
            <br />
            여기서 확인할 수 있어요
          </p>
        </div>
      </div>
    );
  }

  const totalItems = groups.reduce(
    (sum, g) => sum + (g.bookmarks?.length || 0),
    0,
  );

  const newestBookmarkId = computeNewestBookmarkId(groups);

  return (
    <div className="px-4 py-3">
      <BookmarkReport groups={groups} totalItems={totalItems} />
      <div className="flex flex-col gap-2">
        {groups.map((g) => (
          <BookmarkGroup
            key={g.id}
            group={g}
            bookmarks={g.bookmarks || []}
            newestBookmarkId={newestBookmarkId}
          />
        ))}
      </div>
    </div>
  );
}
