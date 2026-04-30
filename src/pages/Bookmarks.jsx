/* =========================================================
 * src/pages/Bookmarks.jsx
 * 북마크 페이지 — 최저가 리포트 박스 + 그룹 카드 리스트.
 *
 * v0.4.4 변경 (2026-04-30, 트랙 E — Mixpanel):
 *  - 🆕 mount 시 (data 로드 완료 후) trackBookmarkTabViewDaily 호출.
 *    PC trackBookmarkTabViewDaily 정합 — 하루 1번만 발동.
 *    속성: bookmark_group_count, bookmark_target_count.
 *
 * v0.4.3 (유지): select 컬럼 initial_price.
 * v0.4.2 (유지): NEW 판정 로직.
 * ========================================================= */
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase.js";
import { analytics } from "../lib/analytics.js";
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
  const [state, setState] = useState({
    status: "loading",
    groups: [],
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("bookmark_groups")
        .select(`
          id,
          local_id,
          name,
          is_pinned,
          target_price,
          target_achieved,
          position,
          updated_at,
          bookmarks (
            id,
            title,
            url,
            mall_id,
            mall_name,
            current_price,
            initial_price,
            lowest_price,
            last_price_check_at,
            last_check_status,
            updated_at,
            position,
            created_at
          )
        `)
        .order("is_pinned", { ascending: false })
        .order("target_achieved", { ascending: false })
        .order("updated_at", { ascending: false });

      if (cancelled) return;

      if (error) {
        setState({ status: "error", groups: [], error: error.message });
        return;
      }

      const groups = data || [];
      setState({ status: "ok", groups, error: null });

      // v0.4.4: bookmark_tab_view daily 트랙. PC 정합.
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
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (state.status === "loading") {
    return (
      <div className="px-4 py-8 text-center text-sm text-mosaic-text-muted">
        불러오는 중...
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="px-4 py-4">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-700">북마크 조회 실패</p>
          <p className="mt-1 text-xs text-red-600 break-all">{state.error}</p>
        </div>
      </div>
    );
  }

  if (state.groups.length === 0) {
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

  const totalItems = state.groups.reduce(
    (sum, g) => sum + (g.bookmarks?.length || 0),
    0,
  );

  const newestBookmarkId = computeNewestBookmarkId(state.groups);

  return (
    <div className="px-4 py-3">
      <BookmarkReport groups={state.groups} totalItems={totalItems} />
      <div className="flex flex-col gap-2">
        {state.groups.map((g) => (
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
