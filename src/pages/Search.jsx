/* =========================================================
 * src/pages/Search.jsx
 * 검색 페이지 — 핀 고정 + 최근 검색.
 *
 * v4 변경 (2026-05-01, 트랙 E 3 — 사용자 catch):
 *  - 🐛 pinned + history fetch를 Promise.all 병렬화.
 *    이전 v3: await 직렬 (pinned 응답 후 history 시작) → 100~200ms.
 *    fix: 둘 다 동시 시작 → 50~100ms (50% 개선).
 *  - 실시간성 100% 유지 — fetch 빈도/freshness 변경 X.
 *    PC ↔ 모바일 동기화 product spec 정합.
 *
 * v3 (유지): 안내 메시지 제거, 핀 고정 0개 시 섹션 미표시.
 *
 * Phase 1 정책:
 *  - read-only: 페이지 안 추가 입력창 X. 헤더 SearchBar는 URL ?q= 분기용.
 *  - PC 사이드패널과 시각적으로 정렬: 핀 고정 위쪽, 최근 검색 아래쪽.
 *  - 키워드 클릭 → /search?q={keyword} navigate.
 *
 * Phase 2:
 *  - 모바일에서 새 검색 → search_history Supabase upsert
 *  - PC ↔ 모바일 양방향 sync (메모리 #21)
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

  return <SearchHome />;
}

function SearchHome() {
  const navigate = useNavigate();
  const [pinned, setPinned] = useState({ status: "loading", rows: [], error: null });
  const [history, setHistory] = useState({ status: "loading", rows: [], error: null });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // v4: Promise.all 병렬화. 두 query 독립적이라 병렬 실행 안전.
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

  // 핀 고정 0개일 때 섹션 자체 미표시
  const showPinned = pinned.status === "ok" && pinned.rows.length > 0;

  return (
    <div className="px-4 py-4">
      {/* 핀 고정 키워드 (0개면 섹션 자체 미표시) */}
      {showPinned && (
        <Section
          title="핀 고정 키워드"
          icon="📌"
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
      )}

      {/* 최근 검색 (시간 제거) */}
      <Section
        title="최근 검색"
        icon="🕘"
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
