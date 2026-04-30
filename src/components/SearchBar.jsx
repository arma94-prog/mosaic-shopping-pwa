/* =========================================================
 * src/components/SearchBar.jsx
 * 헤더 안 검색바 — PC .sb 정확 매핑 + 라우트별 분기.
 *
 * v11 변경 (2026-04-30, 트랙 E — Mixpanel):
 *  - 🆕 submit 시 search_run 트랙 + peopleAdd({total_searches: 1}).
 *    PC sidepanel.js search_run 정합. trimmed 있을 때만 발동.
 *
 * v10 (유지): events에서 focus → /search navigate.
 * v9 (유지): autoFocus 제거 (표준 모바일 패턴).
 * ========================================================= */
import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { analytics } from "../lib/analytics";

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path
        d="M20 20l-3.5-3.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.18" />
      <path
        d="M9 9l6 6M15 9l-6 6"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function SearchBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const urlQuery = params.get("q") || "";
  const [input, setInput] = useState(urlQuery);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);
  const skipSyncRef = useRef(false);

  const isOnSearchPage = location.pathname === "/search";

  useEffect(() => {
    if (skipSyncRef.current) {
      skipSyncRef.current = false;
      return;
    }
    setInput(urlQuery);
  }, [urlQuery]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = input.trim();

    // v11: search_run 트랙 — trimmed 있을 때만 발동 (빈 submit 무시).
    if (trimmed) {
      try {
        analytics.track("search_run", { query: trimmed });
        analytics.peopleAdd({ total_searches: 1 });
      } catch (_) {}
    }

    if (isOnSearchPage) {
      if (trimmed) {
        setParams({ q: trimmed }, { replace: true });
      } else {
        setParams({}, { replace: true });
      }
    } else {
      if (trimmed) {
        navigate(`/search?q=${encodeURIComponent(trimmed)}`);
      }
    }
    inputRef.current?.blur();
  };

  const handleClear = () => {
    setInput("");
    if (isOnSearchPage) {
      setParams({}, { replace: true });
    }
  };

  const handleFocus = () => {
    setFocused(true);

    if (!isOnSearchPage) {
      navigate("/search");
      return;
    }

    if (urlQuery) {
      skipSyncRef.current = true;
      setParams({}, { replace: true });
    }
  };

  const borderColor = focused ? "#E8762B" : "#E5E1D3";
  const boxShadow = focused ? "0 0 0 2px rgba(232,118,43,0.12)" : "none";

  return (
    <>
      <style>{`
        input.mosaic-search-input::-webkit-search-decoration,
        input.mosaic-search-input::-webkit-search-cancel-button,
        input.mosaic-search-input::-webkit-search-results-button,
        input.mosaic-search-input::-webkit-search-results-decoration {
          -webkit-appearance: none !important;
          appearance: none !important;
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
      `}</style>

      <form onSubmit={handleSubmit} className="flex-1 min-w-0" role="search">
        <div
          className="flex items-center gap-1.5 transition-all duration-150 min-w-0"
          style={{
            height: "32px",
            background: "#FFFFFF",
            border: `1px solid ${borderColor}`,
            borderRadius: "6px",
            padding: "0 10px",
            boxShadow,
          }}
        >
          <span
            className="flex-shrink-0"
            style={{ color: "#A8A699", display: "flex", alignItems: "center" }}
          >
            <SearchIcon />
          </span>
          <input
            ref={inputRef}
            type="search"
            inputMode="search"
            enterKeyHint="search"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={handleFocus}
            onBlur={() => setFocused(false)}
            placeholder="검색어 입력"
            aria-label="검색어"
            className="mosaic-search-input flex-1 min-w-0 bg-transparent outline-none"
            style={{
              fontSize: "15px",
              color: "#1A1A1A",
              fontFamily: "inherit",
              WebkitAppearance: "none",
              appearance: "none",
            }}
          />
          {input && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="검색어 지우기"
              className="flex-shrink-0 transition-colors"
              style={{
                color: "#6B6B6B",
                background: "transparent",
                border: "none",
                padding: 0,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              <ClearIcon />
            </button>
          )}
        </div>
      </form>
    </>
  );
}
