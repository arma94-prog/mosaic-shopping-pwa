/* =========================================================
 * src/lib/searchHistory.js
 * Supabase search_history 미러 (PWA → Supabase write)
 *
 * Phase B (Extension 결정 #349 add-only 정합):
 *  - 사용자 검색 시 search_history upsert.
 *  - 비로그인 silent skip (PWA는 로그인 강제라 실제 경로 X — 안전망).
 *  - fire-and-forget — 호출자는 결과 await X (UI 지연 차단).
 *  - 명시 DELETE는 PWA에 X 버튼 UI 없으므로 미구현.
 *
 * PC supabase-sync.js 정합:
 *  - 자연 키 (user_id, keyword) — on_conflict 동일.
 *  - 컬럼 — user_id / keyword / last_searched_at / position.
 *  - PWA는 position=0 고정 (가장 최근). PC download가 last_searched_at desc로 정렬해 cap.
 *
 * SoC:
 *  - 본 파일 = 메신저 (Supabase write 책임).
 *  - SearchBar.jsx = UI (입력 + submit) — 호출만.
 * ========================================================= */
import { supabase } from "./supabase.js";

const KEYWORD_MAX = 200; // PC supabase-sync.js 정합

/**
 * 사용자 검색 시 search_history upsert. 비로그인 silent skip.
 * 호출자는 fire-and-forget — UI 지연 차단 위해 await 권장 X.
 *
 * @param {string} keyword - 검색어 (trim 완료 가정, 추가 trim 안전망 포함)
 * @returns {Promise<{ok: boolean, skipped?: string, error?: string}>}
 */
export async function recordSearchHistory(keyword) {
  if (!keyword || typeof keyword !== "string") {
    return { ok: false, skipped: "empty_keyword" };
  }
  const trimmed = keyword.trim();
  if (!trimmed) return { ok: false, skipped: "empty_keyword" };

  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      // eslint-disable-next-line no-console
      console.warn("[search-history] getSession error", error);
      return { ok: false, error: error.message };
    }
    const userId = data?.session?.user?.id;
    if (!userId) {
      // PWA는 로그인 강제 — 안전망으로만 존재.
      return { ok: false, skipped: "not_logged_in" };
    }

    const payload = {
      user_id: userId,
      keyword: trimmed.slice(0, KEYWORD_MAX),
      last_searched_at: new Date().toISOString(),
      position: 0,
    };

    const { error: upsertError } = await supabase
      .from("search_history")
      .upsert(payload, { onConflict: "user_id,keyword" });

    if (upsertError) {
      // eslint-disable-next-line no-console
      console.warn("[search-history] upsert error", upsertError);
      return { ok: false, error: upsertError.message };
    }

    return { ok: true };
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("[search-history] unexpected error", e);
    return { ok: false, error: e && e.message };
  }
}
