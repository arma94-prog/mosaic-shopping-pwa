/* =========================================================
 * src/pages/Search.jsx
 * 검색 페이지 — 핀 고정 + 최근 검색.
 *
 * v10 변경 (2026-05-25, 사용자 피드백):
 *  - 🆕 검색 history 빈 상태 UI 개편 — emptyMessage 텍스트 → 박스 카드
 *    (모자이크 북마크 로고 + "PC와 모바일에서 검색 이력이 없습니다.").
 *  - 🆕 history 비었을 때 하단에 OnboardingNotice (PC 설치 + 동기화 안내).
 *  - 🆕 SearchHome 컨테이너 flex column + minHeight 100% — 안내 박스 sticky 위해.
 *  - 🆕 Section 컴포넌트에 emptyContent prop 추가 (ReactNode 전달 가능).
 *
 * v9 (유지): useSearchMallsPrefetch (silent prefetch).
 * v8 (유지): useSearchHome 훅.
 * ========================================================= */
import { useNavigate, useSearchParams } from "react-router-dom";
import SearchResults from "../components/SearchResults";
import MosaicBookmarkLogo from "../components/MosaicBookmarkLogo";
import OnboardingNotice from "../components/OnboardingNotice";
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
  const historyEmpty =
    historyState.status === "ok" && historyState.rows.length === 0;

  return (
    <div
      className="px-4 pt-3 pb-4"
      style={{
        // v10: flex column + minHeight 100% — 하단 OnboardingNotice sticky 위해.
        // AppShell main(flex-1 overflow-y-auto) 안에서 자식 minHeight 100% 동작.
        minHeight: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
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
        emptyContent={<HistoryEmptyBox />}
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

      {/* v10: history 비었을 때만 하단 안내 박스 노출 (sticky bottom, mb 30) */}
      {historyEmpty && (
        <OnboardingNotice
          style={{ marginTop: "auto", marginBottom: 30 }}
          message="PC 크롬 웹스토어에서 '모자이크 쇼핑'을 설치하시고, 같은 구글 계정으로 로그인 하시면, 모바일과 PC간 검색 이력이 동기화됩니다."
        />
      )}
    </div>
  );
}

/**
 * v10: 검색 history 빈 상태 박스 — 검색 이력 있을 때 카드 CSS 정합
 * (background #FFFFFF, border #EFECE3, rounded 12) + 로고 + 안내 텍스트.
 */
function HistoryEmptyBox() {
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #EFECE3",
        borderRadius: 12,
        padding: "32px 16px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
      }}
    >
      <MosaicBookmarkLogo size={48} />
      <p
        style={{
          fontSize: 14,
          color: "#1A1A1A",
          fontWeight: 500,
          margin: 0,
          textAlign: "center",
        }}
      >
        PC와 모바일에서 검색 이력이 없습니다.
      </p>
    </div>
  );
}

function Section({
  title,
  state,
  emptyMessage,
  emptyContent,
  renderItem,
  firstSection,
}) {
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

      {/* v10: 빈 상태 — emptyContent 우선 (ReactNode), fallback emptyMessage. */}
      {state.status === "ok" && state.rows.length === 0 && (
        emptyContent != null
          ? emptyContent
          : emptyMessage
          ? <p style={{ fontSize: "13px", color: "#6B6B6B" }}>{emptyMessage}</p>
          : null
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
