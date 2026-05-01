/* =========================================================
 * src/components/Header.jsx
 * 모바일 PWA 헤더 — 로고 + (페이지명 또는 검색바) + 햄버거.
 *
 * v14 변경 (2026-05-01, 트랙 E 3 — 사용자 catch + v8 회귀):
 *  - 🔄 v8 정확 회귀. safe-top class + border-b border-mosaic-line 복원.
 *    inline paddingTop env(...) + boxSizing 제거.
 *  - 사용자 검증: v8에서는 라인 catch 없었음. 따라서 border-b 자체는 정상.
 *    v9~v13 시도가 의도치 않은 부수효과 발생 가능성.
 *  - safe-top class는 글로벌 CSS에 정의 (메모리 #24 트랙 E3 초기 작업).
 *
 * v13 (제거): border-b 제거, inline style 분기.
 * v12 (제거): iOS standalone에서만 inline style.
 * v11 (제거): NEEDS_IOS_SAFE_TOP false 시 borderTop none.
 * v10 (제거): outline/borderTop none 명시.
 * v9 (제거): inline paddingTop env + boxSizing.
 * v8 (회귀 기준): safe-top class + border-b. 사용자 검증 정상.
 * v7 (유지): events에서도 SearchBar 표시.
 * v5 (유지): icon → MosaicLogo SVG.
 * v4 (유지): pl-4 pr-3 (로고 좌측 격자 정렬).
 * ========================================================= */
import { useState } from "react";
import { useLocation } from "react-router-dom";
import HamburgerMenu from "./HamburgerMenu";
import SearchBar from "./SearchBar";
import MosaicLogo from "./MosaicLogo";

const PAGE_TITLES = {
  "/events": "핫딜 모음",
  "/search": "검색",
  "/bookmarks": "북마크",
};

// v7: SearchBar 표시 페이지 (events + search). bookmarks는 타이틀.
const SEARCH_BAR_PATHS = new Set(["/events", "/search"]);

function HamburgerIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 6h18M3 12h18M3 18h18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function Header() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const showSearchBar = SEARCH_BAR_PATHS.has(location.pathname);
  const pageTitle = PAGE_TITLES[location.pathname] || "";

  return (
    <>
      {/* v8 회귀: 위 통합 (크롬바와 #FAFAF7), 아래 구분 (본문과 border) */}
      <header
        className="
          flex-shrink-0
          flex items-center gap-3
          h-12 pl-4 pr-3
          bg-mosaic-bg
          border-b border-mosaic-line
          safe-top
        "
      >
        <MosaicLogo size={28} />

        <div className="flex-1 min-w-0">
          {showSearchBar ? (
            <SearchBar />
          ) : (
            <h1 className="text-base font-semibold truncate">{pageTitle}</h1>
          )}
        </div>

        <button
          aria-label="메뉴 열기"
          onClick={() => setMenuOpen(true)}
          className="
            flex-shrink-0
            p-2 -mr-2
            text-mosaic-muted
            active:text-mosaic-text
            transition-colors
          "
        >
          <HamburgerIcon />
        </button>
      </header>

      {menuOpen && <HamburgerMenu onClose={() => setMenuOpen(false)} />}
    </>
  );
}
