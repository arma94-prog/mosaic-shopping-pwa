/* =========================================================
 * src/components/AppShell.jsx
 * 인증 후 메인 레이아웃 — 헤더 + Outlet + BottomNav + 종료 토스트.
 *
 * 100dvh로 모바일 뷰포트 정확 매핑 (iOS Safari URL 바 변동 대응).
 * Outlet 영역만 스크롤. 헤더/바텀은 고정 (탭 전환 시 시각적 안정).
 *
 * v2 변경 (2026-04-30, PWA history 정책 — 스펙 3):
 *  - 🆕 홈(/events)에서 뒤로가기 → 종료 확인 토스트 패턴.
 *    1차: 토스트 + history guard 재충전 (3초 사이클 시작)
 *    2차 (3초 안): history.back() 호출 → OS 처리에 위임
 *    3초 후: 사이클 reset (다시 1차부터)
 *  - 🆕 Toast 컴포넌트 렌더 (모자이크 아이콘 인라인).
 *  - 🆕 useRef 패턴으로 stale closure 회피 (toastShown / guardAdded / timer).
 *
 * 동작 원리 — history guard 패턴:
 *  - /events 진입 시 window.history.pushState로 "guard entry" 1회 추가.
 *    Stack: [..., events_real, events_guard] → 현재 위치 guard.
 *  - 뒤로가기 → guard 소비 → events_real로 복귀 → popstate 핸들러 발동.
 *    이때 React Router는 location.pathname을 여전히 /events로 유지
 *    (URL이 둘 다 /events이므로 라우트 변경 없음).
 *  - 1차 처리: 토스트 표시 + 새 guard pushState로 사이클 시작.
 *  - 2차 처리: window.history.back() — guard 없이 실제 stack 뒤로.
 *
 * Phase 1 한계 (사용자 합의):
 *  - PWA standalone (Android Chrome): history.back()이 stack 시작점 너머로
 *    가면 OS가 background로 전환 — 진짜 process kill 아님.
 *  - iOS PWA: OS-level 뒤로가기 버튼 자체 없음. edge swipe 시에만 popstate.
 *    종료 토스트 의미 약함 (dogfood 후 문구 조정 가능).
 *  - 진짜 exit는 Phase 2 Capacitor 빌드의 App.exitApp()에서만 가능.
 *  - 메모리 #4 (PWA standalone webview 한계) 맥락 참조.
 *
 * 다른 페이지 영향 없음:
 *  - popstate 리스너는 /events 활성 시에만 등록 (cleanup으로 다른 라우트 제거).
 *  - /search, /bookmarks 등에서는 기본 popstate 동작 (이전 history entry).
 *  - 검색 페이지 stack 1개 정책은 SearchBar/Search에서 replace로 처리.
 * ========================================================= */
import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import BottomNav from "./BottomNav";
import Toast from "./Toast";
import MosaicLogo from "./MosaicLogo";

const HOME_PATH = "/events";
const TOAST_DURATION_MS = 3000;
const EXIT_TOAST_MESSAGE = "'뒤로' 버튼을 한 번 더 누르시면\n종료됩니다";

export default function AppShell() {
  const location = useLocation();
  const [showExitToast, setShowExitToast] = useState(false);

  // 토스트 사이클 상태 — useRef로 stale closure 회피.
  // (handlePopState 클로저가 항상 최신 값 참조)
  const toastShownRef = useRef(false);
  const guardAddedRef = useRef(false);
  const toastTimerRef = useRef(null);

  useEffect(() => {
    // 홈을 떠나면 모든 사이클 상태 리셋.
    if (location.pathname !== HOME_PATH) {
      guardAddedRef.current = false;
      toastShownRef.current = false;
      setShowExitToast(false);
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
        toastTimerRef.current = null;
      }
      return;
    }

    // 홈 진입 — guard 1회 추가 (이미 있으면 skip).
    if (!guardAddedRef.current) {
      window.history.pushState({ exitGuard: true }, "");
      guardAddedRef.current = true;
    }

    const handlePopState = () => {
      // popstate가 발동했다 = 우리 guard가 소비됐다.
      // 이 핸들러는 홈 활성 시에만 등록됨 (cleanup으로 다른 라우트에선 제거).
      guardAddedRef.current = false;

      if (toastShownRef.current) {
        // 2차: 진짜 종료 시도. 사이클 정리 후 OS 처리에 위임.
        if (toastTimerRef.current) {
          clearTimeout(toastTimerRef.current);
          toastTimerRef.current = null;
        }
        toastShownRef.current = false;
        setShowExitToast(false);
        // history.back()은 popstate를 다시 발동시키지만, 이 시점엔 핸들러가
        // cleanup 안 됐으므로 무한 루프 방지를 위해 toastShownRef를 false로 먼저 리셋.
        // 다만 OS가 stack 시작점에서 background 처리하면 popstate 자체가 안 발동.
        window.history.back();
      } else {
        // 1차: 토스트 + guard 재충전.
        toastShownRef.current = true;
        setShowExitToast(true);
        window.history.pushState({ exitGuard: true }, "");
        guardAddedRef.current = true;

        // 3초 후 사이클 reset (1차 상태 해제 — 다시 뒤로가기 시 또 1차부터).
        // ⚠ 이때 stack에는 guard가 남아있음. 사용자가 3초 지난 뒤 뒤로가기 하면
        //    또 토스트 1차 발동 → 의도된 동작 (사이클 리셋).
        toastTimerRef.current = setTimeout(() => {
          toastShownRef.current = false;
          setShowExitToast(false);
          toastTimerRef.current = null;
        }, TOAST_DURATION_MS);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [location.pathname]);

  return (
    <div className="flex flex-col h-[100dvh] bg-mosaic-bg text-mosaic-text">
      <Header />
      <main className="flex-1 overflow-y-auto">
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
