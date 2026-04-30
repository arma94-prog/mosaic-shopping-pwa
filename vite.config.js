/* =========================================================
 * vite.config.js
 *
 * v3 변경 (2026-04-30, 트랙 E):
 *  - 🆕 package.json version → __APP_VERSION__ define 주입.
 *    analytics.js에서 app_version 속성으로 사용 (PC와 정합).
 *
 * v2 변경: theme_color #F0EDE4, PNG 5종 includeAssets, manifest 업데이트.
 * ========================================================= */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import { readFileSync } from "fs";

// package.json version 자동 주입 (build/dev 시 한 번 읽음)
const pkg = JSON.parse(readFileSync("./package.json", "utf-8"));

export default defineConfig({
  define: {
    // analytics.js에서 사용. JSON.stringify로 감싸서 문자열 리터럴 주입.
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
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
        theme_color: "#F0EDE4",
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
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webmanifest}"],
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/api/, /supabase\.co/, /accounts\.google\.com/],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  server: {
    port: 5173,
    host: true,
  },
});
