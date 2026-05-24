/* =========================================================
 * src/components/AppShell.jsx
 * 인증 후 메인 레이아웃 — 헤더 + Outlet + BottomNav.
 *
 * v19 변경 (2026-05-25, 사용자 피드백):
 *  - 🆕 이중 백키 종료 패턴 (PWA standalone 표준 UX).
 *    1) 마운트 시 가짜 history entry push — 첫 백키 가로채기 위해.
 *    2) popstate 1차: 토스트 + 가짜 entry 복원 + 2초 timer.
 *    3) popstate 2차 (2초 내): history.back()으로 stack 한 번 더 pop
 *       → PWA standalone 자동 종료.
 *    4) 2초 만료 후 백키: 다시 1차 동작.
 *
 *  - BottomNav v14 (replace prop)와 정합 — 탭 진입 entry는 stack 끝 1개만.
 *
 *  - Phase 2 Capacitor 도입 시: App.exitApp() 명시 호출로 정확 종료 대체.
 *    현재 Phase 1은 web layer 한계 — stack 비움으로 종료 trigger.
 *
 * v18 (제거 → 재도입): popstate listener. v18에서 자연 history 위임 결정 폐기,
 *   v19에서 가짜 entry + 토스트 패턴으로 사용자 UX ↑.
 *
 * v3 (유지): fixed inset-0 + flex column. 외부 webview 갔다 와도 viewport 고정.
 *
 * Phase 2 Capacitor 구현 항목 (메모리 #4 우선순위):
 *  - @capacitor/app의 App.addListener('backButton', ...) — OS 백키 직접 intercept.
 *  - App.exitApp() — 진짜 종료 (현재 stack 비움 우회 패턴 대체).
 *  - 표준 dual-back exit 정확 구현.
 * ========================================================= */
import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import BottomNav from "./BottomNav";
import { useToast } from "./ToastProvider";

/** 토스트 표시 후 종료 대기 시간 (ms). 이 시간 내 2차 백키 = 종료. */
const EXIT_PENDING_MS = 2000;

export default function AppShell() {
  const { showToast } = useToast();

  useEffect(() => {
    // 1) 가짜 entry — 첫 백키를 popstate handler로 가로채기 위해.
    //    URL 동일 (window.location.href) → React Router location 변화 catch X.
    //    state만 다르고 pathname 동일이라 부작용 없음.
    window.history.pushState({ _mosaicExitGuard: true }, "", window.location.href);

    let exitPending = false;
    let exitTimer = null;

    const handlePopState = () => {
      if (exitPending) {
        // 2차 백키 (2초 내) — 종료 trigger.
        // history.back()으로 stack 한 번 더 pop. PWA standalone에서 stack 비면
        // OS/PWA shell이 자동 종료.
        // (브라우저 탭에서 실행 중일 때는 이전 페이지로 — Phase 2에서 Capacitor exitApp로 정확 처리.)
        if (exitTimer) {
          clearTimeout(exitTimer);
          exitTimer = null;
        }
        exitPending = false;
        window.history.back();
        return;
      }

      // 1차 백키 — 가짜 entry 복원 (다음 백키도 가로채기 위해) + 토스트 + 만료 timer.
      exitPending = true;
      window.history.pushState({ _mosaicExitGuard: true }, "", window.location.href);
      showToast("뒤로 한 번 더 누르면 종료됩니다");
      exitTimer = window.setTimeout(() => {
        exitPending = false;
        exitTimer = null;
      }, EXIT_PENDING_MS);
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      if (exitTimer) clearTimeout(exitTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
