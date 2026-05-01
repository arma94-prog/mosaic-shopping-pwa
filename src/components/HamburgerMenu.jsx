/* =========================================================
 * src/components/HamburgerMenu.jsx
 * Chrome 스타일 햄버거 메뉴 — 우측 상단에서 슬라이드 다운.
 *
 * v3 변경 (2026-05-01, 트랙 E 3):
 *  - 🐛 메뉴 위치 — top 56px → top 0 (노티바에 붙도록).
 *    safe-area-inset-top만 padding으로 추가 (iOS notch 대응).
 *    Chrome 모바일 햄버거 메뉴 정확 정합.
 *
 * v2 (유지): 메뉴 3개 (서비스 소개 / 설정 / 로그아웃).
 * ========================================================= */
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase.js";
import { useExternalNavigate } from "../lib/externalLinkContext";
import MosaicLogo from "./MosaicLogo";

const INTRO_URL = "https://arma94-prog.github.io/mosaic-shopping/";

function SettingsIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

export default function HamburgerMenu({ onClose }) {
  const navigate = useNavigate();
  const externalNavigate = useExternalNavigate();

  const handleIntro = () => {
    onClose();
    externalNavigate(INTRO_URL);
  };

  const handleSettings = () => {
    onClose();
    navigate("/settings");
  };

  const handleLogout = async () => {
    onClose();
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("[hamburger] signOut error:", e);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        style={{ background: "rgba(0,0,0,0.3)" }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* v3: top 0으로 노티바에 붙음. safe-area-inset-top만 padding으로 추가. */}
      <div
        className="fixed right-2 z-50 overflow-hidden"
        style={{
          top: "env(safe-area-inset-top)",
          background: "#FFFFFF",
          borderRadius: "12px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
          minWidth: "220px",
          marginTop: "8px",
        }}
      >
        <MenuItem
          icon={<MosaicLogo size={20} />}
          label="서비스 소개"
          onClick={handleIntro}
        />
        <Divider />
        <MenuItem
          icon={<SettingsIcon />}
          label="설정"
          onClick={handleSettings}
        />
        <MenuItem
          icon={<LogoutIcon />}
          label="로그아웃"
          onClick={handleLogout}
        />
      </div>
    </>
  );
}

function MenuItem({ icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors"
      style={{
        background: "transparent",
        color: "#1A1A1A",
        fontSize: "14px",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#F5F3EC")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <span className="flex-shrink-0" style={{ color: "#5C3D1F", display: "flex" }}>
        {icon}
      </span>
      <span>{label}</span>
    </button>
  );
}

function Divider() {
  return (
    <div
      style={{ height: "1px", background: "#EFECE3", margin: "4px 0" }}
      aria-hidden="true"
    />
  );
}
