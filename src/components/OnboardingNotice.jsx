/* =========================================================
 * src/components/OnboardingNotice.jsx
 * 온보딩 안내 박스 — "★ 안내해 드립니다" + message.
 *
 * v1 (2026-05-25):
 *  - 단일 진실 — 북마크 빈 상태 + 검색 빈 상태에서 공용 사용.
 *  - message prop으로 본문 받음 (string or ReactNode).
 *  - style prop으로 호출자가 위치(mt-auto 등) override 가능.
 *
 * 사용처:
 *  - BookmarkEmptyOnboarding (북마크 페이지 빈 상태)
 *  - Search.jsx (검색 페이지 history 비었을 때)
 *
 * 디자인 (mockup `docs/mockups/bookmark-empty-onboarding.html` 정합):
 *  - 배경: #F0EEE7
 *  - 본문 색: #523E2F (브라운)
 *  - head 색: #9F7D5B
 *  - border-radius: 12
 *  - padding: 14 16
 * ========================================================= */

const TEXT = "#523E2F";
const NOTICE_HEAD = "#9F7D5B";
const NOTICE_BG = "#F0EEE7";

export default function OnboardingNotice({ message, style }) {
  return (
    <div
      style={{
        padding: "14px 16px",
        background: NOTICE_BG,
        borderRadius: 12,
        fontSize: 12.5,
        lineHeight: 1.6,
        color: TEXT,
        ...style,
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
      {message}
    </div>
  );
}
