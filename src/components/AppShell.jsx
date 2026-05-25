/* =========================================================
 * src/components/AppShell.jsx
 * 인증 후 메인 레이아웃 — 헤더 + Outlet + BottomNav + 종료 확인 모달.
 *
 * v24 변경 (2026-05-25, 사용자 catch — lastPathRef race fix):
 *  - 🐛 v23 본문 lastPathRef + useEffect 본문 race — React Router v7
 *    useSyncExternalStore가 sync 갱신 시 useEffect가 handler 호출 전에 발동.
 *    → handler 시점 oldPath === newPath → modal X 의도가 modal 표시로 갈림.
 *  - 🆕 state 검증 본문으로 교체 — window.history.state._mosaicExitGuard.
 *    pop 직후 새 current entry state로 판단:
 *      · state.guard === true → pop된 entry가 navigate entry (사용자 이전 페이지 이동) → modal X
 *      · state.guard !== true → pop된 entry가 guard (사용자가 홈에서 guard 소비) → 모달 표시
 *    timer/closure/ref 추적 X — state 자체로 결정. race 0.
 *
 * v23 (제거): useLocation + lastPathRef.
 * v22 (유지): ExitConfirmModal — race condition 본질 차단.
 * v20 (유지): main.jsx 즉시 push + state 검증.
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

    const pushGuard = () => {
      window.history.pushState(
        { _mosaicExitGuard: true },
        "",
        window.location.href,
      );
    };

    const handlePopState = () => {
      if (exitModalOpenRef.current) {
        // 모달 살아있는 동안 백키 = 취소와 동일 (모달 닫음 + 가짜 entry 복원).
        exitModalOpenRef.current = false;
        setExitModalOpen(false);
        pushGuard();
        return;
      }

      // v24: 새 current entry state로 분기.
      // pop 직후 window.history.state = pop 후 current entry의 state.
      if (window.history.state?._mosaicExitGuard === true) {
        // 새 current가 guard → pop된 entry가 navigate entry.
        // 사용자가 일반 페이지(/search 또는 /bookmarks)에서 백키 → 이전 페이지로 navigate.
        // 가짜 entry는 이미 stack 끝 → 다음 백키 = 모달 catch 가능.
        return;
      }

      // 새 current가 navigate entry (state.guard X) → pop된 entry가 guard.
      // 사용자가 /events에서 백키 → guard 소비 → 모달 표시.
      // 가짜 entry 다시 push (모달 살아있는 동안 백키도 catch 위해).
      exitModalOpenRef.current = true;
      setExitModalOpen(true);
      pushGuard();
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
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
