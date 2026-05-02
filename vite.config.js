/* =========================================================
 * vite.config.js
 *
 * v5 변경 (2026-05, Phase 1.7 SW 강화):
 *  - 🆕 workbox.runtimeCaching 추가 — 외부 도메인 (GitHub Pages) 자산 캐싱.
 *    이전 v4: GitHub Pages max-age=600 (10분)에 의존 → 메모리 압박/캐시 만료 시 재 fetch.
 *    이후 v5: SW가 강제 캐시 → 30일 (PNG) / 7일 (JSON), 브라우저 캐시 정책 무관.
 *
 *    룰 1 — mall 아이콘 PNG/이미지: CacheFirst.
 *      거의 안 바뀌므로 캐시 있으면 무조건 즉시 응답 (네트워크 안 감 → 가장 빠름).
 *      URL 기반 캐시 무효화 — mall 운영자가 파일명 바꾸면 자동 신규 fetch.
 *      maxAgeSeconds 30일 + maxEntries 200 (안전 한도).
 *
 *    룰 2 — mall 데이터 JSON: StaleWhileRevalidate.
 *      캐시 즉시 응답 + 백그라운드 갱신 (SWR 라이브러리 철학과 정합).
 *      mall 운영자가 컨텐츠 추가/수정 시 다음 진입에 반영.
 *      maxAgeSeconds 7일 + maxEntries 20.
 *
 *    cacheableResponse statuses [0, 200]:
 *      - 0 = opaque response (CORS 미통과 시). GitHub Pages는 CORS 통과하지만
 *        네트워크 fluctuation 보호 안전망.
 *
 *  - useEventMalls / useSearchMalls / useSearchMallsPrefetch 의 코드 레벨 preload는
 *    그대로 유지 — 이 fetch들이 SW 룰에 매칭되어 자동으로 캐시에 저장.
 *    "SW에 데이터가 없으면 prefetch" = 첫 진입 시 코드 preload → SW가 가로채서 캐시 저장.
 *
 * v4 (유지): theme/background_color #FAFAF7, Android maskable 아이콘 분리.
 * v3 (유지): __APP_VERSION__ define from package.json.
 *
 * 검증 방법:
 *  - dev 모드에서는 SW 비활성 (devOptions.enabled: false). `npm run dev`에서는 효과 X.
 *  - 검증: `npm run build && npm run preview` 로컬 또는 Vercel 배포 후.
 *  - DevTools → Application → Cache Storage → "mosaic-mall-icons" / "mosaic-mall-data" 확인.
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
        "icon-192-maskable.png",
        "icon-512-maskable.png",
        "apple-touch-icon.png",
        "favicon-32.png",
        "favicon-16.png",
      ],
      manifest: {
        name: "모자이크 쇼핑",
        short_name: "모자이크",
        description: "PC에서 저장한 북마크와 가격 알림을 모바일에서도 확인하세요",
        theme_color: "#FAFAF7",
        background_color: "#FAFAF7",
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
        navigateFallbackDenylist: [
          /^\/api/,
          /supabase\.co/,
          /accounts\.google\.com/,
        ],
        // v5: 외부 도메인 (GitHub Pages) 자산 SW 캐싱.
        runtimeCaching: [
          // 룰 1 — mall 아이콘 (PNG/JPG/WebP/SVG/GIF) — CacheFirst, 30일 영구.
          {
            urlPattern:
              /^https:\/\/arma94-prog\.github\.io\/mosaic-shopping\/.*\.(png|jpg|jpeg|webp|svg|gif)$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "mosaic-mall-icons",
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 30 * 24 * 60 * 60,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // 룰 2 — mall 데이터 JSON — StaleWhileRevalidate, 7일.
          {
            urlPattern:
              /^https:\/\/arma94-prog\.github\.io\/mosaic-shopping\/.*\.json$/,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "mosaic-mall-data",
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 7 * 24 * 60 * 60,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
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
