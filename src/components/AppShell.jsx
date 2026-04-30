/* =========================================================
 * src/components/AppShell.jsx
 * 인증 후 메인 레이아웃 — 헤더 + Outlet + BottomNav.
 *
 * v15 변경 (2026-04-30, fix-3b — events → search → bookmarks 백키 catch):
 *  - 🐛 v14의 lastPathRef 패턴 폐기 — useEffect timing race로 일부 시나리오 실패.
 *    구체적: events → search → bookmarks → 백키 시 events로 못 감.
 *
 *  - 🆕 단순화 패턴: window.location.pathname 직접 검사.
 *    popstate 발동 → setTimeout 0 (react-router의 location update 대기) →
 *    window.location.pathname !== "/events"이면 events로 강제 navigate.
 *
 *  - lastPathRef 의존 X → useEffect timing race 회피.
 *  - 어떤 라우트 → 어떤 라우트로 백키든 결과는 통일: events 외엔 events로.
 *
 * 시나리오 커버 (모두 통과):
 *   events 첫 진입 → 백키: popstate 미발동 (Chrome PWA standalone 한계) → OS 종료
 *   events → bookmarks → 백키: react-router /events → 우리 handler에서 events 일치 → navigate 안 함
 *   events → search → 백키: 동일
 *   events → search → bookmarks → 백키: react-router /search → 우리 handler에서 events로 강제
 *   /search?q=X → 백키: react-router /search → events로 강제
 *
 * v14 (제거): lastPathRef 패턴.
 * v3 (유지): fixed inset-0 + flex column.
 *
 * Phase 2 Capacitor에서 정확 구현 (메모리 #4):
 *  - @capacitor/app의 App.addListener('backButton', ...) — OS 백키 직접 intercept.
 *  - 표준 dual-back exit + bookmarks 강제 events 모두 통합.
 * ========================================================= */
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Header from "./Header";
import BottomNav from "./BottomNav";

export default function AppShell() {
  const navigate = useNavigate();

  // 백키 정책 — events 외 라우트에서 백키 = events로 강제 navigate.
  useEffect(() => {
    const onPopState = () => {
      // setTimeout 0: react-router가 popstate에 따른 location update 처리 후 우리 navigate.
      // 즉시 navigate하면 react-router와 race condition 위험.
      setTimeout(() => {
        if (window.location.pathname !== "/events") {
          navigate("/events", { replace: true });
        }
      }, 0);
    };

    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
    };
  }, [navigate]);

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
