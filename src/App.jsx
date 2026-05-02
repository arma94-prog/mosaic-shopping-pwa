/* =========================================================
 * src/App.jsx
 * 최상위 라우터 + Provider 조립.
 *
 * v6 변경 (2026-05, Phase 1.7 — PrewarmingGate 도입):
 *  - 🆕 PrewarmingGate 추가 — AuthGate 안쪽, AppShell 바깥.
 *    첫 설치 시 mall data + 아이콘 SW 캐시 prewarming 화면.
 *    캐시 있으면 즉시 통과 (사용자 못 봄).
 *  - 적용 범위: 메인 흐름(/events, /search, /bookmarks)만.
 *    /settings는 mall 아이콘 안 쓰므로 비적용.
 *
 * Provider 순서 (바깥 → 안):
 *   HelmetProvider (SEO)
 *   └ AuthProvider (인증 상태)
 *     └ SWRConfig (데이터 캐시)
 *       └ ToastProvider (토스트 큐)
 *         └ ExternalLinkProvider (외부 링크)
 *           └ BrowserRouter
 *             └ AuthGate
 *               └ PrewarmingGate                    🆕 v6
 *                 └ AppShell (Header + BottomNav)
 *
 * v5 (유지): SWRConfig + ToastProvider.
 * v4 (유지): HelmetProvider — 페이지별 SEO 메타.
 * v3 (유지): /about route 추가.
 * v2 (유지): /settings route 추가 (AppShell 밖).
 * ========================================================= */
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { SWRConfig } from "swr";
import { AuthProvider } from "./lib/auth";
import { swrConfigValue } from "./lib/swrConfig";
import { ExternalLinkProvider } from "./lib/externalLinkContext";
import { ToastProvider } from "./components/ToastProvider";
import AuthGate from "./components/AuthGate";
import PrewarmingGate from "./components/PrewarmingGate";
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

                  {/* 인증 후 자체 헤더 페이지 (AppShell 밖, prewarming 불필요) */}
                  <Route
                    path="/settings"
                    element={
                      <AuthGate>
                        <Settings />
                      </AuthGate>
                    }
                  />

                  {/* 인증 후 메인 흐름 (AppShell — Header + BottomNav)
                      v6: PrewarmingGate로 첫 설치 시 mall 캐시 prewarming */}
                  <Route
                    element={
                      <AuthGate>
                        <PrewarmingGate>
                          <AppShell />
                        </PrewarmingGate>
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
