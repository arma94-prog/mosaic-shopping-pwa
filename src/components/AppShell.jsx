/* =========================================================
 * src/components/AppShell.jsx
 * 인증 후 메인 레이아웃 — 헤더 + Outlet + BottomNav.
 *
 * v16 변경 (2026-04-30, 시나리오 G 진단):
 *  - v15 (단순화 패턴) + 진단 박스.
 *  - 사용자 catch: events → search → bookmarks → 백키 시 events로 못 감.
 *  - 진단 정보:
 *    - mount 시 path
 *    - location 변경 시 path (BottomNav 등 추적)
 *    - popstate 발동 시점 path
 *    - setTimeout 안 path
 *    - navigate 호출 여부
 *  - dogfood 후 박스 캡쳐 받아서 정확 timing 진단 → fix.
 *  - ⚠ 검증 완료 후 즉시 DEBUG=false + 박스 제거 (커밋 시 v17).
 * ========================================================= */
import { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Header from "./Header";
import BottomNav from "./BottomNav";

const VERSION_LABEL = "v0.4.1";
const DEBUG = true;

export default function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const [debugLog, setDebugLog] = useState([]);
  const [tick, setTick] = useState(0);

  const log = (msg) => {
    if (!DEBUG) return;
    setDebugLog((prev) => {
      const t = new Date().toISOString().slice(11, 19);
      return [...prev, `${t} ${msg}`].slice(-14);
    });
    setTick((t) => t + 1);
  };

  // location 변경 추적 (BottomNav navigate 등)
  useEffect(() => {
    log(`loc=${location.pathname}${location.search || ""}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.search]);

  // 백키 정책 — events 외 라우트에서 백키 = events로 강제 navigate.
  useEffect(() => {
    const onPopState = () => {
      const t1Path = window.location.pathname;
      log(`pop1 path=${t1Path} H=${window.history.length}`);

      setTimeout(() => {
        const t2Path = window.location.pathname;
        log(`pop2 path=${t2Path} H=${window.history.length}`);

        if (t2Path !== "/events") {
          log(`nav→events`);
          navigate("/events", { replace: true });
        } else {
          log(`skip (already /events)`);
        }
      }, 0);
    };

    window.addEventListener("popstate", onPopState);
    log(`[init] popstate listener registered`);
    return () => {
      window.removeEventListener("popstate", onPopState);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

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
