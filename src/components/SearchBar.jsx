/* =========================================================
 * src/components/SearchBar.jsx
 * 헤더 안 검색바 — PC .sb 정확 매핑 + 라우트별 분기.
 *
 * v9 변경 (2026-04-30, 사용자 결정 — autoFocus 해제):
 *  - 🐛 /search 진입 시 자동 focus useEffect 제거.
 *  - 사용자 결정: "검색입력창을 직접 누르지 않고서는 키패드를 팝업시키지 않음".
 *    iOS 한계 우회 시도였으나 product 표준 패턴 따름 (다른 모바일 서비스 정합).
 *  - inputRef는 그대로 유지 (handleSubmit의 blur() 호출에 사용).
 *
 * v8 변경 (2026-04-30): 라우트 분기 + autoFocus + 옵션 A skipSync.
 * v7 변경 (2026-04-30): submit/clear에 { replace: true } 추가.
 * v6 변경 (2026-04-30): SearchIcon/ClearIcon +15% (16/20).
 * v5 변경 (2026-04-30): native cancel-button 인라인 style로 제거.
 * ========================================================= */
import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

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
  // focus로 인한 q 제거 시 input 동기화 1회 차단 (옵션 A).
  const skipSyncRef = useRef(false);

  const isOnSearchPage = location.pathname === "/search";

  // URL의 q 변화 → input 동기화. 단 focus로 인한 q 제거는 skip (옵션 A).
  useEffect(() => {
    if (skipSyncRef.current) {
      skipSyncRef.current = false;
      return;
    }
    setInput(urlQuery);
  }, [urlQuery]);

  // v9 (2026-04-30): autoFocus useEffect 제거.
  // 사용자 결정: 다른 서비스들도 검색입력창을 직접 누르지 않고서는 키패드를 팝업시키지 않음.
  // 표준 product 패턴 채택. iOS/Android 모두 사용자 직접 input 클릭 시에만 키패드.

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = input.trim();

    if (isOnSearchPage) {
      // /search 안에서 submit → 같은 stack entry q만 변경 (스펙 1).
      if (trimmed) {
        setParams({ q: trimmed }, { replace: true });
      } else {
        setParams({}, { replace: true });
      }
    } else {
      // /events에서 submit → /search?q=X push (검색결과 화면으로 진입).
      if (trimmed) {
        navigate(`/search?q=${encodeURIComponent(trimmed)}`);
      }
    }
    inputRef.current?.blur();
  };

  const handleClear = () => {
    setInput("");
    if (isOnSearchPage) {
      // /search에서 clear → q 제거 (검색홈으로 복귀, stack 1개 유지).
      setParams({}, { replace: true });
    }
    // /events에서는 URL 변경 X. input만 비움.
  };

  const handleFocus = () => {
    setFocused(true);
    // /search?q=X에서 focus → q 제거(replace) + input 유지 (옵션 A).
    if (isOnSearchPage && urlQuery) {
      skipSyncRef.current = true; // 다음 setInput(urlQuery="") 동기화 차단.
      setParams({}, { replace: true });
    }
  };

  const borderColor = focused ? "#E8762B" : "#E5E1D3";
  const boxShadow = focused ? "0 0 0 2px rgba(232,118,43,0.12)" : "none";

  return (
    <>
      {/* native X 강제 제거 - 컴포넌트 내부에 인라인 (production purge 회피).
       * input.mosaic-search-input::-webkit-search-cancel-button 까지 명시 specificity ↑ */}
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
