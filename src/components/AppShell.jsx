/* =========================================================
 * src/components/AppShell.jsx
 * 인증 후 메인 레이아웃 — 헤더 + Outlet + BottomNav + 종료 확인 모달.
 *
 * v23 변경 (2026-05-25, 사용자 catch — Android 표준 백키 UX):
 *  - 🆕 popstate handler 분기 — newPath vs oldPath 비교.
 *    · newPath === oldPath && /events → 가짜 entry pop → 모달 표시
 *    · newPath !== oldPath → 일반 navigate pop (다른 탭 → /events 자동 이동) → modal X
 *  - 🆕 useLocation + lastPathRef로 이전 pathname 추적.
 *  - BottomNav v15 (/events에서만 push, 외 replace)와 정합 —
 *    어디든 백키 = 홈으로 → 홈에서 백키 = 모달.
 *  - 표준 Android 앱 UX 정합.
 *
 * v22 (유지): ExitConfirmModal — race condition 본질 차단.
 * v20 (유지): main.jsx 즉시 push + state 검증.
 *
 * Phase 2 Capacitor 도입 시: App.exitApp() 명시 호출로 종료 trigger 정확 처리.
 * ========================================================= */
import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import BottomNav from "./BottomNav";
import ExitConfirmModal from "./ExitConfirmModal";

export default function AppShell() {
  const location = useLocation();
  const [exitModalOpen, setExitModalOpen] = useState(false);
  // closure stale 방지 — popstate handler가 latest state catch.
  const exitModalOpenRef = useRef(false);
  // v23: 이전 pathname 추적 — popstate 시 가짜 entry pop vs 일반 navigate 구분.
  const lastPathRef = useRef(
    typeof window !== "undefined" ? window.location.pathname : "/events",
  );

  // v23: location 변화 시 lastPathRef 갱신 (NavLink push/replace로 인한 변화 catch).
  useEffect(() => {
    lastPathRef.current = location.pathname;
  }, [location.pathname]);

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
        lastPathRef.current = window.location.pathname;
        return;
      }

      const newPath = window.location.pathname;
      const oldPath = lastPathRef.current;

      if (newPath === oldPath && newPath === "/events") {
        // v23: /events에서 가짜 entry pop — 모달 표시 (사용자가 홈에서 백키).
        exitModalOpenRef.current = true;
        setExitModalOpen(true);
        pushGuardIfMissing();
      } else if (newPath === "/events") {
        // v23: 다른 탭 → /events 자동 이동 (popstate 자연 처리, modal X).
        // 가짜 entry 다시 push (다음 백키 = 모달 catch 위해).
        pushGuardIfMissing();
      }
      // 그 외 (newPath !== /events) — 일반 navigate, BrowserRouter가 자체 처리.

      lastPathRef.current = newPath;
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
