/* =========================================================
 * src/components/ToastProvider.jsx
 * 토스트 큐 관리 컨텍스트 — "마지막 것만 표시" 정책.
 *
 * v2 변경 (2026-05, Phase 1.7 도그푸딩):
 *  - 🐛 default duration 500ms → 2000ms.
 *    이전: 0.5초 → 사용자가 메시지 못 읽음 (특히 갱신 알림).
 *    이후: 2초 → 사용자가 메시지 인지 가능 + 화면 방해 X (사용자 검증).
 *    피드백 모달 (2.5초)도 2초로 통일 → UX 일관성.
 *
 * Phase 1.7 신규 (2026-05):
 *  - 단일 state로 토스트 1개만 표시.
 *  - 새 호출 시 기존 토스트 즉시 dismiss + 새 토스트 표시 (key 변경 → 재마운트).
 *
 * 사용:
 *   const { showToast } = useToast();
 *   showToast("쇼핑몰 목록이 갱신됨");           // default 2000ms
 *   showToast("커스텀 메시지", 3000);            // 명시 시 override
 * ========================================================= */
import { createContext, useCallback, useContext, useRef, useState } from "react";
import Toast from "./Toast";

const ToastContext = createContext(null);

/**
 * 모든 토스트 표시 시간 통일 (Phase 1.7 도그푸딩 결정).
 * 갱신 알림 + 피드백 결과 동일 시간.
 */
const DEFAULT_TOAST_DURATION_MS = 2000;

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const idRef = useRef(0);

  /**
   * @param {string} message - 토스트 본문.
   * @param {number} duration - 표시 시간 (ms). 기본 2000ms.
   */
  const showToast = useCallback(
    (message, duration = DEFAULT_TOAST_DURATION_MS) => {
      if (!message) return;
      idRef.current += 1;
      // key가 바뀌면서 Toast 컴포넌트 재마운트 → fade-in 다시 발동.
      // 즉, 이전 토스트가 떠있어도 즉시 새 토스트로 교체 (마지막 것만).
      setToast({ id: idRef.current, message, duration });
    },
    [],
  );

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
