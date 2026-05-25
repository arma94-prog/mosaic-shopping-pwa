/* =========================================================
 * src/components/AppShell.jsx
 * 인증 후 메인 레이아웃 — 헤더 + Outlet + BottomNav + 종료 확인 모달.
 *
 * v28 변경 (2026-05-25, 사용자 dogfood Android Chrome PWA):
 *  - 🐛 close() 우선 호출 — Chrome 80+ PWA standalone에서 직접 종료 trigger.
 *    이전 v27: back() 먼저 호출 → close() — back()이 stack pop만 + close() 무력.
 *    이후 v28: 즉시 close() + setTimeout 단계별 close() + back() 다회.
 *  - 다층 본문 — 즉시(sync) + 0ms + 50ms + 100ms 4단계.
 *
 * v27 (제거 → v28 보강): setTimeout 다회 시도.
 *
 * v26 (제거 → v27 보강): doExit go(-99) → history.back() 교체.
 *    iOS PWA history.length === 1 fix 회피. 다만 sync 호출 timing 문제.
 *
 * v25 (유지): 모달 상태 백키 = doExit (사용자 dogfood 의도).
 * v24 (유지): state.guard + pathname 분기.
 * v22 (유지): ExitConfirmModal — race condition 본질 차단.
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

  // v27: 종료 trigger — 다층 본문 (사용자 dogfood v26도 종료 X).
  // 본질 가설: React 합성 이벤트 안 sync back()은 OS event(백키)와 다르게 처리.
  // - setTimeout으로 React 이벤트 사이클 분리.
  // - back() 여러 번 시도 (Android Chrome PWA stack 비움 시도).
  // - window.close() Android fallback.
  // - iOS PWA는 Apple 정책상 종료 API X — 최선 본문.
  const doExit = useCallback(() => {
    exitModalOpenRef.current = false;
    setExitModalOpen(false);
    // popstate listener 제거 — 추후 발생할 popstate가 handler 재호출 X.
    if (handlePopStateRef.current) {
      window.removeEventListener("popstate", handlePopStateRef.current);
      handlePopStateRef.current = null;
    }

    // v28: Android Chrome PWA standalone 본문 — close() 우선 + back() fallback.
    // close()는 Chrome 80+에서 PWA standalone 동작 가능 (script-trigger 동작).
    // 안 되면 back() 다회로 stack 비움 시도.
    // setTimeout으로 React 합성 이벤트 사이클 분리.

    // 1) 즉시 close() 시도 — Android Chrome PWA에서 가장 직접적 종료.
    try { window.close(); } catch (_) {}

    // 2) setTimeout 0ms — React 사이클 분리 후 다시 close() + back().
    setTimeout(() => {
      try { window.close(); } catch (_) {}
      try { window.history.back(); } catch (_) {}
    }, 0);

    // 3) 50ms 후 추가 back() — 첫 back() 처리 후 추가 stack pop.
    setTimeout(() => {
      try { window.history.back(); } catch (_) {}
      try { window.close(); } catch (_) {}
    }, 50);

    // 4) 100ms 후 마지막 시도.
    setTimeout(() => {
      try { window.history.back(); } catch (_) {}
      try { window.close(); } catch (_) {}
    }, 100);
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
