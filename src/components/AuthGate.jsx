/* =========================================================
 * src/components/AuthGate.jsx
 * 인증 게이트
 *
 * v13 변경 (2026-05-01, 푸터 링크 확장):
 *  - 🆕 푸터에 "모자이크 쇼핑 소개" 링크 추가 (`/about`).
 *    효과: (1) 도메인 SEO 시드 (소개 페이지로 검색 노출),
 *    (2) Brand Verification 보강 (서비스 정체성 페이지 명확화),
 *    (3) 미인증 사용자 정보 접근성↑.
 *  - 레이아웃: "모자이크 쇼핑 소개 | 개인정보처리방침" 한 줄 배치.
 *    순서: 서비스 소개 먼저 → 약관 다음 (자연스러운 인지 흐름).
 *    구분자(|)는 text-mosaic-line 색상으로 자연스럽게.
 *  - v12에서 추가했던 랜딩 콘텐츠(헤드라인+기능카드)는 채택 안 함 — 사용자 의도가
 *    "내용 추가 X, 링크만"이었으므로 v11 디자인 그대로 유지.
 *
 *  ⚠️ 후속 작업 필요:
 *  - /about 페이지 컴포넌트/라우트 생성 (별도 작업, /privacy와 동일 패턴 적용)
 *  - SEO 메타 태그 (index.html) — Brand Verification 통과 후 진행
 *
 * v11 변경 (2026-05-01, OAuth Brand Verification 통과):
 *  - 🆕 미인증 화면 하단에 개인정보처리방침 링크 추가 (`/privacy`).
 *    이유: Google OAuth Brand Verification 검토봇이 mosaicshopping.com/
 *    익명 진입 시 AuthGate 로그인 화면만 보고 처리방침 링크 못 찾아 거절.
 *    AuthGate 푸터에 링크 노출 → 검토봇 통과 + 일반 사용자 UX↑.
 *  - 위치: 로그인 안내문 아래 24px gap. 모자이크 톤 (text-mosaic-muted, text-xs, underline).
 *  - target 미지정 (같은 origin, _self 기본). PWA standalone에서도 자연스러운 이동.
 *
 * v10 변경 (2026-05-01, 트랙 E 3 — 사용자 catch + cohort 정확화):
 *  - 🐛 last_display_mode → use_mobile 키 변경.
 *    이전 v9: last_display_mode = "standalone" 등.
 *    문제: 단일 user_id에 PC + PWA 통합 시, PC 사용자 프로필도
 *    PWA가 setting한 standalone 값이 남음. last-write-wins 잘못 적용.
 *  - 신규 키 use_mobile = 모바일 PWA 사용 여부 + 모드 동시 표현.
 *    값 있음 = 모바일 사용자, 값 자체 = 사용 모드 (standalone/browser/...)
 *    값 미설정 = 모바일 미사용.
 *  - PC analytics.js의 use_pc_extension (peopleSetOnce, 누적)와 분리.
 *
 *  Mixpanel cohort 정의:
 *    - PWA 전용 사용자: use_mobile != null AND use_pc_extension != true
 *    - PC 전용 사용자: use_pc_extension = true AND use_mobile == null
 *    - Cross-platform: use_pc_extension = true AND use_mobile != null
 *
 *  기존 last_display_mode property는 데이터 quality 의심 (PC인데 standalone 가능).
 *  Mixpanel Lexicon에서 deprecated 표시 또는 분석 시 무시. 자동 cleanup X.
 *
 * v9 (제거): last_display_mode 키.
 * v8 (유지): useRef로 panel_session_start dedup.
 * v7 (유지): session=true 시 setUserId, session=null 시 clearUserId.
 * ========================================================= */
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../lib/auth.jsx";
import { analytics } from "../lib/analytics.js";
import MosaicLogo from "./MosaicLogo.jsx";

export default function AuthGate({ children }) {
  const { session, loading, signInWithGoogle } = useAuth();
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState(null);

  const lastTrackedUserIdRef = useRef(null);

  useEffect(() => {
    analytics.installGlobalErrorHandlers();
  }, []);

  useEffect(() => {
    if (!session) {
      analytics.clearUserId();
      lastTrackedUserIdRef.current = null;
      return;
    }

    analytics.setUserId(session.user.id);

    if (lastTrackedUserIdRef.current === session.user.id) {
      return;
    }
    lastTrackedUserIdRef.current = session.user.id;

    (async () => {
      try {
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

        // v10: use_mobile — PWA 사용 여부 + 모드 동시 표현.
        // 값 있음 = 모바일 사용자, 값 자체 = 사용 모드.
        await analytics.peopleSet({
          ...analytics.getCurrentStateProps(),
          last_active_date: analytics.formatLocalYmd(),
          use_mobile: analytics.detectDisplayMode(),
        });

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
        <div className="mt-6 flex items-center justify-center gap-3 text-xs text-mosaic-muted">
          <a
            href="/about"
            className="underline hover:text-mosaic-ink"
          >
            모자이크 쇼핑 소개
          </a>
          <span aria-hidden="true" className="text-mosaic-line">|</span>
          <a
            href="/privacy"
            className="underline hover:text-mosaic-ink"
          >
            개인정보처리방침
          </a>
        </div>
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
