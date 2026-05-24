/* =========================================================
 * src/components/MosaicBookmarkLogo.jsx
 * 모자이크 + 북마크 합성 로고 — PC 격자+돋보기 정체성 정합.
 *
 * v3 (2026-05-25, 사용자 피드백):
 *  - 외곽선 strokeWidth 1.8 → 1.25 (~70% 가늘게, MosaicSearchLogo 톤 정합).
 *
 * v2 (2026-05-25, 사용자 피드백):
 *  - 북마크 크기 +15% (34 → 39).
 *  - 북마크 외곽선 가늘게 (strokeWidth 2.2 → 1.8).
 *  - 북마크 위치 +5 / +5 (42,42 → 47,47).
 *  - viewBox 80 → 88 (북마크 끝점 86 수용, 격자 4~68 위치 보존).
 *
 * v1: 3×3 격자 (#fff5e6 우하 셀 자리에 북마크 오버레이) + lucide bookmark.
 *
 * 색상 (PWA MosaicLogo 본문 정합):
 *  - 오렌지: #e8762b / 노랑: #f4d443 / 흰: #ffffff (테두리 #e6e1d0)
 *  - 북마크 채우기: #FFFFFF / 외곽선: #1A1A1A
 * ========================================================= */
export default function MosaicBookmarkLogo({ size = 40 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 88 88"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="모자이크 쇼핑 — 북마크"
      role="img"
    >
      {/* 3×3 격자 (PWA MosaicLogo 정합, 4~68 영역 보존) */}
      <rect x="4" y="4" width="19" height="19" rx="3" fill="#f4d443" />
      <rect x="26" y="4" width="19" height="19" rx="3" fill="#ffffff" stroke="#e6e1d0" />
      <rect x="49" y="4" width="19" height="19" rx="3" fill="#e8762b" />
      <rect x="4" y="26" width="19" height="19" rx="3" fill="#ffffff" stroke="#e6e1d0" />
      <rect x="26" y="26" width="19" height="19" rx="3" fill="#e8762b" />
      <rect x="49" y="26" width="19" height="19" rx="3" fill="#f4d443" />
      <rect x="4" y="49" width="19" height="19" rx="3" fill="#e8762b" />
      <rect x="26" y="49" width="19" height="19" rx="3" fill="#f4d443" />
      {/* 우측 하단 셀 (49~68) 자리에 북마크 오버레이 — 셀 자체는 그리지 않음 */}

      {/* 북마크 — v3: strokeWidth 1.8 → 1.25 (~70% 가늘게) */}
      <svg width="39" height="39" x="47" y="47" viewBox="0 0 24 24">
        <path
          d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"
          fill="#FFFFFF"
          stroke="#1A1A1A"
          strokeWidth="1.25"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    </svg>
  );
}
