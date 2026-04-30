/* =========================================================
 * src/components/AppShell.jsx
 * 인증 후 메인 레이아웃 — 헤더 + Outlet + BottomNav.
 *
 * v14 변경 (2026-04-30, fix-3):
 *  - 🆕 백키 정책 명시화 — bookmarks/search → events 강제 navigate.
 *    사용자 명시 정책:
 *     - /bookmarks 또는 /search 어떤 형태든 → 백키 = events 이동
 *     - /events → 백키 = 종료 (Chrome PWA 표준 동작, 코드 추가 X)
 *
 *  - 구현 패턴 (트랙 D 학습 적용):
 *     - lastPathRef (useRef) — 직전 path 추적, useEffect로 업데이트.
 *     - popstate 발동 시 ref 검사 → bookmarks/search였으면 events 강제 navigate.
 *     - setTimeout 0 — react-router의 location update 후 우리 navigate 처리 (race condition 회피).
 *
 *  - react-router popstate listener가 우리보다 먼저 등록 (BrowserRouter mount 순서).
 *    우리 handler 실행 시점에 react location은 이미 새 path. 단 ref는 useEffect로
 *    업데이트되어 직전 path 보유. ref 검사로 분기 정확.
 *
 * v13 (한계 인정 + 옵션 A) 폐기. 9차례 시도 history는 git log 참조.
 * v3 (유지): fixed inset-0 + flex column. 외부 webview 갔다 와도 viewport 절대 고정.
 *
 * Phase 2 Capacitor에서:
 *  - @capacitor/app의 App.addListener('backButton', ...) — OS 백키 직접 intercept.
 *  - 표준 dual-back exit + bookmarks 강제 events 모두 동일 API로 통합.
 *  - 메모리 #4 (PWA standalone webview 한계 — Phase 2 우선순위 격상 사유) 정합.
 * ========================================================= */
import { useEffect, useRef } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Header from "./Header";
import BottomNav from "./BottomNav";

export default function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const lastPathRef = useRef(location.pathname);

  // location 변경 시 ref 업데이트 (다음 popstate 대비).
  // useEffect는 commit 후 실행 → ref는 직전 path 보유 시점이 popstate handler 실행 시점.
  useEffect(() => {
    lastPathRef.current = location.pathname;
  }, [location.pathname]);

  // popstate 백키 정책 — bookmarks/search에서 백키 = events로 강제 navigate.
  useEffect(() => {
    const onPopState = () => {
      const lastPath = lastPathRef.current;
      const isFromBookmarks = lastPath === "/bookmarks";
      const isFromSearch = lastPath?.startsWith("/search");

      if (isFromBookmarks || isFromSearch) {
        // setTimeout 0: react-router가 popstate에 따른 location update 처리 후 우리 navigate 실행.
        // 즉시 navigate하면 race condition 위험.
        setTimeout(() => {
          navigate("/events", { replace: true });
        }, 0);
      }
    };

    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
    };
  }, [navigate]);

  return (
    // v3 (유지): fixed inset-0 + flex column. 외부 webview 갔다 와도 viewport 절대 고정.
    <div className="fixed inset-0 flex flex-col bg-mosaic-bg text-mosaic-text">
      <Header />
      <main className="flex-1 overflow-y-auto overscroll-contain">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
