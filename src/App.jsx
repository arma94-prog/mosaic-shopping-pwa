/* =========================================================
 * src/App.jsx
 * 최상위 라우터 + Provider 조립.
 *
 * v4 변경 (2026-05-01, SEO 트랙):
 *  - 🆕 react-helmet-async의 HelmetProvider로 전체 래핑.
 *    이유: About/Privacy 페이지가 자체 <Helmet>으로 페이지별
 *    <title>, <meta>, OG 태그 동적 변경. 카카오톡/페이스북 공유 시
 *    페이지별 정확한 미리보기.
 *  - Provider 위치: 최상단 (AuthProvider보다 바깥). Provider 자체는
 *    가벼우며, 모든 라우트에서 Helmet 사용 가능.
 *
 * v3 변경 (2026-05-01, 서비스 소개 페이지 추가):
 *  - 🆕 /about route 추가. AuthGate 밖 (공개).
 *    이유: 미인증 사용자 + 검색봇 + Brand Verification 검토봇이
 *    로그인 없이 접근. Privacy와 동일 정책.
 *
 * v2 변경 (2026-05-01, 트랙 E 3):
 *  - 🆕 /settings route 추가. AuthGate 안, AppShell 밖.
 *    이유: Settings 페이지가 자체 헤더 (뒤로가기) 사용. AppShell
 *    Header + BottomNav 노출 X. 사용자가 명시 요청한 디자인.
 *
 * 라우팅 정책:
 *  - /privacy, /about: 공개 (AuthGate 밖). 검토봇 + 미인증 사용자 접근 가능.
 *  - /settings: AuthGate 안, AppShell 밖. 자체 헤더 + bottom nav 없음.
 *  - 나머지: AuthGate 안 (AppShell 레이아웃).
 *  - /results 경로는 폐기 → /search로 안전 redirect (외부 어딘가 링크 잔존 대비).
 *  - / 진입 → /events로 redirect (기본 탭).
 *  - 알 수 없는 경로 → /events로 redirect.
 *
 * 의존성 (v4 추가):
 *  - react-helmet-async: ^2.0.x
 *    `npm install react-helmet-async`
 * ========================================================= */
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "./lib/auth";
import { ExternalLinkProvider } from "./lib/externalLinkContext";
import AuthGate from "./components/AuthGate";
import AppShell from "./components/AppShell";
import Events from "./pages/Events";
import Search from "./pages/Search";
import Bookmarks from "./pages/Bookmarks";
import Settings from "./pages/Settings";
import Privacy from "./pages/Privacy";
import About from "./pages/About";

export default function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <ExternalLinkProvider>
          <BrowserRouter>
            <Routes>
              {/* 공개 — Verification 검토자 + 검색봇 + 미인증 사용자 접근 가능 */}
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/about" element={<About />} />

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
                <Route
                  path="/results"
                  element={<Navigate to="/search" replace />}
                />

                {/* 알 수 없는 경로 → 기본 탭 */}
                <Route path="*" element={<Navigate to="/events" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </ExternalLinkProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}
