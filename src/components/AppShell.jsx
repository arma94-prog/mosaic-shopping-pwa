/* =========================================================
 * src/components/AppShell.jsx
 * 인증 후 메인 레이아웃 — 헤더 + Outlet + BottomNav.
 *
 * v13 변경 (2026-04-30, Phase 1 한계 솔직 인정 — 9차례 시도 후 옵션 A 확정):
 *
 * 시도 history (모두 검증됨, 모두 실패):
 *  - v3 fixed inset-0: 흔들림 fix만 효과 ✅ (유지)
 *  - v4 timestamp 기반 사이클
 *  - v5 closure 단순화 + visual debug
 *  - v6 paranoid double pushState
 *  - v7 진단 박스 + lifecycle 모니터링
 *  - v9 외부 조언 패턴 (load + state object)
 *  - v10 paranoid 재시도
 *  - v11 navigate(hash URL) — popstate 발동 ✅, but Events fetch cancel ❌
 *  - v12 pushState + react-router 호환 state — 다시 popstate 미발동 ❌
 *
 * 결정적 데이터 (사용자 dogfood):
 *  - events 첫 진입 + OS 백키 = blur 후 종료. popstate 미발동.
 *  - bookmarks/search → 백키 = popstate 정상 발동 (자연 history 동작).
 *  - 유일한 fix 후보였던 v11도 부작용으로 폐기.
 *
 * 결론: Android Chrome PWA standalone에서 events 첫 진입 시
 *       OS 백키 = 즉시 종료. 우회 코드로 회피 불가능.
 *
 * Phase 1 정책:
 *  - 토스트 사이클 시도 모두 제거. Chrome PWA 표준 동작 따름.
 *  - bookmarks/search → 백키 = events 이동: react-router 자연 history 동작에 위임.
 *    (BottomNav로 events에서 다른 페이지 갔으면 stack 직전 = events. 백키 자연 도달.)
 *  - 흔들림 fix (fixed inset-0)는 검증됨 → 유지.
 *
 * Phase 2 Capacitor에서 정확 구현 (우선순위 ↑):
 *  - @capacitor/app의 App.addListener('backButton', ...) — OS 백키 직접 intercept.
 *  - App.exitApp() — 명시적 종료.
 *  - 표준 dual-back exit 정확 구현 + bookmarks 강제 events 이동도 동일 API로.
 *  - 메모리 #4 (PWA standalone webview 한계 — Phase 2 Capacitor 우선순위 격상 사유) 정합.
 * ========================================================= */
import { Outlet } from "react-router-dom";
import Header from "./Header";
import BottomNav from "./BottomNav";

export default function AppShell() {
  return (
    // v3 (유지): fixed inset-0 + flex column. 외부 webview 갔다 와도 viewport 절대 고정.
    <div className="fixed inset-0 flex flex-col bg-mosaic-bg text-mosaic-text">
      <Header />
      <main className="flex-1 overflow-y-auto overscroll-contain">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
