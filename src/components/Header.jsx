/* =========================================================
 * src/components/Header.jsx
 * 모바일 PWA 헤더 — 로고 + (페이지명 또는 검색바) + 햄버거.
 *
 * v3 변경 (2026-04-30):
 *  - MosaicLogo: 4분할 placeholder → 실제 PNG 아이콘 (assets/icon128.png).
 *    src/assets/에 위치, Vite가 빌드 시점에 hashing해서 캐싱 효율적.
 * ========================================================= */
import { useState } from "react";
import { useLocation } from "react-router-dom";
import HamburgerMenu from "./HamburgerMenu";
import SearchBar from "./SearchBar";
import logoIcon from "../assets/icon128.png";

const PAGE_TITLES = {
  "/events": "핫딜 모음",
  "/search": "검색",
  "/bookmarks": "북마크",
};

function MosaicLogo() {
  return (
    <img
      src={logoIcon}
      alt="모자이크 쇼핑"
      className="flex-shrink-0 w-7 h-7"
      draggable="false"
    />
  );
}

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

  const isSearchPage = location.pathname === "/search";
  const pageTitle = PAGE_TITLES[location.pathname] || "";

  return (
    <>
      <header
        className="
          flex-shrink-0
          flex items-center gap-3
          h-12 px-3
          border-b border-mosaic-line
          bg-mosaic-surface
          safe-top
        "
      >
        <MosaicLogo />

        <div className="flex-1 min-w-0">
          {isSearchPage ? (
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
