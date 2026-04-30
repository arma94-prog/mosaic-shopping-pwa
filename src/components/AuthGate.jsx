/* =========================================================
 * src/components/AuthGate.jsx
 * 인증 게이트
 *
 * v5 변경 (2026-04-30, 사용자 catch — 로딩 아이콘 제거):
 *  - 🐛 LoadingScreen 컴포넌트 호출 제거.
 *  - 🆕 단순 그레이톤 텍스트 "모자이크 쇼핑 로딩중" 인라인.
 *  - 사용자 결정: "앱실행시 아이콘이 뜨는데, 아예 빼는건 어때? 그냥 그레이톤, 15pt".
 *  - LoadingScreen 컴포넌트 자체는 보존 (다른 곳 사용 가능성).
 *
 * v4 변경 (2026-04-30): LOADING_GRACE_MS 200 → 400.
 * v3 변경 (2026-04-30): 첫 200ms LoadingScreen 표시 안 함 (깜빡임 fix).
 * v2 변경 (2026-04-30): 쇼핑백 이모지 → 모자이크 격자 SVG.
 *
 * - 로딩 중 (400ms 넘음): 그레이톤 텍스트
 * - 로딩 중 (400ms 이내): 빈 배경 (mosaic-bg)
 * - 미인증: Google 로그인 화면
 * - 인증됨: children 렌더
 * ========================================================= */
import { useState, useEffect } from "react";
import { useAuth } from "../lib/auth.jsx";
import MosaicLogo from "./MosaicLogo.jsx";

// v4: 200 → 400. 깜빡임 방지 임계값.
const LOADING_GRACE_MS = 400;

export default function AuthGate({ children }) {
  const { session, loading, signInWithGoogle } = useAuth();
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState(null);
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    if (!loading) {
      setShowLoading(false);
      return;
    }
    const timer = setTimeout(() => {
      setShowLoading(true);
    }, LOADING_GRACE_MS);
    return () => clearTimeout(timer);
  }, [loading]);

  if (loading) {
    if (showLoading) {
      // v5: LoadingScreen 대신 단순 그레이톤 텍스트.
      return (
        <div className="flex h-full items-center justify-center bg-mosaic-bg">
          <p
            style={{
              fontSize: "15px",
              color: "#A8A699",
              fontWeight: 400,
            }}
          >
            모자이크 쇼핑 로딩중
          </p>
        </div>
      );
    }
    // 400ms 이내: 빈 배경 (mosaic-bg). 사용자 인지 X.
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
      // 리다이렉트 발생 → 이 컴포넌트는 곧 unmount됨
    } catch (e) {
      setSigningIn(false);
      setError(e?.message ?? "로그인 실패");
    }
  }

  return (
    <div className="flex h-full flex-col items-center justify-center px-6 safe-top safe-bottom">
      <div className="flex flex-1 flex-col items-center justify-center gap-6">
        {/* v2: 모자이크 격자 SVG (PC 환경설정 정체성). 검은 배경 박스 제거 — 모자이크 자체가 정체성. */}
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
