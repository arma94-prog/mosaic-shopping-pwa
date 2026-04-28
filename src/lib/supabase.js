/* =========================================================
 * src/lib/supabase.js
 * Supabase 클라이언트 싱글톤
 *
 * Phase 1 정책:
 *  - PKCE flow 사용 (PWA 표준 OAuth)
 *  - 세션은 localStorage에 저장 (PWA standalone 모드에서 영속)
 *  - autoRefreshToken: true (만료 직전 자동 갱신)
 *  - persistSession: true
 * ========================================================= */
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // 개발 단계 보호용 — 빌드 시점에 환경변수가 누락되면 즉시 실패
  // eslint-disable-next-line no-console
  console.error(
    "[mosaic-pwa] Supabase 환경변수 누락. .env.local 또는 Vercel 환경변수를 확인하세요."
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    flowType: "pkce",
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: "mosaic-pwa-auth",
  },
  global: {
    headers: {
      "x-client-info": "mosaic-pwa@0.1.0",
    },
  },
});
