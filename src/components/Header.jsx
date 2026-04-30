/* =========================================================
 * src/components/Header.jsx
 * 모바일 PWA 헤더 — 로고 + (페이지명 또는 검색바) + 햄버거.
 *
 * v5 변경 (2026-04-30, 사용자 catch — 캡쳐 image 1, 2 정합):
 *  - 🐛 icon128.png (쇼핑백) → MosaicLogo SVG 컴포넌트 (PC 환경설정 정체성 정합).
 *  - 사용자 정체성 일관성: AuthGate 큰 로고 + Header 작은 로고 + 모바일 홈 화면 아이콘 모두 동일 모자이크 격자.
 *  - 사이즈 변화 없음 (이전 w-7 h-7 = 28px → MosaicLogo size={28} 동일).
 *  - 햄버거 메뉴 + 검색바 + padding 정책 (v4) 모두 그대로 유지.
 *
 * v4 변경 (2026-04-30):
 *  - 헤더 padding: px-3 → pl-4 pr-3 (좌측만 16px로 증가).
 *    이유: 로고를 본문 격자(SearchResults의 px-4)와 시각적 left-align.
 *    결과: 로고 좌측 X = 격자 첫 셀 좌측 X. 검색바는 좌측에서 4px 좁아짐.
 *    햄버거 우측 패딩(pr-3 = 12px)은 그대로 유지.
 *  - assets/icon128.png 새 로고로 교체 (사용자 첨부 v2). → v5에서 SVG로 교체.
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
