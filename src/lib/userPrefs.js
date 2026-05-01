/* =========================================================
 * src/lib/userPrefs.js
 * 로컬 사용자 설정 — localStorage 기반.
 *
 * v2 변경 (2026-05-01, 트랙 E 3):
 *  - 🆕 showCategoryName 설정 (default: true).
 *    끄기 시 카테고리 레이블만 숨기고 라인/여백/레이아웃은 그대로.
 *
 * Phase 1 (PWA local only):
 *  - iconSize: "small" | "medium" | "large" (default: medium)
 *  - showMallName: boolean (default: false)
 *  - showCategoryName: boolean (default: true) ⭐ v2
 *  - 향후 Phase 2에서 user_settings 테이블과 통합 가능.
 *
 * 변경 시 'mosaic-prefs-change' custom event dispatch.
 * ========================================================= */
import { useEffect, useState } from "react";

const STORAGE_KEY = "ms_user_prefs";
const EVENT_NAME = "mosaic-prefs-change";

const DEFAULTS = {
  iconSize: "medium",
  showMallName: false,
  showCategoryName: true, // v2: 디폴트 보기
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

export function useUserPrefs() {
  const [prefs, setPrefs] = useState(readPrefs);

  useEffect(() => {
    const handler = () => setPrefs(readPrefs());
    window.addEventListener(EVENT_NAME, handler);
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

export function getIconSizePercent(iconSize) {
  if (iconSize === "small") return 60;
  if (iconSize === "large") return 80;
  return 70;
}

/** 쇼핑몰 이름 표시용 가공.
 *  v2: 첫 공백까지의 앞 단어만 추출 → 4글자 초과 시 ".." 말줄임.
 *
 *  예시:
 *    "이마트 트레이더스" → "이마트"
 *    "롯데홈쇼핑몰" → "롯데홈쇼.."
 *    "GS프레시몰" → "GS프레.."
 *    "쿠팡" → "쿠팡"
 */
export function formatMallName(name) {
  if (!name) return "";
  const trimmed = String(name).trim();
  if (!trimmed) return "";
  const firstWord = trimmed.split(/\s+/)[0];
  if (firstWord.length <= 4) return firstWord;
  return firstWord.slice(0, 4) + "..";
}
