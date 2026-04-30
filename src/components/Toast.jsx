/* =========================================================
 * src/components/Toast.jsx
 * 모바일 PWA 하단 토스트 — 재사용 컴포넌트.
 *
 * v2 변경 (2026-04-30, 사용자 catch — 토스트 디자인):
 *  - 🎨 width: 화면 80% 고정 (이전: maxWidth: calc(100vw - 32px)).
 *    bottom 80px + left 50% + translateX -50% + width 80%로 가운데 정렬.
 *  - 🎨 background opacity: 0.92 → 0.72 (사용자 -20%).
 *
 * v1 (2026-04-30): PWA history 정책과 함께 신규.
 *
 * 책임:
 *  - open prop으로 표시/숨김 제어 (부모가 timing 관리)
 *  - leadingIcon 슬롯 (MosaicLogo, 이모지, SVG 등 자유)
 *  - message는 "\n" 줄바꿈 지원 (whiteSpace: pre-line)
 *  - 위치: BottomNav 위 + safe-area-inset 대응
 *  - 페이드 인/아웃 애니메이션 (200ms)
 *  - role="status" + aria-live="polite" 접근성
 *  - pointer-events-none — 토스트가 사용자 탭을 가로채지 않음
 * ========================================================= */
import { useEffect, useState } from "react";

export default function Toast({ open, message = "", leadingIcon = null }) {
  const [render, setRender] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setRender(true);
      // 다음 프레임에 visible (페이드 인 트랜지션 발동)
      const id = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(id);
    } else {
      setVisible(false);
      // 페이드 아웃 후 unmount (200ms)
      const id = setTimeout(() => setRender(false), 200);
      return () => clearTimeout(id);
    }
  }, [open]);

  if (!render) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed z-50 pointer-events-none"
      style={{
        bottom: "calc(env(safe-area-inset-bottom, 0px) + 80px)",
        left: "50%",
        transform: "translateX(-50%)",
        width: "80%", // v2: 화면 80% 고정
        opacity: visible ? 1 : 0,
        transition: "opacity 200ms ease-out",
      }}
    >
      <div
        className="flex items-center justify-center gap-2 rounded-xl"
        style={{
          background: "rgba(26, 26, 26, 0.72)", // v2: 0.92 → 0.72 (-20% opacity)
          color: "#FFFFFF",
          fontSize: "13px",
          lineHeight: "1.5",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.18)",
          padding: "12px 16px",
          whiteSpace: "pre-line",
          width: "100%",
        }}
      >
        {leadingIcon && (
          <span className="flex-shrink-0 flex items-center">{leadingIcon}</span>
        )}
        <span style={{ textAlign: "center" }}>{message}</span>
      </div>
    </div>
  );
}
