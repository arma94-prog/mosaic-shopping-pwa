/* =========================================================
 * src/App.jsx
 * 최상위 라우터 + Provider 조립.
 *
 * 라우팅 정책:
 *  - /privacy: 공개 (AuthGate 밖). Verification 검토자가 로그인 없이 접근.
 *  - 나머지: AuthGate 안 (AppShell 레이아웃).
 *  - /results 경로는 폐기 → /search로 안전 redirect (외부 어딘가 링크 잔존 대비).
 *  - / 진입 → /events로 redirect (기본 탭).
 *  - 알 수 없는 경로 → /events로 redirect.
 *
 * Provider 중첩 순서 (중요):
 *   AuthProvider           — 세션 상태 (가장 바깥)
 *     └ ExternalLinkProvider  — 외부 링크 모달 글로벌 상태
 *         └ BrowserRouter
 *             └ Routes
 *
 * 외부 링크 Provider를 BrowserRouter 안쪽에 두지 않는 이유: 라우트 변경과
 * 무관하게 모달 상태를 유지하기 위함 (페이지 이동해도 pendingUrl 보존).
 * ========================================================= */
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./lib/auth";
import { ExternalLinkProvider } from "./lib/externalLinkContext";
import AuthGate from "./components/AuthGate";
import AppShell from "./components/AppShell";
import Events from "./pages/Events";
import Search from "./pages/Search";
import Bookmarks from "./pages/Bookmarks";
import Privacy from "./pages/Privacy";

export default function App() {
  return (
    <AuthProvider>
      <ExternalLinkProvider>
        <BrowserRouter>
          <Routes>
            {/* 공개 — Verification 검토자가 로그인 없이 접근 가능 */}
            <Route path="/privacy" element={<Privacy />} />

            {/* 인증 후 메인 흐름 */}
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
