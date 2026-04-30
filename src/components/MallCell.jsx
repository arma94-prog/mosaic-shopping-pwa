/* =========================================================
 * src/components/MallCell.jsx
 * mall 격자 셀 — Events + SearchResults 둘 다 사용.
 *
 * 책임:
 *  - mall 아이콘 URL 결정 (PC mallIconResolver 정확 매핑)
 *  - 아이콘 로드 실패 시 fallback (PC .chip-fb 정합)
 *  - 클릭 시 onClick 핸들러 호출
 *
 * v1 (2026-04-30, 사용자 catch):
 *  - 이전: SearchResults.jsx + Events.jsx 둘 다 자체 MallCell 구현. fallback 디자인 PC 정합 X.
 *  - 이후: 공용 컴포넌트로 통합. PC `.chip-fb` 정확 매핑.
 *
 * PC `.chip-fb` 정확 명세 (sidepanel.css line 103):
 *  - background: #EAE6D9 (베이지)
 *  - border-radius: 6px
 *  - color: #fff (흰색)
 *  - font-size: clamp(9px, 2.2vw, 11px) → PWA 12px (PC +1)
 *  - font-weight: 700
 *  - padding: 2px (PWA 4px — 모바일 가독성)
 *  - text-align: center
 *  - word-break: keep-all (한글 줄바꿈)
 *  - white-space: normal
 * ========================================================= */
import { useState } from "react";
import { resolveMallIconUrl } from "../lib/mallIconResolver";

export default function MallCell({ mall, iconBase, onClick }) {
  const [imgError, setImgError] = useState(false);
  const iconUrl = resolveMallIconUrl(mall, iconBase);

  const showFallback = !iconUrl || imgError;

  return (
    <button
      onClick={onClick}
      aria-label={mall.name}
      title={mall.name}
      className="aspect-square rounded-[10px] flex items-center justify-center overflow-hidden transition-colors active:bg-[#F1EFE8]"
      style={{
        background: "transparent",
        border: "none",
        padding: 0,
      }}
    >
      {!showFallback ? (
        <img
          src={iconUrl}
          alt=""
          loading="lazy"
          onError={() => setImgError(true)}
          className="w-[70%] h-[70%] object-contain"
          draggable="false"
        />
      ) : (
        // PC .chip-fb 정확 매핑: 베이지 배경 + 흰색 글자 + word-break keep-all
        <div
          className="w-full h-full flex items-center justify-center overflow-hidden"
          style={{
            background: "#EAE6D9",
            borderRadius: "6px",
            padding: "4px",
            boxSizing: "border-box",
          }}
        >
          <span
            className="text-center"
            style={{
              fontSize: "12px",  // PC clamp(9~11) +1
              fontWeight: 700,
              color: "#FFFFFF",
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
    </button>
  );
}
