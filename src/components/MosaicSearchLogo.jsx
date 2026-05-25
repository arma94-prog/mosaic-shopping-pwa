/* =========================================================
 * src/components/MosaicSearchLogo.jsx
 * 모자이크 + 돋보기 합성 로고 — 검색 정체성.
 *
 * v2 (2026-05-25, 사용자 피드백):
 *  - 돋보기 크기 39 → 43 (+10%).
 *  - viewBox 88 → 90 (돋보기 끝점 90 수용).
 *
 * v1 (2026-05-25):
 *  - MosaicBookmarkLogo와 격자 본문 동일 (8개, 우하 셀 #fff5e6 자리 비움).
 *  - 우하에 돋보기 (lucide search) 오버레이 — 흰 채우기 원 + 핸들 라인.
 *  - 외곽선 strokeWidth 1.25 (북마크 로고와 동일 70% 톤).
 *
 * 사용처:
 *  - Search.jsx HistoryEmptyBox (검색 페이지 history 빈 상태).
 *
 * 색상 (PWA MosaicLogo / BookmarkLogo 정합):
 *  - 격자 — 오렌지 #e8762b / 노랑 #f4d443 / 흰 #ffffff (테두리 #e6e1d0)
 *  - 돋보기 — 채우기 #FFFFFF / 외곽선 #1A1A1A
 * ========================================================= */
export default function MosaicSearchLogo({ size = 40 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 90 90"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="모자이크 쇼핑 — 검색"
      role="img"
    >
      {/* 3×3 격자 (4~68, 우하 셀 자리 비움 — 돋보기 오버레이 영역) */}
      <rect x="4" y="4" width="19" height="19" rx="3" fill="#f4d443" />
      <rect x="26" y="4" width="19" height="19" rx="3" fill="#ffffff" stroke="#e6e1d0" />
      <rect x="49" y="4" width="19" height="19" rx="3" fill="#e8762b" />
      <rect x="4" y="26" width="19" height="19" rx="3" fill="#ffffff" stroke="#e6e1d0" />
      <rect x="26" y="26" width="19" height="19" rx="3" fill="#e8762b" />
      <rect x="49" y="26" width="19" height="19" rx="3" fill="#f4d443" />
      <rect x="4" y="49" width="19" height="19" rx="3" fill="#e8762b" />
      <rect x="26" y="49" width="19" height="19" rx="3" fill="#f4d443" />

      {/* 돋보기 — v2: 39 → 43 (+10%), viewBox 88 → 90 */}
      <svg width="43" height="43" x="47" y="47" viewBox="0 0 24 24">
        <circle
          cx="11"
          cy="11"
          r="8"
          fill="#FFFFFF"
          stroke="#1A1A1A"
          strokeWidth="1.25"
        />
        <path
          d="m21 21-4.3-4.3"
          fill="none"
          stroke="#1A1A1A"
          strokeWidth="1.25"
          strokeLinecap="round"
        />
      </svg>
    </svg>
  );
}
