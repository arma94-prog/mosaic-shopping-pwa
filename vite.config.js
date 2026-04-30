/* =========================================================
 * vite.config.js
 *
 * v3 변경 (2026-04-30, P1 — SW 자동 업데이트 보강):
 *  - 🆕 workbox.skipWaiting: true 추가.
 *    새 SW가 install 즉시 activate (waiting 단계 건너뜀).
 *  - 🆕 workbox.clientsClaim: true 추가.
 *    새 SW가 모든 열린 탭을 즉시 takeover.
 *  - 🆕 workbox.cleanupOutdatedCaches: true 추가.
 *    이전 버전 캐시 자동 정리 (저장공간 누적 방지).
 *  - 효과: 새 deploy 후 사용자 PWA 다시 열면 즉시 새 버전 동작.
 *    이전: 옛 SW가 옛 hash JS 캐시 반환 → 화이트 스크린 (사용자 catch).
 *    이후: 새 SW 즉시 takeover → 새 hash JS 정상 fetch.
 *
 * v2 변경 (2026-04-30, 사용자 catch):
 *  - description 업데이트 (메모리 #21 정체성 정합)
 *  - theme_color #0f172a → #F0EDE4 (모자이크 베이지 배경 정합)
 *  - apple-touch-icon + favicon link 추가 (includeAssets)
 * ========================================================= */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      // v2: PNG 아이콘 5개 모두 포함 (홈 화면, iOS apple-touch, favicon)
      includeAssets: [
        "icon-192.png",
        "icon-512.png",
        "apple-touch-icon.png",
        "favicon-32.png",
        "favicon-16.png",
      ],
      manifest: {
        name: "모자이크 쇼핑",
        short_name: "모자이크",
        description: "PC에서 저장한 북마크와 가격 알림을 모바일에서도 확인하세요",
        theme_color: "#F0EDE4",  // v2: 모자이크 베이지 배경 (PC 정체성 정합)
        background_color: "#FFFFFF",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        lang: "ko",
        icons: [
          {
            src: "icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        // Phase 1: 정적 자산만 SW 캐시. Supabase API 응답은 캐시 안 함.
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webmanifest}"],
        navigateFallback: "/index.html",
        // Supabase / Google OAuth 도메인은 SW가 가로채지 않도록 제외
        navigateFallbackDenylist: [/^\/api/, /supabase\.co/, /accounts\.google\.com/],
        // v3: 새 SW 즉시 activate + 모든 클라이언트 takeover.
        // 새 deploy 후 사용자 PWA 다시 열면 옛 캐시 mismatch 차단.
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
      },
      devOptions: {
        enabled: false, // 개발 중에는 SW 비활성화 (HMR 충돌 방지)
      },
    }),
  ],
  server: {
    port: 5173,
    host: true,
  },
});
