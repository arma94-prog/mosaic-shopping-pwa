/* =========================================================
 * src/pages/Bookmarks.jsx
 * 북마크 페이지 — 그룹 + 상품 nested fetch + PC 톤 카드 리스트.
 *
 * v0.2.0 변경 (2026-04-30, 세션 3):
 *  - Supabase nested query로 bookmark_groups + bookmarks 한 번에 fetch.
 *  - BookmarkGroup / BookmarkItem 컴포넌트로 책임 분리 (단일 파일 → 3 파일).
 *  - PC 사이드패널 톤 정확 매칭 (.bm-group, .bm-mall, .bm-m-* 등).
 *  - 상품 클릭 → useExternalNavigate → 외부 webview.
 *  - last_price_check_at "n분 전 확인" 표시.
 *
 * 정렬 (PC sortBookmarks 룰 모방):
 *  1. is_pinned 우선 (핀 고정)
 *  2. target_achieved 우선 (목표가 달성)
 *  3. updated_at 최신
 *  그룹 안 상품: position 오름차순 (사용자가 PC에서 정렬한 순서)
 *
 * Phase 1 정책 (read-only):
 *  - 그룹 생성/수정/삭제 X
 *  - PC 확장에서 자동 갱신된 데이터 조회만
 *
 * Phase 2 후속:
 *  - 그룹 클릭 시 토글 (펼침/접힘)
 *  - 가격 변동 그래프
 *  - mall_id → 사용자 친화적 mall name 매핑 (mosaic-search-malls.json)
 * ========================================================= */
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase.js";
import BookmarkGroup from "../components/BookmarkGroup";

export default function Bookmarks() {
  const [state, setState] = useState({
    status: "loading",
    groups: [],
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Supabase nested query: bookmark_groups + bookmarks 한 번에.
      // RLS가 두 테이블 모두 적용되어 사용자 본인 데이터만 반환.
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
            current_price,
            lowest_price,
            last_price_check_at,
            updated_at,
            position
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

      // 그룹 안 bookmarks는 position 오름차순 정렬 (Supabase nested order는 별도 옵션 필요해서 클라이언트 정렬)
      const groups = (data || []).map((g) => ({
        ...g,
        bookmarks: (g.bookmarks || [])
          .slice()
          .sort((a, b) => (a.position || 0) - (b.position || 0)),
      }));

      setState({ status: "ok", groups, error: null });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (state.status === "loading") {
    return (
      <div className="px-4 py-8 text-center text-sm text-mosaic-muted">
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
          <p className="mt-1 text-xs text-mosaic-muted leading-relaxed">
            PC 확장에서 상품을 북마크하면
            <br />
            여기서 확인할 수 있어요
          </p>
        </div>
      </div>
    );
  }

  // 전체 상품 카운트 (안내 메시지용)
  const totalItems = state.groups.reduce(
    (sum, g) => sum + (g.bookmarks?.length || 0),
    0,
  );

  return (
    <div className="px-4 py-3">
      <p className="mb-2 text-[11px] text-mosaic-muted-3">
        {state.groups.length}개 그룹 · {totalItems}개 상품 · PC에서 자동 갱신
      </p>
      <div className="flex flex-col gap-2">
        {state.groups.map((g) => (
          <BookmarkGroup
            key={g.id}
            group={g}
            bookmarks={g.bookmarks}
          />
        ))}
      </div>
    </div>
  );
}
