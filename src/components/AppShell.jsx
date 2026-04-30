/* =========================================================
 * src/components/AppShell.jsx
 * 인증 후 메인 레이아웃 — 헤더 + Outlet + BottomNav + 종료 토스트.
 *
 * v6 변경 (2026-04-30, 사용자 dogfood 결과 기반 — paranoid double pushState):
 *  - 🐛 토스트 미작동 진짜 원인 확정 (visual debug 결과):
 *    A. 첫 진입 백키 → popstate 로그 미발동 → handler 호출 안 됨.
 *    B. webview 거친 후 백키 → 1차 정상.
 *    C. 1차 후 또 백키 → popstate 로그 미발동 → 종료.
 *  - 진단: 진입 시 pushState 1회로는 stack 시작점에 흡수됨 (PWA standalone Android Chrome 동작).
 *    stack 시작점 너머로 백키 = OS background → popstate 미발동.
 *  - 해결: guard pushState를 2번씩 (paranoid mode).
 *    진입 시: stack [..., g_a, g_b] → 백키 1번 = g_a로 popstate 정상.
 *    1차 발동 시: 또 2번 push → 토스트 떠 있는 동안 백키 = popstate 정상 → 2차 분기.
 *  - 단점: 사이클 반복 시 stack 누적 (1차마다 +2). 사용자 영향 무시 가능 수준.
 *  - Visual debug overlay 유지 (검증 후 다음 라운드에서 제거).
 *
 * v5 변경 (2026-04-30): closure 단순화 + visual debug.
 * v4 변경 (2026-04-30): timestamp 패턴.
 * v3 변경 (2026-04-30): fixed inset-0 + bookmarks 가드.
 *
 * Phase 1 한계 (사용자 합의):
 *  - PWA standalone에서 events 2차 종료 시도 시 stack 시작점 너머 = OS background.
 *  - paranoid double push로 시작점 도달 회피 + popstate 발동 보장.
 * ========================================================= */
import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Header from "./Header";
import BottomNav from "./BottomNav";
import Toast from "./Toast";
import MosaicLogo from "./MosaicLogo";

const HOME_PATH = "/events";
const BOOKMARKS_PATH = "/bookmarks";
const TOAST_DURATION_MS = 3000;
const EXIT_TOAST_MESSAGE = "'뒤로' 버튼을 한 번 더 누르시면\n종료됩니다";

// ⚠ dogfood 검증 후 false로 변경.
const DEBUG_HISTORY = true;

/** v6: paranoid double pushState — stack 시작점 흡수 회피 + popstate 발동 보장. */
function pushExitGuard() {
  window.history.pushState(null, "", window.location.href);
  window.history.pushState(null, "", window.location.href);
}

export default function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showExitToast, setShowExitToast] = useState(false);
  const [debugLog, setDebugLog] = useState([]);

  const log = (msg) => {
    if (!DEBUG_HISTORY) return;
    setDebugLog((prev) => {
      const t = new Date().toLocaleTimeString("ko-KR", { hour12: false });
      const next = [...prev, `${t.slice(3)} ${msg}`];
      return next.slice(-10);
    });
  };

  // ─── /events 가드 ───
  useEffect(() => {
    if (location.pathname !== HOME_PATH) return;

    log(`[events] mount`);

    let lastBackTime = 0;
    let timer = null;

    const handlePopState = () => {
      const now = Date.now();
      const sinceLast = now - lastBackTime;

      log(`[events] popstate Δ=${sinceLast}ms`);

      if (lastBackTime > 0 && sinceLast < TOAST_DURATION_MS) {
        // 2차: 종료 시도.
        log(`[events] 2차 → history.back()`);
        setShowExitToast(false);
        lastBackTime = 0;
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
        window.history.back();
        return;
      }

      // 1차: 토스트 + guard 2개 재충전 (paranoid).
      log(`[events] 1차 → toast + guard×2`);
      lastBackTime = now;
      setShowExitToast(true);
      pushExitGuard();

      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        log(`[events] timer 3s → reset`);
        setShowExitToast(false);
        lastBackTime = 0;
        timer = null;
      }, TOAST_DURATION_MS);
    };

    // 진입 시 guard 2개 (paranoid).
    pushExitGuard();
    log(`[events] guard×2 pushed (initial)`);

    window.addEventListener("popstate", handlePopState);

    return () => {
      log(`[events] unmount`);
      window.removeEventListener("popstate", handlePopState);
      if (timer) clearTimeout(timer);
      setShowExitToast(false);
    };
  }, [location.pathname]);

  // ─── /bookmarks 가드 ───
  useEffect(() => {
    if (location.pathname !== BOOKMARKS_PATH) return;

    log(`[bookmarks] mount`);

    const handlePopState = () => {
      log(`[bookmarks] popstate → /events`);
      navigate(HOME_PATH, { replace: true });
    };

    // bookmarks도 paranoid double push.
    pushExitGuard();
    window.addEventListener("popstate", handlePopState);

    return () => {
      log(`[bookmarks] unmount`);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [location.pathname, navigate]);

  return (
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

      {/* dogfood 검증 후 DEBUG_HISTORY=false로 끄기 */}
      {DEBUG_HISTORY && debugLog.length > 0 && (
        <div
          style={{
            position: "fixed",
            top: "calc(env(safe-area-inset-top, 0px) + 56px)",
            right: 4,
            zIndex: 9999,
            maxWidth: "62%",
            background: "rgba(0,0,0,0.78)",
            color: "#fff",
            fontSize: "9px",
            lineHeight: "1.4",
            padding: "5px 7px",
            borderRadius: "4px",
            fontFamily: "ui-monospace, monospace",
            whiteSpace: "pre-line",
            pointerEvents: "none",
          }}
        >
          {debugLog.join("\n")}
        </div>
      )}
    </div>
  );
}
