/* =========================================================
 * src/components/BottomNav.jsx
 * 모바일 네이티브 하단 탭바 (3개 화면)
 *
 * v15 변경 (2026-05-25, 사용자 catch — Android 표준 백키 UX):
 *  - 🆕 NavLink `replace` prop 동적 — /events에서만 push, 그 외 replace.
 *    효과: stack 항상 [/events, /current_tab] 형태 유지.
 *      → 어디든 백키 = /events로 자동 이동
 *      → /events에서 백키 = 종료 확인 모달 (AppShell v23)
 *    표준 모바일 앱 패턴 정합.
 *
 * v14 (제거): 모든 탭 replace. v15에서 /events 외에서만 replace로 좁힘.
 * v13 (유지): SearchIcon 단일 outline 구조 통일.
 * v11 (유지): SVG 외부 크기 26 (검색 아이콘 키움).
 *
 * 다른 아이콘은 24×24 그대로 유지.
 * ========================================================= */
import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";

function PriceTagIcon({ active }) {
  const color = active ? "#E8762B" : "#A8A699";
  if (active) {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M3 4l8.5-1 9 9-9 9-9-9 1-8z"
          fill="#FFFFFF"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M3 4l8.5-1 9 9-9 9-9-9 1-8z"
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** 돋보기 - 검색 (v13: 단일 outline 구조 — BookmarkIcon 패턴 정합) */
function SearchIcon({ active }) {
  const color = active ? "#E8762B" : "#A8A699";
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="7" fill="none" stroke={color} strokeWidth="1.8" />
      <line x1="16.5" y1="16.5" x2="21" y2="21" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function BookmarkIcon({ active }) {
  const color = active ? "#E8762B" : "#A8A699";
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M6 3h12a1 1 0 0 1 1 1v17l-7-5-7 5V4a1 1 0 0 1 1-1z"
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const TABS = [
  { to: "/events", label: "핫딜 모음", Icon: PriceTagIcon },
  { to: "/search", label: "검색", Icon: SearchIcon },
  { to: "/bookmarks", label: "북마크", Icon: BookmarkIcon },
];

export default function BottomNav() {
  const location = useLocation();
  // v15: /events (홈)에서 다른 탭 클릭 = push (history 1번 누적 → 백키로 홈 돌아감).
  // 그 외 페이지에서 다른 탭 클릭 = replace (history 누적 X — stack 깊이 일정 유지).
  const shouldReplace = location.pathname !== "/events";

  const [hasSafeArea, setHasSafeArea] = useState(() => {
    if (typeof navigator === "undefined") return false;
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  });

  useEffect(() => {
    const probe = document.createElement("div");
    probe.style.cssText =
      "position:fixed;visibility:hidden;padding-bottom:env(safe-area-inset-bottom)";
    document.body.appendChild(probe);
    const px = parseInt(getComputedStyle(probe).paddingBottom, 10) || 0;
    document.body.removeChild(probe);
    setHasSafeArea(px > 0);
  }, []);

  const navStyle = hasSafeArea
    ? {
        background: "#FFFFFF",
        borderTop: "1px solid #EFECE3",
        height: 50,
        paddingBottom: 0,
      }
    : {
        background: "#FFFFFF",
        borderTop: "1px solid #EFECE3",
      };

  const linkClass = hasSafeArea
    ? "flex flex-col items-center justify-center gap-0.5 h-full transition"
    : "flex flex-col items-center justify-center gap-1 py-2 transition";

  return (
    <nav style={navStyle}>
      <ul className="flex items-stretch h-full">
        {TABS.map((tab) => (
          <li key={tab.to} className="flex-1">
            <NavLink to={tab.to} className={linkClass} replace={shouldReplace}>
              {({ isActive }) => (
                <>
                  <tab.Icon active={isActive} />
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? "#E8762B" : "#A8A699",
                    }}
                  >
                    {tab.label}
                  </span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
