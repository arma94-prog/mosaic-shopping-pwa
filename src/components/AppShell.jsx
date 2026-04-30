/* =========================================================
 * src/components/AppShell.jsx
 * 인증 후 메인 레이아웃 — 헤더 + Outlet + BottomNav + 종료 토스트.
 *
 * v7 변경 (2026-04-30, 진단 강화 — paranoid 효과 없음):
 *  - 🔬 박스 항상 표시 (mount 즉시): pathname / history.length / tick.
 *    이전 v6 박스는 debugLog 비면 안 보임. v7은 mount 후 즉시 가시.
 *  - 🔬 history.length 실시간 표시: pushExitGuard 효과 검증 핵심 지표.
 *    paranoid double push 호출 후 H.LEN이 실제로 +2 늘어나는가?
 *    안 늘어나면 → pushState가 stack 추가 못 하고 있음 (진짜 원인).
 *  - 🔬 hash URL로 push 차별화: 같은 URL push 무시 회피 시도.
 *    pushState(`${pathname}${search}#g1`) → URL 명확히 다름 → stack 강제 추가.
 *    react-router는 hash 무시하므로 라우팅 영향 X.
 *  - 🔬 PWA lifecycle 이벤트 모니터링: pageshow/visibilitychange/focus/blur.
 *    시나리오 A vs B 차이의 정확한 lifecycle 흐름 진단.
 *
 * v6 (paranoid double push) 그대로 유지하되 URL을 hash로 차별화.
 *
 * 검증 시나리오 (사용자 dogfood):
 *  A. 첫 진입 백키:
 *     - mount 시 박스에 "[events] init guard×2 H.LEN=N+2" 표시되는가?
 *     - H.LEN이 +2 늘어나는가? (안 늘어나면 push 자체 실패)
 *     - 백키 후 POPSTATE 로그 추가되는가?
 *  B. webview 후 백키:
 *     - mall 클릭 후 pageshow/visibility 로그 어떻게 보이는가?
 *     - 백키 시 POPSTATE 로그 + H.LEN 변화는?
 *  C. 1차 후 백키:
 *     - 1차 토스트 후 [events] guard#1×2 push 로그 + H.LEN 증가?
 *     - 또 백키 시 POPSTATE 발동?
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

// ⚠ 진단 완료 후 false로 변경.
const DEBUG_HISTORY = true;

/**
 * v7: hash URL로 차별화 push.
 * 같은 URL push가 stack에 추가 안 되는 환경 회피.
 * react-router는 hash 무시하므로 라우팅 영향 없음.
 */
function pushExitGuard(label) {
  const base = window.location.pathname + window.location.search;
  window.history.pushState(null, "", `${base}#g${label}a`);
  window.history.pushState(null, "", `${base}#g${label}b`);
}

export default function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showExitToast, setShowExitToast] = useState(false);
  const [debugLog, setDebugLog] = useState([]);
  // history.length 실시간 갱신용 강제 re-render 트리거.
  const [tick, setTick] = useState(0);

  const log = (msg) => {
    if (!DEBUG_HISTORY) return;
    setDebugLog((prev) => {
      const t = new Date().toISOString().slice(11, 19);
      return [...prev, `${t} ${msg}`].slice(-14);
    });
    setTick((t) => t + 1);
  };

  // ─── PWA lifecycle 이벤트 모니터링 (진단) ───
  useEffect(() => {
    if (!DEBUG_HISTORY) return;

    const onPageShow = (e) => log(`pageshow persist=${e.persisted}`);
    const onVisibility = () => log(`vis=${document.visibilityState}`);
    const onFocus = () => log(`focus`);
    const onBlur = () => log(`blur`);

    window.addEventListener("pageshow", onPageShow);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", onFocus);
    window.addEventListener("blur", onBlur);

    log(`[App] mount H.LEN=${window.history.length}`);

    return () => {
      window.removeEventListener("pageshow", onPageShow);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("blur", onBlur);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── /events 가드 ───
  useEffect(() => {
    if (location.pathname !== HOME_PATH) return;

    log(`[events] mount H.LEN=${window.history.length}`);

    let lastBackTime = 0;
    let timer = null;
    let cycle = 0;

    const handlePopState = () => {
      const now = Date.now();
      const sinceLast = now - lastBackTime;

      log(`POPSTATE Δ=${sinceLast} H.LEN=${window.history.length} hash=${window.location.hash}`);

      if (lastBackTime > 0 && sinceLast < TOAST_DURATION_MS) {
        log(`[events] 2차 → back()`);
        setShowExitToast(false);
        lastBackTime = 0;
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
        window.history.back();
        return;
      }

      cycle++;
      log(`[events] 1차 #${cycle}`);
      lastBackTime = now;
      setShowExitToast(true);
      pushExitGuard(`c${cycle}`);
      log(`[events] guard#${cycle}×2 H.LEN=${window.history.length}`);

      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        log(`[events] timer reset`);
        setShowExitToast(false);
        lastBackTime = 0;
        timer = null;
      }, TOAST_DURATION_MS);
    };

    pushExitGuard("init");
    log(`[events] init guard×2 H.LEN=${window.history.length}`);

    window.addEventListener("popstate", handlePopState);

    return () => {
      log(`[events] unmount`);
      window.removeEventListener("popstate", handlePopState);
      if (timer) clearTimeout(timer);
      setShowExitToast(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // ─── /bookmarks 가드 ───
  useEffect(() => {
    if (location.pathname !== BOOKMARKS_PATH) return;

    log(`[bookmarks] mount`);

    const handlePopState = () => {
      log(`[bookmarks] popstate → /events`);
      navigate(HOME_PATH, { replace: true });
    };

    pushExitGuard("bm");
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

      {/* v7: 박스 항상 표시 (mount 즉시 가시). 진단 캡쳐용. */}
      {DEBUG_HISTORY && (
        <div
          style={{
            position: "fixed",
            top: "calc(env(safe-area-inset-top, 0px) + 56px)",
            right: 4,
            zIndex: 9999,
            maxWidth: "75%",
            background: "rgba(0,0,0,0.85)",
            color: "#fff",
            fontSize: "9px",
            lineHeight: "1.35",
            padding: "5px 7px",
            borderRadius: "4px",
            fontFamily: "ui-monospace, monospace",
            whiteSpace: "pre-line",
            pointerEvents: "none",
          }}
        >
          {`P=${location.pathname}${location.hash}\nH=${window.history.length} T=${tick}\n──────────`}
          {debugLog.length > 0 ? `\n${debugLog.join("\n")}` : "\n(no logs yet)"}
        </div>
      )}
    </div>
  );
}
