/* =========================================================
 * src/pages/Events.jsx
 * 핫딜 모음 — Phase 1에서는 placeholder.
 *
 * Phase 2 구현 예정:
 *  - mosaic-events.json fetch (GitHub Pages)
 *  - 사용자 user_settings.customEventMalls 합쳐서 표시
 *  - disabled_malls/cats 필터링
 *  - 카드 클릭 → useExternalNavigate로 외부 브라우저 이동
 * ========================================================= */

export default function Events() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-12 text-center">
      <div className="text-5xl mb-5" aria-hidden="true">🎁</div>
      <h2 className="text-lg font-semibold mb-2 text-mosaic-text">
        핫딜 모음
      </h2>
      <p className="text-sm text-mosaic-muted leading-relaxed">
        Phase 2에서 만나요.
        <br />
        한국 주요 핫딜 커뮤니티의
        <br />
        실시간 핫딜을 한눈에 보여드립니다.
      </p>
      <div className="mt-8 text-xs text-mosaic-muted-3">
        지금은 검색과 북마크 기능을 사용하실 수 있어요.
      </div>
    </div>
  );
}
