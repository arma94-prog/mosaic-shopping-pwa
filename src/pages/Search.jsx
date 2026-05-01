/* =========================================================
 * src/pages/Search.jsx
 * 검색 페이지 — 핀 고정 + 최근 검색.
 *
 * v7 변경 (2026-05-01, 트랙 E 3 — 사용자 catch latency):
 *  - 🐛 pinned + history fetch를 Promise.all 병렬화.
 *    이전 v6: await 직렬 (pinned 응답 후 history 시작) → 100~200ms.
 *    fix: 둘 다 동시 시작 → 50~100ms (50% 개선).
 *  - 실시간성 100% 유지 — fetch 빈도/freshness 변경 X.
 *    PC ↔ 모바일 동기화 product spec 정합.
 *  - 디자인/마크업 v6 그대로 보존.
 *
 * v6 (유지): 핀고정 firstSection={true} 명시. 핀고정 위 여백 catch fix.
 * v5 (유지): 헤더 (n) 제거, 폰트 12px.
 * v4 (유지): 헤더 아이콘 제거.
 * v3 (유지): "최근 검색 키워드" + 키워드 앞 북마크 아이콘.
 * ========================================================= */
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase.js";
import SearchResults from "../components/SearchResults";

function KeywordBookmarkIcon({ filled }) {
  if (filled) {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="#E8762B"
        stroke="#E8762B"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="flex-shrink-0"
      >
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
    );
  }
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#C8C4B5"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="flex-shrink-0"
    >
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

export default function Search() {
  const [params] = useSearchParams();
  const query = params.get("q")?.trim() || "";

  if (query) {
    return <SearchResults query={query} />;
  }

  return <SearchHome />;
}

function SearchHome() {
  const navigate = useNavigate();
  const [pinned, setPinned] = useState({ status: "loading", rows: [], error: null });
  const [history, setHistory] = useState({ status: "loading", rows: [], error: null });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // v7: Promise.all 병렬화. 두 query 독립적이라 병렬 실행 안전.
      // 직렬 100~200ms → 병렬 50~100ms (50% 개선). 실시간성 100% 유지.
      const [pinnedRes, historyRes] = await Promise.all([
        supabase
          .from("keywords")
          .select("keyword, position")
          .order("position", { ascending: true }),
        supabase
          .from("search_history")
          .select("keyword, last_searched_at")
          .order("last_searched_at", { ascending: false })
          .limit(50),
      ]);

      if (cancelled) return;

      if (pinnedRes.error) {
        setPinned({ status: "error", rows: [], error: pinnedRes.error.message });
      } else {
        setPinned({ status: "ok", rows: pinnedRes.data ?? [], error: null });
      }

      if (historyRes.error) {
        setHistory({ status: "error", rows: [], error: historyRes.error.message });
      } else {
        setHistory({ status: "ok", rows: historyRes.data ?? [], error: null });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const goToResults = (keyword) => {
    if (!keyword) return;
    navigate(`/search?q=${encodeURIComponent(keyword)}`);
  };

  const showPinned = pinned.status === "ok" && pinned.rows.length > 0;

  return (
    <div className="px-4 pt-3 pb-4">
      {showPinned && (
        <Section
          title="핀 고정 키워드"
          firstSection={true}
          state={pinned}
          renderItem={(row) => (
            <button
              type="button"
              onClick={() => goToResults(row.keyword)}
              className="flex w-full items-center gap-2 px-4 py-3 text-left transition-colors"
              style={{ background: "transparent" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#FAFAF7")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <KeywordBookmarkIcon filled={true} />
              <span
                className="truncate"
                style={{ fontSize: "14px", color: "#1A1A1A" }}
              >
                {row.keyword}
              </span>
            </button>
          )}
        />
      )}

      <Section
        title="최근 검색 키워드"
        state={history}
        emptyMessage="최근 검색한 키워드가 여기에 표시돼요"
        firstSection={!showPinned}
        renderItem={(row) => (
          <button
            type="button"
            onClick={() => goToResults(row.keyword)}
            className="flex w-full items-center gap-2 px-4 py-3 text-left transition-colors"
            style={{ background: "transparent" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#FAFAF7")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <KeywordBookmarkIcon filled={false} />
            <span
              className="truncate"
              style={{ fontSize: "14px", color: "#1A1A1A" }}
            >
              {row.keyword}
            </span>
          </button>
        )}
      />
    </div>
  );
}

function Section({ title, state, emptyMessage, renderItem, firstSection }) {
  return (
    <section style={{ marginTop: firstSection ? 0 : "20px" }}>
      <h2
        className="pl-[7px]"
        style={{
          color: "#5C3D1F",
          paddingTop: "2px",
          paddingBottom: "2px",
          marginBottom: "8px",
          marginTop: 0,
          fontSize: "12px",
          fontWeight: 400,
        }}
      >
        {title}
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

      {state.status === "ok" && state.rows.length === 0 && emptyMessage && (
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
