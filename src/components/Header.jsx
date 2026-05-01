/* =========================================================
 * src/components/Header.jsx
 * 모바일 PWA 헤더 — 로고 + (페이지명 또는 검색바) + 햄버거.
 *
 * v7 변경 (2026-05-01, 트랙 E 3 — 회귀 fix):
 *  - 🐛 events에서도 SearchBar 표시 (이전 버전에 있던 spec 회귀 복구).
 *    /events + /search → SearchBar.
 *    /bookmarks → "북마크" 타이틀 (검색 무관 의미축).
 *  - SearchBar v10에 이미 events focus → /search navigate 로직 있음.
 *    Header는 표시 분기만 추가.
 *  - 결과: events 사용자가 입력 시 자연스럽게 검색 모드 진입.
 *
 * v6 (유지): bg-mosaic-bg + border 제거 (크롬바와 통합 인상).
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
      <header
        className="
          flex-shrink-0
          flex items-center gap-3
          h-12 pl-4 pr-3
          bg-mosaic-bg
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
