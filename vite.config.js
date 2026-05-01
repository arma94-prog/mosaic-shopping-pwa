/* =========================================================
 * vite.config.js
 *
 * v4 변경 (2026-05-01, 트랙 E 3):
 *  - 🐛 PWA 배경색 PC 정합 — theme_color #F0EDE4 → #FAFAF7,
 *    background_color #FFFFFF → #FAFAF7. 사용자 catch.
 *    PC index.css --color-mosaic-bg와 정합. index.html meta theme-color도 동일.
 *  - 🆕 Android maskable 아이콘 분리 — icon-192-maskable.png / icon-512-maskable.png.
 *    Android 어댑터 아이콘 시스템이 자동 마스크할 때 짤리지 않도록 padding 포함된 별도 PNG.
 *    iOS는 기존 icon-192.png / icon-512.png (any purpose) 그대로 사용.
 *
 * v3 (유지): __APP_VERSION__ define from package.json.
 * v2 (제거): theme_color #F0EDE4 (트랙 C 결정 → 트랙 E 3에서 사용자 PC 정합 우선 결정으로 override).
 * ========================================================= */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import { readFileSync } from "fs";

const pkg = JSON.parse(readFileSync("./package.json", "utf-8"));

export default defineConfig({
  define: {
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
        "icon-192-maskable.png",  // v4: Android 전용
        "icon-512-maskable.png",  // v4: Android 전용
        "apple-touch-icon.png",
        "favicon-32.png",
        "favicon-16.png",
      ],
      manifest: {
        name: "모자이크 쇼핑",
        short_name: "모자이크",
        description: "PC에서 저장한 북마크와 가격 알림을 모바일에서도 확인하세요",
        // v4: PC 정합 #FAFAF7로 통일.
        theme_color: "#FAFAF7",
        background_color: "#FAFAF7",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        lang: "ko",
        icons: [
          // iOS는 any purpose만 사용 (homescreen icon이 그대로 표시됨, OS가 라운드 마스크 살짝 적용)
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
          // v4: Android 어댑터 아이콘 — maskable. 안전 영역 안에 모자이크 사각형이 위치하도록
          // 주황 배경 + padding 포함된 별도 PNG (icon-{size}-maskable.png).
          // OS가 원형/사각/뭉툭 마스크 적용해도 모자이크 사각형 짤리지 않음.
          {
            src: "icon-192-maskable.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "icon-512-maskable.png",
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
