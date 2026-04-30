/* =========================================================
 * src/components/Header.jsx
 * 모바일 PWA 헤더 — 로고 + (페이지명 또는 검색바) + 햄버거.
 *
 * v6 변경 (2026-04-30, 사용자 catch — 캡쳐 image 1 PC 정합):
 *  - 🆕 /events에도 SearchBar 표시 (이전: 페이지명 "핫딜 모음").
 *    이유: 사용자 명시 "앱 실행하자 마자 검색 진입할 수 있도록".
 *    SearchBar 컴포넌트가 라우트별 분기 처리:
 *      /events submit → /search?q=X push (다음 화면 이동)
 *      /search submit → 같은 라우트 q replace (스펙 1, stack 1개)
 *  - 🆕 PAGES_WITH_SEARCHBAR Set으로 라우트 화이트리스트 명시.
 *  - 🐛 PAGE_TITLES에서 "/events" 제거 (이제 SearchBar로).
 *  - /bookmarks는 그대로 페이지명 "북마크" (검색 진입점 X).
 *
 * v5 변경 (2026-04-30):
 *  - icon128.png → MosaicLogo SVG (PC 환경설정 정체성 정합).
 *
 * v4 변경 (2026-04-30):
 *  - 헤더 padding pl-4 pr-3.
 * ========================================================= */
import { useState } from "react";
import { useLocation } from "react-router-dom";
import HamburgerMenu from "./HamburgerMenu";
import SearchBar from "./SearchBar";
import MosaicLogo from "./MosaicLogo";

// v6: /events 제거 (이제 SearchBar). /bookmarks는 그대로 페이지명.
const PAGE_TITLES = {
  "/bookmarks": "북마크",
};

// v6: SearchBar 표시 라우트 화이트리스트.
const PAGES_WITH_SEARCHBAR = new Set(["/events", "/search"]);

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

  const showSearchBar = PAGES_WITH_SEARCHBAR.has(location.pathname);
  const pageTitle = PAGE_TITLES[location.pathname] || "";

  return (
    <>
      <header
        className="
          flex-shrink-0
          flex items-center gap-3
          h-12 pl-4 pr-3
          border-b border-mosaic-line
          bg-mosaic-surface
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
