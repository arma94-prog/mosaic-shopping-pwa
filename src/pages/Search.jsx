/* =========================================================
 * src/pages/Search.jsx
 * 검색 페이지 — 핀 고정 + 최근 검색.
 *
 * v3 변경 (2026-05-01, 트랙 E 3 — 사용자 catch):
 *  - 🆕 핀 고정 섹션 헤더 아이콘 📌 → StarIcon (outline). 시안 C 선택.
 *  - 🆕 "최근 검색" → "최근 검색 키워드".
 *  - 🆕 키워드 앞 북마크 아이콘 추가 (PC 캡쳐 정합):
 *    - 핀 고정: BookmarkIconFilled (filled + 주황 #E8762B).
 *    - 최근 검색: BookmarkIconOutline (outline + 회색 #C8C4B5).
 *  - Phase 2: 북마크 아이콘 클릭 시 핀고정 토글 (예정).
 *
 * v2 (유지): Section 헤더 통일 (#5C3D1F, 14px 400, pl-[7px]).
 * ========================================================= */
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase.js";
import SearchResults from "../components/SearchResults";

/** Lucide outline clock — 최근 검색 헤더 */
function ClockIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

/** Lucide outline star — 핀 고정 헤더 (v3, 시안 C) */
function StarIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

/** 키워드 앞 북마크 아이콘. filled = 핀고정, outline = 최근검색.
 *  BottomNav BookmarkIcon과 같은 path. Phase 2에서 클릭 시 핀고정 토글. */
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
    <div className="px-4 py-4">
      {showPinned && (
        <Section
          title="핀 고정 키워드"
          icon={<StarIcon />}
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
        icon={<ClockIcon />}
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

function Section({ title, icon, state, emptyMessage, renderItem, firstSection }) {
  return (
    <section style={{ marginTop: firstSection ? 0 : "20px" }}>
      <h2
        className="flex items-center gap-2 pl-[7px]"
        style={{
          color: "#5C3D1F",
          paddingTop: "2px",
          paddingBottom: "2px",
          marginBottom: "8px",
        }}
      >
        {typeof icon === "string" ? <span>{icon}</span> : icon}
        <span style={{ fontSize: "14px", fontWeight: 400 }}>
          {title}
          {state.status === "ok" && (
            <span style={{ fontWeight: 400 }}> ({state.rows.length})</span>
          )}
        </span>
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
