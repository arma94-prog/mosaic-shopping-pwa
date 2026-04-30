/* =========================================================
 * src/pages/Bookmarks.jsx
 * 북마크 페이지 — 최저가 리포트 박스 + 그룹 카드 리스트.
 *
 * v0.4.1 변경 (2026-04-30):
 *  - bookmarks 쿼리에 last_check_status 컬럼 추가 (솔드아웃 등 표시용).
 *
 * Phase 1 정책 (read-only).
 * ========================================================= */
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase.js";
import BookmarkGroup from "../components/BookmarkGroup";
import BookmarkReport from "../components/BookmarkReport";

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
            previous_price,
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

      setState({ status: "ok", groups: data || [], error: null });
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

  return (
    <div className="px-4 py-3">
      <BookmarkReport groups={state.groups} totalItems={totalItems} />
      <div className="flex flex-col gap-2">
        {state.groups.map((g) => (
          <BookmarkGroup
            key={g.id}
            group={g}
            bookmarks={g.bookmarks || []}
          />
        ))}
      </div>
    </div>
  );
}
