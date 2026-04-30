/* =========================================================
 * src/components/AppShell.jsx
 * 인증 후 메인 레이아웃 — 헤더 + Outlet + BottomNav.
 *
 * v9 변경 (2026-04-30, 외부 조언 코드 검증):
 *  - 🔬 외부에서 조언받은 표준 dual-back exit 코드 그대로 시도.
 *    이전 v6/v7과 본질적 구조는 같지만, 미세한 차이가 결과 바꿀 수 있음 검증.
 *  - 핵심 차이:
 *    1. window 'load' 이벤트로 진입 시점 명시 (React useEffect 아님)
 *    2. state object에 noBackExits 플래그 명시
 *    3. pushState 두 번째 인자 빈 문자열, URL 인자 생략
 *  - 진단 박스 유지: H.LEN, popstate, blur 등 모니터링.
 *
 * 검증 시나리오:
 *  - 시나리오 A (첫 진입 백키): 토스트 뜨는가? popstate 발동되는가?
 *    YES → 우리 v6/v7 코드의 미세한 issue가 원인이었음
 *    NO → Chrome PWA standalone 백키 처리 자체 한계 (옵션 A로)
 *
 * v8 (제거): 단순화 시도.
 * v7 (제거): 진단 박스만.
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

// ⚠ 검증 완료 후 false.
const DEBUG_HISTORY = true;

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

  // ─── lifecycle 모니터링 (진단 유지) ───
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

  // ─── 외부 조언 코드 그대로 — load + popstate 패턴 ───
  useEffect(() => {
    let lastBackTime = 0;
    let timer = null;

    // 외부 조언 1번: load 시점에 가상 히스토리 추가.
    // React mount 시점이 load 이후이므로, useEffect에서 즉시 push도 동등.
    // 단 'load' 이벤트가 미리 발동했을 수 있으므로 직접 push.
    const initialPush = () => {
      window.history.pushState({ noBackExits: true }, "");
      log(`[init] pushState H.LEN=${window.history.length}`);
    };

    if (document.readyState === "complete") {
      initialPush();
    } else {
      window.addEventListener("load", initialPush, { once: true });
    }

    // 외부 조언 2번: popstate 감지 + state 체크.
    const onPopState = (event) => {
      const now = Date.now();
      const sinceLast = now - lastBackTime;

      log(
        `POPSTATE state=${JSON.stringify(event.state)} Δ=${sinceLast} H.LEN=${window.history.length}`
      );

      // state.noBackExits === true 이면 우리 가드가 소비된 것.
      if (event.state && event.state.noBackExits) {
        // 토스트 떠 있는 동안 또 백키 = 2차
        if (lastBackTime > 0 && sinceLast < TOAST_DURATION_MS) {
          log(`[2차] 종료 시도`);
          setShowExitToast(false);
          lastBackTime = 0;
          if (timer) {
            clearTimeout(timer);
            timer = null;
          }
          // 가드 재충전 안 함 → 다음 백키 = 종료
          return;
        }

        // 1차: 토스트 + 가드 재충전
        log(`[1차] 토스트`);
        lastBackTime = now;
        setShowExitToast(true);
        window.history.pushState({ noBackExits: true }, "");
        log(`[1차] guard re-pushed H.LEN=${window.history.length}`);

        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
          log(`[timer] reset`);
          setShowExitToast(false);
          lastBackTime = 0;
          timer = null;
        }, TOAST_DURATION_MS);
      } else {
        log(`[popstate] not our guard, ignored`);
      }
    };

    window.addEventListener("popstate", onPopState);
    log(`[init] popstate listener registered`);

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
          {`H=${window.history.length} T=${tick}\n──────────`}
          {debugLog.length > 0 ? `\n${debugLog.join("\n")}` : "\n(no logs)"}
        </div>
      )}
    </div>
  );
}
