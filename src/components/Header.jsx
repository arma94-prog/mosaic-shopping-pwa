/* =========================================================
 * src/components/Header.jsx
 * 모바일 PWA 헤더 — 로고 + (페이지명 또는 검색바) + 햄버거.
 *
 * v9 변경 (2026-05-01, 트랙 E 3 — iOS catch):
 *  - 🐛 safe-top class → inline style로 직접 적용.
 *    iOS standalone에서 status bar 영역과 헤더 겹침 발생 (캡쳐 확인).
 *    원인 추정: Tailwind 4 production purge가 .safe-top class 제거
 *    또는 @layer base 외부 정의된 class가 일부 환경에서 인식 안 됨.
 *    inline style은 purge 영향 없음 — 안전.
 *  - h-12 (48px) + paddingTop env(safe-area-inset-top) (iOS ~47px) = 약 95px 총.
 *    Android/PC는 env() 0 → 48px 유지.
 *
 * v8 (유지): bg-mosaic-bg + border-b border-mosaic-line.
 * v7 (유지): events에서도 SearchBar 표시.
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
      {/* v9: safe-top class → inline style. iOS purge 회피. */}
      <header
        className="flex-shrink-0 flex items-center gap-3 h-12 pl-4 pr-3 bg-mosaic-bg border-b border-mosaic-line"
        style={{
          paddingTop: "env(safe-area-inset-top)",
          boxSizing: "content-box",
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
