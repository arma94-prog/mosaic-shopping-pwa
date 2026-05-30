/* =========================================================
 * src/components/BookmarkEmptyOnboarding.jsx
 * 북마크 페이지 빈 상태 — PC 설치 + 동기화 온보딩.
 *
 * v10 (2026-05-25, 사용자 피드백):
 *  - 타이틀 2줄 bottom margin 20 → 30 (+10, step과 spacing 추가).
 *
 * v9 (2026-05-25, 사용자 피드백):
 *  - 안내 박스 message에 <br/> 줄바꿈 3줄 추가.
 *  - 타이틀 2줄 bottom margin 10 → 20 (+10, step과 spacing 추가).
 *
 * v8 (2026-05-25, 사용자 피드백):
 *  - 로고 wrap top margin 50 → 40 (-10).
 *  - 타이틀 1줄 bottom margin 10 → 5 (-5).
 *  - 타이틀 2줄 bottom margin 0 → 10 (+10, step과 spacing).
 *
 * v7 (2026-05-25, refactor):
 *  - 안내 박스 → OnboardingNotice 컴포넌트로 분리 (Search 페이지와 단일 진실).
 *  - 시각/CSS 변화 X — 본문 동일.
 *
 * v6 (2026-05-25, 사용자 피드백):
 *  - 로고 wrap bottom margin 30 → 20.
 *  - 타이틀 bottom margin 28 → 6.
 *  - step 번호 크기 -10% (26 → 23, font-size 13 → 12).
 *  - step 번호 우측 10 이동 (padding-left 30 → 40).
 *  - MosaicBookmarkLogo 갱신 — 북마크 +15% (39), strokeWidth 1.8, 위치 +5/+5.
 *
 * v5 (2026-05-25, 사용자 피드백):
 *  - 격자+북마크 합성 로고 다시 추가 (MosaicBookmarkLogo).
 *    크기 40px, 위 50 / 아래 30 margin.
 *  - 타이틀 top margin 60 → 0 (로고 wrap이 spacing 흡수).
 *  - 안내 박스 배경 #E8E2D6 → #F0EEE7.
 *
 * v4 (2026-05-25, 사용자 피드백):
 *  - step 번호 왼쪽으로 20px 이동 (padding-left 50 → 30).
 *  - 번호 ↔ 글자 간격 5 → 10.
 *  - step label font-size 13 → 15 (+2pt).
 *  - 타이틀 두 줄 분리:
 *    · 1줄 "PC에서 마음에~" 18px (+2pt) / #523E2F
 *    · 2줄 "모바일에서~" 20px (+4pt) / 주황 #E8762B
 *    · 두 줄 사이 +10 (1줄 margin-bottom).
 *
 * v3 (2026-05-25, 사용자 피드백):
 *  - 타이틀 top margin 30 → 60.
 *  - step 번호 오른쪽으로 50px 이동 (padding-left 50).
 *  - 번호 ↔ 텍스트 vertical center align (align-items: center).
 *  - 번호 ↔ 글자 간격 5px (gap 5, .body padding-left 제거).
 *
 * v2 (2026-05-25, 사용자 피드백):
 *  - 모자이크 로고 제거.
 *  - 타이틀 top margin +30px (로고 자리 흡수).
 *  - 1~4 step 상세 설명 왼쪽 padding +10 (들여쓰기 강화).
 *  - 안내 박스 배경 #E8E2D6.
 *  - 안내 박스 viewport 하단 sticky (margin-top: auto) + bottom margin 30px.
 *  - 컨테이너 flex column + min-height: 100% — AppShell main(flex-1 overflow-y-auto)
 *    안에서 컨텐츠 짧을 때 안내 박스를 viewport 하단으로 push.
 *
 * v1 (2026-05-25, Variant A 확정):
 *  - PC 온보딩 스타일 정합 (3×3 격자 로고 + 4단계 통합 list + 안내 박스).
 *
 * SoC + Tailwind 4 production purge 회피 (CLAUDE.md §7.5):
 *  - 핵심 색 hex 직접 지정.
 *  - 디자인 토큰 의존 X.
 *
 * 디자인 토큰 (mockup `docs/mockups/bookmark-empty-onboarding.html`와 정합):
 *  - 전체 폰트: #523E2F (브라운 톤)
 *  - 주황 (step 번호): #E8762B
 *  - 안내 head: #9F7D5B
 *  - 안내 배경: #E8E2D6
 * ========================================================= */

