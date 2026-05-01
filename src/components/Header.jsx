/* =========================================================
 * src/components/Header.jsx
 * 모바일 PWA 헤더 — 로고 + (페이지명 또는 검색바) + 햄버거.
 *
 * v13 변경 (2026-05-01, 트랙 E 3 — 사용자 catch):
 *  - 🐛 border-b border-mosaic-line 제거. 헤더 아래 라인 없앰.
 *    캡쳐 검증: 사용자가 "노티바와 헤더 사이 라인"이라 표현했지만
 *    실제 라인은 헤더 아래 (border-b)였음. 위치 혼동.
 *    헤더와 본문 모두 bg-mosaic-bg (#FAFAF7) 동일 → 라인 제거해도
 *    자연스러운 분리. 미니멀 인상.
 *
 * v12 (유지): iOS standalone일 때만 inline style.
 * v8 (회귀 부분): bg-mosaic-bg 유지, border-b 제거.
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

const NEEDS_IOS_SAFE_TOP = (() => {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  if (!isIOS) return false;
  const isStandalone =
    window.navigator.standalone === true ||
    (typeof window.matchMedia === "function" &&
      window.matchMedia("(display-mode: standalone)").matches);
  return isStandalone;
})();

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

  const headerStyle = NEEDS_IOS_SAFE_TOP
    ? {
        paddingTop: "env(safe-area-inset-top)",
        boxSizing: "content-box",
      }
    : undefined;

  return (
    <>
      {/* v13: border-b 제거. */}
      <header
        className="flex-shrink-0 flex items-center gap-3 h-12 pl-4 pr-3 bg-mosaic-bg"
        style={headerStyle}
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
