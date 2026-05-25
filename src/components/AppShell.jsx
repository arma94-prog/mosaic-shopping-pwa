/* =========================================================
 * src/components/AppShell.jsx
 * 인증 후 메인 레이아웃 — 헤더 + Outlet + BottomNav + 종료 확인 모달.
 *
 * v25 변경 (2026-05-25, 사용자 dogfood — 종료 버그 + 모달 백키 의도 정합):
 *  - 🐛 handleConfirm 종료 trigger fix.
 *    이전 v24: handleConfirm → history.back() → popstate handler 재호출
 *      → state.guard !== true → modal 다시 표시 (화면 깜빡거림).
 *    이후 v25: popstate listener 제거 + history.go(-99)로 stack 충분히 비움
 *      → PWA standalone에서 stack 비면 OS 자동 종료.
 *      → listener 제거로 인해 handler 재호출 X.
 *  - 🆕 모달 상태 백키 = handleConfirm (종료 trigger).
 *    이전 v24: 모달 상태 백키 = 취소 (모달 닫음).
 *    이후 v25: 사용자 dogfood 의도 정합 — 모달 표시 후 백키 = 종료 즉시.
 *
 *  - handlePopStateRef로 listener 추적 — handleConfirm에서 명시 제거 가능.
 *
 * v24 (유지): state._mosaicExitGuard 검증 본 분기.
 * v22 (유지): ExitConfirmModal — race condition 본질 차단.
 * v20 (유지): main.jsx 즉시 push + state 검증.
 *
 * Phase 2 Capacitor 도입 시: App.exitApp() 명시 호출로 종료 trigger 정확 처리.
 *   현재 Phase 1은 web layer 한계 — go(-99)로 stack 비움 시도.
 * ========================================================= */
import { useCallback, useEffect, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import BottomNav from "./BottomNav";
import ExitConfirmModal from "./ExitConfirmModal";

export default function AppShell() {
  const [exitModalOpen, setExitModalOpen] = useState(false);
  // closure stale 방지 — popstate handler가 latest state catch.
  const exitModalOpenRef = useRef(false);
  // v25: popstate listener 추적 — handleConfirm에서 명시 제거 가능.
  const handlePopStateRef = useRef(null);

  // v25: 종료 trigger — listener 제거 + stack 비움 시도.
  const doExit = useCallback(() => {
    exitModalOpenRef.current = false;
    setExitModalOpen(false);
    // popstate listener 제거 — go(-99)로 발생할 popstate가 handler 재호출 X.
    if (handlePopStateRef.current) {
      window.removeEventListener("popstate", handlePopStateRef.current);
      handlePopStateRef.current = null;
    }
    // PWA standalone — stack 비우면 OS 자동 종료 trigger.
    // go(-99): stack 깊이 모름 → 가능한 만큼 pop (브라우저가 사용 가능 history까지만 pop).
    // history.length 신뢰 X (iOS PWA에서 1로 fix 가능).
    try {
      window.history.go(-99);
    } catch (_) {
      /* PWA standalone 한계 — Phase 2 Capacitor에서 App.exitApp() 정확 */
    }
  }, []);

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
        // v25: 모달 상태 백키 = 종료 (사용자 dogfood 의도 정합).
        doExit();
        return;
      }

      // v25: state.guard + pathname 둘 다 검증.
      // 모달은 /events에서만 표시 (사용자 명세 시나리오).
      // 다른 페이지 pop → 일반 navigate (검색 히스토리, 북마크 등) → modal X.
      if (window.history.state?._mosaicExitGuard === true) {
        // 새 current가 guard → pop된 entry가 navigate entry → 일반 navigate. modal X.
        return;
      }

      if (window.location.pathname !== "/events") {
        // 새 current가 navigate entry이지만 /events 외 페이지 → 일반 navigate. modal X.
        // 예: /search?q=foo → 백키 → /search (검색 히스토리 페이지).
        return;
      }

      // /events에서 guard 소비 → 모달 표시.
      exitModalOpenRef.current = true;
      setExitModalOpen(true);
      pushGuard();
    };

    handlePopStateRef.current = handlePopState;
    window.addEventListener("popstate", handlePopState);
    return () => {
      if (handlePopStateRef.current) {
        window.removeEventListener("popstate", handlePopStateRef.current);
        handlePopStateRef.current = null;
      }
    };
  }, [doExit]);

  const handleCancel = () => {
    exitModalOpenRef.current = false;
    setExitModalOpen(false);
    // 가짜 entry는 popstate handler에서 이미 push됐으므로 추가 push X.
  };

  const handleConfirm = () => {
    doExit();
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
