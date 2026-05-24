/* =========================================================
 * src/components/BookmarkEmptyOnboarding.jsx
 * 북마크 페이지 빈 상태 — PC 설치 + 동기화 온보딩.
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

const TEXT = "#523E2F";
const ORANGE = "#E8762B";
const NOTICE_HEAD = "#9F7D5B";
const NOTICE_BG = "#E8E2D6";

function Step({ num, label }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "10px 0",
      }}
    >
      <span
        style={{
          flexShrink: 0,
          width: 26,
          height: 26,
          borderRadius: "50%",
          background: ORANGE,
          color: "#FFFFFF",
          fontSize: 13,
          fontWeight: 700,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          marginTop: 1,
        }}
      >
        {num}
      </span>
      <div
        style={{
          flex: 1,
          minWidth: 0,
          paddingLeft: 10 /* v2 — 상세 설명 왼쪽 margin +10 */,
        }}
      >
        <div
          style={{
            fontSize: 13,
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
      {/* 타이틀 — top margin 30px (로고 자리 흡수) */}
      <h2
        style={{
          textAlign: "center",
          fontSize: 16,
          fontWeight: 700,
          lineHeight: 1.5,
          color: TEXT,
          margin: "30px 0 28px",
          letterSpacing: "-0.3px",
        }}
      >
        PC에서 마음에 드는 상품 북마크하고,
        <br />
        모바일에서 바로 확인하고 주문하세요.
      </h2>

      {/* Step 1~4 — 구분선 없음 */}
      <Step num={1} label="PC에서 '크롬 웹스토어' 열기" />
      <Step num={2} label='"모자이크 쇼핑" 검색 및 설치' />
      <Step num={3} label="같은 구글 계정으로 로그인" />
      <Step num={4} label="PC와 북마크 동기화 진행" />

      {/* 안내 박스 — viewport 하단 sticky (mt-auto) + mb 30px */}
      <div
        style={{
          marginTop: "auto",
          marginBottom: 30,
          padding: "14px 16px",
          background: NOTICE_BG,
          borderRadius: 12,
          fontSize: 12.5,
          lineHeight: 1.6,
          color: TEXT,
        }}
      >
        <div
          style={{
            fontWeight: 700,
            color: NOTICE_HEAD,
            marginBottom: 4,
            fontSize: 12.5,
          }}
        >
          ★ 안내해 드립니다
        </div>
        현재 북마크 추가 기능은 PC 버전에서만 지원하고 있습니다. 모바일
        앱에서도 자유롭게 북마크를 추가하실 수 있도록 현재 열심히 준비 중이니
        조금만 기다려 주세요!
      </div>
    </div>
  );
}
