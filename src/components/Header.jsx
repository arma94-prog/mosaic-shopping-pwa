/* =========================================================
 * src/components/Header.jsx
 * 모바일 PWA 헤더 — 로고 + (페이지명 또는 검색바) + 햄버거.
 *
 * v8 변경 (2026-05-01, 트랙 E 3 — 사용자 catch):
 *  - 🐛 헤더 하단에 border-b 복원 (border-mosaic-line, #EFECE3).
 *    배경은 #FAFAF7로 본문과 통합되어 있지만, 헤더 ↔ 본문 구분 라인은 필요.
 *    의미축: 위 (크롬바와) 통합 / 아래 (본문과) 구분.
 *
 * v7 (유지): events에서도 SearchBar 표시 (회귀 fix).
 * v6 (유지): bg-mosaic-bg #FAFAF7 (크롬바와 배경 정합).
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
      {/* v8: 위 통합 (크롬바와 #FAFAF7), 아래 구분 (본문과 border) */}
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
