/* =========================================================
 * src/pages/Search.jsx
 * 검색 페이지 — 핀 고정 키워드 + 최근 검색 표시.
 *
 * v2 변경 (2026-04-30, 사용자 catch):
 *  - 🐛 키워드 클릭 시 검색결과 페이지로 navigate (이전: 클릭 무반응).
 *    핀 고정 + 최근 검색 둘 다 동일.
 *    URL 패턴: /search?q={keyword} — Search.jsx 자체에서 q 분기로 SearchResults 렌더.
 *  - PC 정합 폰트 +1pt 적용 (모바일 가독성).
 *
 * Phase 1 정책:
 *  - read-only: 입력창 disabled. 새 검색 추가 X.
 *  - PC 사이드패널과 시각적으로 정렬: 핀 고정 위쪽, 최근 검색 아래쪽.
 * ========================================================= */
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase.js";
import SearchResults from "../components/SearchResults";

export default function Search() {
  const [params] = useSearchParams();
  const query = params.get("q")?.trim() || "";

  // q 있으면 검색결과 화면
  if (query) {
    return <SearchResults query={query} />;
  }

  // q 없으면 핀 고정 + 최근 검색 리스트
  return <SearchHome />;
}

function SearchHome() {
  const navigate = useNavigate();
  const [pinned, setPinned] = useState({ status: "loading", rows: [], error: null });
  const [history, setHistory] = useState({ status: "loading", rows: [], error: null });

  useEffect(() => {
    let cancelled = false;
    (async () => {
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

  // 키워드 클릭 시 검색결과로 이동
  const goToResults = (keyword) => {
    if (!keyword) return;
    navigate(`/search?q=${encodeURIComponent(keyword)}`);
  };

  return (
    <div className="px-4 py-4">
      {/* 검색 입력창 (Phase 1 disabled) */}
      <div
        className="flex items-center gap-2 rounded-xl px-4 py-3 opacity-60"
        style={{
          background: "#FFFFFF",
          border: "1px solid #EFECE3",
        }}
      >
        <span style={{ color: "#6B6B6B" }}>🔍</span>
        <input
          type="search"
          inputMode="search"
          placeholder="PC에서 검색해주세요"
          className="flex-1 bg-transparent outline-none"
          style={{ fontSize: "15px", color: "#1A1A1A" }}
          disabled
        />
      </div>
      <p className="mt-2" style={{ fontSize: "12px", color: "#6B6B6B" }}>
        Phase 1은 조회 전용입니다. 새 검색은 PC 확장에서 진행하세요.
      </p>

      {/* 핀 고정 키워드 */}
      <Section
        title="핀 고정 키워드"
        icon="📌"
        state={pinned}
        emptyMessage="PC에서 핀으로 고정한 키워드가 여기에 표시돼요"
        renderItem={(row) => (
          <button
            type="button"
            onClick={() => goToResults(row.keyword)}
            className="flex w-full items-center gap-2 px-4 py-3 text-left transition-colors"
            style={{ background: "transparent" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#FAFAF7")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <span style={{ fontSize: "13px", color: "#E8762B" }}>📌</span>
            <span
              className="truncate"
              style={{ fontSize: "14px", color: "#1A1A1A" }}
            >
              {row.keyword}
            </span>
          </button>
        )}
      />

      {/* 최근 검색 */}
      <Section
        title="최근 검색"
        icon="🕘"
        state={history}
        emptyMessage="최근 PC에서 검색한 키워드가 여기에 표시돼요"
        renderItem={(row) => (
          <button
            type="button"
            onClick={() => goToResults(row.keyword)}
            className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left transition-colors"
            style={{ background: "transparent" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#FAFAF7")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <span
              className="truncate"
              style={{ fontSize: "14px", color: "#1A1A1A" }}
            >
              {row.keyword}
            </span>
            <span
              className="shrink-0"
              style={{ fontSize: "12px", color: "#A8A699" }}
            >
              {formatRelative(row.last_searched_at)}
            </span>
          </button>
        )}
      />
    </div>
  );
}

function Section({ title, icon, state, emptyMessage, renderItem }) {
  return (
    <section className="mt-5">
      <h2
        className="mb-2 flex items-center gap-1.5 font-semibold"
        style={{ fontSize: "13px", color: "#6B6B6B" }}
      >
        <span>{icon}</span>
        <span>{title}</span>
        {state.status === "ok" && (
          <span className="ml-1 font-normal">({state.rows.length})</span>
        )}
      </h2>

      {state.status === "loading" && (
        <p style={{ fontSize: "13px", color: "#6B6B6B" }}>불러오는 중...</p>
      )}

      {state.status === "error" && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="break-all" style={{ fontSize: "13px", color: "#b91c1c" }}>
            에러: {state.error}
          </p>
        </div>
      )}

      {state.status === "ok" && state.rows.length === 0 && (
        <p style={{ fontSize: "13px", color: "#6B6B6B" }}>{emptyMessage}</p>
      )}

      {state.status === "ok" && state.rows.length > 0 && (
        <ul
          className="flex flex-col overflow-hidden rounded-xl"
          style={{
            background: "#FFFFFF",
            border: "1px solid #EFECE3",
          }}
        >
          {state.rows.map((row, i) => (
            <li
              key={`${row.keyword}-${i}`}
              style={{
                borderTop: i === 0 ? "none" : "1px solid #F5F3EC",
              }}
            >
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
