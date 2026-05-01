/* =========================================================
 * src/components/Header.jsx
 * 모바일 PWA 헤더 — 로고 + (페이지명 또는 검색바) + 햄버거.
 *
 * v12 변경 (2026-05-01, 트랙 E 3 — 사용자 catch):
 *  - 🐛 Android는 v8 동작 그대로 보장. style prop 자체 미적용.
 *    이전 v11: NEEDS_IOS_SAFE_TOP false일 때도 borderTop/outline 명시 →
 *    잠재 회귀 가능성.
 *  - iOS standalone일 때만 inline style 추가 (paddingTop env + boxSizing).
 *  - 그 외 (Android, PC, iOS browser) = className만, 추가 style 없음 = v8 동작.
 *
 * v11 (제거): NEEDS_IOS_SAFE_TOP false 시 borderTop/outline 명시.
 * v10 (제거): 모든 환경에 borderTop/outline 명시.
 * v9 (제거): 모든 환경에 paddingTop env + boxSizing.
 * v8 (회귀 안전): className만 (bg-mosaic-bg + border-b border-mosaic-line + safe-top).
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

/** iOS PWA standalone 환경 detection. */
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

  // v12: iOS standalone일 때만 style prop. 그 외 = undefined (no-op = v8 동작).
  const headerStyle = NEEDS_IOS_SAFE_TOP
    ? {
        paddingTop: "env(safe-area-inset-top)",
        boxSizing: "content-box",
      }
    : undefined;

  return (
    <>
      <header
        className="flex-shrink-0 flex items-center gap-3 h-12 pl-4 pr-3 bg-mosaic-bg border-b border-mosaic-line"
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
