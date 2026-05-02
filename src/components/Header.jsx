/* =========================================================
 * src/components/Header.jsx
 * 모바일 PWA 헤더 — 로고 또는 뒤로가기 + (페이지명 또는 검색바) + 햄버거.
 *
 * v16 변경 (2026-05, Phase 1.7 polish — 사용자 요청):
 *  - 🆕 검색 결과 페이지(/search?q=...)에서 좌측 MosaicLogo → 뒤로가기 버튼.
 *    크기 정확히 28x28 (로고와 동일), 색 #5C3D1F (모자이크 갈색).
 *    클릭 시 "Search 진입 직전 페이지"로 navigate.
 *  - 🆕 Search origin tracker — sessionStorage에 검색 진입 직전 path 저장.
 *    location 변경 감지 → /search 진입 시 직전 path를 SEARCH_ORIGIN_KEY에 기록.
 *    검색어 여러 번 바꿔도 origin은 변경 X (같은 /search 안에서는 갱신 안 함).
 *
 * 동작 시나리오:
 *   /events → /search → /search?q=노트북 → /search?q=마우스
 *     → 뒤로가기 1번 → /events (origin)
 *   /bookmarks → 키워드 클릭 → /search?q=X
 *     → 뒤로가기 1번 → /bookmarks
 *   첫 진입 (앱 시작 → /search 직접): origin 미저장 → fallback /events
 *
 * v15 (유지): iOS PWA standalone safe-top inline fallback.
 * v8 (유지): events에서도 SearchBar.
 * ========================================================= */
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import HamburgerMenu from "./HamburgerMenu";
import SearchBar from "./SearchBar";
import MosaicLogo from "./MosaicLogo";

const PAGE_TITLES = {
  "/events": "핫딜 모음",
  "/search": "검색",
  "/bookmarks": "북마크",
};

const SEARCH_BAR_PATHS = new Set(["/events", "/search"]);
const SEARCH_ORIGIN_KEY = "search-origin-path";
const FALLBACK_ORIGIN = "/events";

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

/** 뒤로가기 (Chevron Left) — MosaicLogo와 동일 28px 컨테이너, 22px 아이콘. */
function BackIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [menuOpen, setMenuOpen] = useState(false);

  // v16: Search origin tracker.
  // /search 진입 시점에 직전 path 기록. /search 안에서 query만 바뀔 때는 갱신 X.
  const prevPathRef = useRef(null);
  useEffect(() => {
    const currentPath = location.pathname;
    const prevPath = prevPathRef.current;
    if (currentPath === "/search" && prevPath && prevPath !== "/search") {
      try {
        sessionStorage.setItem(SEARCH_ORIGIN_KEY, prevPath);
      } catch (_) {
        // private mode 등 실패 → fallback 사용.
      }
    }
    prevPathRef.current = currentPath;
  }, [location.pathname]);

  const showSearchBar = SEARCH_BAR_PATHS.has(location.pathname);
  const pageTitle = PAGE_TITLES[location.pathname] || "";

  // v16: 검색 결과 페이지 (/search + q 파라미터 있음)
  const isSearchResult =
    location.pathname === "/search" && Boolean(searchParams.get("q"));

  // v16: 뒤로가기 핸들러 — origin으로 navigate.
  const handleBack = () => {
    let origin = FALLBACK_ORIGIN;
    try {
      const stored = sessionStorage.getItem(SEARCH_ORIGIN_KEY);
      if (stored) origin = stored;
    } catch (_) {}
    navigate(origin);
  };

  const headerStyle = NEEDS_IOS_SAFE_TOP
    ? { paddingTop: "env(safe-area-inset-top)" }
    : undefined;

  return (
    <>
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
        {/* v16: 검색 결과 시 뒤로가기, 그 외엔 로고. 28x28 동일 사이즈. */}
        {isSearchResult ? (
          <button
            type="button"
            aria-label="뒤로가기"
            onClick={handleBack}
            className="flex-shrink-0 flex items-center justify-center"
            style={{
              width: 28,
              height: 28,
              color: "#5C3D1F",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            <BackIcon />
          </button>
        ) : (
          <MosaicLogo size={28} />
        )}

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
