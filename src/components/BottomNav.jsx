/* =========================================================
 * src/components/BottomNav.jsx
 * 모바일 네이티브 하단 탭바 (3개 화면)
 *
 * v6 변경 (2026-04-30, 사용자 결정):
 *  - iOS만 nav 시각 전체 50px 고정.
 *    구현: height: 50 + paddingBottom: 0 (safe-area 영역 무시).
 *    home indicator 영역 일부 침범 (~22~24px). home gesture 영역 ~10px 보존.
 *  - Android (env = 0): v2 원래대로 (gap-1 + py-2 + padding 0).
 *
 * v5 (제거): iOS 60px (콘텐츠 48 + safe 12).
 * v2 (유지): SVG 인라인 아이콘.
 * ========================================================= */
import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";

/** 가격 태그 - 핫딜 모음 (monoline) */
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
        <circle cx="7.5" cy="8" r="1.5" fill={color} />
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
      <circle cx="7.5" cy="8" r="1.3" fill={color} />
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

/** 책갈피 - 북마크 (duotone) */
function BookmarkIcon({ active }) {
  const color = active ? "#E8762B" : "#A8A699";
  if (active) {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M6 3a1 1 0 0 0-1 1v17.5a.5.5 0 0 0 .8.4L12 17.5l6.2 4.4a.5.5 0 0 0 .8-.4V4a1 1 0 0 0-1-1H6z"
          fill={color}
        />
      </svg>
    );
  }
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
  // initial 추측 — navigator.userAgent로. 첫 render 깜빡임 회피.
  const [hasSafeArea, setHasSafeArea] = useState(() => {
    if (typeof navigator === "undefined") return false;
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  });

  useEffect(() => {
    // 정확 측정 — env(safe-area-inset-bottom) 실제 값.
    const probe = document.createElement("div");
    probe.style.cssText =
      "position:fixed;visibility:hidden;padding-bottom:env(safe-area-inset-bottom)";
    document.body.appendChild(probe);
    const px = parseInt(getComputedStyle(probe).paddingBottom, 10) || 0;
    document.body.removeChild(probe);
    setHasSafeArea(px > 0);
  }, []);

  // OS-aware 분기:
  //   iOS X+: nav 시각 전체 50px 고정 (height + padding 0). 콘텐츠 자동 fit.
  //   Android (env = 0): v2 원래대로 (콘텐츠 자동 + py-2 gap-1).
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
