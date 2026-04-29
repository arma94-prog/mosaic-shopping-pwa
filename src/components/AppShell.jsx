/* =========================================================
 * src/components/AppShell.jsx
 * 인증 후 메인 레이아웃 — 헤더 + Outlet + BottomNav.
 *
 * 100dvh로 모바일 뷰포트 정확 매핑 (iOS Safari URL 바 변동 대응).
 * Outlet 영역만 스크롤. 헤더/바텀은 고정 (탭 전환 시 시각적 안정).
 * ========================================================= */
import { Outlet } from "react-router-dom";
import Header from "./Header";
import BottomNav from "./BottomNav";

export default function AppShell() {
  return (
    <div className="flex flex-col h-[100dvh] bg-mosaic-bg text-mosaic-text">
      <Header />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
