/* =========================================================
 * src/components/Header.jsx
 * 모바일 PWA 헤더 — 로고 + (페이지명 또는 검색바) + 햄버거.
 *
 * v6 변경 (2026-05-01, 트랙 E 3 — 사용자 catch):
 *  - 🐛 헤더 배경 bg-mosaic-surface (#FFFFFF) → bg-mosaic-bg (#FAFAF7).
 *    크롬바/브라우저바와 헤더가 하나의 영역처럼 보이도록 PC 정합 색 통일.
 *  - 🐛 border-b border-mosaic-line 제거.
 *    배경색이 본문과 같아도 보더가 있으면 시각적 분리됨. 보더 제거로 완전 통합.
 *  - 결과: 크롬바 ↔ 헤더 ↔ 본문이 시각적으로 단일 영역.
 *    검색 input 자체 박스(흰색 + 보더)는 그대로 유지 (의도된 입력 강조).
 *
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
      {/* v6: bg-mosaic-bg + border 제거. 크롬바와 통합된 영역 인상. */}
      <header
        className="
          flex-shrink-0
          flex items-center gap-3
          h-12 pl-4 pr-3
          bg-mosaic-bg
          safe-top
        "
      >
        <MosaicLogo size={28} />

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
