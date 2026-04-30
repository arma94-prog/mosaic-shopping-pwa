/* =========================================================
 * src/components/AppShell.jsx
 * 인증된 사용자용 메인 레이아웃
 *  - 상단: 미니 헤더 (모자이크 로고 + 페이지 + 로그아웃)
 *  - 중간: <Outlet /> 스크롤 영역
 *  - 하단: BottomNav 고정
 *
 * v2 변경 (2026-04-30, 사용자 catch — 캡쳐 image 2 정합):
 *  - 🆕 헤더 좌측에 모자이크 작은 로고 추가 (정체성 일관)
 *  - 🐛 라벨 "/events" → "이벤트" → "핫딜 모음" (BottomNav + 페이지 일관)
 * ========================================================= */
import { Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../lib/auth.jsx";
import BottomNav from "./BottomNav.jsx";
import MosaicLogo from "./MosaicLogo.jsx";

const TITLES = {
  "/events": "핫딜 모음",
  "/search": "검색",
  "/results": "검색 결과",
  "/bookmarks": "북마크",
};

export default function AppShell() {
  const { user, signOut } = useAuth();
  const { pathname } = useLocation();
  const title = TITLES[pathname] ?? "모자이크 쇼핑";

  async function handleSignOut() {
    if (!confirm("로그아웃하시겠어요?")) return;
    try {
      await signOut();
    } catch {
      alert("로그아웃 실패. 다시 시도해주세요.");
    }
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b border-mosaic-line bg-mosaic-surface px-4 py-3 safe-top">
        {/* v2: 모자이크 로고 + 페이지 타이틀 (캡쳐 image 2 정합) */}
        <div className="flex items-center gap-2">
          <MosaicLogo size={28} />
          <h1 className="text-base font-semibold tracking-tight">{title}</h1>
        </div>
        <button
          onClick={handleSignOut}
          className="rounded-md px-2 py-1 text-xs text-mosaic-muted active:bg-mosaic-line/50"
          title={user?.email ?? ""}
        >
          로그아웃
        </button>
      </header>
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
