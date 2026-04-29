/* =========================================================
 * src/App.jsx
 * 라우터 + 인증 게이트 통합
 * /privacy는 인증 게이트 밖에 위치 (Google OAuth verification 검토자가 로그인 없이 접근 가능)
 * ========================================================= */
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./lib/auth.jsx";
import AuthGate from "./components/AuthGate.jsx";
import AppShell from "./components/AppShell.jsx";
import Events from "./pages/Events.jsx";
import Search from "./pages/Search.jsx";
import Results from "./pages/Results.jsx";
import Bookmarks from "./pages/Bookmarks.jsx";
import Privacy from "./pages/Privacy.jsx";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ---------- 공개 라우트 (인증 불필요) ---------- */}
          <Route path="/privacy" element={<Privacy />} />

          {/* ---------- 인증 필요 라우트 ---------- */}
          <Route
            path="/*"
            element={
              <AuthGate>
                <Routes>
                  <Route element={<AppShell />}>
                    <Route path="/events" element={<Events />} />
                    <Route path="/search" element={<Search />} />
                    <Route path="/results" element={<Results />} />
                    <Route path="/bookmarks" element={<Bookmarks />} />
                    <Route path="/" element={<Navigate to="/bookmarks" replace />} />
                    <Route path="*" element={<Navigate to="/bookmarks" replace />} />
                  </Route>
                </Routes>
              </AuthGate>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
