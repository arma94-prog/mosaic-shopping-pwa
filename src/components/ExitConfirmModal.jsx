/* =========================================================
 * src/components/ExitConfirmModal.jsx
 * PWA 종료 확인 모달 — 백키 시 사용자 명시 선택.
 *
 * v1 (2026-05-25):
 *  - 표준 모바일 앱 패턴 — race condition 본질 차단.
 *  - 사용자 의도 명확 (취소 / 종료 명시 버튼).
 *
 * 사용처:
 *  - AppShell — popstate handler 안에서 open=true 토글.
 *
 * 디자인:
 *  - backdrop: rgba(0,0,0,0.5)
 *  - 모달: #FFFFFF, border-radius 14, max-width 320, 중앙 정렬
 *  - 제목: 16px / 700 / #1A1A1A
 *  - 버튼: 1줄 2개 (취소 회색 / 종료 주황)
 *  - 핵심 색 hex 직접 (Tailwind 4 production purge 회피 — CLAUDE.md §7.5)
 * ========================================================= */
import { createPortal } from "react-dom";

export default function ExitConfirmModal({ open, onCancel, onConfirm }) {
  if (!open) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-modal-title"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      // backdrop 클릭 시 취소 (표준 모달 UX)
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onCancel();
        }
      }}
    >
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: 14,
          maxWidth: 320,
          width: "100%",
          padding: "24px 20px 16px",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
        }}
      >
        <h2
          id="exit-modal-title"
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: "#1A1A1A",
            margin: "0 0 24px",
            textAlign: "center",
            lineHeight: 1.5,
            letterSpacing: "-0.3px",
          }}
        >
          모자이크 쇼핑을 종료하시겠습니까?
        </h2>

        <div
          style={{
            display: "flex",
            gap: 8,
          }}
        >
          <button
            type="button"
            onClick={onCancel}
            style={{
              flex: 1,
              height: 44,
              borderRadius: 10,
              border: "1px solid #EFECE3",
              background: "#FFFFFF",
              color: "#6B6B6B",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            취소하기
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              flex: 1,
              height: 44,
              borderRadius: 10,
              border: "none",
              background: "#E8762B",
              color: "#FFFFFF",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            종료하기
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
