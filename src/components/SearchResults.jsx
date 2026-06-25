/* =========================================================
 * src/components/SearchResults.jsx
 * 검색 결과 — PC 사이드패널 톤 정렬 + 미니멀.
 *
 * v31 변경 (2026-05-25, 사용자 피드백):
 *  - 🆕 상단 타이틀 추가 — "(검색 아이콘) 'OOO' 검색 결과".
 *    Events 페이지 "쇼핑몰 핫딜 모음" 정합 (CSS / 색 / 폰트 / spacing 동일).
 *    검색 아이콘 = lucide search (18px, fill=none, stroke=currentColor, sw 2.2).
 *
 * v30 (유지): SWR 도입.
 * v29 (유지): 이용 안내 우측 padding 0.
 * ========================================================= */
import { useExternalNavigate } from "../lib/externalLinkContext";
import { buildSearchUrl } from "../lib/searchMalls";
import { trackMallClick } from "../lib/trackMallClick";
import { useUserPrefs } from "../lib/userPrefs";
import { useSearchMalls } from "../hooks/useSearchMalls.js";
import { useEventMalls } from "../hooks/useEventMalls.js";
import MallRow from "./MallRow";

/** v31: 검색 아이콘 — Events PriceTagIcon 패턴 정합 (18px / fill=none / sw 2.2). */
function SearchIcon() {
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
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export default function SearchResults({ query }) {
  const [prefs] = useUserPrefs();
  const navigate = useExternalNavigate();
  const { categories, iconBase, isLoading, error } = useSearchMalls();
  // 제휴 고지("쿠팡 파트너스~") 노출 — events aff_notice 공유(SWR dedupe, 추가 fetch 없음).
  //   aff_notice === false면 숨김, 그 외(true·부재) 노출 (Events 정책 일치).
  const { affNotice } = useEventMalls();
  const showAffNotice = affNotice !== false;

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
      {/* v31: 상단 타이틀 — Events "쇼핑몰 핫딜 모음" CSS 정합 */}
      <div
        className="flex items-center gap-2 pl-[23px] pr-4"
        style={{
          color: "#5C3D1F",
          paddingTop: "2px",
          paddingBottom: "2px",
          marginBottom: "8px",
        }}
      >
        <SearchIcon />
        <span style={{ fontSize: "14px", fontWeight: 400 }}>
          '{query}' 검색 결과
        </span>
      </div>

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
          {showAffNotice && (
            <>
              <br />
              쿠팡 파트너스 활동으로 일정 수수료를 지급받을 수 있습니다.
            </>
          )}
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
