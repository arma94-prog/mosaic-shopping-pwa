/* =========================================================
 * src/components/HamburgerMenu.jsx
 * 우측 슬라이드 메뉴 — 로그아웃 항목만 (Phase 1).
 *
 * Phase 2 추가 예정:
 *  - 환경설정 (아이콘 라벨 표시 토글, Mixpanel opt-out 등)
 *  - 이용 안내
 *  - FAQ
 *  - 데이터 삭제 (처리방침 §4.1 약속 — 연결 해제와 동일 동작)
 *
 * 기존 lib/auth.jsx의 useAuth() hook 사용. signOut 함수 호출.
 * 로그아웃 성공 시 메뉴 닫힘 (AuthProvider가 세션 변경 감지하여 LoginScreen으로 자동 이동).
 * ========================================================= */
import { useEffect } from "react";
import { useAuth } from "../lib/auth";

function CloseIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6 6l12 12M18 6l-12 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function HamburgerMenu({ onClose }) {
  const auth = useAuth();

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const handleSignOut = async () => {
    try {
      // auth.jsx의 signOut 시그니처에 따라 await만 하거나 결과 체크
      if (auth && typeof auth.signOut === "function") {
        await auth.signOut();
      }
      onClose();
    } catch (e) {
      // signOut 실패해도 메뉴는 닫음 (사용자 경험 우선)
      // eslint-disable-next-line no-console
      console.error("[mosaic-pwa] signOut error:", e);
      onClose();
    }
  };

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/40"
        aria-hidden="true"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="메뉴"
        className="
          fixed top-0 right-0 bottom-0 z-50
          w-72 max-w-[85vw]
          bg-mosaic-surface
          shadow-2xl
          flex flex-col
          safe-top safe-bottom
        "
      >
        <div className="flex items-center justify-between h-12 px-3 border-b border-mosaic-line">
          <span className="text-base font-semibold">메뉴</span>
          <button
            aria-label="닫기"
            onClick={onClose}
            className="p-2 -mr-2 text-mosaic-muted active:text-mosaic-text"
          >
            <CloseIcon />
          </button>
        </div>

        <ul className="flex-1 overflow-y-auto py-2">
          <li>
            <button
              onClick={handleSignOut}
              className="
                w-full px-4 py-3
                text-left text-sm
                text-mosaic-text
                active:bg-mosaic-line/50
                transition-colors
              "
            >
              로그아웃
            </button>
          </li>
        </ul>

        <div className="px-4 py-3 text-xs text-mosaic-muted-3 border-t border-mosaic-line">
          모자이크 쇼핑 PWA v0.1
        </div>
      </aside>
    </>
  );
}
