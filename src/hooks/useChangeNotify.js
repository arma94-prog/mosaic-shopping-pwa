/* =========================================================
 * src/hooks/useChangeNotify.js
 * 데이터 변경 감지 + 토스트 발화 훅 — SWR 데이터 훅과 결합.
 *
 * Phase 1.7 신규 (2026-05):
 *  - 옵션 B 정책: 최종 렌더 결과(useMemo로 만든 categories 등) 기준 비교.
 *    원본 + settings 둘 다 변하면 합쳐진 1개 토스트.
 *  - 첫 진입(prev = undefined)은 발화 X.
 *  - 변경 감지 시 페이지별 문구 토스트 발화.
 *
 * 사용:
 *   const { categories } = useEventMalls();
 *   useChangeNotify(categories, "쇼핑몰 목록이 갱신됨");
 *
 * 페이지 전환 동작:
 *  - Events → Search 이동 시 Events unmount → prevRef 사라짐.
 *  - Events 재진입 시 prevRef = undefined로 초기화 → SWR 캐시 표시 시점에 prev 저장.
 *  - 이후 background revalidate에서 변경 감지 → 토스트.
 *  → 의도된 설계 (페이지 진입 시점부터 변경 추적).
 * ========================================================= */
import { useEffect, useRef } from "react";
import { useToast } from "../components/ToastProvider";

/**
 * 단순 deep equal — JSON 직렬화 비교.
 * mall data, keyword list 등 직렬화 가능한 데이터에 안전.
 * 함수, Date, undefined 키 포함 시 부정확 가능 — 본 컨텍스트 데이터는 모두 plain JSON 형태.
 */
function deepEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch (_) {
    return false;
  }
}

/**
 * @param {*} value - 감시할 값. null/undefined면 skip (로딩 중).
 * @param {string} message - 변경 시 표시할 토스트 문구.
 * @param {number} duration - 토스트 표시 시간. 기본 500ms (갱신 토스트).
 */
export function useChangeNotify(value, message, duration = 500) {
  const prevRef = useRef(undefined);
  const { showToast } = useToast();

  useEffect(() => {
    // 데이터 아직 안 옴 → skip
    if (value == null) return;

    const prev = prevRef.current;

    // 첫 진입 → 비교 X, prev만 저장.
    // SWR 캐시 hit + revalidate가 같은 데이터 반환 시에도 ref가 같아 useEffect 재발동 X.
    if (prev === undefined) {
      prevRef.current = value;
      return;
    }

    // 변경 감지
    if (!deepEqual(prev, value)) {
      showToast(message, duration);
    }

    prevRef.current = value;
  }, [value, message, duration, showToast]);
}
