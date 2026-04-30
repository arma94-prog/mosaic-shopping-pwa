/* =========================================================
 * src/lib/externalLinkContext.jsx
 * 외부 링크 안내 모달 — 첫 클릭 시 1회만 표시 (localStorage flag).
 *
 * 사용 패턴:
 *   const navigate = useExternalNavigate();
 *   <button onClick={() => navigate("https://www.coupang.com/...")}>
 *     쿠팡으로 이동
 *   </button>
 *
 * 동작:
 *  1) 첫 호출: 모달 표시 → 사용자가 "확인" 클릭 → flag 저장 + 외부 브라우저로 이동
 *  2) 이후 호출: 모달 없이 바로 외부 브라우저로 이동
 *  3) "취소" 클릭: flag 저장 안 함, 이동 안 함
 *
 * 외부 브라우저 처리:
 *  - PWA 안에서 window.open(url, "_blank") 호출
 *  - PWA standalone 모드는 외부 URL 임베드 불가 → OS가 기본 브라우저로 자동 처리
 *  - noopener+noreferrer로 보안 + 추적 방지
 * ========================================================= */
import { createContext, useContext, useState, useCallback } from "react";
import ExternalLinkModal from "../components/ExternalLinkModal";

const FLAG_KEY = "mosaic-external-link-acked";

function _hasAcked() {
  try {
    return localStorage.getItem(FLAG_KEY) === "1";
  } catch (_) {
    return false;
  }
}
function _ack() {
  try {
    localStorage.setItem(FLAG_KEY, "1");
  } catch (_) {}
}
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
  const [pendingUrl, setPendingUrl] = useState(null);

  const navigate = useCallback((url) => {
    if (!url) return;
    if (_hasAcked()) {
      _open(url);
    } else {
      setPendingUrl(url);
    }
  }, []);

  const handleConfirm = useCallback(() => {
    if (pendingUrl) {
      _ack();
      _open(pendingUrl);
      setPendingUrl(null);
    }
  }, [pendingUrl]);

  const handleCancel = useCallback(() => {
    setPendingUrl(null);
  }, []);

  return (
    <Ctx.Provider value={{ navigate }}>
      {children}
      {pendingUrl && (
        <ExternalLinkModal
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </Ctx.Provider>
  );
}

/** 외부 링크 이동 함수. URL을 인자로 호출하면 첫 회는 모달, 이후는 바로 이동. */
export function useExternalNavigate() {
  return useContext(Ctx).navigate;
}
