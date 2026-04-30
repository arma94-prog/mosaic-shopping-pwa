/* =========================================================
 * src/pages/Search.jsx
 *
 * URL ?q= 양방향 동기화로 분기:
 *  - q 없음: 핀 고정 키워드 + 최근 검색 히스토리 (read-only)
 *  - q 있음: SearchResults — 6열 격자 통합 검색
 *
 * 헤더의 SearchBar가 ?q= 갱신 → 본 컴포넌트가 분기 렌더.
 *
 * v3 변경 (2026-04-30, 단계 4):
 *  - 인라인 disabled 검색창 제거 (헤더 SearchBar로 통합).
 *  - URL ?q= 분기 (세션 2 패턴 통합).
 *  - lib/relativeTime 사용 (세션 3 추출).
 *  - 토큰 마이그레이션: muted → text-muted.
 * ========================================================= */
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase.js";
import { formatRelative } from "../lib/relativeTime";
import SearchResults from "../components/SearchResults";

export default function Search() {
  const [params] = useSearchParams();
  const query = (params.get("q") || "").trim();

  // q 있으면 통합 검색 결과 화면
  if (query) {
    return <SearchResults query={query} />;
  }

  // q 없으면 핀 고정 + 최근 검색 (히스토리 뷰)
  return <SearchHistory />;
}

function SearchHistory() {
  const [pinned, setPinned] = useState({ status: "loading", rows: [], error: null });
  const [history, setHistory] = useState({ status: "loading", rows: [], error: null });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // 핀 고정 키워드 — position 오름차순
      const pinnedRes = await supabase
        .from("keywords")
        .select("keyword, position")
        .order("position", { ascending: true });
      if (!cancelled) {
        if (pinnedRes.error) {
          setPinned({ status: "error", rows: [], error: pinnedRes.error.message });
        } else {
          setPinned({ status: "ok", rows: pinnedRes.data ?? [], error: null });
        }
      }

      // 최근 검색 — last_searched_at 내림차순
      const historyRes = await supabase
        .from("search_history")
        .select("keyword, last_searched_at")
        .order("last_searched_at", { ascending: false })
        .limit(50);
      if (!cancelled) {
        if (historyRes.error) {
          setHistory({ status: "error", rows: [], error: historyRes.error.message });
        } else {
          setHistory({ status: "ok", rows: historyRes.data ?? [], error: null });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="px-4 py-3">
      {/* 핀 고정 키워드 */}
      <Section
        title="핀 고정 키워드"
        icon="📌"
        state={pinned}
        emptyMessage="PC에서 핀으로 고정한 키워드가 여기에 표시돼요"
        renderItem={(row) => (
          <div className="flex items-center gap-2">
            <span className="text-mosaic-accent text-xs">📌</span>
            <span className="truncate text-sm">{row.keyword}</span>
          </div>
        )}
      />

      {/* 최근 검색 */}
      <Section
        title="최근 검색"
        icon="🕘"
        state={history}
        emptyMessage="최근 PC에서 검색한 키워드가 여기에 표시돼요"
        renderItem={(row) => (
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-sm">{row.keyword}</span>
            <span className="shrink-0 text-xs text-mosaic-text-soft">
              {formatRelative(row.last_searched_at)}
            </span>
          </div>
        )}
      />
    </div>
  );
}

function Section({ title, icon, state, emptyMessage, renderItem }) {
  return (
    <section className="mt-2 first:mt-0">
      <h2 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-mosaic-text-muted">
        <span>{icon}</span>
        <span>{title}</span>
        {state.status === "ok" && (
          <span className="ml-1 font-normal">({state.rows.length})</span>
        )}
      </h2>

      {state.status === "loading" && (
        <p className="text-xs text-mosaic-text-muted">불러오는 중...</p>
      )}

      {state.status === "error" && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-xs text-red-700 break-all">에러: {state.error}</p>
        </div>
      )}

      {state.status === "ok" && state.rows.length === 0 && (
        <p className="text-xs text-mosaic-text-muted">{emptyMessage}</p>
      )}

      {state.status === "ok" && state.rows.length > 0 && (
        <ul className="flex flex-col divide-y divide-mosaic-line overflow-hidden rounded-xl border border-mosaic-line bg-mosaic-surface">
          {state.rows.map((row, i) => (
            <li key={`${row.keyword}-${i}`} className="px-4 py-3">
              {renderItem(row)}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
