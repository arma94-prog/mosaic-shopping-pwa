/* =========================================================
 * src/lib/feedback.js
 * 오류 제보 + 사업 제휴 발송 — Google Apps Script Web App.
 *
 * v1 신규 (2026-05-01, 트랙 E 3):
 *  - PC sidepanel.js와 동일 REPORT_URL 호출.
 *  - body: { subject, body } JSON. Content-Type: text/plain (CORS 회피).
 *  - meta: PWA 정합 — version + UA. bmCount/mode 생략 (PWA 단순화).
 *
 * 사용:
 *   await sendFeedback({ category, label, content });
 *   throws on network failure.
 * ========================================================= */

const REPORT_URL =
  "https://script.google.com/macros/s/AKfycbwmci68UYC1BVgWkI69FU-xSi5fyY4dN2oDUxZqiaX7RUbeUbLnn8VuSC8flWEZmmwwGg/exec";

const PWA_VERSION = "0.4.0"; // PWA 버전. 빌드 시 vite.config.js define으로 주입 가능 (Phase 2).

function getMetaInfo() {
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const chromeMatch = ua.match(/Chrome\/[\d.]+/);
  const chromeVer = chromeMatch ? chromeMatch[0] : "Unknown";
  const osMatch = ua.match(/\(([^)]+)\)/);
  const os = osMatch ? osMatch[1].split(";")[0].trim() : "Unknown";
  return `v${PWA_VERSION} (PWA) · ${chromeVer} · ${os}`;
}

/**
 * 오류 제보 또는 사업 제휴 발송.
 * @param {object} params
 * @param {"report"|"partner"} params.category
 * @param {string} params.label - 카테고리 옵션 라벨 (e.g. "깨진 링크 / 페이지 오류")
 * @param {string} params.content - 본문 텍스트
 */
export async function sendFeedback({ category, label, content }) {
  const subject =
    category === "partner"
      ? `[모자이크 쇼핑 사업제휴 · ${label}]`
      : `[모자이크 쇼핑 ${label}] v${PWA_VERSION} (PWA)`;
  const body = content + "\n\n---\n" + getMetaInfo();

  await fetch(REPORT_URL, {
    method: "POST",
    body: JSON.stringify({ subject, body }),
    headers: { "Content-Type": "text/plain" },
  });
}

export const REPORT_OPTIONS = [
  { value: "broken", label: "깨진 링크 / 페이지 오류" },
  { value: "price", label: "가격 추출 오류" },
  { value: "feature", label: "기능 제안" },
  { value: "other", label: "기타" },
];

export const PARTNER_OPTIONS = [
  { value: "affiliate", label: "제휴 마케팅 / 어필리에이트" },
  { value: "api", label: "API 연동" },
  { value: "ad", label: "광고 / 프로모션" },
  { value: "other", label: "기타" },
];
