/* =========================================================
 * src/components/AppShell.jsx
 * 인증 후 메인 레이아웃 — 헤더 + Outlet + BottomNav + 백키 토스트.
 *
 * v31 변경 (2026-05-25, 사용자 결정 — Phase 1 한계 인정, 모달 → 토스트 회귀):
 *  - 🐛 v22~v30 모달 + script 종료 trigger 본문 폐기.
 *    본질 catch: Android Chrome PWA standalone에서 script로 PWA 종료 trigger
 *    본문 한계. 사용자 백키(OS event)만 종료 trigger 가능.
 *  - 🆕 v21 토스트 패턴 본문 회귀:
 *    · 백키 1차 (/events에서) → 토스트 + 가짜 entry 복원.
 *    · 백키 2차 (토스트 살아있는 동안) → handler에서 history.back() 호출 →
 *      OS의 stack pop과 결합되어 PWA 종료 trigger.
 *    · 토스트 사라진 후 백키 → 1차 동작 다시.
 *  - state.guard + pathname 검증 본문 유지 (v24/v25).
 *  - toastActiveRef로 race condition 차단 (v21/ToastProvider v3).
 *
 *  - Phase 2 Capacitor 도입 시: App.exitApp() 정확. 현재 Phase 1은 web layer 한계.
 *
 * v22~v30 (제거): ExitConfirmModal + script 종료 trigger 본문.
 * v21 (회복): 토스트 + history.back() handler.
 * ========================================================= */
import { useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import BottomNav from "./BottomNav";
import { useToast } from "./ToastProvider";

export default function AppShell() {
  const { showToast, toastActiveRef } = useToast();
  const { pathname } = useLocation();
  const mainRef = useRef(null);

  // 탭(경로) 전환 시 항상 맨 위로 — 스크롤 컨테이너는 window가 아닌 <main>이라
  // 별도 리셋이 없으면 이전 페이지 scrollTop이 그대로 남음 (Arma 2026-06-02).
  useEffect(() => {
    if (mainRef.current) mainRef.current.scrollTop = 0;
  }, [pathname]);

  useEffect(() => {
    // 가짜 entry — main.jsx에서 이미 push했지만 BrowserRouter Navigate replace로
    // 치환됐을 가능성. state 검증 후 필요 시 fallback push.
    if (window.history.state?._mosaicExitGuard !== true) {
      window.history.pushState({ _mosaicExitGuard: true }, "", window.location.href);
    }

    const handlePopState = () => {
      if (toastActiveRef.current) {
        // 토스트 살아있는 동안 백키 = 종료 trigger.
        // handler 안 추가 back() 호출 → OS 백키 stack pop과 결합되어 stack 비움 → PWA 종료.
        // (사용자 dogfood 백키 = 종료 정합. script back()만으로는 종료 X, OS event 결합 필요.)
        try {
          window.history.back();
        } catch (_) {
          /* 한계 */
        }
        return;
      }

      // v24: 새 current entry state로 분기.
      if (window.history.state?._mosaicExitGuard === true) {
        // 새 current가 guard → pop된 entry가 navigate entry → 일반 navigate. 토스트 X.
        return;
      }

      // v25: /events 외 페이지에서 백키 → 일반 navigate. 토스트 X.
      if (window.location.pathname !== "/events") {
        return;
      }

      // /events에서 guard 소비 → 토스트 표시 + 가짜 entry 복원 (다음 백키 catch 위해).
      window.history.pushState({ _mosaicExitGuard: true }, "", window.location.href);
      showToast("'뒤로' 버튼을 한번 더 누르시면 종료됩니다.");
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [showToast, toastActiveRef]);

  return (
    // v3 (유지): fixed inset-0 + flex column. 외부 webview 갔다 와도 viewport 절대 고정.
    <div className="fixed inset-0 flex flex-col bg-mosaic-bg text-mosaic-text">
      <Header />
      <main ref={mainRef} className="flex-1 overflow-y-auto overscroll-contain">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
