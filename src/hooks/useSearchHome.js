/* =========================================================
 * src/hooks/useSearchHome.js
 * Search Home 데이터 훅 — pinned keywords + search_history 결합.
 *
 * v2 변경 (2026-05, Phase 1.7 도그푸딩 — fix1):
 *  - 🐛 사용자 catch: "키워드 북마크"와 "최근 검색어"는 의미 다름.
 *    이전 v1: 합쳐서 1개 토스트 "최근 검색어가 갱신됨" → 키워드 북마크 변경도
 *      "최근 검색어"로 잘못 안내.
 *    이후 v2: 분리 호출.
 *      - pinned (키워드 북마크) 변경 → "키워드 북마크 갱신됨"
 *      - history (최근 검색어) 변경 → "최근 검색어 갱신됨"
 *  - 두 데이터가 동시 변경되는 매우 드문 케이스 → 큐 정책 "마지막 것만"으로
 *    history 토스트 표시. 화면은 둘 다 반영. 도그푸딩에서 거슬리면 그때 통합 토스트.
 *
 * v1 (제거): combined { pinned, history } 단일 토스트.
 * ========================================================= */
import useSWR from "swr";
import { supabase } from "../lib/supabase.js";
import { useAuth } from "../lib/auth";
import { useChangeNotify } from "./useChangeNotify.js";

/**
 * 핀 고정 키워드 — keywords 테이블의 사용자 row.
 * 모자이크에서 "키워드 북마크"로 칭함.
 * RLS로 본인 row만 조회됨.
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

  // v2: 분리 토스트. 의미 충돌 해소.
  // 키워드 북마크 변경 → "키워드 북마크 갱신됨"
  // 최근 검색어 변경 → "최근 검색어 갱신됨"
  // useChangeNotify는 data가 null일 때 skip + 첫 진입 발화 X — 안전.
  useChangeNotify(pinned.data, "키워드 북마크 갱신됨");
  useChangeNotify(history.data, "최근 검색어 갱신됨");

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
