/* =========================================================
 * src/components/MallCell.jsx
 * mall 격자 셀 — Events + SearchResults 둘 다 사용.
 *
 * v3 변경 (2026-05-01, 트랙 E 3 — 설정 페이지):
 *  - 🆕 useUserPrefs() 구독 — 설정 변경 시 즉시 re-render.
 *  - 🆕 iconSize 설정 적용 (small 60% / medium 70% / large 80%).
 *  - 🆕 showMallName 설정 시 아이콘 아래에 이름 4글자 말줄임 표시.
 *  - cell 구조 변경: button 직접 aspect-square → button (flex-col)
 *    + 내부 aspect-square div (아이콘) + optional span (이름).
 *
 * v2 (유지): fallback 70% 회색 테두리 + 페이지 타이틀 색.
 * ========================================================= */
import { useState } from "react";
import { resolveMallIconUrl } from "../lib/mallIconResolver";
import { useUserPrefs, getIconSizePercent } from "../lib/userPrefs";

/** 4글자 말줄임. 한글/영문/숫자 모두 동일 처리. */
function truncateName(name) {
  if (!name) return "";
  const trimmed = name.trim();
  if (trimmed.length <= 4) return trimmed;
  return trimmed.slice(0, 4) + "..";
}

export default function MallCell({ mall, iconBase, onClick }) {
  const [imgError, setImgError] = useState(false);
  const [prefs] = useUserPrefs();

  const iconUrl = resolveMallIconUrl(mall, iconBase);
  const showFallback = !iconUrl || imgError;
  const sizePercent = getIconSizePercent(prefs.iconSize);
  const sizeClass = `w-[${sizePercent}%] h-[${sizePercent}%]`;
  // 임의값 동적 생성은 Tailwind purge 위험 — inline style로 명시
  const sizeStyle = { width: `${sizePercent}%`, height: `${sizePercent}%` };

  return (
    <button
      onClick={onClick}
      aria-label={mall.name}
      title={mall.name}
      className="flex flex-col items-center transition-colors active:bg-[#F1EFE8] rounded-[10px]"
      style={{
        background: "transparent",
        border: "none",
        padding: 0,
        gap: prefs.showMallName ? "2px" : 0,
      }}
    >
      <div
        className="aspect-square w-full flex items-center justify-center overflow-hidden rounded-[10px]"
      >
        {!showFallback ? (
          <img
            src={iconUrl}
            alt=""
            loading="lazy"
            onError={() => setImgError(true)}
            className="object-contain"
            style={sizeStyle}
            draggable="false"
          />
        ) : (
          <div
            className="flex items-center justify-center overflow-hidden"
            style={{
              ...sizeStyle,
              background: "transparent",
              border: "1px solid #E6E6E6",
              borderRadius: "6px",
              padding: "4px",
              boxSizing: "border-box",
            }}
          >
            <span
              className="text-center"
              style={{
                fontSize: "12px",
                fontWeight: 500,
                color: "#1A1A1A",
                lineHeight: 1.15,
                wordBreak: "keep-all",
                whiteSpace: "normal",
                letterSpacing: "-0.2px",
              }}
            >
              {mall.name || "?"}
            </span>
          </div>
        )}
      </div>

      {prefs.showMallName && (
        <span
          className="truncate w-full text-center"
          style={{
            fontSize: "10px",
            color: "#6B6B6B",
            lineHeight: 1.2,
            paddingBottom: "2px",
          }}
        >
          {truncateName(mall.name)}
        </span>
      )}
    </button>
  );
}
