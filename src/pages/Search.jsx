/* =========================================================
 * src/pages/Search.jsx
 * 검색 페이지 — 핀 고정 + 최근 검색.
 *
 * v4 변경 (2026-05-01, 트랙 E 3 — 사용자 catch):
 *  - 🐛 섹션 헤더 아이콘 제거 (Star, Clock 모두). 키워드별 북마크 아이콘이
 *    있으니 헤더 아이콘 중복.
 *  - 🐛 헤더 폰트 14px → 12px (-2pt). 직관적 검색 페이지에서 타이틀이
 *    돋보일 필요 없음.
 *  - 🐛 wrapper py-4 → pt-3 pb-4. Events.jsx pt-3과 정합 (위 여백 정합).
 *
 * v3 (제거): StarIcon/ClockIcon 헤더 아이콘.
 * v3 (유지): "최근 검색 키워드" 텍스트 + 키워드 앞 북마크 아이콘.
 * ========================================================= */
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase.js";
import SearchResults from "../components/SearchResults";

/** 키워드 앞 북마크 아이콘. filled = 핀고정, outline = 최근검색.
 *  Phase 2: 클릭 시 핀고정 토글. */
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

/** Section 헤더 — v4: 아이콘 없음, 12px (-2pt). */
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
          fontSize: "12px",
          fontWeight: 400,
        }}
      >
        {title}
        {state.status === "ok" && (
          <span> ({state.rows.length})</span>
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
