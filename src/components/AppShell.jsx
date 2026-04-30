/* =========================================================
 * src/components/AppShell.jsx
 * 인증 후 메인 레이아웃 — 헤더 + Outlet + BottomNav.
 *
 * v18 변경 (2026-04-30, 트랙 D 최종 마무리):
 *  - popstate listener 제거 (search/bookmarks → events 강제 navigate 제거).
 *  - 진단 박스 제거. DEBUG 제거.
 *  - 사용자 결정: events에서 백키 시 종료 안 되는 것이 오히려 안전.
 *    PWA standalone에서 stack 깊이 무관하게 "백키 = 무조건 종료"는 web layer 한계.
 *    Phase 2 Capacitor에서 App.exitApp() 정확 구현 예정.
 *
 * Phase 1 백키 정책 (자연 history 동작에 위임):
 *  - bookmarks/search → 백키: react-router popstate → 자연 stack 직전 (대부분 events)
 *  - events 첫 진입 → 백키: stack 시작점 너머 → OS 종료
 *  - events에 BottomNav 통해 다시 도착 → 백키: stack 직전으로 popstate (이상하지 않음, 표준 patterns)
 *
 * v17 (제거): mount-once popstate listener.
 * v3 (유지): fixed inset-0 + flex column. 외부 webview 갔다 와도 viewport 절대 고정.
 *
 * Phase 2 Capacitor 구현 항목 (메모리 #4 우선순위):
 *  - @capacitor/app의 App.addListener('backButton', ...) — OS 백키 직접 intercept.
 *  - App.exitApp() — events에서 백키 시 명시적 종료.
 *  - 표준 dual-back exit (1차 토스트 + 2차 종료) 정확 구현.
 *  - 외부 mall deep link state 전달.
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
