/* =========================================================
 * src/pages/Search.jsx
 * 검색 페이지 — 핀 고정 + 최근 검색.
 *
 * v9 변경 (2026-05, Phase 1.7 polish2 — 사용자 catch):
 *  - 🆕 SearchHome 진입 시 useSearchMallsPrefetch 호출 — search mall + 아이콘
 *    백그라운드 prefetch. 사용자가 검색어 입력하는 1-2초 동안 캐시 데우기.
 *    효과: 첫 검색 결과 진입 시에도 아이콘 즉시 표시 (캐시 hit).
 *  - silent prefetch — 토스트 발화 X (SearchHome에서 mall 토스트는 노이즈).
 *
 * v8 (유지): useSearchHome 훅 도입.
 * v7 (유지): pinned + history Promise.all 병렬.
 * ========================================================= */
import { useNavigate, useSearchParams } from "react-router-dom";
import SearchResults from "../components/SearchResults";
import { useSearchHome } from "../hooks/useSearchHome.js";
import { useSearchMallsPrefetch } from "../hooks/useSearchMallsPrefetch.js";

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

function toSectionState({ rows, isLoading, error }) {
  if (error && rows.length === 0) {
    return { status: "error", rows: [], error: error.message || String(error) };
  }
  if (isLoading && rows.length === 0) {
    return { status: "loading", rows: [], error: null };
  }
  return { status: "ok", rows, error: null };
}

function SearchHome() {
  const navigate = useNavigate();
  const { pinned, history } = useSearchHome();

  // v9: 검색몰 + 아이콘 백그라운드 prefetch.
  // SearchResults 진입 시 캐시 hit → 즉시 표시 + 아이콘 깜빡임 없음.
  // 토스트 발화 X (silent).
  useSearchMallsPrefetch();

  const pinnedState = toSectionState(pinned);
  const historyState = toSectionState(history);

  const goToResults = (keyword) => {
    if (!keyword) return;
    navigate(`/search?q=${encodeURIComponent(keyword)}`);
  };

  const showPinned = pinnedState.status === "ok" && pinnedState.rows.length > 0;

  return (
    <div className="px-4 pt-3 pb-4">
      {showPinned && (
        <Section
          title="핀 고정 키워드"
          firstSection={true}
          state={pinnedState}
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
        state={historyState}
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
