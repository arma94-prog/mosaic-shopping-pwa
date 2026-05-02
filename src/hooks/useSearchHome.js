/* =========================================================
 * src/hooks/useSearchHome.js
 * Search Home 데이터 훅 — pinned keywords + search_history 결합.
 *
 * Phase 1.7 신규 (2026-05):
 *  - SWR로 두 Supabase 데이터 캐시.
 *  - cache key에 user.id 포함 → 계정 전환 시 자동 분리.
 *  - 옵션 A — pinned + history 합쳐서 변경 감지. 둘 중 하나라도 변하면 1개 토스트.
 *    문구: "최근 검색어가 갱신됨" (pinned가 변해도 동일 — 사용자에게 '뭔가 갱신됨' 신호로 충분).
 *
 * 기존 Search.jsx의 query를 그대로 추출 (Promise.all 병렬 실행은 SWR이 내부에서 처리).
 *
 * 반환:
 *   pinned:  { rows, isLoading, error }
 *   history: { rows, isLoading, error }
 * ========================================================= */
import { useMemo } from "react";
import useSWR from "swr";
import { supabase } from "../lib/supabase.js";
import { useAuth } from "../lib/auth";
import { useChangeNotify } from "./useChangeNotify.js";

/**
 * 핀 고정 키워드 — keywords 테이블의 사용자 row.
 * RLS로 본인 row만 조회됨 (user_id 명시 X).
 */
async function fetchPinnedKeywords() {
  const { data, error } = await supabase
    .from("keywords")
    .select("keyword, position")
    .order("position", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

/**
 * 최근 검색 키워드 — search_history 테이블, 최근순 50개.
 * RLS로 본인 row만 조회됨.
 */
async function fetchSearchHistory() {
  const { data, error } = await supabase
    .from("search_history")
    .select("keyword, last_searched_at")
    .order("last_searched_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return data ?? [];
}

export function useSearchHome() {
  const { user } = useAuth();
  const userId = user?.id;

  const pinnedKey = userId ? `keywords-pinned:${userId}` : null;
  const historyKey = userId ? `search-history:${userId}` : null;

  const pinned = useSWR(pinnedKey, fetchPinnedKeywords);
  const history = useSWR(historyKey, fetchSearchHistory);

  // 옵션 A — pinned + history 합쳐서 1번 변경 감지.
  // 둘 다 null이면 (인증 전 또는 로딩 중) skip.
  const combined = useMemo(() => {
    if (pinned.data == null && history.data == null) return null;
    return {
      pinned: pinned.data || [],
      history: history.data || [],
    };
  }, [pinned.data, history.data]);

  useChangeNotify(combined, "최근 검색어가 갱신됨");

  return {
    pinned: {
      rows: pinned.data ?? [],
      isLoading: pinned.isLoading,
      error: pinned.error,
    },
    history: {
      rows: history.data ?? [],
      isLoading: history.isLoading,
      error: history.error,
    },
  };
}
