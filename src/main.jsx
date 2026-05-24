import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles/index.css";

// =========================================================
// PWA 이중 백키 종료 패턴 — 가짜 history entry 즉시 push.
// AppShell mount 전 race 차단 (AuthGate/PrewarmingGate 로딩 중 백키 catch).
// BrowserRouter의 / → /events Navigate replace가 본 entry를 치환하지만,
// AppShell useEffect에서 state 검증 후 fallback push로 회복.
// =========================================================
if (typeof window !== "undefined" && window.history) {
  try {
    window.history.pushState(
      { _mosaicExitGuard: true },
      "",
      window.location.href,
    );
  } catch (_) {
    /* private mode 또는 sandbox 제한 — 무시 */
  }
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
