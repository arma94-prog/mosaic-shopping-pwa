/* =========================================================
 * src/components/AppShell.jsx
 * 인증 후 메인 레이아웃 — 헤더 + Outlet + BottomNav.
 *
 * v11 변경 (2026-04-30, 마지막 시도 — react-router navigate):
 *  - 🔬 가설: 직접 window.history.pushState로 추가한 entry는 PWA standalone
 *    백키 시 popstate 발동 안 함. react-router의 navigate를 거친 entry만
 *    popstate 발동 (bookmarks → 백키 시 정상 동작 근거).
 *  - 🆕 paranoid push를 useNavigate()로 변경.
 *    state는 navigate option의 state로 전달.
 *
 * 검증:
 *  - 시나리오 A에서 백키 시 popstate 발동되면 → 가설 맞음. fix 완료.
 *  - 여전히 안 되면 → Chrome PWA standalone의 진짜 한계. 옵션 A로.
 *
 * ⚠ CTO 약속: 이번이 마지막 시도. 안 되면 옵션 A (단순 제거 + Phase 2 Capacitor).
 *
 * v10 (제거): 직접 pushState paranoid. 시나리오 A 실패.
 * v3 유지: fixed inset-0 (흔들림 fix).
 * ========================================================= */
import { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Header from "./Header";
import BottomNav from "./BottomNav";
import Toast from "./Toast";
import MosaicLogo from "./MosaicLogo";

const TOAST_DURATION_MS = 3000;
const EXIT_TOAST_MESSAGE = "'뒤로' 버튼을 한 번 더 누르시면\n종료됩니다";
const VERSION_LABEL = "v0.3.8";

const DEBUG_HISTORY = true;

export default function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showExitToast, setShowExitToast] = useState(false);
  const [debugLog, setDebugLog] = useState([]);
  const [tick, setTick] = useState(0);

  const log = (msg) => {
    if (!DEBUG_HISTORY) return;
    setDebugLog((prev) => {
      const t = new Date().toISOString().slice(11, 19);
      return [...prev, `${t} ${msg}`].slice(-14);
    });
    setTick((t) => t + 1);
  };

  // ─── lifecycle 모니터링 ───
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

  // ─── dual-back exit (react-router navigate 사용) ───
  useEffect(() => {
    let lastBackTime = 0;
    let timer = null;

    // v11: window.history.pushState 대신 navigate 사용.
    // react-router의 history 객체 통해 push → popstate 발동 보장 (가설).
    const paranoidPush = () => {
      const path = location.pathname + location.search;
      // navigate에 state 옵션으로 noBackExits 전달.
      navigate(`${path}#g1`, { state: { noBackExits: true } });
      navigate(`${path}#g2`, { state: { noBackExits: true } });
    };

    const initialPush = () => {
      paranoidPush();
      log(`[init] navigate×2 H.LEN=${window.history.length}`);
    };

    if (document.readyState === "complete") {
      initialPush();
    } else {
      window.addEventListener("load", initialPush, { once: true });
    }

    const onPopState = (event) => {
      const now = Date.now();
      const sinceLast = now - lastBackTime;

      // react-router는 state를 { usr: ..., key: ... } 형태로 wrap.
      // 우리가 넘긴 state는 event.state.usr에 있음.
      const usrState = event.state && event.state.usr;
      const isOurGuard = usrState && usrState.noBackExits;

      log(
        `POPSTATE usr=${JSON.stringify(usrState)} ours=${isOurGuard} Δ=${sinceLast} H=${window.history.length}`
      );

      if (isOurGuard) {
        if (lastBackTime > 0 && sinceLast < TOAST_DURATION_MS) {
          log(`[2차] 종료`);
          setShowExitToast(false);
          lastBackTime = 0;
          if (timer) {
            clearTimeout(timer);
            timer = null;
          }
          return;
        }

        log(`[1차] 토스트`);
        lastBackTime = now;
        setShowExitToast(true);
        paranoidPush();
        log(`[1차] re-push H=${window.history.length}`);

        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
          log(`[timer] reset`);
          setShowExitToast(false);
          lastBackTime = 0;
          timer = null;
        }, TOAST_DURATION_MS);
      } else {
        log(`[popstate] not ours, ignored`);
      }
    };

    window.addEventListener("popstate", onPopState);
    log(`[init] listener registered`);

    return () => {
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("load", initialPush);
      if (timer) clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          {`${VERSION_LABEL} H=${window.history.length} T=${tick}\n──────────`}
          {debugLog.length > 0 ? `\n${debugLog.join("\n")}` : "\n(no logs)"}
        </div>
      )}
    </div>
  );
}