import MosaicBookmarkLogo from "./MosaicBookmarkLogo";
import OnboardingNotice from "./OnboardingNotice";

const TEXT = "#523E2F";
const ORANGE = "#E8762B";

function Step({ num, label }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10 /* v4 — 번호 ↔ 글자 간격 5 → 10 */,
        padding: "10px 0 10px 40px" /* v6 — 번호 우측 10 이동 (30 → 40) */,
      }}
    >
      <span
        style={{
          flexShrink: 0,
          width: 23 /* v6 — 번호 크기 -10% (26 → 23) */,
          height: 23,
          borderRadius: "50%",
          background: ORANGE,
          color: "#FFFFFF",
          fontSize: 12 /* v6 — font-size -10% (13 → 12) */,
          fontWeight: 700,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {num}
      </span>
      <div
        style={{
          flex: 1,
          minWidth: 0,
        }}
      >
        <div
          style={{
            fontSize: 15 /* v4 — 13 → 15 (+2pt) */,
            fontWeight: 600,
            color: TEXT,
            lineHeight: 1.5,
            letterSpacing: "-0.2px",
          }}
        >
          {label}
        </div>
      </div>
    </div>
  );
}

export default function BookmarkEmptyOnboarding() {
  return (
    <div
      style={{
        padding: "0 20px",
        color: TEXT,
        minHeight: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 로고 — v8: 위 40 (-10) / 아래 20. v0.7.2(2026-05-30, Arma): 위 40 → 30 (-10) */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          margin: "30px 0 20px",
        }}
      >
        <MosaicBookmarkLogo size={40} />
      </div>

      {/* 타이틀 — v6: bottom 28 → 6 */}
      <h2
        style={{
          textAlign: "center",
          margin: "0 0 6px",
        }}
      >
        <span
          style={{
            display: "block",
            fontSize: 18,
            fontWeight: 700,
            color: TEXT,
            lineHeight: 1.5,
            letterSpacing: "-0.3px",
            marginBottom: 5 /* v8 — 10 → 5 (-5) */,
          }}
        >
          PC에서 마음에 드는 상품 북마크하고,
        </span>
        <span
          style={{
            display: "block",
            fontSize: 20,
            fontWeight: 700,
            color: ORANGE,
            lineHeight: 1.5,
            letterSpacing: "-0.3px",
            marginBottom: 30 /* v10 — 20 → 30 (+10, step과 spacing 추가) */,
          }}
        >
          모바일에서 바로 확인하고 주문하세요.
        </span>
      </h2>

      {/* Step 1~4 — 구분선 없음 */}
      <Step num={1} label="PC에서 '크롬 웹스토어' 열기" />
      <Step num={2} label='"모자이크 쇼핑" 검색 및 설치' />
      <Step num={3} label="같은 구글 계정으로 로그인" />
      <Step num={4} label="PC와 북마크 동기화 진행" />

      {/* 안내 박스 — v7: OnboardingNotice 컴포넌트로 분리 (단일 진실) */}
      <OnboardingNotice
        style={{ marginTop: "auto", marginBottom: 30 }}
        message={
          <>
            현재 북마크 추가 기능은 PC 버전에서만 지원하고 있습니다.
            <br />
            모바일 앱에서도 자유롭게 북마크를 추가하실 수 있도록
            <br />
            현재 열심히 준비 중이니 조금만 기다려 주세요!
          </>
        }
      />
    </div>
  );
}
