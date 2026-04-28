/* =========================================================
 * src/components/BottomNav.jsx
 * 모바일 네이티브 하단 탭바 (4개 화면)
 * ========================================================= */
import { NavLink } from "react-router-dom";

const TABS = [
  { to: "/events", label: "이벤트", icon: "🎁" },
  { to: "/search", label: "검색", icon: "🔍" },
  { to: "/results", label: "결과", icon: "📋" },
  { to: "/bookmarks", label: "북마크", icon: "🔖" },
];

export default function BottomNav() {
  return (
    <nav className="border-t border-mosaic-line bg-mosaic-surface safe-bottom">
      <ul className="flex items-stretch">
        {TABS.map((tab) => (
          <li key={tab.to} className="flex-1">
            <NavLink
              to={tab.to}
              className={({ isActive }) =>
                [
                  "flex flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] font-medium transition",
                  isActive ? "text-mosaic-accent" : "text-mosaic-muted",
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
