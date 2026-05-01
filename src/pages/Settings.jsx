/* =========================================================
 * src/pages/Settings.jsx
 * 환경 설정 페이지 — 로컬 저장 (localStorage).
 *
 * v7 변경 (2026-05-01, 트랙 E 3 — 사용자 catch):
 *  - 🐛 Android에서 inline style 미적용 (Header v12 정합).
 *    headerWrapperStyle = NEEDS_IOS_SAFE_TOP일 때만 적용.
 *
 * v6 (제거): borderTop 명시.
 * v5 (유지): button 60px.
 * v3 (유지): "아이콘 갯수" 항목.
 * ========================================================= */
import { useNavigate } from "react-router-dom";
import { useUserPrefs } from "../lib/userPrefs";

const BUTTON_WIDTH_PX = 60;

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
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

export default function Settings() {
  const navigate = useNavigate();
  const [prefs, update] = useUserPrefs();

  // v7: iOS standalone일 때만. 그 외 undefined (no-op).
  const headerWrapperStyle = NEEDS_IOS_SAFE_TOP
    ? {
        paddingTop: "env(safe-area-inset-top)",
        boxSizing: "content-box",
      }
    : undefined;

  return (
    <div className="flex h-full flex-col">
      <header
        className="flex-shrink-0 flex items-center gap-3 h-12 pl-4 pr-3 bg-mosaic-bg border-b border-mosaic-line"
        style={headerWrapperStyle}
      >
        <button
          aria-label="뒤로가기"
          onClick={() => navigate(-1)}
          className="flex-shrink-0 p-2 -ml-2 transition-colors"
          style={{ color: "#1A1A1A", background: "transparent", border: "none" }}
        >
          <BackIcon />
        </button>
        <h1 className="flex-1 text-base font-semibold truncate">설정</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pt-3 pb-6">
        <h2
          className="pl-[7px]"
          style={{
            color: "#5C3D1F",
            paddingTop: "2px",
            paddingBottom: "2px",
            marginBottom: "8px",
            marginTop: 0,
            fontSize: "12px",
            fontWeight: 400,
          }}
        >
          쇼핑몰 설정
        </h2>

        <ul
          className="flex flex-col overflow-hidden rounded-xl"
          style={{
            background: "#FFFFFF",
            border: "1px solid #EFECE3",
          }}
        >
          <li className="px-4 py-3" style={{ borderTop: "none" }}>
            <Row label="아이콘 크기">
              <Segmented
                value={prefs.iconSize}
                onChange={(v) => update({ iconSize: v })}
                options={[
                  { value: "small", label: "작게" },
                  { value: "medium", label: "보통" },
                  { value: "large", label: "크게" },
                ]}
              />
            </Row>
          </li>

          <li
            className="px-4 py-3"
            style={{ borderTop: "1px solid #F5F3EC" }}
          >
            <Row label="아이콘 갯수">
              <Segmented
                value={String(prefs.iconCount)}
                onChange={(v) => update({ iconCount: Number(v) })}
                options={[
                  { value: "5", label: "5개" },
                  { value: "6", label: "6개" },
                ]}
              />
            </Row>
          </li>

          <li
            className="px-4 py-3"
            style={{ borderTop: "1px solid #F5F3EC" }}
          >
            <Row label="쇼핑몰 이름">
              <Segmented
                value={prefs.showMallName ? "on" : "off"}
                onChange={(v) => update({ showMallName: v === "on" })}
                options={[
                  { value: "on", label: "보기" },
                  { value: "off", label: "끄기" },
                ]}
              />
            </Row>
          </li>

          <li
            className="px-4 py-3"
            style={{ borderTop: "1px solid #F5F3EC" }}
          >
            <Row label="카테고리 이름">
              <Segmented
                value={prefs.showCategoryName ? "on" : "off"}
                onChange={(v) => update({ showCategoryName: v === "on" })}
                options={[
                  { value: "on", label: "보기" },
                  { value: "off", label: "끄기" },
                ]}
              />
            </Row>
          </li>

          <li
            className="px-4 py-3"
            style={{ borderTop: "1px solid #F5F3EC" }}
          >
            <Row label="쇼핑몰 ON/OFF">
              <span style={{ fontSize: "13px", color: "#A8A699" }}>
                PC에서 설정하세요
              </span>
            </Row>
          </li>
        </ul>
      </main>
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span style={{ fontSize: "14px", color: "#1A1A1A" }}>{label}</span>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

function Segmented({ value, onChange, options }) {
  return (
    <div
      className="flex"
      style={{
        background: "#F5F3EC",
        borderRadius: "8px",
        padding: "2px",
        gap: "0",
      }}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            style={{
              width: `${BUTTON_WIDTH_PX}px`,
              padding: "5px 0",
              fontSize: "12px",
              fontWeight: active ? 500 : 400,
              color: active ? "#FFFFFF" : "#6B6B6B",
              background: active ? "#E8762B" : "transparent",
              border: "none",
              borderRadius: "6px",
              transition: "all 0.15s",
              cursor: "pointer",
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
