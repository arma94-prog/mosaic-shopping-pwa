/* =========================================================
 * src/components/SearchBar.jsx
 * 헤더 안 검색바 — PC .sb 정확 매핑.
 *
 * v7 변경 (2026-04-30, PWA history 정책 — 스펙 1, 2):
 *  - 🆕 handleSubmit: setParams에 { replace: true } 추가.
 *    SearchHome ↔ SearchResults는 같은 history stack entry 1개 정책.
 *    검색결과 → 뒤로가기 시 SearchHome 거치지 않고 직전 페이지로 복귀.
 *  - 🆕 handleClear: 동일하게 replace 모드.
 *  - 🆕 handleFocus: q 있을 때 setParams({}, replace) 호출.
 *    검색바를 누르는 순간 즉시 히스토리 모드(핀+최근)로 복귀.
 *    URL의 q 제거 → useEffect로 input도 자동 ""로 동기화.
 *
 * 의도된 부수 효과 (focus 시):
 *  - input value 자동 초기화 (urlQuery 변화 → useEffect → setInput("")).
 *  - focused state는 그대로 유지 (포커스 끊기지 않음).
 *  - 사용자가 빈 input + 핀/최근 리스트를 보고 새 검색 시작 가능.
 *
 * ⚠ 부수 효과 검증 시나리오 (dogfood 시 확인):
 *  - 사용자가 "엽서" 검색했다가 "엽서지갑"으로 수정하려고 검색바를 누른 경우,
 *    input이 비워지므로 처음부터 다시 타이핑해야 함.
 *  - 만약 불편하다면 옵션 B (input 유지 + URL replace)로 전환 가능.
 *
 * v6 변경 (2026-04-30, 사용자 catch 회복):
 *  - 🐛 SearchIcon (돋보기) 14 → 16 (+15%)
 *  - 🐛 ClearIcon (X 버튼) 17 → 20 (+15%)
 *  - 사용자가 이전 라운드에 +15% 요청했으나 다른 fix 라운드에서 롤백된 것을 복원.
 *  - 정수 반올림: 14 × 1.15 = 16.1 → 16 / 17 × 1.15 = 19.55 → 20.
 *
 * v5 변경 (2026-04-30, 사용자 catch):
 *  - 🐛 X 버튼 중복 진짜 fix: native cancel-button 제거를 컴포넌트 내부 <style>에 인라인.
 *    이전: index.css에 글로벌로 처리했으나 production purge 가능성 의심.
 *    이후: 컴포넌트 내부 <style scoped 효과>로 우회 — 안전.
 *  - X 버튼 (커스텀) 크기 +20% (14px → 17px). 사용자 catch.
 * ========================================================= */
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

function SearchIcon() {
  // v6: 14 → 16 (+15%)
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
  // v6: 17 → 20 (+15%)
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
    // v7: replace 모드. SearchHome ↔ SearchResults 단일 history stack.
    if (trimmed) {
      setParams({ q: trimmed }, { replace: true });
    } else {
      setParams({}, { replace: true });
    }
    e.target.querySelector("input")?.blur();
  };

  const handleClear = () => {
    setInput("");
    // v7: replace 모드 (검색결과 → 검색홈 = 같은 stack entry).
    setParams({}, { replace: true });
  };

  const handleFocus = () => {
    setFocused(true);
    // v7: q 있을 때 focus → /search (q 제거) replace.
    // 사용자가 검색바를 누르는 순간 즉시 히스토리 모드(핀+최근)로 복귀.
    if (urlQuery) {
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
