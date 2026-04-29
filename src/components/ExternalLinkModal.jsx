/* =========================================================
 * src/components/ExternalLinkModal.jsx
 * 외부 링크 안내 모달 — bottom sheet 스타일 (모바일 친화).
 *
 * 위치: ExternalLinkProvider가 글로벌로 렌더링.
 * 트리거: 외부 링크 첫 클릭 시 (localStorage flag로 1회만).
 *
 * 인터랙션:
 *  - "확인 (다시 보지 않기)" → flag 저장 + 외부 브라우저
 *  - "취소" → flag 저장 안 함, 모달만 닫힘
 *  - 백드롭 클릭 / ESC → 취소와 동일
 * ========================================================= */
import { useEffect } from "react";

export default function ExternalLinkModal({ onConfirm, onCancel }) {
  // ESC로 닫기
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    // 모달 열린 동안 body 스크롤 잠금
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onCancel]);

  return (
    <>
      {/* 백드롭 */}
      <div
        onClick={onCancel}
        className="fixed inset-0 z-40 bg-black/40"
        aria-hidden="true"
      />

      {/* 모달 — 모바일 bottom sheet 패턴 (작은 화면에선 하단 고정, 큰 화면에선 가운데) */}
      <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center pointer-events-none">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="external-link-title"
          className="
            pointer-events-auto
            w-full sm:max-w-sm
            bg-mosaic-surface
            rounded-t-2xl sm:rounded-2xl
            shadow-2xl
            overflow-hidden
            mx-0 sm:mx-4 mb-0 sm:mb-0
          "
        >
          <div className="px-6 py-7 text-center">
            <div
              id="external-link-title"
              className="text-base text-mosaic-text leading-relaxed"
            >
              쇼핑몰 사이트로 이동하기 위해
              <br />
              인터넷 브라우저가 열려요.
            </div>
          </div>

          <div className="flex border-t border-mosaic-line">
            <button
              onClick={onCancel}
              className="
                flex-1 py-3.5
                text-sm text-mosaic-muted
                border-r border-mosaic-line
                active:bg-mosaic-line/40
                transition-colors
              "
            >
              취소
            </button>
            <button
              onClick={onConfirm}
              className="
                flex-1 py-3.5
                text-sm font-semibold text-mosaic-accent
                active:bg-mosaic-min-bg/60
                transition-colors
              "
            >
              확인 (다시 보지 않기)
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
