/* =========================================================
 * src/components/SearchResults.jsx
 * 검색 결과 6열 격자 — OS 네이티브 앱 아이콘 톤.
 *
 * 디자인 (사용자 결정 v2):
 *  - 셀 테두리/배경 제거 (OS 앱 아이콘처럼 둥둥 떠있음)
 *  - 카테고리별 섹션 + 작은 헤더 텍스트 (예: "가격비교", "종합몰")
 *  - 터치 시 grey 음영 (active:bg-black/10) — OS 네이티브 누름 피드백
 *  - 아이콘만 표시 (mall 라벨은 환경설정 토글로 추후)
 *
 * 동작:
 *  - searchMalls.json fetch (캐싱됨)
 *  - 카테고리별로 섹션 렌더 (categories 순회, 일렬 평탄화 안 함)
 *  - 셀 클릭 → useExternalNavigate (외부 webview)
 * ========================================================= */
import { useEffect, useState } from "react";
import { useExternalNavigate } from "../lib/externalLinkContext";
import {
  fetchSearchMalls,
  buildSearchUrl,
  buildIconUrl,
} from "../lib/searchMalls";

export default function SearchResults({ query }) {
  const [state, setState] = useState({
    status: "loading",
    data: null,
    error: null,
  });
  const navigate = useExternalNavigate();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchSearchMalls();
        if (!cancelled) {
          setState({ status: "ok", data, error: null });
        }
      } catch (e) {
        if (!cancelled) {
          setState({ status: "error", data: null, error: e.message });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (state.status === "loading") {
    return (
      <div className="px-4 py-8 text-center text-sm text-mosaic-muted">
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

  const categories = state.data.categories || [];
  const iconBase = state.data.iconBase || "";
  const totalMalls = categories.reduce(
    (sum, cat) => sum + (cat.items?.length || 0),
    0,
  );

  const handleClick = (mall) => {
    const url = buildSearchUrl(mall.url, query);
    if (url) navigate(url);
  };

  return (
    <div className="pb-6">
      {/* 검색어 + 총 카운트 */}
      <div className="px-4 py-3 text-xs text-mosaic-muted">
        <span className="text-mosaic-text font-medium">"{query}"</span>
        <span className="mx-1">·</span>
        <span>{totalMalls}개 쇼핑몰</span>
      </div>

      {/* 카테고리별 섹션 */}
      {categories.map((cat) => {
        const items = cat.items || [];
        if (items.length === 0) return null;
        return (
          <section key={cat.id} className="mt-3 first:mt-0">
            <h3 className="px-4 pb-2 text-[11px] font-medium text-mosaic-muted-2 tracking-wide">
              {cat.name}
            </h3>
            <div className="grid grid-cols-6 gap-2 px-4">
              {items.map((mall, i) => (
                <MallCell
                  key={`${cat.id}-${mall.name}-${i}`}
                  mall={mall}
                  iconBase={iconBase}
                  onClick={() => handleClick(mall)}
                />
              ))}
            </div>
          </section>
        );
      })}

      <p className="mt-8 px-4 text-[11px] text-mosaic-muted-3 text-center leading-relaxed">
        쇼핑몰 아이콘을 누르면
        <br />
        해당 쇼핑몰의 검색 결과가 열려요.
      </p>
    </div>
  );
}

function MallCell({ mall, iconBase, onClick }) {
  const [imgError, setImgError] = useState(false);
  const iconUrl = buildIconUrl(iconBase, mall.icon);

  return (
    <button
      onClick={onClick}
      aria-label={mall.name}
      title={mall.name}
      className="
        aspect-square
        rounded-[10px]
        flex items-center justify-center
        overflow-hidden
        active:bg-black/10
        transition-colors duration-100
      "
    >
      {iconUrl && !imgError ? (
        <img
          src={iconUrl}
          alt=""
          loading="lazy"
          onError={() => setImgError(true)}
          className="w-full h-full object-contain"
          draggable="false"
        />
      ) : (
        // fallback: 아이콘 없거나 로드 실패 시 mall 이름 첫 2글자
        <span className="text-xs font-medium text-mosaic-muted truncate px-1">
          {(mall.name || "?").slice(0, 2)}
        </span>
      )}
    </button>
  );
}
