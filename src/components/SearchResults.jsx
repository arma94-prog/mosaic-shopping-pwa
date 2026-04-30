/* =========================================================
 * src/components/SearchResults.jsx
 * 검색 결과 6열 격자 — PC 사이드패널 톤 정렬 + 미니멀.
 *
 * v9 변경 (2026-04-30, 트랙 E — Mixpanel):
 *  - 🆕 mall click 시 trackMallClick("search", ...) 호출.
 *    PC search_mall_click + peopleAdd({total_search_clicks: 1}) 정합.
 *    + url이 쿠팡이면 coupang_hop_triggered + peopleAdd({total_coupang_hops: 1}) 추가.
 *
 * v8 (유지): 토큰 마이그레이션.
 * ========================================================= */
import { useEffect, useState } from "react";
import { useExternalNavigate } from "../lib/externalLinkContext";
import { fetchSearchMalls, buildSearchUrl } from "../lib/searchMalls";
import { fetchUserSettings, applyMallFilters } from "../lib/mallFilters";
import { trackMallClick } from "../lib/trackMallClick";
import SharedMallCell from "./MallCell";

export default function SearchResults({ query }) {
  const [state, setState] = useState({ status: "loading", categories: [], iconBase: "", error: null });
  const navigate = useExternalNavigate();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
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

  // v9: mall click 시 트랙 + 외부 navigate.
  // category는 mall이 속한 cat.key 전달.
  const handleClick = (mall, category) => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(
      typeof navigator !== "undefined" ? navigator.userAgent : ""
    );
    const baseUrl = (isMobile && mall.urlMobile) ? mall.urlMobile : mall.url;
    const url = buildSearchUrl(baseUrl, query);

    trackMallClick({
      context: "search",
      mall: { ...mall, url },
      query: query || "",
      category: category || "",
    });

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
                  onClick={() => handleClick(mall, cat.key)}
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
          fontSize: "12px",
          fontWeight: 400,
          color: "#9F9F9F",
        }}
      >
        {text}
      </span>
      <div className="flex-1 h-px" style={{ background: "#EFECE3" }} aria-hidden="true" />
    </div>
  );
}

function MallCell({ mall, iconBase, onClick }) {
  return <SharedMallCell mall={mall} iconBase={iconBase} onClick={onClick} />;
}
