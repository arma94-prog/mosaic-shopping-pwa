/* =========================================================
 * src/components/HamburgerMenu.jsx
 * Chrome 스타일 햄버거 메뉴 — 우측 상단에서 슬라이드 다운.
 *
 * v5 변경 (2026-05-01, 트랙 E 3 — 사업 제휴 + 오류 제보 추가):
 *  - 🆕 메뉴 5개 + divider 4개 (모든 항목 사이).
 *  - 🆕 사업 제휴 / 오류 제보 → FeedbackModal 호출.
 *  - 🆕 BriefcaseIcon (사업 제휴), AlertCircleIcon (오류 제보).
 *  - 메뉴 순서: 서비스 소개 / 로그아웃 / 사업 제휴 / 오류 제보 / 설정.
 *
 * v4 (유지): MenuItem padding 14px (오터치 방지).
 * v3 (유지): top env(safe-area-inset-top) (노티바 붙음).
 * ========================================================= */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase.js";
import { useExternalNavigate } from "../lib/externalLinkContext";
import MosaicLogo from "./MosaicLogo";
import FeedbackModal from "./FeedbackModal";

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

/** 사업 제휴 — 가방. 단순 직사각형 + 손잡이. */
function BriefcaseIcon() {
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
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

/** 오류 제보 — 동그라미 안 ! */
function AlertCircleIcon() {
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
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

export default function HamburgerMenu({ onClose }) {
  const navigate = useNavigate();
  const externalNavigate = useExternalNavigate();
  const [feedbackType, setFeedbackType] = useState(null); // null | "report" | "partner"

  const handleIntro = () => {
    onClose();
    externalNavigate(INTRO_URL);
  };

  const handleLogout = async () => {
    onClose();
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("[hamburger] signOut error:", e);
    }
  };

  const handlePartner = () => {
    setFeedbackType("partner");
  };

  const handleReport = () => {
    setFeedbackType("report");
  };

  const handleSettings = () => {
    onClose();
    navigate("/settings");
  };

  // 모달이 열려 있을 때는 햄버거 메뉴 자체를 숨김 (모달 닫으면 햄버거도 같이 닫힘).
  if (feedbackType) {
    return (
      <FeedbackModal
        type={feedbackType}
        onClose={() => {
          setFeedbackType(null);
          onClose();
        }}
      />
    );
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        style={{ background: "rgba(0,0,0,0.3)" }}
        onClick={onClose}
        aria-hidden="true"
      />

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
          icon={<LogoutIcon />}
          label="로그아웃"
          onClick={handleLogout}
        />
        <Divider />
        <MenuItem
          icon={<BriefcaseIcon />}
          label="사업 제휴"
          onClick={handlePartner}
        />
        <Divider />
        <MenuItem
          icon={<AlertCircleIcon />}
          label="오류 제보"
          onClick={handleReport}
        />
        <Divider />
        <MenuItem
          icon={<SettingsIcon />}
          label="설정"
          onClick={handleSettings}
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
      className="flex w-full items-center gap-3 text-left transition-colors"
      style={{
        background: "transparent",
        color: "#1A1A1A",
        fontSize: "14px",
        padding: "14px 16px",
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
      style={{ height: "1px", background: "#EFECE3", margin: "0" }}
      aria-hidden="true"
    />
  );
}
