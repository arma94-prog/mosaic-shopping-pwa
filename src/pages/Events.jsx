/* =========================================================
 * src/pages/Events.jsx
 * 핫딜 모음 페이지 — PC 사이드패널 "쇼핑몰 핫딜 모음" 정합.
 *
 * v29 변경 (2026-05, Phase 1.7 — SWR 도입):
 *  - 🆕 useEventMalls 훅 도입 — useState/useEffect 35줄 제거.
 *  - 🆕 SWR 캐시 hit 시 즉시 표시 + 백그라운드 revalidate.
 *  - 🆕 데이터 변경 시 "쇼핑몰 목록이 갱신됨" 토스트 (페이지 진입 시점부터).
 *  - 로딩/에러 UI는 v28 그대로 유지. 마크업/디자인 변경 X.
 *
 * v28 (유지): 이용 안내 우측 padding 0.
 * ========================================================= */
import { useExternalNavigate } from "../lib/externalLinkContext";
import { pickEventUrl } from "../lib/eventMalls";
import { trackMallClick } from "../lib/trackMallClick";
import { useUserPrefs } from "../lib/userPrefs";
import { useEventMalls } from "../hooks/useEventMalls.js";
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
  const [prefs] = useUserPrefs();
  const navigate = useExternalNavigate();
  const { categories, iconBase, isLoading, error } = useEventMalls();

  const handleClick = (mall, category) => {
    const url = pickEventUrl(mall);
    trackMallClick({
      context: "event",
      mall: { ...mall, url },
      category: category || "",
    });
    if (url) navigate(url);
  };

  // categories 없을 때만 로딩/에러 UI 표시 (캐시 hit 시 categories 즉시 있음).
  if (!categories) {
    if (error) {
      return (
        <div className="mx-4 mt-4 rounded-lg p-3" style={{ background: "#FCEBEB", border: "1px solid #FECACA" }}>
          <p className="break-all" style={{ fontSize: "13px", color: "#b91c1c" }}>
            핫딜 정보를 불러올 수 없어요: {error.message || String(error)}
          </p>
        </div>
      );
    }
    return (
      <div
        className="px-4 py-8 text-center"
        style={{ fontSize: "13px", color: "#6B6B6B" }}
      >
        핫딜 정보를 불러오는 중...
      </div>
    );
  }

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
          className="pl-[24px] pr-0 text-left"
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
