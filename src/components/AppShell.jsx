/* =========================================================
 * src/components/AppShell.jsx
 * 인증 후 메인 레이아웃 — 헤더 + Outlet + BottomNav.
 *
 * v12 변경 (2026-04-30, navigate hash 부작용 fix):
 *  - 🐛 navigate(`${path}#g1`)이 hash 변화로 location 객체 변경 →
 *    Events.jsx의 useEffect가 cancel되면서 쇼핑몰 아이콘 fetch 안 됨.
 *  - 해결: window.history.pushState로 돌아가되 state는 react-router
 *    호환 형식 ({usr: {...}, key: ...}). URL은 그대로 (변화 없음).
 *  - URL 변화 없으니 Events.jsx 영향 X. 사용자 catch 2 (빈 화면) 해결.
 *  - state 호환 → react-router popstate handler가 정상 처리 → 우리
 *    listener도 발동 (v11에서 검증된 패턴).
 *
 * v12의 핵심 발견:
 *  - v10 (직접 pushState, native state): popstate 미발동.
 *  - v11 (navigate, hash URL): popstate 정상 발동 ✅, but Events 영향.
 *  - v12 (직접 pushState, react-router 호환 state, URL 변화 없음):
 *    react-router 호환 state로 react-router의 history 처리 흐름에
 *    합류 → popstate 정상 발동 (가설). URL 변화 없으니 다른 컴포넌트 영향 X.
 *
 * v11 (제거): navigate hash URL.
 * v3 유지: fixed inset-0 (흔들림 fix).
 * ========================================================= */
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import BottomNav from "./BottomNav";
import Toast from "./Toast";
import MosaicLogo from "./MosaicLogo";

const TOAST_DURATION_MS = 3000;
const EXIT_TOAST_MESSAGE = "'뒤로' 버튼을 한 번 더 누르시면\n종료됩니다";
const VERSION_LABEL = "v0.3.9";

const DEBUG_HISTORY = true;

/**
 * v12: react-router 호환 state로 직접 pushState.
 * URL은 그대로 (변화 없음) → 다른 컴포넌트 영향 X.
 * state 형식 {usr: ..., key: ...} → react-router 라우팅 시스템에서 정상 처리.
 */
function paranoidPush() {
  const url = window.location.href;
  const makeKey = () => Math.random().toString(36).slice(2, 10);
  window.history.pushState(
    { usr: { noBackExits: true }, key: makeKey() },
    "",
    url
  );
  window.history.pushState(
    { usr: { noBackExits: true }, key: makeKey() },
    "",
    url
  );
}

export default function AppShell() {
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

    log(`[App] mount H=${window.history.length}`);

    return () => {
      window.removeEventListener("pageshow", onPageShow);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("blur", onBlur);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── dual-back exit ───
  useEffect(() => {
    let lastBackTime = 0;
    let timer = null;

    const initialPush = () => {
      paranoidPush();
      log(`[init] paranoid×2 H=${window.history.length}`);
    };

    if (document.readyState === "complete") {
      initialPush();
    } else {
      window.addEventListener("load", initialPush, { once: true });
    }

    const onPopState = (event) => {
      const now = Date.now();
      const sinceLast = now - lastBackTime;

      const usrState = event.state && event.state.usr;
      const isOurGuard = usrState && usrState.noBackExits;

      log(
        `POPSTATE ours=${isOurGuard} Δ=${sinceLast} H=${window.history.length}`
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
