/* =========================================================
 * src/components/SearchBar.jsx
 * 헤더 안에 들어가는 검색바 컴포넌트.
 *
 * v2 변경 (2026-04-30): PC .sb 톤 정확 매칭.
 *  - border: line (#EFECE3) → line-2 (#E5E1D3) — PC와 일치
 *  - placeholder 색: muted-2 → muted-3 (#A8A699) — PC와 일치
 *  - focus 시 그림자 추가: 0 0 0 2px rgba(232,118,43,0.12) — PC와 일치
 *
 * 책임 (v1 그대로):
 *  - URL ?q= 양방향 동기화
 *  - 엔터 → setSearchParams({ q })
 *  - X 버튼 → setSearchParams({}) (히스토리 view 복귀)
 *  - 자동 포커스 안 함 (모바일 키보드 자동 표시 방지)
 * ========================================================= */
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
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
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
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

  return (
    <form
      onSubmit={handleSubmit}
      className="flex-1 min-w-0"
      role="search"
    >
      <div
        className="
          flex items-center gap-2
          h-9 px-3
          bg-mosaic-surface
          border border-mosaic-line-2
          rounded-full
          focus-within:border-mosaic-accent
          focus-within:shadow-[0_0_0_2px_rgba(232,118,43,0.12)]
          transition-all duration-150
        "
      >
        <span className="flex-shrink-0 text-mosaic-muted-3">
          <SearchIcon />
        </span>
        <input
          type="search"
          inputMode="search"
          enterKeyHint="search"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="검색어 입력"
          aria-label="검색어"
          className="
            flex-1 min-w-0
            bg-transparent
            text-sm
            outline-none
            placeholder:text-mosaic-muted-3
          "
        />
        {input && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="검색어 지우기"
            className="
              flex-shrink-0
              text-mosaic-muted
              active:text-mosaic-text
              transition-colors
            "
          >
            <ClearIcon />
          </button>
        )}
      </div>
    </form>
  );
}
