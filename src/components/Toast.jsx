/* =========================================================
 * src/components/Toast.jsx
 * 단일 토스트 표시 컴포넌트 — Portal로 body에 마운트.
 *
 * v2 변경 (2026-05, Phase 1.7 도그푸딩):
 *  - 🐛 default duration 500 → 2000ms (ToastProvider와 통일).
 *    Toast 컴포넌트는 항상 ToastProvider에서 명시 duration을 받지만,
 *    fallback 안전망 일관성 위해 동일하게 변경.
 *
 * Phase 1.7 신규 (2026-05):
 *  - 위치: 화면 하단, BottomNav 위 (iOS safe-area 고려).
 *  - 디자인: 다크 pill — 사용자 습관 정합 (iOS/Android 표준 토스트).
 *  - fade in/out 200ms — 자연스러운 등장/퇴장.
 *
 * 사용처: ToastProvider 내부 — 직접 import 안 함.
 * ========================================================= */
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function Toast({ message, duration = 2000, onDone }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // 10ms 후 fade-in (DOM 삽입 직후 transition 발동)
    const fadeInTimer = setTimeout(() => setVisible(true), 10);

    // duration ms 후 fade-out 시작
    const dismissTimer = setTimeout(() => {
      setVisible(false);
    }, duration);

    // fade-out 200ms 후 unmount
    const cleanupTimer = setTimeout(() => {
      onDone?.();
    }, duration + 200);

    return () => {
      clearTimeout(fadeInTimer);
      clearTimeout(dismissTimer);
      clearTimeout(cleanupTimer);
    };
  }, [duration, onDone]);

  return createPortal(
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        bottom: "calc(70px + env(safe-area-inset-bottom))",
        left: "50%",
        transform: `translateX(-50%) translateY(${visible ? 0 : 8}px)`,
        opacity: visible ? 1 : 0,
        transition: "opacity 200ms ease, transform 200ms ease",
        zIndex: 100,
        pointerEvents: "none",
        background: "rgba(28, 28, 26, 0.92)",
        color: "#FFFFFF",
        fontSize: "13px",
        fontWeight: 400,
        padding: "10px 18px",
        borderRadius: "20px",
        whiteSpace: "nowrap",
        maxWidth: "calc(100vw - 32px)",
        textOverflow: "ellipsis",
        overflow: "hidden",
      }}
    >
      {message}
    </div>,
    document.body,
  );
}
