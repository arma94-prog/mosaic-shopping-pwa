/* =========================================================
 * src/components/SearchResults.jsx
 * 검색 결과 — PC 사이드패널 톤 정렬 + 미니멀.
 *
 * v21 변경 (2026-05-01, 트랙 E 3 — 사용자 catch):
 *  - 🐛 카테고리 끄기 시 spacing 5 → 8 (+3px씩).
 *
 * v20 (제거): 5.
 * ========================================================= */
import { useEffect, useState } from "react";
import { useExternalNavigate } from "../lib/externalLinkContext";
import { fetchSearchMalls, buildSearchUrl } from "../lib/searchMalls";
import { fetchUserSettings, applyMallFilters } from "../lib/mallFilters";
import { trackMallClick } from "../lib/trackMallClick";
import { useUserPrefs } from "../lib/userPrefs";
import MallRow from "./MallRow";

export default function SearchResults({ query }) {
  const [state, setState] = useState({ status: "loading", categories: [], iconBase: "", error: null });
  const [prefs] = useUserPrefs();
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
  const sectionMarginTop = prefs.showCategoryName ? 0 : 8;
  const headerPaddingBottom = prefs.showCategoryName ? 0 : 8;
  const iconCount = prefs.iconCount || 5;

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
          <section key={cat.key} className="first:mt-0" style={{ marginTop: `${sectionMarginTop}px` }}>
            <CategoryHeader
              label={cat.label}
              fallback={cat.key}
              showLabel={prefs.showCategoryName}
              paddingBottom={headerPaddingBottom}
            />
            <MallRow
              items={items}
              iconBase={iconBase}
              iconCount={iconCount}
              keyPrefix={cat.key}
              onClickItem={(mall) => handleClick(mall, cat.key)}
            />
          </section>
        );
      })}

      <div style={{ height: "40px" }} aria-hidden="true" />

      <section>
        <CategoryHeader label="이용 안내" showLabel={true} paddingBottom={1} />
        <p
          className="px-4 pl-[24px] leading-relaxed text-left"
          style={{ fontSize: "10.5px", color: "#A8A699", paddingTop: "6px" }}
        >
          카테고리와 쇼핑몰 보기 설정은 PC와 동기화됩니다.
          <br />
          카테고리와 쇼핑몰은 PC에서만 설정 하실 수 있어요.
          <br />
          쿠팡 파트너스 활동으로 일정 수수료를 지급받을 수 있습니다.
          <br />
          깨진 링크나 불편한 점은 오류 제보해 주세요.
        </p>
      </section>
    </div>
  );
}

function CategoryHeader({ label, fallback, showLabel = true, paddingBottom = 1 }) {
  const text = (label || "").trim() || (fallback || "").trim();
  if (!text) return null;
  return (
    <div
      className="flex items-center gap-3 px-4"
      style={{ paddingBottom: `${paddingBottom}px` }}
    >
      {showLabel && (
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
      )}
      <div className="flex-1 h-px" style={{ background: "#EFECE3" }} aria-hidden="true" />
    </div>
  );
}
