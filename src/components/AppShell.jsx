/* =========================================================
 * src/components/AppShell.jsx
 * 인증 후 메인 레이아웃 — 헤더 + Outlet + BottomNav + 종료 확인 모달.
 *
 * v26 변경 (2026-05-25, 사용자 catch — 백키 동일 본문):
 *  - 🐛 doExit이 go(-99) → history.back()으로 교체. + window.close() fallback.
 *    이전 v25: go(-99) — iOS PWA history.length === 1 fix이라 동작 X.
 *      → "종료하기" 클릭 시 모달만 사라지고 PWA 종료 X.
 *    이후 v26: history.back() — 백키와 동일 stack pop trigger.
 *      → 사용자 catch "백키 1번 = 종료" 본문 정합.
 *    Android fallback: window.close().
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

  // v26: 종료 trigger — 백키와 동일 본문 (사용자 catch).
  // v25 본문(go(-99))은 iOS PWA standalone에서 history.length === 1 fix이라
  // N > length-1라 동작 X → 모달만 사라짐. 백키는 OS가 직접 stack pop trigger.
  // 해결: history.back() 호출 (백키와 동일 효과) + Android에서 window.close() 시도.
  const doExit = useCallback(() => {
    exitModalOpenRef.current = false;
    setExitModalOpen(false);
    // popstate listener 제거 — history.back()으로 발생할 popstate가 handler 재호출 X.
    if (handlePopStateRef.current) {
      window.removeEventListener("popstate", handlePopStateRef.current);
      handlePopStateRef.current = null;
    }
    // 백키 동일 본문 — stack pop 1회. PWA standalone에서 stack 비면 OS 자동 종료.
    try {
      window.history.back();
    } catch (_) {
      /* 한계 — Phase 2 Capacitor에서 App.exitApp() 정확 */
    }
    // Android Chrome PWA fallback — script-opened 창 제한 우회 시도.
    try {
      window.close();
    } catch (_) {
      /* 일부 환경 미지원 */
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
