/* =========================================================
 * src/components/MallCell.jsx
 * mall 격자 셀 — Events + SearchResults 둘 다 사용.
 *
 * v2 변경 (2026-04-30, 사용자 catch — 캡쳐 기반):
 *  - 🐛 fallback 셀 100% 크기 → 70% (다른 셀과 동일)
 *  - 🐛 베이지 배경 #EAE6D9 → transparent
 *  - 🐛 테두리 명시적 1px solid #E6E6E6 (배경 대신 시각 경계)
 *  - 🐛 색 #FFFFFF → #1A1A1A (페이지 타이틀 정합)
 *  - 🐛 weight 700 → 500 (볼드 제거)
 *
 *  사용자 의도 정확 매핑:
 *   "기존 쇼핑몰 아이콘들과 동일한 사이즈에 폰트 색깔은 각 페이지 타이틀 폰트랑 같게,
 *    볼드 제거 + 테두리 보더라인"
 *
 * v1 (이전): PC .chip-fb 정합 시도 (베이지 배경 + 흰색 글씨) — 페이지 톤 어긋남.
 *
 * 책임:
 *  - mall 아이콘 URL 결정 (PC mallIconResolver 정확 매핑)
 *  - 아이콘 로드 실패 시 fallback (페이지 톤 정합)
 *  - 클릭 시 onClick 핸들러 호출
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
        // v2: 70% 크기 + 회색 테두리 + 페이지 타이틀 색 (#1A1A1A) + weight 500
        <div
          className="w-[70%] h-[70%] flex items-center justify-center overflow-hidden"
          style={{
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
    </button>
  );
}
