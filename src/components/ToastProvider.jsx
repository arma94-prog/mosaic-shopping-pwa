/* =========================================================
 * src/components/ToastProvider.jsx
 * 토스트 큐 관리 컨텍스트 — "마지막 것만 표시" 정책.
 *
 * v3 변경 (2026-05-25, 사용자 catch — 이중 백키 종료 race fix):
 *  - 🆕 toastActiveRef 추가 — toast mount~unmount lifecycle ref로 추적.
 *    AppShell popstate handler가 토스트 활성 상태 직접 catch 가능.
 *    이전: handler가 setTimeout(2000)으로 exit pending reset → Toast lifecycle
 *      (fade-in 10 + duration 2000 + fade-out 200 = 2210ms)과 race.
 *    이후: toastActive = true (showToast 호출 직후) / false (handleDone 호출 시점).
 *      Toast unmount 시점과 정확히 동기화. race 차단.
 *
 * v2 (유지): default duration 2000ms.
 * Phase 1.7 (유지): 단일 state, 새 호출 시 즉시 교체.
 *
 * 사용:
 *   const { showToast } = useToast();
 *   const { toastActiveRef } = useToast();  // ★ v3 — 활성 상태 catch
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
  // v3: toast mount~unmount lifecycle ref로 추적 (AppShell race fix).
  // showToast 호출 직후 true / handleDone (Toast 완전 unmount) 호출 시점 false.
  const toastActiveRef = useRef(false);

  /**
   * @param {string} message - 토스트 본문.
   * @param {number} duration - 표시 시간 (ms). 기본 2000ms.
   */
  const showToast = useCallback(
    (message, duration = DEFAULT_TOAST_DURATION_MS) => {
      if (!message) return;
      idRef.current += 1;
      // v3: 활성 ref true — handler가 다음 popstate에서 catch 가능.
      toastActiveRef.current = true;
      // key가 바뀌면서 Toast 컴포넌트 재마운트 → fade-in 다시 발동.
      // 즉, 이전 토스트가 떠있어도 즉시 새 토스트로 교체 (마지막 것만).
      setToast({ id: idRef.current, message, duration });
    },
    [],
  );

  const handleDone = useCallback((doneId) => {
    // 같은 토스트만 unmount — race 조건에서 새 토스트가 살아있을 수 있음.
    setToast((curr) => {
      if (curr && curr.id === doneId) {
        // v3: 마지막 토스트 unmount → 활성 ref false.
        toastActiveRef.current = false;
        return null;
      }
      return curr;
    });
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, toastActiveRef }}>
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
