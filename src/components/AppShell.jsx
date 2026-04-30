/* =========================================================
 * src/components/AppShell.jsx
 * 인증 후 메인 레이아웃 — 헤더 + Outlet + BottomNav.
 *
 * v10 변경 (2026-04-30, 캡쳐 데이터 기반 paranoid 재시도):
 *  - 🐛 진입 시 + 매 1차 발동 시 push 2번 (paranoid).
 *    캡쳐 분석: pushState 정상 + popstate는 stack 깊이 충분할 때만 발동.
 *    이전 v9 (push 1번): events 첫 진입 → H.LEN=2 → 백키 시 시작점 너머 → 종료.
 *    v10 (push 2번): events 첫 진입 → H.LEN=3 → 백키 시 H.LEN=2 entry → popstate 발동.
 *  - 🆕 URL hash로 차별화 (#g1, #g2). 같은 URL push 무시 회피 안전망.
 *  - 🆕 박스 우상단에 "v0.3.7" 버전 표시. 캐시 mismatch 즉시 식별.
 *  - 🐛 v6 paranoid가 안 됐던 가능성 = 캐시 mismatch. 사용자 한 번 더 dogfood.
 *
 * 캡쳐 시나리오 분석 (사용자 데이터):
 *  - bookmarks/search → 백키 → events 이동 + 1차 토스트 (사용자 의도와 정합)
 *  - 추가 bookmarks 가드 불필요. 자연스러운 history 동작이 의도와 일치.
 *
 * 검증:
 *  A. 첫 진입 백키 → 토스트 떠야 함 (H.LEN=3에서 백키 시 popstate 발동 기대)
 *  B. 1차 토스트 후 또 백키 → 종료 (가드 재충전 안 함)
 *  C. timer reset 후 또 백키 → 1차 토스트 (paranoid 재push)
 *
 * v9 (제거): push 1번. 시나리오 A 실패.
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
const VERSION_LABEL = "v0.3.7"; // 박스 식별용

// ⚠ 검증 완료 후 false.
const DEBUG_HISTORY = true;

/** paranoid double push — hash로 URL 차별화 + state 일관. */
function paranoidPush() {
  const base = window.location.pathname + window.location.search;
  window.history.pushState({ noBackExits: true }, "", `${base}#g1`);
  window.history.pushState({ noBackExits: true }, "", `${base}#g2`);
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

  // ─── dual-back exit 패턴 (paranoid double push) ───
  useEffect(() => {
    let lastBackTime = 0;
    let timer = null;

    const initialPush = () => {
      paranoidPush();
      log(`[init] paranoid×2 H.LEN=${window.history.length}`);
    };

    if (document.readyState === "complete") {
      initialPush();
    } else {
      window.addEventListener("load", initialPush, { once: true });
    }

    const onPopState = (event) => {
      const now = Date.now();
      const sinceLast = now - lastBackTime;

      log(
        `POPSTATE state=${JSON.stringify(event.state)} Δ=${sinceLast} H.LEN=${window.history.length}`
      );

      if (event.state && event.state.noBackExits) {
        // 토스트 떠 있는 동안 또 백키 = 2차 (가드 재충전 안 함)
        if (lastBackTime > 0 && sinceLast < TOAST_DURATION_MS) {
          log(`[2차] 종료 (no re-push)`);
          setShowExitToast(false);
          lastBackTime = 0;
          if (timer) {
            clearTimeout(timer);
            timer = null;
          }
          return;
        }

        // 1차: 토스트 + paranoid 재push
        log(`[1차] 토스트`);
        lastBackTime = now;
        setShowExitToast(true);
        paranoidPush();
        log(`[1차] paranoid re-push H.LEN=${window.history.length}`);

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
          {`${VERSION_LABEL} H=${window.history.length} T=${tick}\n──────────`}
          {debugLog.length > 0 ? `\n${debugLog.join("\n")}` : "\n(no logs)"}
        </div>
      )}
    </div>
  );
}
