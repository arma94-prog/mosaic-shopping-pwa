/* =========================================================
 * src/App.jsx
 * 라우터 + 인증 게이트 통합
 * - /privacy 는 공개 라우트 (AuthGate 바깥)
 * - 그 외 라우트는 AuthGate + AppShell 보호
 * ========================================================= */
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";
import { AuthProvider } from "./lib/auth.jsx";
import AuthGate from "./components/AuthGate.jsx";
import AppShell from "./components/AppShell.jsx";
import Events from "./pages/Events.jsx";
import Search from "./pages/Search.jsx";
import Results from "./pages/Results.jsx";
import Bookmarks from "./pages/Bookmarks.jsx";
import Privacy from "./pages/Privacy.jsx";

/**
 * AuthGate 를 layout route 형태로 감싸서, 자식 라우트들에만 인증을 강제한다.
 * `<Outlet />` 위치에 자식 라우트 element 가 렌더된다.
 */
function ProtectedRoutes() {
  return (
    <AuthGate>
      <Outlet />
    </AuthGate>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ── 공개 라우트 (인증 불필요) ── */}
          {/* Google OAuth verification 검토자도 비로그인 상태로 접근하므로
              /privacy 는 반드시 AuthGate 바깥에 있어야 한다. */}
          <Route path="/privacy" element={<Privacy />} />

          {/* ── 인증 보호 라우트 ── */}
          <Route element={<ProtectedRoutes />}>
            <Route element={<AppShell />}>
              <Route path="/events" element={<Events />} />
              <Route path="/search" element={<Search />} />
              <Route path="/results" element={<Results />} />
              <Route path="/bookmarks" element={<Bookmarks />} />
              <Route path="/" element={<Navigate to="/bookmarks" replace />} />
              <Route path="*" element={<Navigate to="/bookmarks" replace />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
