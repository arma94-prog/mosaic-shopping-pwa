/* =========================================================
 * src/components/AppShell.jsx
 * 인증 후 메인 레이아웃 — 헤더 + Outlet + BottomNav.
 *
 * v21 변경 (2026-05-25, 사용자 catch — 토스트 직후 백키 종료 race fix):
 *  - 🐛 exit pending setTimeout(2000ms) 제거 → toastActiveRef.current 직접 검증.
 *    이전: setTimeout이 Toast lifecycle (fade-in 10 + duration 2000 + fade-out 200
 *      = 2210ms)보다 짧아 race — 토스트 사라진 후 백키 시 exit pending 아직 true
 *      → 2차 동작 → 종료. 사용자 catch "토스트 끝나고 백키 → 바로 종료".
 *    이후: ToastProvider v3의 toastActiveRef와 정확 동기화.
 *      - 토스트 mount~unmount lifecycle 안에서 백키 → 2차 (종료)
 *      - 토스트 unmount 후 백키 → 1차 (다시 토스트)
 *    timer 추측 X — race 원천 차단.
 *
 * v20 (유지): main.jsx 즉시 push + state 검증.
 * v19 (유지 → v21에서 timer 제거): 이중 백키 종료 패턴.
 *  1) 마운트 시 가짜 history entry push — 첫 백키 가로채기 위해.
 *  2) popstate 1차 (토스트 없음): 토스트 + 가짜 entry 복원.
 *  3) popstate 2차 (토스트 살아있는 동안): history.back()으로 stack 한 번 더 pop
 *     → PWA standalone 자동 종료.
 *  4) 토스트 자연 만료 후 백키: 다시 1차 동작.
 *
 *  - BottomNav v14 (replace prop)와 정합 — 탭 진입 entry는 stack 끝 1개만.
 *
 *  - Phase 2 Capacitor 도입 시: App.exitApp() 명시 호출로 정확 종료 대체.
 *    현재 Phase 1은 web layer 한계 — stack 비움으로 종료 trigger.
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

export default function AppShell() {
  const { showToast, toastActiveRef } = useToast();

  useEffect(() => {
    // 1) 가짜 entry — main.jsx에서 이미 push했지만 BrowserRouter Navigate replace로
    //    치환됐을 가능성. state 검증 후 필요 시 fallback push.
    //    URL 동일 (window.location.href) → React Router location 변화 catch X.
    //    state만 다르고 pathname 동일이라 부작용 없음.
    //    StrictMode dev re-mount 시에도 state 검증으로 중복 push 차단.
    if (window.history.state?._mosaicExitGuard !== true) {
      window.history.pushState({ _mosaicExitGuard: true }, "", window.location.href);
    }

    const handlePopState = () => {
      // 2차 백키 (토스트 살아있는 동안) — 종료 trigger.
      // history.back()으로 stack 한 번 더 pop. PWA standalone에서 stack 비면
      // OS/PWA shell이 자동 종료.
      // (브라우저 탭에서 실행 중일 때는 이전 페이지로 — Phase 2 Capacitor exitApp로 정확 처리.)
      if (toastActiveRef.current) {
        window.history.back();
        return;
      }

      // 1차 백키 — 가짜 entry 복원 (다음 백키도 가로채기 위해) + 토스트.
      // toastActiveRef는 showToast 호출 직후 true → 다음 popstate는 2차로 분기.
      if (window.history.state?._mosaicExitGuard !== true) {
        window.history.pushState({ _mosaicExitGuard: true }, "", window.location.href);
      }
      showToast("'뒤로' 버튼을 한번 더 누르시면 종료됩니다.");
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
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
