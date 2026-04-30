/* =========================================================
 * src/components/AuthGate.jsx
 * 인증 게이트
 *
 * v7 변경 (2026-04-30, 트랙 E 2.1 — Mixpanel Simplified ID Merge):
 *  - 🆕 session=true 시 analytics.setUserId(session.user.id) 호출.
 *    이 시점부터 모든 이벤트에 $user_id 자동 첨부됨.
 *    PC에서 같은 Supabase user.id로 로그인하면 자동 통합 (Mixpanel Simplified ID Merge).
 *  - 🆕 session=null 시 analytics.clearUserId() 호출.
 *    logout 또는 처음 mount(loading) 시. 무해 (이미 없으면 noop).
 *  - 호출 순서: setUserId → peopleSetOnce → peopleSet → track. 중요.
 *    user_id 설정 후에 people 호출되어야 user.id 프로필에 정확히 매핑됨.
 *
 * v6 (유지): session=true 시 People install/state set + panel_session_start.
 * v5 (유지): 미인증 화면 MosaicLogo 96px + LoadingScreen 호출 제거.
 * ========================================================= */
import { useState, useEffect } from "react";
import { useAuth } from "../lib/auth.jsx";
import { analytics } from "../lib/analytics.js";
import MosaicLogo from "./MosaicLogo.jsx";

export default function AuthGate({ children }) {
  const { session, loading, signInWithGoogle } = useAuth();
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState(null);

  // 글로벌 에러 핸들러 (mount 시 1회)
  useEffect(() => {
    analytics.installGlobalErrorHandlers();
  }, []);

  // session 변경 시: setUserId / clearUserId + People + track
  useEffect(() => {
    if (!session) {
      // session === null (logout 또는 loading 단계). user_id 정리.
      analytics.clearUserId();
      return;
    }

    (async () => {
      try {
        // v7: setUserId 가장 먼저 — 이후 모든 이벤트/people에 $user_id 자동 첨부.
        analytics.setUserId(session.user.id);

        // $set_once: install_date, install_version (첫 진입 시만)
        const initialized = localStorage.getItem("ms_pwa_initialized");
        if (!initialized) {
          const ok = await analytics.peopleSetOnce({
            install_date: new Date().toISOString(),
            install_version:
              typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "unknown",
          });
          if (ok) {
            localStorage.setItem("ms_pwa_initialized", "true");
          }
        }

        // $set: os/locale/current_version/last_active_date (매 진입)
        await analytics.peopleSet({
          ...analytics.getCurrentStateProps(),
          last_active_date: analytics.formatLocalYmd(),
        });

        // panel_session_start 이벤트 (PC와 동일 명칭)
        analytics.track("panel_session_start", {});
      } catch (_) {}
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  if (loading) {
    return <div className="h-full bg-mosaic-bg" aria-hidden="true" />;
  }

  if (session) {
    return children;
  }

  async function handleSignIn() {
    setSigningIn(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (e) {
      setSigningIn(false);
      setError(e?.message ?? "로그인 실패");
    }
  }

  return (
    <div className="flex h-full flex-col items-center justify-center px-6 safe-top safe-bottom">
      <div className="flex flex-1 flex-col items-center justify-center gap-6">
        <MosaicLogo size={96} />
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">모자이크 쇼핑</h1>
          <p className="mt-2 text-sm text-mosaic-muted">
            PC에서 저장한 북마크와 가격 알림을
            <br />
            모바일에서도 확인하세요
          </p>
        </div>
      </div>

      <div className="w-full max-w-sm pb-8">
        <button
          onClick={handleSignIn}
          disabled={signingIn}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-mosaic-line bg-white py-4 text-base font-medium text-mosaic-ink shadow-sm transition active:scale-[0.98] disabled:opacity-60"
        >
          <GoogleIcon />
          {signingIn ? "이동 중..." : "Google로 계속하기"}
        </button>
        {error && (
          <p className="mt-3 text-center text-xs text-red-600">{error}</p>
        )}
        <p className="mt-4 text-center text-xs text-mosaic-muted">
          PC에서 이용 중인 Google 계정과 같은 계정으로 로그인하세요
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
