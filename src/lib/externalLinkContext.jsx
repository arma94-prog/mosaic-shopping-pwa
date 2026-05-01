/* =========================================================
 * src/lib/externalLinkContext.jsx
 * 외부 링크 즉시 이동 — 모달 없음.
 *
 * v2 변경 (2026-05-01, 트랙 E 3 — 사용자 catch):
 *  - 🐛 첫 클릭 시 안내 모달 제거. 즉시 외부 브라우저로 이동.
 *    이전 v1: localStorage flag로 1회만 모달 표시.
 *      → 사용자 인지로는 불필요한 마찰 (외부 이동은 자명).
 *    fix: navigate() 내부에서 모달 트리거 X, _open(url) 즉시 호출.
 *  - ExternalLinkModal import 제거. 컴포넌트 파일은 살아 있음 (향후 복원 대비).
 *  - Provider, hook signature, _open 정책 그대로 유지 (호출처 영향 X).
 *  - 기존 사용자 localStorage flag(mosaic-external-link-acked) 정리 X
 *    (영향 없음, 향후 복원 시 자연스러운 fallback).
 *
 * 호출처는 변경 X:
 *   const navigate = useExternalNavigate();
 *   navigate(url) → 즉시 새 탭 열림.
 *
 * 외부 브라우저 처리:
 *  - window.open(url, "_blank", "noopener")
 *  - PWA standalone에서 OS 기본 브라우저로 자동 위임
 *  - noopener: 탭 하이재킹 방지
 *  - noreferrer 미적용: Referer 헤더 보존 (지마켓 봇 체크 회피, 쿠팡 affiliate 추적 정확화)
 *  - PWA standalone webview 한계는 Phase 2 Capacitor에서 개선 예정 (TECH_DEBT).
 * ========================================================= */
import { createContext, useContext, useCallback } from "react";

function _open(url) {
  // noopener: 탭 하이재킹 방지 (필수 보안)
  // noreferrer 제거: Referer 헤더 정상 전달.
  //  - 일부 쇼핑몰(예: 지마켓)이 referrer 부재를 봇 패턴으로 오인하여 봇 체크 띄우는 문제 완화
  //  - 쿠팡 파트너스 affiliate 추적 정확화 (보너스)
  //  - 자체 도메인(mosaicshopping.com) referrer는 사용자 PII 노출 없음
  // PWA standalone webview 한계는 Phase 2 Capacitor 빌드에서 추가 개선 예정 (TECH_DEBT).
  window.open(url, "_blank", "noopener");
}

const Ctx = createContext({ navigate: () => {} });

export function ExternalLinkProvider({ children }) {
  // v2: 모달 상태 제거. navigate가 즉시 _open 호출.
  const navigate = useCallback((url) => {
    if (!url) return;
    _open(url);
  }, []);

  return <Ctx.Provider value={{ navigate }}>{children}</Ctx.Provider>;
}

/** 외부 링크 이동 함수. URL을 인자로 호출하면 즉시 새 탭으로 이동. */
export function useExternalNavigate() {
  return useContext(Ctx).navigate;
}
