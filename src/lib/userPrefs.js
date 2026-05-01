/* =========================================================
 * src/lib/userPrefs.js
 * 로컬 사용자 설정 — localStorage 기반.
 *
 * Phase 1 (PWA local only):
 *  - iconSize: "small" | "medium" | "large" (default: medium)
 *  - showMallName: true | false (default: false)
 *  - 향후 Phase 2에서 user_settings 테이블과 통합 가능.
 *
 * 변경 시 'mosaic-prefs-change' custom event dispatch →
 * 구독 컴포넌트가 즉시 re-render. localStorage는 cross-tab 외에는
 * 자동 이벤트 발생 안 하므로 수동 dispatch 필요.
 * ========================================================= */
import { useEffect, useState } from "react";

const STORAGE_KEY = "ms_user_prefs";
const EVENT_NAME = "mosaic-prefs-change";

const DEFAULTS = {
  iconSize: "medium", // small | medium | large
  showMallName: false,
};

function readPrefs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULTS, ...parsed };
  } catch (_) {
    return { ...DEFAULTS };
  }
}

function writePrefs(prefs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: prefs }));
  } catch (_) {}
}

/** 설정 hook. 변경 시 자동 저장 + 모든 구독자에게 전파. */
export function useUserPrefs() {
  const [prefs, setPrefs] = useState(readPrefs);

  useEffect(() => {
    const handler = () => setPrefs(readPrefs());
    window.addEventListener(EVENT_NAME, handler);
    // cross-tab 또는 다른 PWA window 변경 감지 (드물음)
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(EVENT_NAME, handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const update = (patch) => {
    const next = { ...readPrefs(), ...patch };
    writePrefs(next);
  };

  return [prefs, update];
}

/** 아이콘 크기 → 비율 매핑.
 *  보통 = 70% (현재 default), 작게 = 60% (-15%), 크게 = 80% (+15%). */
export function getIconSizePercent(iconSize) {
  if (iconSize === "small") return 60;
  if (iconSize === "large") return 80;
  return 70;
}
