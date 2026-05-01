/* =========================================================
 * src/components/BottomNav.jsx
 * 모바일 네이티브 하단 탭바 (3개 화면)
 *
 * v8 (롤백 — 2026-05-01):
 *  - v9 변경 (SearchIcon path 비율 확대 + PriceTagIcon active 흰색) 사용자 catch로 롤백.
 *  - 사용자 보고: "전체 레이아웃 깨졌음, 하단탭 건드려서 그런거 같음".
 *  - 정확한 인과 미확인이지만 안전 우선으로 v8 (점 제거만 적용된 안전 상태) 복귀.
 *
 * v8 (유지): PriceTagIcon 점 제거. 미니멀 룩.
 * v7 (유지): BookmarkIcon active outline + 주황색.
 * v6 (유지): iOS height 50 + Android v2 원래대로.
 * ========================================================= */
import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";

/** 가격 태그 - 핫딜 모음 (v8: 안의 점 제거, 미니멀) */
function PriceTagIcon({ active }) {
  const color = active ? "#E8762B" : "#A8A699";
  if (active) {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M3 4l8.5-1 9 9-9 9-9-9 1-8z"
          fill="#FBE8D9"
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

/** 돋보기 - 검색 (duotone) */
function SearchIcon({ active }) {
  const color = active ? "#E8762B" : "#A8A699";
  if (active) {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M11 4a7 7 0 0 1 5.4 11.5l5.3 5.3a1 1 0 0 1-1.4 1.4l-5.3-5.3A7 7 0 1 1 11 4zm0 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10z"
          fill={color}
        />
      </svg>
    );
  }
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="7" fill="none" stroke={color} strokeWidth="1.8" />
      <line x1="16.5" y1="16.5" x2="21" y2="21" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

/** 책갈피 - 북마크 (v7+: outline + 색상으로 active 구분) */
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
            <NavLink to={tab.to} className={linkClass}>
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
