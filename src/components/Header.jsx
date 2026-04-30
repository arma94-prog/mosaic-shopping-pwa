/* =========================================================
 * src/components/Header.jsx
 * 모바일 PWA 헤더 — 로고 + (페이지명 또는 검색바) + 햄버거.
 *
 * v7 변경 (2026-04-30, 사용자 catch — iOS 레이아웃 깨짐):
 *  - 🐛 iOS PWA standalone status bar(notch ~47px) 영역에서 헤더 짜부라짐 fix.
 *    원인: h-12(48px 고정) + safe-top(padding-top: env(safe-area-inset-top))
 *    조합이 box-border 모드에서 충돌. content 영역이 48-47=1px만 남음.
 *  - 해결: height를 동적으로 계산 (48px + 인셋).
 *    paddingTop으로 status bar 영역 비워둠 → 그 영역에 헤더 background 표시.
 *    safe-top 클래스 제거 (인라인 style로 통합).
 *  - 영향: iOS Safari 일반 탭(inset-top=0), Android(inset-top=0)는 동일 동작.
 *    iOS PWA standalone(inset-top≈47)에서만 헤더 정상 height + 정상 content.
 *
 * v6 변경 (2026-04-30): /events에도 SearchBar (PAGES_WITH_SEARCHBAR Set).
 * v5 변경 (2026-04-30): icon128.png → MosaicLogo SVG.
 * v4 변경 (2026-04-30): 헤더 padding pl-4 pr-3.
 * ========================================================= */
import { useState } from "react";
import { useLocation } from "react-router-dom";
import HamburgerMenu from "./HamburgerMenu";
import SearchBar from "./SearchBar";
import MosaicLogo from "./MosaicLogo";

const PAGE_TITLES = {
  "/bookmarks": "북마크",
};

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
      {/* v7: safe-top 클래스 제거 + height/paddingTop을 인라인 style로 통합.
       * iOS PWA standalone status bar 영역 정상 처리. */}
      <header
        className="
          flex-shrink-0
          flex items-center gap-3
          pl-4 pr-3
          border-b border-mosaic-line
          bg-mosaic-surface
        "
        style={{
          height: "calc(48px + env(safe-area-inset-top))",
          paddingTop: "env(safe-area-inset-top)",
        }}
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
