/* =========================================================
 * src/components/AppShell.jsx
 * 인증 후 메인 레이아웃 — 헤더 + Outlet + BottomNav + 종료 토스트.
 *
 * v4 변경 (2026-04-30, 사용자 catch — 토스트 미작동):
 *  - 🐛 토스트 사이클 timestamp 패턴으로 단순화:
 *    이전 v3: toastShownRef + guardAddedRef 이중 ref 상태 → race condition 가능성.
 *    이후 v4: lastBackTimestampRef 단일 ref → 직관적 + 디버깅 쉬움.
 *  - 🐛 pushState 시 URL 명시 (window.location.href):
 *    이전: pushState({...}, "") — 일부 환경에서 stack 추가 실패 가능.
 *    이후: pushState({...}, "", window.location.href) — URL 명시로 안정성 ↑.
 *  - 🆕 events 진입 시 initial guard 1회 추가 분리 (initialGuardAddedRef).
 *    이로써 1차/2차 사이클 로직과 진입 가드 분리 → 책임 명확.
 *
 * 동작 원리 (v4 timestamp 패턴):
 *  - events 진입 → initial guard 1회 pushState. Stack: [..., events_real, events_g0].
 *  - 1차 popstate (뒤로가기): 위치 events_real로. lastBackTimestamp 기록.
 *    토스트 표시 + 새 guard pushState. Stack: [..., events_real, events_g_new].
 *    3초 timer 시작.
 *  - 3초 안에 또 popstate: timestamp 차이 < TOAST_DURATION_MS → 2차 분기.
 *    토스트 정리 + history.back() + skipNextPopstate.
 *  - 3초 후 timer 발동: 토스트 사라짐 + timestamp reset.
 *    이후 popstate는 다시 1차 분기.
 *
 * Phase 1 한계 (사용자 합의):
 *  - PWA standalone에서 events 2차 종료 시도 시:
 *    stack 시작점이 /events이면 OS background ✅
 *    stack에 다른 entries 남아있으면 그쪽으로 이동 (의도와 다름)
 *  - iOS PWA: OS-level 뒤로가기 자체 없음. swipe 시에만 popstate.
 *  - 진짜 exit는 Phase 2 Capacitor App.exitApp()에서만 가능.
 *  - 메모리 #4 (PWA standalone webview 한계) 맥락 참조.
 *
 * 외부 webview 흔들림 fix (v3):
 *  - h-[100dvh] flex → fixed inset-0 flex.
 *  - viewport 4면 절대 고정. 외부 갔다 와도 흔들림 X.
 * ========================================================= */
import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Header from "./Header";
import BottomNav from "./BottomNav";
import Toast from "./Toast";
import MosaicLogo from "./MosaicLogo";

const HOME_PATH = "/events";
const BOOKMARKS_PATH = "/bookmarks";
const TOAST_DURATION_MS = 3000;
const EXIT_TOAST_MESSAGE = "'뒤로' 버튼을 한 번 더 누르시면\n종료됩니다";

export default function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showExitToast, setShowExitToast] = useState(false);

  // events 토스트 사이클 — timestamp 단일 ref (v4 단순화).
  const lastBackTimestampRef = useRef(0);
  const toastTimerRef = useRef(null);
  const skipNextPopstateRef = useRef(false);

  // events 진입 시 initial guard 1회 추가 플래그 (1차 발동의 pushState와 분리).
  const initialGuardAddedRef = useRef(false);

  // bookmarks 가드 상태
  const bookmarksGuardAddedRef = useRef(false);

  useEffect(() => {
    const path = location.pathname;

    // /events 떠나면 모든 사이클 상태 리셋.
    if (path !== HOME_PATH) {
      initialGuardAddedRef.current = false;
      lastBackTimestampRef.current = 0;
      setShowExitToast(false);
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
        toastTimerRef.current = null;
      }
    }

    // /bookmarks 떠나면 bookmarks 가드 정리.
    if (path !== BOOKMARKS_PATH) {
      bookmarksGuardAddedRef.current = false;
    }

    // ─── /events 가드 (timestamp 기반 토스트 사이클) ───
    if (path === HOME_PATH) {
      if (!initialGuardAddedRef.current) {
        // v4: URL 명시 (window.location.href).
        window.history.pushState({ exitGuard: true }, "", window.location.href);
        initialGuardAddedRef.current = true;
      }

      const handleEventsPopState = () => {
        // history.back() 직후 발동되는 popstate 1회 무시.
        if (skipNextPopstateRef.current) {
          skipNextPopstateRef.current = false;
          return;
        }

        const now = Date.now();
        const sinceLast = now - lastBackTimestampRef.current;
        const isWithinCycle =
          lastBackTimestampRef.current > 0 && sinceLast < TOAST_DURATION_MS;

        if (isWithinCycle) {
          // 2차: 진짜 종료 시도. 사이클 정리 후 OS 처리에 위임.
          if (toastTimerRef.current) {
            clearTimeout(toastTimerRef.current);
            toastTimerRef.current = null;
          }
          setShowExitToast(false);
          lastBackTimestampRef.current = 0;
          skipNextPopstateRef.current = true;
          window.history.back();
        } else {
          // 1차: 토스트 + guard 재충전 + timer 시작.
          lastBackTimestampRef.current = now;
          setShowExitToast(true);
          // v4: URL 명시 (안정성 ↑).
          window.history.pushState({ exitGuard: true }, "", window.location.href);

          if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
          toastTimerRef.current = setTimeout(() => {
            setShowExitToast(false);
            toastTimerRef.current = null;
            lastBackTimestampRef.current = 0;
          }, TOAST_DURATION_MS);
        }
      };

      window.addEventListener("popstate", handleEventsPopState);
      return () => {
        window.removeEventListener("popstate", handleEventsPopState);
      };
    }

    // ─── /bookmarks 가드 (강제 events 이동) ───
    if (path === BOOKMARKS_PATH) {
      if (!bookmarksGuardAddedRef.current) {
        window.history.pushState({ bookmarksGuard: true }, "", window.location.href);
        bookmarksGuardAddedRef.current = true;
      }

      const handleBookmarksPopState = () => {
        bookmarksGuardAddedRef.current = false;
        // 직전 history 무시하고 /events로 강제 이동 (스펙 4).
        navigate(HOME_PATH, { replace: true });
      };

      window.addEventListener("popstate", handleBookmarksPopState);
      return () => {
        window.removeEventListener("popstate", handleBookmarksPopState);
      };
    }
  }, [location.pathname, navigate]);

  return (
    // v3: fixed inset-0 flex. 외부 webview 갔다 와도 viewport 절대 고정.
    <div className="fixed inset-0 flex flex-col bg-mosaic-bg text-mosaic-text">
      <Header />
      <main className="flex-1 overflow-y-auto overscroll-contain">
        <Outlet />
      </main>
      <BottomNav />
      <Toast
        open={showExitToast}
        message={EXIT_TOAST_MESSAGE}
        leadingIcon={<MosaicLogo size={16} />}
      />
    </div>
  );
}
