/* =========================================================
 * src/components/ChunkErrorBoundary.jsx
 * PWA 캐시 크래시 자동 복구 — ChunkLoadError catch + SW/cache clear + reload.
 *
 * v1 (2026-05-25):
 *  - 문제: PWA 새 deploy 후 옛 index.html 캐시 + 새 JS chunk hash 불일치
 *    → ChunkLoadError → 화이트 페이지. 사용자가 수동 캐시 지움 의무.
 *  - 해결: ErrorBoundary로 render 에러 catch + window.error/unhandledrejection으로
 *    비동기 chunk load 에러도 catch → SW unregister + caches clear + reload.
 *
 * 감지 패턴:
 *  - ChunkLoadError (name)
 *  - "Loading chunk N failed" / "Loading CSS chunk N failed"
 *  - "Failed to fetch dynamically imported module"
 *
 * 사용처:
 *  - main.jsx — App을 ChunkErrorBoundary로 감쌈.
 *  - 비동기 listener는 ChunkErrorBoundary mount 시 자동 등록.
 *
 * 비-chunk 에러는 catch 안 함 (그대로 throw / log) — 다른 디버깅 도구 정합.
 * ========================================================= */
import { Component } from "react";

function isChunkLoadError(error) {
  if (!error) return false;
  const message = (error && error.message) || "";
  const name = (error && error.name) || "";
  return (
    name === "ChunkLoadError" ||
    /Loading chunk\s*\S+\s*failed/i.test(message) ||
    /Loading CSS chunk\s*\S+\s*failed/i.test(message) ||
    /Failed to fetch dynamically imported module/i.test(message)
  );
}

/** SW unregister + caches clear + reload. async — 호출자는 await 권장 X. */
async function recoverFromChunkError(reason) {
  // eslint-disable-next-line no-console
  console.warn("[chunk-boundary] recovering from chunk error", reason);
  try {
    if ("serviceWorker" in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("[chunk-boundary] SW unregister failed", e);
  }
  try {
    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("[chunk-boundary] caches clear failed", e);
  }
  // 강제 reload — cache bypass (URL에 timestamp 추가).
  try {
    const u = new URL(window.location.href);
    u.searchParams.set("_chunkRecover", Date.now().toString());
    window.location.replace(u.toString());
  } catch (_) {
    window.location.reload();
  }
}

export default class ChunkErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
    this.handleWindowError = this.handleWindowError.bind(this);
    this.handleUnhandledRejection = this.handleUnhandledRejection.bind(this);
    this.recovering = false;
  }

  componentDidMount() {
    // 비동기 ChunkLoadError catch — dynamic import 실패 등.
    window.addEventListener("error", this.handleWindowError);
    window.addEventListener("unhandledrejection", this.handleUnhandledRejection);
  }

  componentWillUnmount() {
    window.removeEventListener("error", this.handleWindowError);
    window.removeEventListener("unhandledrejection", this.handleUnhandledRejection);
  }

  handleWindowError(event) {
    if (isChunkLoadError(event.error)) {
      this.triggerRecovery(event.error);
    }
  }

  handleUnhandledRejection(event) {
    if (isChunkLoadError(event.reason)) {
      this.triggerRecovery(event.reason);
    }
  }

  triggerRecovery(error) {
    if (this.recovering) return; // 중복 호출 차단
    this.recovering = true;
    this.setState({ hasError: true });
    recoverFromChunkError(error);
  }

  static getDerivedStateFromError(error) {
    if (isChunkLoadError(error)) {
      return { hasError: true };
    }
    // 비-chunk 에러는 catch X — 상위 boundary 또는 React default 처리.
    throw error;
  }

  componentDidCatch(error) {
    if (isChunkLoadError(error)) {
      this.triggerRecovery(error);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            position: "fixed",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#FAFAF7",
            color: "#523E2F",
            fontSize: 14,
            fontWeight: 500,
            padding: 16,
            textAlign: "center",
          }}
        >
          <div>
            <p style={{ margin: 0 }}>새 버전으로 업데이트 중...</p>
            <p
              style={{
                margin: "8px 0 0",
                fontSize: 12,
                color: "#9F7D5B",
              }}
            >
              잠시만 기다려 주세요.
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
