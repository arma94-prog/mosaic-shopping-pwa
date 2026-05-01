/* =========================================================
 * src/components/Header.jsx
 * 모바일 PWA 헤더 — 로고 + (페이지명 또는 검색바) + 햄버거.
 *
 * v11 변경 (2026-05-01, 트랙 E 3 — 사용자 catch):
 *  - 🐛 Android 회귀 fix. paddingTop env(safe-area-inset-top)을 iOS PWA
 *    standalone에서만 적용. Android에서는 padding 0.
 *    이전 v9~v10: 모든 환경에서 inline paddingTop env(...) → Android에서
 *    의도치 않은 padding 또는 색 차이 catch (사용자 깜빡임 + 라인 인지).
 *  - SoC 정합: iOS만의 status bar 침범 문제 fix가 다른 OS에 영향 X.
 *
 *  detection 로직 (모듈 최상단 1회):
 *    - iOS user agent + display-mode standalone (또는 navigator.standalone)
 *    - 둘 다 만족 시에만 padding 적용
 *
 * v10 (제거): 모든 환경 paddingTop env(...).
 * v9 (제거): 모든 환경 paddingTop env(...) + boxSizing.
 * v8 (회귀 후 보강): bg-mosaic-bg + border-b border-mosaic-line.
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

/** iOS PWA standalone 환경 detection (모듈 로드 시 1회).
 *  Android, iOS Safari browser 모드, 데스크톱 PC = 모두 false → padding 0. */
const NEEDS_IOS_SAFE_TOP = (() => {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  if (!isIOS) return false;
  // iOS standalone 감지: navigator.standalone (legacy) 또는 display-mode media query.
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

  // v11: iOS PWA standalone일 때만 padding. 그 외 0.
  const headerStyle = NEEDS_IOS_SAFE_TOP
    ? {
        paddingTop: "env(safe-area-inset-top)",
        boxSizing: "content-box",
        borderTop: "none",
        borderLeft: "none",
        borderRight: "none",
        outline: "none",
        boxShadow: "none",
      }
    : {
        borderTop: "none",
        borderLeft: "none",
        borderRight: "none",
        outline: "none",
        boxShadow: "none",
      };

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
