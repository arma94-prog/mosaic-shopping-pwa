/* =========================================================
 * src/components/SearchResults.jsx
 * 검색 결과 — PC 사이드패널 톤 정렬 + 미니멀.
 *
 * v30 변경 (2026-05, Phase 1.7 — SWR 도입):
 *  - 🆕 useSearchMalls 훅 도입 — useState/useEffect 제거.
 *  - 🆕 SWR 캐시 hit 시 즉시 표시 + 백그라운드 revalidate.
 *  - 🆕 데이터 변경 시 "쇼핑몰 목록이 갱신됨" 토스트.
 *  - query 변경 시 재 fetch X — 같은 mall data 캐시 공유. 효율적.
 *  - 디자인/마크업 v29 그대로 유지.
 *
 * v29 (유지): 이용 안내 우측 padding 0.
 * ========================================================= */
import { useExternalNavigate } from "../lib/externalLinkContext";
import { buildSearchUrl } from "../lib/searchMalls";
import { trackMallClick } from "../lib/trackMallClick";
import { useUserPrefs } from "../lib/userPrefs";
import { useSearchMalls } from "../hooks/useSearchMalls.js";
import MallRow from "./MallRow";

export default function SearchResults({ query }) {
  const [prefs] = useUserPrefs();
  const navigate = useExternalNavigate();
  const { categories, iconBase, isLoading, error } = useSearchMalls();

  // categories 없을 때만 로딩/에러 UI 표시.
  if (!categories) {
    if (error) {
      return (
        <div className="mx-4 mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-xs text-red-700 break-all">
            쇼핑몰 정보를 불러올 수 없어요: {error.message || String(error)}
          </p>
        </div>
      );
    }
    return (
      <div className="px-4 py-8 text-center text-sm text-mosaic-text-muted">
        쇼핑몰 정보를 불러오는 중...
      </div>
    );
  }

  const sectionMarginTop = prefs.showCategoryName ? 0 : 10;
  const headerPaddingBottom = prefs.showCategoryName ? 0 : 10;
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
          className="pl-[24px] pr-0 text-left"
          style={{
            fontSize: "10.5px",
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
