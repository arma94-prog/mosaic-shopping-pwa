/* =========================================================
 * src/components/SearchBar.jsx
 * 헤더 안 검색바 — PC .sb 정확 매핑.
 *
 * v4 변경 (2026-04-30, 사용자 catch):
 *  - 🐛 X 버튼 중복 catch: <input type="search">의 native X 제거.
 *    PC .sb input::-webkit-search-cancel-button { -webkit-appearance: none } 매핑.
 *    type="search" 유지 + appearance 제거 = 검색 키보드 + native X 제거.
 *  - PC .sb 정확 hex 색 + 형태 매핑:
 *    - height 28px → PWA 32px (모바일 +1pt 사이즈)
 *    - border 1px #E5E1D3 / radius 6px (PC 정확)
 *    - focus: border #E8762B + shadow rgba(232,118,43,0.12)
 *    - 폰트: PC clamp(12,2.6vw,14) → PWA 15px (PC +1)
 * ========================================================= */
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.15" />
      <path
        d="M9 9l6 6M15 9l-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function SearchBar() {
  const [params, setParams] = useSearchParams();
  const urlQuery = params.get("q") || "";
  const [input, setInput] = useState(urlQuery);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    setInput(urlQuery);
  }, [urlQuery]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (trimmed) {
      setParams({ q: trimmed });
    } else {
      setParams({});
    }
    e.target.querySelector("input")?.blur();
  };

  const handleClear = () => {
    setInput("");
    setParams({});
  };

  // PC .sb focus 정합
  const borderColor = focused ? "#E8762B" : "#E5E1D3";
  const boxShadow = focused ? "0 0 0 2px rgba(232,118,43,0.12)" : "none";

  return (
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
          type="search"
          inputMode="search"
          enterKeyHint="search"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="검색어 입력"
          aria-label="검색어"
          className="flex-1 min-w-0 bg-transparent outline-none search-input-no-cancel"
          style={{
            fontSize: "15px",
            color: "#1A1A1A",
            fontFamily: "inherit",
            // PC .sb input 매핑
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
  );
}
