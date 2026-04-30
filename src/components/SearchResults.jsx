/* =========================================================
 * src/components/SearchResults.jsx
 * 검색 결과 6열 격자 — PC 사이드패널 톤 정렬 + 미니멀.
 *
 * v8 변경 (2026-04-30, 단계 4):
 *  - 토큰 마이그레이션 (deprecated → canonical):
 *    text-mosaic-muted-2 → text-mosaic-text-label
 *    text-mosaic-muted-3 → text-mosaic-text-soft
 *    text-mosaic-muted → text-mosaic-text-muted
 *
 * 디자인 (이전 결정 유지):
 *  - 카테고리 헤더: "종합몰 ─────" — text-[11px] font-normal text-label tracking-[0.2px]
 *  - 카테고리 간 mt-1.5 / 헤더 아래 pb-1
 *  - 아이콘 70%
 *  - 셀 테두리/배경 없음, 터치 시 grey 음영
 *  - JSON 필드명: cat.key / cat.label (실제 mosaic-search-malls.json 구조)
 * ========================================================= */
import { useEffect, useState } from "react";
import { useExternalNavigate } from "../lib/externalLinkContext";
import {
  fetchSearchMalls,
  buildSearchUrl,
} from "../lib/searchMalls";
import { fetchUserSettings, applyMallFilters } from "../lib/mallFilters";
import SharedMallCell from "./MallCell";

export default function SearchResults({ query }) {
  const [state, setState] = useState({ status: "loading", categories: [], iconBase: "", error: null });
  const navigate = useExternalNavigate();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // v10 (2026-04-30, 사용자 catch): user_settings 병렬 fetch + 필터 적용.
        // 이전: 모든 mall 표시 (PC에서 OFF한 mall도 보임).
        // 이후: PC sidepanel.js renderCurrent() 정확 매핑 (mode = "search").
        const [data, settings] = await Promise.all([
          fetchSearchMalls(),
          fetchUserSettings(),
        ]);
        if (cancelled) return;

        const categories = applyMallFilters(data, "search", settings);
        setState({
          status: "ok",
          categories,
          iconBase: data.iconBase || "",
          error: null,
        });
      } catch (e) {
        if (!cancelled) {
          setState({ status: "error", categories: [], iconBase: "", error: e.message });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (state.status === "loading") {
    return (
      <div className="px-4 py-8 text-center text-sm text-mosaic-text-muted">
        쇼핑몰 정보를 불러오는 중...
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="mx-4 mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
        <p className="text-xs text-red-700 break-all">
          쇼핑몰 정보를 불러올 수 없어요: {state.error}
        </p>
      </div>
    );
  }

  const { categories, iconBase } = state;

  // v9 변경 (2026-04-30, 사용자 catch):
  // 모바일 UA에서 urlMobile 옵셔널 필드 우선 사용. 없으면 url fallback.
  const handleClick = (mall) => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(
      typeof navigator !== "undefined" ? navigator.userAgent : ""
    );
    const baseUrl = (isMobile && mall.urlMobile) ? mall.urlMobile : mall.url;
    const url = buildSearchUrl(baseUrl, query);
    if (url) navigate(url);
  };

  return (
    <div className="pt-3 pb-6">
      {categories.map((cat) => {
        const items = cat.items || [];
        if (items.length === 0) return null;
        return (
          <section key={cat.key} className="first:mt-0" style={{ marginTop: "5px" }}>
            <CategoryHeader label={cat.label} fallback={cat.key} />
            <div className="grid grid-cols-6 gap-2 px-4">
              {items.map((mall, i) => (
                <MallCell
                  key={`${cat.key}-${mall.name}-${i}`}
                  mall={mall}
                  iconBase={iconBase}
                  onClick={() => handleClick(mall)}
                />
              ))}
            </div>
          </section>
        );
      })}

      <p className="mt-8 px-4 text-[11px] text-mosaic-text-soft text-center leading-relaxed">
        쇼핑몰 아이콘을 누르면
        <br />
        해당 쇼핑몰의 검색 결과가 열려요.
      </p>
    </div>
  );
}

function CategoryHeader({ label, fallback }) {
  const text = (label || "").trim() || (fallback || "").trim();
  if (!text) return null;
  return (
    <div className="flex items-center gap-3 px-4" style={{ paddingBottom: "1px" }}>
      <span
        className="shrink-0 tracking-[0.2px] truncate"
        style={{
          fontSize: "12px",  // PC clamp(10,2.4vw,12) → PWA +1
          fontWeight: 400,
          color: "#9F9F9F",  // PC .lbl 정확 hex
        }}
      >
        {text}
      </span>
      <div className="flex-1 h-px" style={{ background: "#EFECE3" }} aria-hidden="true" />
    </div>
  );
}

function MallCell({ mall, iconBase, onClick }) {
  // v11 (2026-04-30): 공용 컴포넌트 사용. 자체 구현 제거.
  // PC .chip-fb 정합 + isCustom 도메인 자동 추정 로직은 ../components/MallCell.jsx로 이전.
  return <SharedMallCell mall={mall} iconBase={iconBase} onClick={onClick} />;
}
