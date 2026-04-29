/* =========================================================
 * src/components/BottomNav.jsx
 * 모바일 네이티브 하단 탭바 — Phase 1 합의된 3개 탭.
 *
 * 변경 (이전 버전 → 현재):
 *  - 4개 → 3개 탭. "이벤트" → "핫딜 모음" 명칭 변경.
 *  - 검색+결과를 "검색" 하나로 통합 (URL ?q= query parameter로 두 view 전환, 세션 2에서 구현).
 *  - 폐기된 /results 경로는 App.jsx에서 /search로 자동 redirect.
 * ========================================================= */
import { NavLink } from "react-router-dom";

const TABS = [
  { to: "/events", label: "핫딜 모음", icon: "🎁" },
  { to: "/search", label: "검색", icon: "🔍" },
  { to: "/bookmarks", label: "북마크", icon: "🔖" },
];

export default function BottomNav() {
  return (
    <nav
      className="
        flex-shrink-0
        border-t border-mosaic-line
        bg-mosaic-surface
        safe-bottom
      "
    >
      <ul className="flex items-stretch">
        {TABS.map((tab) => (
          <li key={tab.to} className="flex-1">
            <NavLink
              to={tab.to}
              className={({ isActive }) =>
                [
                  "flex flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors",
                  isActive
                    ? "text-mosaic-accent"
                    : "text-mosaic-muted active:text-mosaic-text",
                ].join(" ")
              }
            >
              <span className="text-xl leading-none">{tab.icon}</span>
              <span>{tab.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
