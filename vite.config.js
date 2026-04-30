/* =========================================================
 * vite.config.js
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
        // Phase 1: 정적 자산만 SW 캐시. Supabase API 응답은 캐시 안 함 (read-only지만 stale 위험)
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webmanifest}"],
        navigateFallback: "/index.html",
        // Supabase / Google OAuth 도메인은 SW가 가로채지 않도록 제외
        navigateFallbackDenylist: [/^\/api/, /supabase\.co/, /accounts\.google\.com/],
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
