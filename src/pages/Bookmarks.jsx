/* =========================================================
 * src/pages/Bookmarks.jsx
 * Phase 1 첫 실데이터 렌더 — bookmark_groups read.
 *
 * v0.1.1 fix: 컬럼명 정정
 *  - group_id → id (Supabase 자동 생성 UUID PK)
 *  - achieved → target_achieved
 *  - is_pinned 추가 (핀 고정 표시)
 *  - 정렬: PC 사이드패널 룰 모방 (핀 고정 → 목표 달성 → 최근 업데이트)
 *
 * Phase 1 정책:
 *  - read-only (생성/수정/삭제 X)
 *  - 가격 표시 정책: Supabase 저장값 그대로 + last_synced 표시
 *  - 다음 세션에서 그룹 클릭 → 그룹 내 bookmarks 상세로 확장
 * ========================================================= */
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase.js";

export default function Bookmarks() {
  const [state, setState] = useState({ status: "loading", groups: [], error: null });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("bookmark_groups")
        .select("id, local_id, name, is_pinned, target_price, target_achieved, position, updated_at")
        .order("is_pinned", { ascending: false })
        .order("target_achieved", { ascending: false })
        .order("updated_at", { ascending: false });
      if (cancelled) return;
      if (error) {
        setState({ status: "error", groups: [], error: error.message });
      } else {
        setState({ status: "ok", groups: data ?? [], error: null });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (state.status === "loading") {
    return <div className="p-4 text-sm text-mosaic-muted">불러오는 중...</div>;
  }

  if (state.status === "error") {
    return (
      <div className="p-4">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-700">북마크 조회 실패</p>
          <p className="mt-1 text-xs text-red-600 break-all">{state.error}</p>
        </div>
      </div>
    );
  }

  if (state.groups.length === 0) {
    return (
      <div className="p-4">
        <div className="rounded-xl border border-dashed border-mosaic-line p-8 text-center">
          <p className="text-2xl">🔖</p>
          <p className="mt-2 text-sm font-medium">아직 북마크가 없어요</p>
          <p className="mt-1 text-xs text-mosaic-muted">
            PC 확장에서 상품을 북마크하면
            <br />
            여기서 확인할 수 있어요
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-3">
      <p className="mb-3 text-xs text-mosaic-muted">
        총 {state.groups.length}개 · PC에서 자동 갱신됩니다
      </p>
      <ul className="flex flex-col gap-2">
        {state.groups.map((g) => (
          <li
            key={g.id}
            className="rounded-xl border border-mosaic-line bg-mosaic-surface p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  {g.is_pinned && (
                    <span className="text-xs" title="핀 고정">📌</span>
                  )}
                  <p className="truncate text-sm font-medium">
                    {g.name || "(이름 없음)"}
                  </p>
                </div>
                {g.target_price ? (
                  <p className="mt-1 text-xs text-mosaic-muted">
                    목표가 {Number(g.target_price).toLocaleString()}원
                    {g.target_achieved && (
                      <span className="ml-1.5 rounded bg-mosaic-accent-soft px-1.5 py-0.5 text-[10px] font-medium text-mosaic-accent">
                        달성
                      </span>
                    )}
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-mosaic-muted">목표가 미설정</p>
                )}
              </div>
              <span className="shrink-0 text-xs text-mosaic-muted">
                {formatRelative(g.updated_at)}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function formatRelative(iso) {
  if (!iso) return "";
  const ts = new Date(iso).getTime();
  if (Number.isNaN(ts)) return "";
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "방금";
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}일 전`;
  return new Date(iso).toLocaleDateString("ko-KR");
}
