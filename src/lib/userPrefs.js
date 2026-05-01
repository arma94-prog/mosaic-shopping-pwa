/* =========================================================
 * src/lib/userPrefs.js
 * 로컬 사용자 설정 — localStorage 기반.
 *
 * v4 변경 (2026-05-01, 트랙 E 3 — 사용자 catch):
 *  - 🐛 iconCount 디폴트 6 → 5.
 *
 * Phase 1 (PWA local only):
 *  - iconSize: "small" | "medium" | "large" (default: medium)
 *  - showMallName: boolean (default: false)
 *  - showCategoryName: boolean (default: true)
 *  - iconCount: 5 | 6 (default: 5) ⭐ v4
 * ========================================================= */
import { useEffect, useState } from "react";

const STORAGE_KEY = "ms_user_prefs";
const EVENT_NAME = "mosaic-prefs-change";

const DEFAULTS = {
  iconSize: "medium",
  showMallName: false,
  showCategoryName: true,
  iconCount: 5, // v4: 6 → 5
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
