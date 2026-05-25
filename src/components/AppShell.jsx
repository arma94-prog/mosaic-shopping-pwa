/* =========================================================
 * src/components/AppShell.jsx
 * 인증 후 메인 레이아웃 — 헤더 + Outlet + BottomNav + 종료 확인 모달.
 *
 * v22 변경 (2026-05-25, 사용자 catch — 토스트 → 확인 모달 패턴 교체):
 *  - 🆕 ExitConfirmModal — 백키 시 "모자이크 쇼핑을 종료하시겠습니까?" + 취소/종료.
 *  - 🐛 race condition 본질 차단 — Toast lifecycle 추적 불필요.
 *    이전 v21: toastActiveRef로 lifecycle 동기화 → fade-out 200ms race 잔존 가능.
 *    이후 v22: 사용자 명시 선택 (취소/종료 버튼) → race 0.
 *  - 백키 시 모달 표시 + 가짜 entry 복원.
 *  - 취소 / backdrop 클릭 / 모달 살아있는 동안 백키 = 모달 닫음 + 가짜 entry 복원.
 *  - 종료 = history.back() → stack 비움 → PWA standalone 자동 종료.
 *  - 시각 PWA 종료 path 동일 (v21과).
 *
 * v21 (제거): toastActiveRef + showToast — modal 패턴으로 교체.
 *   ToastProvider v3의 toastActiveRef는 그대로 보존 (다른 호출자 영향 X).
 *
 * v20 (유지): main.jsx 즉시 push + state 검증.
 * v19 (유지): 이중 백키 종료 패턴 (now confirm modal 패턴).
 *
 * Phase 2 Capacitor 도입 시: App.exitApp() 명시 호출로 종료 trigger 정확 처리.
 * ========================================================= */
import { useEffect, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import BottomNav from "./BottomNav";
import ExitConfirmModal from "./ExitConfirmModal";

export default function AppShell() {
  const [exitModalOpen, setExitModalOpen] = useState(false);
  // closure stale 방지 — popstate handler가 latest state catch.
  const exitModalOpenRef = useRef(false);

  useEffect(() => {
    // 가짜 entry — main.jsx에서 이미 push했지만 BrowserRouter Navigate replace로
    // 치환됐을 가능성. state 검증 후 필요 시 fallback push.
    if (window.history.state?._mosaicExitGuard !== true) {
      window.history.pushState({ _mosaicExitGuard: true }, "", window.location.href);
    }

    const pushGuardIfMissing = () => {
      if (window.history.state?._mosaicExitGuard !== true) {
        window.history.pushState(
          { _mosaicExitGuard: true },
          "",
          window.location.href,
        );
      }
    };

    const handlePopState = () => {
      if (exitModalOpenRef.current) {
        // 모달 살아있는 동안 백키 = 취소와 동일 (모달 닫음 + 가짜 entry 복원).
        exitModalOpenRef.current = false;
        setExitModalOpen(false);
        pushGuardIfMissing();
        return;
      }

      // 모달 표시 + 가짜 entry 복원 (다음 백키도 가로채기 위해).
      exitModalOpenRef.current = true;
      setExitModalOpen(true);
      pushGuardIfMissing();
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCancel = () => {
    exitModalOpenRef.current = false;
    setExitModalOpen(false);
    // 가짜 entry는 popstate handler에서 이미 push됐으므로 추가 push X.
  };

  const handleConfirm = () => {
    exitModalOpenRef.current = false;
    setExitModalOpen(false);
    // PWA 종료 trigger — history.back()으로 stack 한 번 더 pop.
    // PWA standalone에서 stack 비면 OS/PWA shell 자동 종료.
    window.history.back();
  };

  return (
    // v3 (유지): fixed inset-0 + flex column. 외부 webview 갔다 와도 viewport 절대 고정.
    <div className="fixed inset-0 flex flex-col bg-mosaic-bg text-mosaic-text">
      <Header />
      <main className="flex-1 overflow-y-auto overscroll-contain">
        <Outlet />
      </main>
      <BottomNav />
      <ExitConfirmModal
        open={exitModalOpen}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
