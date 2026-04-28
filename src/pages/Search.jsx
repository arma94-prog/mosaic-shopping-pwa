/* =========================================================
 * src/pages/Search.jsx
 * v0.1.2: 핀 고정 키워드(keywords) + 최근 검색(search_history) 미러 데이터 read.
 *
 * Phase 1 정책:
 *  - read-only: 입력창 disabled. 모바일에서 새 검색 추가/이력 기록 X.
 *  - PC 사이드패널과 시각적으로 정렬: 핀 고정 위쪽, 최근 검색 아래쪽.
 *  - 항목 탭은 다음 세션에서 검색결과 페이지로 navigate 연결.
 * ========================================================= */
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase.js";

export default function Search() {
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
      {/* 검색 입력창 (Phase 1 disabled) */}
      <div className="flex items-center gap-2 rounded-xl border border-mosaic-line bg-mosaic-surface px-4 py-3 opacity-60">
        <span className="text-mosaic-muted">🔍</span>
        <input
          type="search"
          inputMode="search"
          placeholder="PC에서 검색해주세요"
          className="flex-1 bg-transparent text-base outline-none placeholder:text-mosaic-muted"
          disabled
        />
      </div>
      <p className="mt-2 text-[11px] text-mosaic-muted">
        Phase 1은 조회 전용입니다. 새 검색은 PC 확장에서 진행하세요.
      </p>

      {/* 핀 고정 키워드 */}
      <Section
        title="핀 고정 키워드"
        icon="📌"
        state={pinned}
        emptyMessage="PC에서 핀으로 고정한 키워드가 여기에 표시돼요"
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

function Section({ title, icon, state, emptyMessage, renderItem }) {
  return (
    <section className="mt-5">
      <h2 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-mosaic-muted">
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
            <li key={`${row.keyword}-${i}`} className="px-4 py-3">
              {renderItem(row)}
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
