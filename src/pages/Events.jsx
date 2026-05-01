/* =========================================================
 * src/pages/Events.jsx
 * 핫딜 모음 페이지 — PC 사이드패널 "쇼핑몰 핫딜 모음" 정합.
 *
 * v27 변경 (2026-05-01, 트랙 E 3 — final):
 *  - 🐛 이용 안내 텍스트 정정 (iOS line-height wrap catch 회피):
 *    - "PC의 크롬 브라우저" → "PC 크롬 브라우저"
 *    - "'모자이크 쇼핑'을 설치" → "모자이크 쇼핑을 설치" (따옴표 제거)
 *    - "추가와 보기 설정" → "추가/보기 설정"
 *
 * v26 (유지): 불릿 제거, line-height 1.8.
 * ========================================================= */
import { useEffect, useState } from "react";
import { useExternalNavigate } from "../lib/externalLinkContext";
import { fetchEventMalls, pickEventUrl } from "../lib/eventMalls";
import { fetchUserSettings, applyMallFilters } from "../lib/mallFilters";
import { trackMallClick } from "../lib/trackMallClick";
import { useUserPrefs } from "../lib/userPrefs";
import MallRow from "../components/MallRow";

function PriceTagIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  );
}

export default function Events() {
  const [state, setState] = useState({ status: "loading", categories: [], iconBase: "", error: null });
  const [prefs] = useUserPrefs();
  const navigate = useExternalNavigate();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [data, settings] = await Promise.all([
          fetchEventMalls(),
          fetchUserSettings(),
        ]);
        if (cancelled) return;

        const categories = applyMallFilters(data, "event", settings);

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

  const handleClick = (mall, category) => {
    const url = pickEventUrl(mall);
    trackMallClick({
      context: "event",
      mall: { ...mall, url },
      category: category || "",
    });
    if (url) navigate(url);
  };

  if (state.status === "loading") {
    return (
      <div
        className="px-4 py-8 text-center"
        style={{ fontSize: "13px", color: "#6B6B6B" }}
      >
        핫딜 정보를 불러오는 중...
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="mx-4 mt-4 rounded-lg p-3" style={{ background: "#FCEBEB", border: "1px solid #FECACA" }}>
        <p className="break-all" style={{ fontSize: "13px", color: "#b91c1c" }}>
          핫딜 정보를 불러올 수 없어요: {state.error}
        </p>
      </div>
    );
  }

  const { categories, iconBase } = state;
  const sectionMarginTop = prefs.showCategoryName ? 0 : 10;
  const headerPaddingBottom = prefs.showCategoryName ? 0 : 10;
  const iconCount = prefs.iconCount || 5;

  return (
    <div className="pt-3 pb-6">
      <div
        className="flex items-center gap-2 pl-[23px] pr-4"
        style={{
          color: "#5C3D1F",
          paddingTop: "2px",
          paddingBottom: "2px",
          marginBottom: "8px",
        }}
      >
        <PriceTagIcon />
        <span style={{ fontSize: "14px", fontWeight: 400 }}>
          쇼핑몰 핫딜 모음
        </span>
      </div>

      {categories.map((cat) => {
        const items = cat.items || [];
        if (items.length === 0) return null;
        const catKey = cat.key || cat.id || "";
        return (
          <section
            key={catKey}
            className="first:mt-0"
            style={{ marginTop: `${sectionMarginTop}px` }}
          >
            <CategoryHeader
              label={cat.label || cat.name}
              fallback={catKey}
              showLabel={prefs.showCategoryName}
              paddingBottom={headerPaddingBottom}
            />
            <MallRow
              items={items}
              iconBase={iconBase}
              iconCount={iconCount}
              keyPrefix={catKey}
              onClickItem={(mall) => handleClick(mall, catKey)}
            />
          </section>
        );
      })}

      <div style={{ height: "40px" }} aria-hidden="true" />

      <section>
        <CategoryHeader label="이용 안내" showLabel={true} paddingBottom={1} />
        <p
          className="px-4 pl-[24px] text-left"
          style={{
            fontSize: "11.5px",
            color: "#A8A699",
            paddingTop: "6px",
            lineHeight: 1.8,
          }}
        >
          PC 크롬 브라우저에서도 모자이크 쇼핑을 이용하실 수 있어요.
          <br />
          크롬 웹스토어 방문 후, 모자이크 쇼핑을 설치하시면 됩니다.
          <br />
          최근 검색어, 북마크 등 개인 설정이 PC와 동기화됩니다.
          <br />
          단, 카테고리와 쇼핑몰 추가/보기 설정은 PC에서만 가능해요.
          <br />
          쿠팡 파트너스 활동으로 일정 수수료를 지급받을 수 있습니다.
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
            fontSize: "11px",
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
