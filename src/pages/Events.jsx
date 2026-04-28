/* =========================================================
 * src/pages/Events.jsx
 * Phase 1 — 골격. 인증 + RLS read 검증용 smoke test 포함.
 *  - 로그인 사용자의 bookmark_groups 개수 조회
 *  - 정상 동작하면 인증 + Supabase 클라이언트 + RLS 모두 OK라는 신호
 *
 * 다음 세션에서 실제 이벤트 콘텐츠 (events.json fetch + 카드 list)로 교체.
 * ========================================================= */
import { useEffect, useState } from "react";
import { useAuth } from "../lib/auth.jsx";
import { supabase } from "../lib/supabase.js";

export default function Events() {
  const { user } = useAuth();
  const [smokeTest, setSmokeTest] = useState({ status: "loading", data: null, error: null });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { count, error } = await supabase
        .from("bookmark_groups")
        .select("*", { count: "exact", head: true });
      if (cancelled) return;
      if (error) {
        setSmokeTest({ status: "error", data: null, error: error.message });
      } else {
        setSmokeTest({ status: "ok", data: count, error: null });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="p-4">
      <div className="rounded-xl border border-mosaic-line bg-mosaic-surface p-4">
        <p className="text-sm font-medium">로그인 확인됨</p>
        <p className="mt-1 truncate text-xs text-mosaic-muted">{user?.email}</p>
      </div>

      <section className="mt-4 rounded-xl border border-mosaic-line bg-mosaic-surface p-4">
        <h2 className="text-sm font-semibold">RLS read smoke test</h2>
        <p className="mt-1 text-xs text-mosaic-muted">
          내 <code className="rounded bg-mosaic-line/50 px-1">bookmark_groups</code> 개수 조회
        </p>
        <div className="mt-3">
          {smokeTest.status === "loading" && (
            <p className="text-sm text-mosaic-muted">조회 중...</p>
          )}
          {smokeTest.status === "ok" && (
            <p className="text-sm">
              <span className="font-semibold text-mosaic-accent">{smokeTest.data}</span>개 — 정상
            </p>
          )}
          {smokeTest.status === "error" && (
            <p className="text-sm text-red-600">에러: {smokeTest.error}</p>
          )}
        </div>
      </section>

      <section className="mt-4 rounded-xl border border-dashed border-mosaic-line bg-transparent p-4">
        <p className="text-sm font-medium">이벤트 페이지 (placeholder)</p>
        <p className="mt-1 text-xs text-mosaic-muted">
          다음 세션에서 events.json 로드 + 카드 리스트로 교체합니다.
        </p>
      </section>
    </div>
  );
}
