/* =========================================================
 * src/hooks/useBookmarks.js
 * 북마크 페이지 데이터 훅 — bookmark_groups + bookmarks 조인 SWR.
 *
 * v2 변경 (2026-05, Phase 1.7 도그푸딩 — fix1):
 *  - 🐛 사용자 catch: 가격 변동 없는데도 "북마크 갱신됨" 토스트가 계속 뜸.
 *    원인: PC가 6시간마다 가격 체크 → last_price_check_at + updated_at 자동 갱신.
 *    deep equal 비교에서 시점 메타데이터만 변경되어도 "변경"으로 잡힘.
 *  - 🆕 변경 감지에서 시점 메타데이터 마스킹:
 *      - groups 레벨: updated_at 마스킹.
 *      - bookmarks 레벨: last_price_check_at + updated_at 마스킹.
 *  - 🆕 토스트 문구: "북마크 갱신됨" → "상품 북마크 갱신됨"
 *    (Search Home의 "키워드 북마크"와 의미 충돌 해소).
 *
 * 마스킹 후 진짜 변경 감지되는 시그널:
 *  - 그룹: name, is_pinned, target_price, target_achieved, position, 새 그룹 추가/삭제
 *  - 북마크: title, url, mall, current_price, initial_price, lowest_price,
 *           last_check_status, position, 새 북마크 추가/삭제
 *  → 가격 변동은 정확히 잡힘 (current_price/lowest_price/initial_price).
 *
 * v1 (제거): 마스킹 X, 토스트 "북마크 갱신됨".
 * ========================================================= */
import { useMemo } from "react";
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

  // v2: 변경 감지용 데이터 — 시점 메타데이터 제거.
  // PC 6시간 가격 체크가 가격 미변동에도 last_price_check_at/updated_at만 갱신 → 노이즈.
  // 실제 가격(current_price 등) + 그룹 정보는 그대로 비교되어 진짜 변경만 토스트.
  const dataForCompare = useMemo(() => {
    if (!data) return null;
    return data.map((g) => {
      // eslint-disable-next-line no-unused-vars
      const { updated_at: _gUpdated, ...groupRest } = g;
      return {
        ...groupRest,
        bookmarks: (g.bookmarks || []).map((bm) => {
          // eslint-disable-next-line no-unused-vars
          const { last_price_check_at: _t, updated_at: _u, ...bmRest } = bm;
          return bmRest;
        }),
      };
    });
  }, [data]);

  useChangeNotify(dataForCompare, "상품 북마크 갱신됨");

  return {
    data,                 // 원본 — analytics ref 가드용 + 페이지 렌더용
    groups: data ?? [],
    isLoading,
    error,
  };
}
