/* =========================================================
 * src/lib/auth.jsx
 * 인증 컨텍스트 + 훅
 *
 * 사용:
 *   const { session, user, loading, signInWithGoogle, signOut } = useAuth();
 *
 * 흐름:
 *   1. 앱 마운트 → supabase.auth.getSession() 으로 기존 세션 복원
 *   2. onAuthStateChange 리스너 등록 → SIGNED_IN/SIGNED_OUT 자동 반영
 *   3. signInWithGoogle() → Supabase OAuth → Google → /auth/callback → 세션 저장
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
      }
      setSession(data?.session ?? null);
      setLoading(false);
    });

    // 2. 인증 상태 변경 구독 (로그인/로그아웃/토큰 갱신)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!mounted) return;
      setSession(newSession);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

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

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}
