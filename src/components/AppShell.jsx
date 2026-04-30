/* =========================================================
 * src/components/AppShell.jsx
 * 인증 후 메인 레이아웃 — 헤더 + Outlet + BottomNav.
 *
 * v17 변경 (2026-04-30, 진단 캡쳐 기반 fix):
 *  - 🐛 캡쳐 데이터 분석: [init] popstate listener registered 매 라우트 변경마다 5번.
 *    pop1/pop2/nav→events 로그 없음 = popstate가 우리 listener에 안 잡힘.
 *  - 원인: useEffect [navigate] dep로 매 render마다 재실행 → cleanup/재등록 race.
 *
 *  - 🆕 fix: useEffect empty deps + navigateRef 패턴.
 *    mount 시 1회만 listener 등록. navigate는 ref로 stable하게 참조.
 *
 * v16 (제거): 진단 박스만 + [navigate] dep.
 * v15 (제거): [navigate] dep 패턴.
 * v3 (유지): fixed inset-0.
 * ========================================================= */
import { useEffect, useRef, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Header from "./Header";
import BottomNav from "./BottomNav";

const VERSION_LABEL = "v0.4.2";
const DEBUG = true;

export default function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const navigateRef = useRef(navigate);
  const [debugLog, setDebugLog] = useState([]);
  const [tick, setTick] = useState(0);

  // navigate를 ref로 stable. useEffect popstate가 mount once여도 최신 navigate 사용 가능.
  useEffect(() => {
    navigateRef.current = navigate;
  }, [navigate]);

  const log = (msg) => {
    if (!DEBUG) return;
    setDebugLog((prev) => {
      const t = new Date().toISOString().slice(11, 19);
      return [...prev, `${t} ${msg}`].slice(-14);
    });
    setTick((t) => t + 1);
  };

  // location 변경 추적
  useEffect(() => {
    log(`loc=${location.pathname}${location.search || ""}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.search]);

  // popstate listener — empty deps로 mount 시 1회만 등록.
  // navigateRef로 최신 navigate 참조 (stale closure 회피).
  useEffect(() => {
    const onPopState = () => {
      const t1 = window.location.pathname;
      log(`pop1 path=${t1} H=${window.history.length}`);

      setTimeout(() => {
        const t2 = window.location.pathname;
        log(`pop2 path=${t2} H=${window.history.length}`);

        if (t2 !== "/events") {
          log(`nav→events`);
          navigateRef.current("/events", { replace: true });
        } else {
          log(`skip (already /events)`);
        }
      }, 0);
    };

    window.addEventListener("popstate", onPopState);
    log(`[init] listener registered (mount once)`);

    return () => {
      window.removeEventListener("popstate", onPopState);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // empty deps — mount once.

  return (
    <div className="fixed inset-0 flex flex-col bg-mosaic-bg text-mosaic-text">
      <Header />
      <main className="flex-1 overflow-y-auto overscroll-contain">
        <Outlet />
      </main>
      <BottomNav />

      {DEBUG && (
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
