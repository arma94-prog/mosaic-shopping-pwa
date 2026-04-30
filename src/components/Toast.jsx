/* =========================================================
 * src/components/Toast.jsx
 * 모바일 PWA 하단 토스트 — 재사용 컴포넌트.
 *
 * v1 (2026-04-30): PWA history 정책 + 홈 종료 확인 패턴 도입과 함께 신규.
 *
 * 책임:
 *  - open prop으로 표시/숨김 제어 (부모가 timing 관리)
 *  - leadingIcon 슬롯 (MosaicLogo, 이모지, SVG 등 자유)
 *  - message는 "\n" 줄바꿈 지원 (whiteSpace: pre-line)
 *  - 위치: BottomNav 위 + safe-area-inset 대응
 *  - 페이드 인/아웃 애니메이션 (200ms)
 *  - role="status" + aria-live="polite" 접근성
 *  - pointer-events-none — 토스트가 사용자 탭을 가로채지 않음
 *
 * 디자인:
 *  - 다크 반투명 배경 (rgba(26,26,26,0.92))
 *  - 흰색 텍스트, 13px / line-height 1.5
 *  - 라운드 12px, padding 12px 16px
 *  - max-width: viewport - 32px (좌우 16px 여백 확보)
 *  - bottom: env(safe-area-inset-bottom) + 80px (BottomNav 위)
 *
 * 사용처 (현재):
 *  - AppShell — 홈에서 뒤로가기 시 종료 안내 토스트
 *
 * 향후 확장 (Phase 2~):
 *  - Context API로 글로벌 toast() 호출 (예: 로그인 만료, 동기화 완료 등)
 *  - variant prop (info/success/warning/error)
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
      className="fixed left-1/2 z-50 pointer-events-none"
      style={{
        bottom: "calc(env(safe-area-inset-bottom, 0px) + 80px)",
        transform: "translateX(-50%)",
        opacity: visible ? 1 : 0,
        transition: "opacity 200ms ease-out",
      }}
    >
      <div
        className="flex items-center gap-2 rounded-xl"
        style={{
          background: "rgba(26, 26, 26, 0.92)",
          color: "#FFFFFF",
          fontSize: "13px",
          lineHeight: "1.5",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.18)",
          maxWidth: "calc(100vw - 32px)",
          padding: "12px 16px",
          whiteSpace: "pre-line",
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
