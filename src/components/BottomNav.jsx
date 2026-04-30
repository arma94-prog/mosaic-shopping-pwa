/* =========================================================
 * src/components/BottomNav.jsx
 * 모바일 네이티브 하단 탭바 (3개 화면)
 *
 * v2 변경 (2026-04-30, 사용자 결정):
 *  - 이모지 → SVG 인라인 아이콘 (시스템 폰트 의존 0, 픽셀 정밀).
 *  - 메타포 정합:
 *    - 핫딜 모음: 가격 태그 (시안 5 monoline) — 가격 강조
 *    - 검색: 돋보기 (시안 3 duotone) — 비활성 outline / 활성 filled
 *    - 북마크: 책갈피 (시안 3 duotone) — 비활성 outline / 활성 filled
 *  - Active 색 #E8762B (PC accent) / Inactive 색 #A8A699 (PC text-soft)
 * ========================================================= */
import { NavLink } from "react-router-dom";

/** 가격 태그 - 핫딜 모음 (monoline) */
function PriceTagIcon({ active }) {
  const color = active ? "#E8762B" : "#A8A699";
  if (active) {
    // 활성: 살구 fill + 주황 stroke (PC accent-bg + accent)
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
  // 비활성: outline only
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
    // 활성: filled
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M11 4a7 7 0 0 1 5.4 11.5l5.3 5.3a1 1 0 0 1-1.4 1.4l-5.3-5.3A7 7 0 1 1 11 4zm0 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10z"
          fill={color}
        />
      </svg>
    );
  }
  // 비활성: outline
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
    // 활성: filled
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M6 3a1 1 0 0 0-1 1v17.5a.5.5 0 0 0 .8.4L12 17.5l6.2 4.4a.5.5 0 0 0 .8-.4V4a1 1 0 0 0-1-1H6z"
          fill={color}
        />
      </svg>
    );
  }
  // 비활성: outline
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
  return (
    <nav
      className="safe-bottom"
      style={{
        background: "#FFFFFF",
        borderTop: "1px solid #EFECE3",
      }}
    >
      <ul className="flex items-stretch">
        {TABS.map((tab) => (
          <li key={tab.to} className="flex-1">
            <NavLink
              to={tab.to}
              className="flex flex-col items-center justify-center gap-1 py-2 transition"
            >
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
