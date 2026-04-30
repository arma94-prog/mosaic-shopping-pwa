/* =========================================================
 * src/components/MosaicLogo.jsx
 * 모자이크 쇼핑 정체성 로고 — PC 환경설정과 동일.
 *
 * 책임:
 *  - PC `options.html` line 14~24 SVG 정확 매핑
 *  - 3×3 격자 구조 (오렌지/노랑/흰색 mosaic)
 *  - 사이즈 prop으로 재사용
 *
 * 사용처:
 *  - AuthGate.jsx (로그인 화면 큰 로고)
 *  - AppShell.jsx (header 작은 로고)
 *  - 향후 splash/about 등
 *
 * v1 (2026-04-30, 사용자 catch):
 *  - 이전: 쇼핑백 임시 아이콘 (PWA 첫 진입 + 홈 화면).
 *  - 이후: PC 환경설정과 동일한 모자이크 정체성 일관.
 *
 * 색상 팔레트 (PC 정확 매핑):
 *  - 배경: #F0EDE4 (베이지)
 *  - 오렌지: #e8762b
 *  - 노랑: #f4d443
 *  - 흰색: #ffffff (테두리 #e6e1d0)
 *  - 연한 베이지: #fff5e6
 * ========================================================= */
export default function MosaicLogo({ size = 72, rounded = true }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 72 72"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="모자이크 쇼핑"
      role="img"
    >
      <rect width="72" height="72" rx={rounded ? 12 : 0} fill="#F0EDE4" />
      {/* row 1 */}
      <rect x="4" y="4" width="19" height="19" rx="3" fill="#f4d443" />
      <rect x="26" y="4" width="19" height="19" rx="3" fill="#ffffff" stroke="#e6e1d0" />
      <rect x="49" y="4" width="19" height="19" rx="3" fill="#e8762b" />
      {/* row 2 */}
      <rect x="4" y="26" width="19" height="19" rx="3" fill="#ffffff" stroke="#e6e1d0" />
      <rect x="26" y="26" width="19" height="19" rx="3" fill="#e8762b" />
      <rect x="49" y="26" width="19" height="19" rx="3" fill="#f4d443" />
      {/* row 3 */}
      <rect x="4" y="49" width="19" height="19" rx="3" fill="#e8762b" />
      <rect x="26" y="49" width="19" height="19" rx="3" fill="#f4d443" />
      <rect x="49" y="49" width="19" height="19" rx="3" fill="#fff5e6" />
    </svg>
  );
}
