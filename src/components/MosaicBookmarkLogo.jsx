/* =========================================================
 * src/components/MosaicBookmarkLogo.jsx
 * 모자이크 + 북마크 합성 로고 — PC 격자+돋보기 정체성 정합.
 *
 * v1 (2026-05-25):
 *  - 3×3 격자 (PWA MosaicLogo 본문 정합) + 우측 하단 모서리에 북마크 오버레이.
 *  - 우측 하단 셀(#fff5e6)은 그리지 않음 — 북마크가 그 자리.
 *  - 북마크: lucide-style, 흰 채우기 + 검정 외곽선.
 *  - viewBox 80×80 — 격자 (4~68) + 북마크 모서리 여유.
 *
 * 사용처:
 *  - BookmarkEmptyOnboarding (PWA 북마크 빈 상태) — "북마크" 정체성 시각 강조.
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
      viewBox="0 0 80 80"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="모자이크 쇼핑 — 북마크"
      role="img"
    >
      {/* 3×3 격자 (PWA MosaicLogo 정합, 4~68 영역) */}
      <rect x="4" y="4" width="19" height="19" rx="3" fill="#f4d443" />
      <rect x="26" y="4" width="19" height="19" rx="3" fill="#ffffff" stroke="#e6e1d0" />
      <rect x="49" y="4" width="19" height="19" rx="3" fill="#e8762b" />
      <rect x="4" y="26" width="19" height="19" rx="3" fill="#ffffff" stroke="#e6e1d0" />
      <rect x="26" y="26" width="19" height="19" rx="3" fill="#e8762b" />
      <rect x="49" y="26" width="19" height="19" rx="3" fill="#f4d443" />
      <rect x="4" y="49" width="19" height="19" rx="3" fill="#e8762b" />
      <rect x="26" y="49" width="19" height="19" rx="3" fill="#f4d443" />
      {/* 우측 하단 셀 (49~68) 자리에 북마크 오버레이 — 셀 자체는 그리지 않음 */}

      {/* 북마크 아이콘 (lucide-style, 격자 외곽으로 살짝 튀어나옴) */}
      <svg width="34" height="34" x="42" y="42" viewBox="0 0 24 24">
        <path
          d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"
          fill="#FFFFFF"
          stroke="#1A1A1A"
          strokeWidth="2.2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    </svg>
  );
}
