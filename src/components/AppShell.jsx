/* =========================================================
 * src/components/AppShell.jsx
 * 인증 후 메인 레이아웃 — 헤더 + Outlet + BottomNav + 종료 토스트.
 *
 * v3 변경 (2026-04-30, 사용자 catch + 추가 스펙):
 *  - 🐛 외부 webview 복귀 시 헤더/바텀 흔들림 fix:
 *    h-[100dvh] flex → fixed inset-0 flex. 100dvh는 모바일에서 viewport
 *    재계산(외부 갔다 옴, URL bar 변동 등)으로 일시 흔들림 발생.
 *    fixed inset-0 = viewport 4면 절대 고정. 자식 컴포넌트가 알아서 차지.
 *  - 🆕 /bookmarks 뒤로가기 가드 추가:
 *    /bookmarks에서 OS 뒤로가기 → 직전 history 무시하고 /events로 강제
 *    navigate(replace). 그 후 events 토스트 사이클로 자연스럽게 연결.
 *  - 🆕 events 2차(history.back) 후 popstate 무한 루프 차단:
 *    skipNextPopstateRef로 history.back() 직후 발동되는 popstate 1회 무시.
 *
 * v2 변경 (2026-04-30, PWA history 정책):
 *  - 🆕 /events에서 뒤로가기 → 종료 확인 토스트 패턴.
 *
 * Phase 1 한계 (사용자 합의):
 *  - PWA standalone에서 events 2차 종료 시도 시:
 *    - stack 시작점이 /events이면 OS background 처리 (Android Chrome) ✅
 *    - stack에 다른 entries 남아있으면 그쪽으로 이동 (의도와 다름)
 *  - 첫 진입 라우트가 / → /events redirect라면 AuthGate에서 replace 사용 권장
 *    (stack 시작점을 /events로 강제).
 *  - iOS PWA: OS-level 뒤로가기 자체 없음. swipe 시에만 popstate.
 *  - 진짜 exit는 Phase 2 Capacitor App.exitApp()에서만 가능.
 *  - 메모리 #4 (PWA standalone webview 한계) 맥락 참조.
 *
 * 다른 페이지 영향 (의도된 동작):
 *  - /search 뒤로가기 → 직전 history (events 등). 검색은 stack 1개 정책 (스펙 1).
 *  - /bookmarks 뒤로가기 → 강제 events (스펙 4).
 *  - 다른 라우트는 기본 popstate.
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

  // events 토스트 사이클 상태
  const toastShownRef = useRef(false);
  const guardAddedRef = useRef(false);
  const toastTimerRef = useRef(null);
  // events 2차(history.back) 후 발동되는 popstate 1회 무시 플래그.
  const skipNextPopstateRef = useRef(false);

  // bookmarks 가드 상태
  const bookmarksGuardAddedRef = useRef(false);

  useEffect(() => {
    const path = location.pathname;

    // /events 떠나면 토스트 사이클 + events 가드 정리.
    if (path !== HOME_PATH) {
      guardAddedRef.current = false;
      toastShownRef.current = false;
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

    // ─── /events 가드 (토스트 사이클) ───
    if (path === HOME_PATH) {
      if (!guardAddedRef.current) {
        window.history.pushState({ exitGuard: true }, "");
        guardAddedRef.current = true;
      }

      const handleEventsPopState = () => {
        // history.back() 직후 발동되는 popstate 1회 무시 (무한 루프 차단).
        if (skipNextPopstateRef.current) {
          skipNextPopstateRef.current = false;
          return;
        }

        // popstate가 발동했다 = 우리 guard가 소비됐다.
        guardAddedRef.current = false;

        if (toastShownRef.current) {
          // 2차: 진짜 종료 시도. 사이클 정리 후 OS 처리에 위임.
          if (toastTimerRef.current) {
            clearTimeout(toastTimerRef.current);
            toastTimerRef.current = null;
          }
          toastShownRef.current = false;
          setShowExitToast(false);
          // history.back() 호출 → popstate 다시 발동될 텐데 그건 무시.
          skipNextPopstateRef.current = true;
          window.history.back();
        } else {
          // 1차: 토스트 + guard 재충전.
          toastShownRef.current = true;
          setShowExitToast(true);
          window.history.pushState({ exitGuard: true }, "");
          guardAddedRef.current = true;

          toastTimerRef.current = setTimeout(() => {
            toastShownRef.current = false;
            setShowExitToast(false);
            toastTimerRef.current = null;
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
        window.history.pushState({ bookmarksGuard: true }, "");
        bookmarksGuardAddedRef.current = true;
      }

      const handleBookmarksPopState = () => {
        bookmarksGuardAddedRef.current = false;
        // 직전 history 무시하고 /events로 강제 이동 (스펙 4).
        // replace로 현재 entry를 /events로 교체.
        navigate(HOME_PATH, { replace: true });
      };

      window.addEventListener("popstate", handleBookmarksPopState);
      return () => {
        window.removeEventListener("popstate", handleBookmarksPopState);
      };
    }
  }, [location.pathname, navigate]);

  return (
    // v3: h-[100dvh] flex → fixed inset-0 flex.
    // 외부 webview 갔다 와도 viewport 절대 고정. 헤더/바텀 흔들림 차단.
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
