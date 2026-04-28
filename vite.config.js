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
      includeAssets: ["favicon.svg", "icon-192.png", "icon-512.png"],
      manifest: {
        name: "모자이크 쇼핑",
        short_name: "모자이크",
        description: "쇼핑 통합 검색 + 가격 추적 + 북마크",
        theme_color: "#0f172a",
        background_color: "#ffffff",
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
