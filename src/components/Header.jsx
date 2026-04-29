/* =========================================================
 * src/components/Header.jsx
 * 모바일 PWA 헤더 — 로고 + (페이지명 또는 검색바) + 햄버거.
 *
 * 세션 2 변경:
 *  - /search 경로일 때 페이지명 대신 SearchBar 렌더
 *  - URL ?q= 동기화는 SearchBar가 담당 (Header는 위치만 제공)
 *
 * 로고: 4분할 모자이크 placeholder. 후속에 PC 확장 실제 로고로 교체.
 * ========================================================= */
import { useState } from "react";
import { useLocation } from "react-router-dom";
import HamburgerMenu from "./HamburgerMenu";
import SearchBar from "./SearchBar";

const PAGE_TITLES = {
  "/events": "핫딜 모음",
  "/search": "검색", // /search지만 검색바가 차지하므로 실제 표시 안 됨
  "/bookmarks": "북마크",
};

function MosaicLogo() {
  return (
    <div
      aria-label="모자이크 쇼핑"
      className="flex-shrink-0 grid grid-cols-2 grid-rows-2 gap-[2px] w-7 h-7"
    >
      <div className="bg-mosaic-accent rounded-[2px]" />
      <div className="bg-mosaic-min-bg rounded-[2px]" />
      <div className="bg-mosaic-target-bg rounded-[2px]" />
      <div className="bg-mosaic-line-2 rounded-[2px]" />
    </div>
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
