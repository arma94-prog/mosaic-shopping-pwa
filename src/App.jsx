/* =========================================================
 * src/App.jsx
 * 라우터 + 인증 게이트 통합
 * ========================================================= */
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./lib/auth.jsx";
import AuthGate from "./components/AuthGate.jsx";
import AppShell from "./components/AppShell.jsx";
import Events from "./pages/Events.jsx";
import Search from "./pages/Search.jsx";
import Results from "./pages/Results.jsx";
import Bookmarks from "./pages/Bookmarks.jsx";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
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
      </BrowserRouter>
    </AuthProvider>
  );
}
