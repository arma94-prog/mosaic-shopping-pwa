/* =========================================================
 * src/components/AppShell.jsx
 * 인증 후 메인 레이아웃 — 헤더 + Outlet + BottomNav + 종료 토스트.
 *
 * v5 변경 (2026-04-30, 사용자 catch — 토스트 진단):
 *  - 🔬 closure 기반 단순화 (ref 제거).
 *    이전 v4: timestamp ref + guard ref + skipNext ref → 복잡 + race condition 가능성.
 *    이후 v5: useEffect 안 closure로 lastBackTime/timer 캡쳐 → 단순 + 명확.
 *    각 useEffect (events / bookmarks) 분리로 책임 단일화.
 *  - 🔬 Visual debug overlay 추가 (DEBUG_HISTORY=true 시):
 *    화면 우측 상단에 popstate 발동 시점 + 1차/2차 분기 로그 표시.
 *    사용자 dogfood로 정확 원인 진단 후 DEBUG_HISTORY=false로 끄기.
 *  - 🔬 pushState 시 state arg null + URL 명시 (가장 표준 형태).
 *
 * 사용자 정의 정확 동작 (스펙 정합):
 *  - 핫딜 페이지에서 백키 → 토스트 뜸
 *  - 토스트 떠 있는 동안 또 백키 → 종료
 *  - 토스트 사라진 후 또 백키 → 토스트 다시 뜸 (사이클 reset)
 *
 * 토스트 미작동 catch 진단 (사용자 시나리오):
 *  - "AOS 첫 진입 → 백키 = 안 뜸"
 *  - "mall webview → 닫기 → 백키 = 1번 뜸"
 *  - 가설: 첫 진입 시 stack 너무 얕아서 백키 = stack 시작점 너머 = OS background.
 *    popstate 자체 미발동. mall webview 거치면 Chrome history sync로 stack 깊어져
 *    백키 시 popstate 발동. → Visual debug로 검증 필요.
 *
 * v4 변경 (2026-04-30): timestamp 패턴.
 * v3 변경 (2026-04-30): fixed inset-0 + bookmarks 가드 + skipNextPopstate.
 * v2 변경 (2026-04-30): events 토스트 사이클 도입.
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

// ⚠ dogfood 종료 후 false로 변경 (또는 제거).
const DEBUG_HISTORY = true;

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
      return next.slice(-10); // 최근 10개만
    });
  };

  // ─── /events 가드 (closure 기반 단순화) ───
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
        // 2차: 종료 시도 (OS 처리에 위임)
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

      // 1차: 토스트 + guard 재충전
      log(`[events] 1차 → toast`);
      lastBackTime = now;
      setShowExitToast(true);
      window.history.pushState(null, "", window.location.href);

      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        log(`[events] timer 3s → reset`);
        setShowExitToast(false);
        lastBackTime = 0;
        timer = null;
      }, TOAST_DURATION_MS);
    };

    // 진입 시 guard 1회.
    window.history.pushState(null, "", window.location.href);
    log(`[events] guard pushed (initial)`);

    window.addEventListener("popstate", handlePopState);

    return () => {
      log(`[events] unmount`);
      window.removeEventListener("popstate", handlePopState);
      if (timer) clearTimeout(timer);
      setShowExitToast(false);
    };
  }, [location.pathname]);

  // ─── /bookmarks 가드 (강제 events 이동) ───
  useEffect(() => {
    if (location.pathname !== BOOKMARKS_PATH) return;

    log(`[bookmarks] mount`);

    const handlePopState = () => {
      log(`[bookmarks] popstate → /events`);
      navigate(HOME_PATH, { replace: true });
    };

    window.history.pushState(null, "", window.location.href);
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

      {/* v5: Visual debug overlay — DEBUG_HISTORY=true 시만 표시. dogfood 끝나면 false. */}
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
