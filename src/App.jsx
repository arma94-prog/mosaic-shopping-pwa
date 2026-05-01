/* =========================================================
 * src/App.jsx
 * 최상위 라우터 + Provider 조립.
 *
 * v2 변경 (2026-05-01, 트랙 E 3):
 *  - 🆕 /settings route 추가. AuthGate 안, AppShell 밖.
 *    이유: Settings 페이지가 자체 헤더 (뒤로가기) 사용. AppShell
 *    Header + BottomNav 노출 X. 사용자가 명시 요청한 디자인.
 *
 * 라우팅 정책:
 *  - /privacy: 공개 (AuthGate 밖). Verification 검토자가 로그인 없이 접근.
 *  - /settings: AuthGate 안, AppShell 밖. 자체 헤더 + bottom nav 없음.
 *  - 나머지: AuthGate 안 (AppShell 레이아웃).
 *  - /results 경로는 폐기 → /search로 안전 redirect (외부 어딘가 링크 잔존 대비).
 *  - / 진입 → /events로 redirect (기본 탭).
 *  - 알 수 없는 경로 → /events로 redirect.
 * ========================================================= */
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./lib/auth";
import { ExternalLinkProvider } from "./lib/externalLinkContext";
import AuthGate from "./components/AuthGate";
import AppShell from "./components/AppShell";
import Events from "./pages/Events";
import Search from "./pages/Search";
import Bookmarks from "./pages/Bookmarks";
import Settings from "./pages/Settings";
import Privacy from "./pages/Privacy";

export default function App() {
  return (
    <AuthProvider>
      <ExternalLinkProvider>
        <BrowserRouter>
          <Routes>
            {/* 공개 — Verification 검토자가 로그인 없이 접근 가능 */}
            <Route path="/privacy" element={<Privacy />} />

            {/* 인증 후 자체 헤더 페이지 (AppShell 밖) */}
            <Route
              path="/settings"
              element={
                <AuthGate>
                  <Settings />
                </AuthGate>
              }
            />

            {/* 인증 후 메인 흐름 (AppShell — Header + BottomNav) */}
            <Route
              element={
                <AuthGate>
                  <AppShell />
                </AuthGate>
              }
            >
              <Route index element={<Navigate to="/events" replace />} />
              <Route path="/events" element={<Events />} />
              <Route path="/search" element={<Search />} />
              <Route path="/bookmarks" element={<Bookmarks />} />

              {/* 폐기된 /results 경로 안전 redirect */}
              <Route path="/results" element={<Navigate to="/search" replace />} />

              {/* 알 수 없는 경로 → 기본 탭 */}
              <Route path="*" element={<Navigate to="/events" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ExternalLinkProvider>
    </AuthProvider>
  );
}
