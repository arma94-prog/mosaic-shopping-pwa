/* =========================================================
 * src/components/Header.jsx
 * 모바일 PWA 헤더 — 로고 + (페이지명 또는 검색바) + 햄버거.
 *
 * v15 변경 (2026-05-01, 트랙 E 3 — 사용자 catch + iOS only fix):
 *  - 🐛 iOS PWA standalone에서 safe-top class purge 위험 → inline fallback 추가.
 *    Android는 v8 그대로 (className만). v9~v12에서 회귀 발생한 이유:
 *    inline style이 모든 OS에 적용되어 box-sizing 변동 catch.
 *  - v15는 iOS standalone에서만 inline 적용 → Android는 v8 정확 동일.
 *  - className은 Android safe-top 보장 (Android Chrome은 purge 안 됨).
 *
 * 동작 매트릭스:
 *   iOS PWA standalone   → safe-top class + inline paddingTop env (fallback)
 *   Android PWA          → safe-top class만 (v8 동일)
 *   iOS Safari browser   → safe-top class만 (PWA 아니라 fallback 불필요)
 *   PC                   → safe-top class만 (env() = 0)
 *
 * v14 (v8 회귀): className만. iOS에서 safe-top purge 위험 발생.
 * v8 (회귀 기준): className만 + border-b + safe-top.
 * v7 (유지): events에서도 SearchBar.
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

/** iOS PWA standalone 환경 detection. iOS Safari purge 회피용 fallback inline 적용 trigger. */
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

  // v15: iOS standalone에서만 inline fallback. Android는 undefined (no-op = v8 동일).
  const headerStyle = NEEDS_IOS_SAFE_TOP
    ? { paddingTop: "env(safe-area-inset-top)" }
    : undefined;

  return (
    <>
      {/* v15: className은 Android 정상, style은 iOS purge 회피 fallback */}
      <header
        className="
          flex-shrink-0
          flex items-center gap-3
          h-12 pl-4 pr-3
          bg-mosaic-bg
          border-b border-mosaic-line
          safe-top
        "
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
