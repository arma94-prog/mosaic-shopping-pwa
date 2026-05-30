/* =========================================================
 * src/hooks/useBookmarks.js
 * 북마크 페이지 데이터 훅 — bookmark_groups + bookmarks 조인 SWR.
 *
 * v4 변경 (2026-05-30, Extension 순서 동기화 #364/#367 정합):
 *  - 그룹 .order("position") 에 nullsFirst:false 명시 (레거시 null position 맨 뒤).
 *  - 중첩 bookmarks 도 position ASC(nulls last)로 정렬 — 기존 무정렬이라 PC와 항목 순서 불일치.
 *  - 동률/null 다수 대비 created_at ASC 보조 정렬 (그룹·항목 양쪽).
 *  - Extension pull(order=position.asc.nullslast)과 동일 기준 → PC 사이드패널 순서 = PWA 순서.
 *  - 🆕 bookmarks.delivery_fee select 추가 (배송비타입 표기용 — BookmarkItem.jsx).
 *      값: N>0 유료 / 0 무료 / -1 조건부무료 / null 불명. PC가 source of truth, PWA read-only.
 *
 * v3 변경 (2026-05-25, dogfood — 신규 북마크가 맨 아래 issue fix):
 *  - 🐛 사용자 catch: 신규 북마크 그룹이 PWA에서 맨 아래로. 사이드패널은 정상.
 *  - 원인 (3-tier):
 *      1. Supabase set_updated_at 트리거 — UPSERT마다 NEW.updated_at=NOW() 덮어쓰기
 *      2. PC supabase-sync.js가 가격 cycle 4시간마다 모든 그룹 UPSERT → updated_at 동시 갱신
 *      3. 신규 그룹은 가격 cycle 미참여 → updated_at이 옛 그룹들보다 더 옛
 *  - 🆕 .order("updated_at", DESC) → .order("position", ASC)
 *      PC bookmark-store.js saveGroup L153이 신규 활동 그룹을 bm_idx 맨 앞 이동.
 *      supabase-sync.js L561이 bm_idx 순서를 position 컬럼으로 미러.
 *      → position ASC = 사이드패널 순서 = Arma 의도.
 *
 * v2 (2026-05, Phase 1.7 도그푸딩 — fix1):
 *  - 변경 감지에서 시점 메타데이터 마스킹 (groups.updated_at, bookmarks.last_price_check_at/updated_at).
 *  - 토스트 문구: "북마크 갱신됨" → "상품 북마크 갱신됨".
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
        delivery_fee,
        last_price_check_at,
        last_check_status,
        updated_at,
        position,
        created_at
      )
    `)
    .order("is_pinned", { ascending: false })
    .order("target_achieved", { ascending: false })
    .order("position", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true })
    .order("position", { ascending: true, nullsFirst: false, referencedTable: "bookmarks" })
    .order("created_at", { ascending: true, referencedTable: "bookmarks" });

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
