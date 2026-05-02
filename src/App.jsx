/* =========================================================
 * src/App.jsx
 * 최상위 라우터 + Provider 조립.
 *
 * v5 변경 (2026-05, Phase 1.7 — SWR + Toast 도입):
 *  - 🆕 SWRConfig 추가 — Stale-While-Revalidate 패턴 + localStorage hydrate.
 *    위치: AuthProvider 안쪽, ToastProvider 바깥. 모든 SWR 훅 적용 범위.
 *  - 🆕 ToastProvider 추가 — 갱신 알림 + 피드백 결과 토스트 통합.
 *    위치: SWRConfig 안쪽 — 향후 SWR 변경 토스트 발화 가능.
 *
 * v4 (유지): HelmetProvider — 페이지별 SEO 메타.
 * v3 (유지): /about route 추가.
 * v2 (유지): /settings route 추가 (AppShell 밖).
 *
 * Provider 순서 (바깥 → 안):
 *   HelmetProvider (SEO)
 *   └ AuthProvider (인증 상태)
 *     └ SWRConfig (데이터 캐시)               🆕 v5
 *       └ ToastProvider (토스트 큐)          🆕 v5
 *         └ ExternalLinkProvider (외부 링크)
 *           └ BrowserRouter (라우팅)
 *
 * 의존성 (v5 추가):
 *  - swr: ^2.2.5
 *    `npm install swr` 사전 실행 필요.
 * ========================================================= */
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { SWRConfig } from "swr";
import { AuthProvider } from "./lib/auth";
import { swrConfigValue } from "./lib/swrConfig";
import { ExternalLinkProvider } from "./lib/externalLinkContext";
import { ToastProvider } from "./components/ToastProvider";
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
        <SWRConfig value={swrConfigValue}>
          <ToastProvider>
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
          </ToastProvider>
        </SWRConfig>
      </AuthProvider>
    </HelmetProvider>
  );
}
