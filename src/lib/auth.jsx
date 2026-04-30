/* =========================================================
 * src/lib/auth.jsx
 * 인증 컨텍스트 + 훅
 *
 * v2 변경 (2026-04-30, 사용자 catch):
 *  - 🐛 PWA standalone webview OAuth 토큰 refresh silent fail 보호.
 *    이전: refresh 실패 시 session null + UI 화이트 페이지.
 *    이후: TOKEN_REFRESHED 이벤트 + getSession 폴링으로 만료 감지 → 자동 signOut → 로그인 화면 복귀.
 *
 *  - 사용자 시나리오:
 *    1. 모바일 PWA 첫 설치 + 로그인 → 정상 작동
 *    2. 시간 지남 → 토큰 만료
 *    3. PWA standalone에서 OAuth refresh 시 webview 한계로 silent fail
 *    4. (이전) 화이트 페이지 → 사용자 쿠키 삭제 필요
 *    5. (v2) 토큰 만료 감지 → 자동 signOut → 로그인 버튼 표시 → 사용자 1번 클릭으로 회복
 *
 *  - Phase 2 Capacitor에서 자연 비활성 (App.openUrl로 OAuth 정상 작동).
 *
 * 사용:
 *   const { session, user, loading, signInWithGoogle, signOut } = useAuth();
 *
 * 흐름:
 *   1. 앱 마운트 → supabase.auth.getSession() 으로 기존 세션 복원
 *   2. onAuthStateChange 리스너 등록 → SIGNED_IN/SIGNED_OUT 자동 반영
 *   3. SIGNED_OUT 또는 토큰 만료 감지 → 로그인 화면 표시
 *   4. signInWithGoogle() → Supabase OAuth → Google → /auth/callback → 세션 저장
 * ========================================================= */
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabase.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // 1. 초기 세션 조회 (페이지 새로고침 시 localStorage에서 복원)
    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      if (error) {
        // eslint-disable-next-line no-console
        console.error("[auth] getSession error", error);
        // v2: 세션 조회 자체가 에러 → 토큰 손상 가능성 → signOut으로 정리
        if (isAuthRecoverableError(error)) {
          recoverFromAuthFailure();
          return;
        }
      }
      setSession(data?.session ?? null);
      setLoading(false);
    });

    // 2. 인증 상태 변경 구독 (로그인/로그아웃/토큰 갱신)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (!mounted) return;

      // v2: 명시적 이벤트 처리 — silent fail 방어
      if (event === "TOKEN_REFRESHED" && !newSession) {
        // refresh 시도했는데 새 세션 없음 = silent fail (PWA standalone webview 한계)
        // eslint-disable-next-line no-console
        console.warn("[auth] TOKEN_REFRESHED but no session — clearing");
        recoverFromAuthFailure();
        return;
      }

      if (event === "SIGNED_OUT") {
        setSession(null);
        return;
      }

      setSession(newSession);
    });

    // v2: 모바일 PWA standalone에서 백그라운드 토큰 만료 감지.
    // visibilitychange 이벤트 시 세션 유효성 재검증.
    const handleVisibility = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const { data, error } = await supabase.auth.getSession();
        if (!mounted) return;
        if (error && isAuthRecoverableError(error)) {
          recoverFromAuthFailure();
          return;
        }
        // 세션 자체가 사라짐 (이전엔 있었는데) → 만료
        if (!data?.session && session) {
          // eslint-disable-next-line no-console
          console.warn("[auth] session disappeared on visibility change");
          recoverFromAuthFailure();
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("[auth] visibility check error", e);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * v2: 토큰 손상/만료 시 정리 액션.
   * localStorage의 mosaic-pwa-auth 키를 직접 삭제 + signOut 호출.
   * 이후 onAuthStateChange의 SIGNED_OUT 이벤트로 session=null 반영 → 로그인 화면 표시.
   */
  async function recoverFromAuthFailure() {
    try {
      // localStorage 직접 삭제 (signOut이 실패해도 안전망)
      try {
        window.localStorage.removeItem("mosaic-pwa-auth");
      } catch (_) {
        /* private mode 등 무시 */
      }
      await supabase.auth.signOut();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("[auth] recoverFromAuthFailure error", e);
    } finally {
      setSession(null);
      setLoading(false);
    }
  }

  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });
    if (error) {
      // eslint-disable-next-line no-console
      console.error("[auth] signInWithGoogle error", error);
      throw error;
    }
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      // eslint-disable-next-line no-console
      console.error("[auth] signOut error", error);
      throw error;
    }
  }

  const value = {
    session,
    user: session?.user ?? null,
    loading,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Supabase auth 에러 중 토큰 손상/만료에 해당하는 케이스 판별.
 * 이 종류 에러는 자동 signOut + 로그인 화면 복귀로 해결.
 */
function isAuthRecoverableError(error) {
  if (!error) return false;
  const message = (error.message || "").toLowerCase();
  const status = error.status || error.code;
  return (
    message.includes("invalid refresh token") ||
    message.includes("refresh token not found") ||
    message.includes("jwt") ||
    message.includes("expired") ||
    status === 401 ||
    status === 403
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}
