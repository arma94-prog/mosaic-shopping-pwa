/* =========================================================
 * src/components/BottomNav.jsx
 * 모바일 네이티브 하단 탭바 (3개 화면)
 *
 * v14 변경 (2026-05-25, 사용자 피드백):
 *  - 🆕 NavLink `replace` prop 추가 — 탭 클릭 시 pushState → replaceState.
 *    이전: 탭 누를 때마다 history 누적 → 백키로 PWA 종료까지 N번 필요.
 *    이후: 탭 진입 entry가 항상 stack 끝에 1개만 — AppShell 가짜 entry +
 *      이중 백키 종료 패턴과 정합.
 *
 * v13 (유지): SearchIcon 단일 outline 구조 통일.
 * v11 (유지): SVG 외부 크기 26 (검색 아이콘 키움).
 *
 * 다른 아이콘은 24×24 그대로 유지.
 * ========================================================= */
import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";

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
            <NavLink to={tab.to} className={linkClass} replace>
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
