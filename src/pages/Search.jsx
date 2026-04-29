/* =========================================================
 * src/pages/Search.jsx
 * 검색 페이지 — URL ?q= 분기로 두 view 전환.
 *
 * 세션 2 변경 (v0.1.2 → v0.2.0):
 *  - 검색바를 헤더로 이전 (Header.jsx의 SearchBar 컴포넌트).
 *  - URL ?q= 있으면 SearchResults 렌더, 없으면 기존 히스토리 view.
 *  - 핀고정/최근검색 클릭 → setSearchParams({ q }) → 결과 view로 전환.
 *  - 기존 v0.1.2의 read 로직(keywords/search_history Supabase select)은 그대로 보존.
 *  - 기존 입력창 + Phase 1 안내 메시지는 제거 (검색바가 헤더로 이전됨).
 *
 * URL 정책:
 *  - ?q= 있음 → 결과 view (6열 격자)
 *  - ?q= 없음 → 히스토리 view (핀고정 + 최근검색)
 *  - 새로고침/뒤로가기 안전 (URL이 진실)
 * ========================================================= */
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase.js";
import SearchResults from "../components/SearchResults";

export default function Search() {
  const [params, setParams] = useSearchParams();
  const query = (params.get("q") || "").trim();

  if (query) {
    return <SearchResults query={query} />;
  }

  return (
    <SearchHistory
      onSelect={(keyword) => {
        const k = (keyword || "").trim();
        if (k) setParams({ q: k });
      }}
    />
  );
}

function SearchHistory({ onSelect }) {
  const [pinned, setPinned] = useState({ status: "loading", rows: [], error: null });
  const [history, setHistory] = useState({ status: "loading", rows: [], error: null });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // 핀 고정 키워드 — position 오름차순 (사용자가 정렬한 순서)
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

      // 최근 검색 — last_searched_at 내림차순 (최신 상단)
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
    <div className="px-4 py-4">
      {/* 핀 고정 키워드 */}
      <Section
        title="핀 고정 키워드"
        icon="📌"
        state={pinned}
        emptyMessage="PC에서 핀으로 고정한 키워드가 여기에 표시돼요"
        onItemClick={(row) => onSelect(row.keyword)}
        renderItem={(row) => (
          <div className="flex items-center gap-2">
            <span className="text-xs">📌</span>
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
        onItemClick={(row) => onSelect(row.keyword)}
        renderItem={(row) => (
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-sm">{row.keyword}</span>
            <span className="shrink-0 text-xs text-mosaic-muted">
              {formatRelative(row.last_searched_at)}
            </span>
          </div>
        )}
      />
    </div>
  );
}

function Section({ title, icon, state, emptyMessage, renderItem, onItemClick }) {
  return (
    <section className="mt-2 first:mt-0">
      <h2 className="mb-2 mt-3 flex items-center gap-1.5 text-xs font-semibold text-mosaic-muted">
        <span>{icon}</span>
        <span>{title}</span>
        {state.status === "ok" && (
          <span className="ml-1 font-normal">({state.rows.length})</span>
        )}
      </h2>

      {state.status === "loading" && (
        <p className="text-xs text-mosaic-muted">불러오는 중...</p>
      )}

      {state.status === "error" && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-xs text-red-700 break-all">에러: {state.error}</p>
        </div>
      )}

      {state.status === "ok" && state.rows.length === 0 && (
        <p className="text-xs text-mosaic-muted">{emptyMessage}</p>
      )}

      {state.status === "ok" && state.rows.length > 0 && (
        <ul className="flex flex-col divide-y divide-mosaic-line overflow-hidden rounded-xl border border-mosaic-line bg-mosaic-surface">
          {state.rows.map((row, i) => (
            <li key={`${row.keyword}-${i}`}>
              <button
                onClick={() => onItemClick?.(row)}
                className="
                  w-full px-4 py-3
                  text-left
                  active:bg-mosaic-line/40
                  transition-colors
                "
                aria-label={`${row.keyword} 검색`}
              >
                {renderItem(row)}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function formatRelative(iso) {
  if (!iso) return "";
  const ts = new Date(iso).getTime();
  if (Number.isNaN(ts)) return "";
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "방금";
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}일 전`;
  return new Date(iso).toLocaleDateString("ko-KR");
}
