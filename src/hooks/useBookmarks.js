/* =========================================================
 * src/hooks/useBookmarks.js
 * 북마크 페이지 데이터 훅 — bookmark_groups + bookmarks 조인 SWR.
 *
 * Phase 1.7 신규 (2026-05):
 *  - 사용자 통찰: 가격은 6시간 주기 갱신 → 5분 전/1시간 전 fetch 결과 동일.
 *    SWR 캐시 stale risk = 사실상 0. 가격 신뢰 정책 위반 아님.
 *  - 캐시 hit 시 즉시 표시 → 다른 페이지(Events/Search)와 UX 일관성.
 *  - cache key에 user.id 포함 → 계정 전환 자동 격리.
 *  - 변경 감지 시 "북마크 갱신됨" 토스트.
 *
 * 주의:
 *  - last_price_check_at 필드는 PC가 6시간마다 갱신 → 가격 미변동에도 토스트 발화 가능.
 *    도그푸딩 후 노이즈로 판단되면 변경 감지에서 해당 필드 마스킹 fix.
 *
 * 반환:
 *   data:      raw response (undefined = 로딩 중, [] = 북마크 없음)
 *   groups:    페이지 사용 편의 (data ?? [])
 *   isLoading: 첫 로드 중 (캐시 hit 시 false)
 *   error:     SWR 에러
 * ========================================================= */
import useSWR from "swr";
import { supabase } from "../lib/supabase.js";
import { useAuth } from "../lib/auth";
import { useChangeNotify } from "./useChangeNotify.js";

async function fetchBookmarks() {
  const { data, error } = await supabase
    .from("bookmark_groups")
    .select(`
      id,
      local_id,
      name,
      is_pinned,
      target_price,
      target_achieved,
      position,
      updated_at,
      bookmarks (
        id,
        title,
        url,
        mall_id,
        mall_name,
        current_price,
        initial_price,
        lowest_price,
        last_price_check_at,
        last_check_status,
        updated_at,
        position,
        created_at
      )
    `)
    .order("is_pinned", { ascending: false })
    .order("target_achieved", { ascending: false })
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export function useBookmarks() {
  const { user } = useAuth();
  const userId = user?.id;
  const key = userId ? `bookmarks:${userId}` : null;

  const { data, error, isLoading } = useSWR(key, fetchBookmarks);

  // 변경 감지 — data 도착 후 변경 시마다 발동.
  // last_price_check_at 6시간 갱신 노이즈 가능성 — 도그푸딩 후 판단.
  useChangeNotify(data, "북마크 갱신됨");

  return {
    data,                 // 원본 — analytics ref 가드용
    groups: data ?? [],   // 페이지 렌더 편의
    isLoading,
    error,
  };
}
