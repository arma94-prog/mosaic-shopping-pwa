/* =========================================================
 * src/lib/userPrefs.js
 * 로컬 사용자 설정 — localStorage 기반.
 *
 * v3 변경 (2026-05-01, 트랙 E 3):
 *  - 🆕 iconCount: 5 | 6 (default: 6).
 *    카테고리당 한 화면에 표시할 아이콘 갯수.
 *    초과 시 가로 스와이프 (CSS scroll-snap mandatory).
 *
 * Phase 1 (PWA local only):
 *  - iconSize: "small" | "medium" | "large"
 *  - showMallName: boolean
 *  - showCategoryName: boolean (default: true)
 *  - iconCount: 5 | 6 (default: 6) ⭐ v3
 * ========================================================= */
import { useEffect, useState } from "react";

const STORAGE_KEY = "ms_user_prefs";
const EVENT_NAME = "mosaic-prefs-change";

const DEFAULTS = {
  iconSize: "medium",
  showMallName: false,
  showCategoryName: true,
  iconCount: 6, // v3: 디폴트 6개
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

export function formatMallName(name) {
  if (!name) return "";
  const trimmed = String(name).trim();
  if (!trimmed) return "";
  const firstWord = trimmed.split(/\s+/)[0];
  if (firstWord.length <= 4) return firstWord;
  return firstWord.slice(0, 4) + "..";
}
