/* =========================================================
 * src/pages/Settings.jsx
 * 환경 설정 페이지 — 로컬 저장 (localStorage).
 *
 * v5 변경 (2026-05-01, 트랙 E 3 — 사용자 catch):
 *  - 🐛 button 고정 너비 60px. container min-width 제거.
 *    이전 v4: container min-width 180 + button flex:1 → 짧은 segmented도
 *    180 너비가 되어 button width 변동 catch.
 *    fix: button width 고정 → 모든 button 동일 크기. container는 옵션 갯수
 *    따라 자연 너비.
 *
 * v4 (제거): container min-width.
 * v3 (유지): "아이콘 갯수" 항목.
 * ========================================================= */
import { useNavigate } from "react-router-dom";
import { useUserPrefs } from "../lib/userPrefs";

const BUTTON_WIDTH_PX = 60; // v5: 모든 button 고정 너비 (3옵션 segmented 기준)

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

  return (
    <div className="flex h-full flex-col">
      <header
        className="flex-shrink-0 flex items-center gap-3 h-12 pl-4 pr-3 bg-mosaic-bg border-b border-mosaic-line"
        style={{
          paddingTop: "env(safe-area-inset-top)",
          boxSizing: "content-box",
        }}
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
          {/* 1. 아이콘 크기 */}
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

          {/* 2. 아이콘 갯수 */}
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

          {/* 3. 쇼핑몰 이름 */}
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

          {/* 4. 카테고리 이름 */}
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

          {/* 5. 쇼핑몰 ON/OFF */}
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

/** v5: button 고정 너비. container 자동. */
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
