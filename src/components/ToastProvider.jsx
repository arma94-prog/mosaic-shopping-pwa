/* =========================================================
 * src/components/ToastProvider.jsx
 * 토스트 큐 관리 컨텍스트 — "마지막 것만 표시" 정책.
 *
 * Phase 1.7 신규 (2026-05):
 *  - 단일 state로 토스트 1개만 표시.
 *  - 새 호출 시 기존 토스트 즉시 dismiss + 새 토스트 표시 (key 변경 → 재마운트).
 *  - duration 옵션 — 갱신 토스트는 짧게(0.5초), 피드백 결과는 길게(2.5초).
 *
 * 사용:
 *   const { showToast } = useToast();
 *   showToast("쇼핑몰 목록이 갱신됨");           // default 500ms
 *   showToast("전송되었습니다", 2500);          // 2.5초
 * ========================================================= */
import { createContext, useCallback, useContext, useRef, useState } from "react";
import Toast from "./Toast";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const idRef = useRef(0);

  /**
   * @param {string} message - 토스트 본문.
   * @param {number} duration - 표시 시간 (ms). 갱신=500, 피드백=2500 권장.
   */
  const showToast = useCallback((message, duration = 500) => {
    if (!message) return;
    idRef.current += 1;
    // key가 바뀌면서 Toast 컴포넌트 재마운트 → fade-in 다시 발동.
    // 즉, 이전 토스트가 떠있어도 즉시 새 토스트로 교체 (마지막 것만).
    setToast({ id: idRef.current, message, duration });
  }, []);

  const handleDone = useCallback((doneId) => {
    // 같은 토스트만 unmount — race 조건에서 새 토스트가 살아있을 수 있음.
    setToast((curr) => (curr && curr.id === doneId ? null : curr));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Toast
          key={toast.id}
          message={toast.message}
          duration={toast.duration}
          onDone={() => handleDone(toast.id)}
        />
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be called within ToastProvider");
  }
  return ctx;
}
