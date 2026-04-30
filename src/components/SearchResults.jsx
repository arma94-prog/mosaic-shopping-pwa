/* =========================================================
 * src/components/SearchResults.jsx
 * 검색 결과 6열 격자 — PC 사이드패널 톤 정렬 + 미니멀.
 *
 * 디자인 (사용자 결정 v3):
 *  - 카테고리 헤더: "종합몰 ─────────" 형태 (텍스트 + 가로 구분선)
 *    PC 사이드패널 카테고리 헤더와 시각 일관성.
 *  - 아이콘 크기: 셀 영역 대비 70% (여백 살린 미니멀 느낌, 빡빡함 해소)
 *  - 셀 테두리/배경 없음 (이전 v2 결정 유지)
 *  - 터치 피드백: active:bg-black/10 grey 음영 (이전 v2 결정 유지)
 *
 * 클릭 영역은 셀 전체(100%) 그대로 — 아이콘만 작아짐, 탭 응답성 유지.
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
          <section key={cat.id} className="mt-4 first:mt-1">
            <CategoryHeader name={cat.name} />
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

/**
 * 카테고리 헤더 — "종합몰 ─────────" 형태.
 * PC 사이드패널의 카테고리 구분 패턴과 시각 일관성.
 */
function CategoryHeader({ name }) {
  return (
    <div className="flex items-center gap-3 px-4 pb-2.5">
      <span className="shrink-0 text-xs font-medium text-mosaic-muted tracking-wide">
        {name}
      </span>
      <div className="flex-1 h-px bg-mosaic-line" aria-hidden="true" />
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
          className="w-[70%] h-[70%] object-contain"
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
