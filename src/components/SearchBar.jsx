/* =========================================================
 * src/components/SearchBar.jsx
 * 헤더 안에 들어가는 검색바 컴포넌트.
 *
 * 책임:
 *  - URL ?q= 양방향 동기화 (URL이 진실 — 새로고침/뒤로가기 안전)
 *  - 엔터 → setSearchParams({ q })
 *  - X 버튼 → setSearchParams({}) (히스토리 view로 복귀)
 *  - Q1 결정: 자동 포커스 안 함 (모바일에서 키보드 자동 표시 방지)
 *
 * URL 동기화 패턴:
 *  - URL ?q= 변경 시 input 값도 자동 업데이트 (useEffect)
 *  - input은 로컬 상태 (사용자가 타이핑 중일 때 매 글자마다 URL 갱신은 비효율)
 *  - 엔터 시점에만 URL 반영
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

  // URL 변경 시 input 동기화 (예: 핀고정 키워드 클릭, 뒤로가기)
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
    // 엔터 후 키보드 닫기 (모바일 UX)
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
          bg-mosaic-bg
          border border-mosaic-line
          rounded-full
          focus-within:border-mosaic-accent
          transition-colors
        "
      >
        <span className="flex-shrink-0 text-mosaic-muted-2">
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
            placeholder:text-mosaic-muted-2
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
