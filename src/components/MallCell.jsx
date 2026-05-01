/* =========================================================
 * src/components/MallCell.jsx
 * mall 격자 셀 — Events + SearchResults 둘 다 사용.
 *
 * v4 변경 (2026-05-01, 트랙 E 3):
 *  - 🐛 쇼핑몰 이름 가공 정책 변경: 첫 공백까지 앞 단어 → 4글자 후 ".."
 *    (이전 v3: 단순 4글자 자름. 공백 무시).
 *  - lib/userPrefs.formatMallName 함수로 이동.
 *
 * v3 (유지): useUserPrefs + iconSize + showMallName 적용.
 * v2 (유지): fallback 70% 회색 테두리.
 * ========================================================= */
import { useState } from "react";
import { resolveMallIconUrl } from "../lib/mallIconResolver";
import { useUserPrefs, getIconSizePercent, formatMallName } from "../lib/userPrefs";

export default function MallCell({ mall, iconBase, onClick }) {
  const [imgError, setImgError] = useState(false);
  const [prefs] = useUserPrefs();

  const iconUrl = resolveMallIconUrl(mall, iconBase);
  const showFallback = !iconUrl || imgError;
  const sizePercent = getIconSizePercent(prefs.iconSize);
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
          {formatMallName(mall.name)}
        </span>
      )}
    </button>
  );
}
