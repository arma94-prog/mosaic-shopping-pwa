/* =========================================================
 * src/components/SearchResults.jsx
 * 검색 결과 6열 격자 — Q2 결정에 따라 아이콘만 표시 (라벨/카테고리 헤더 없음).
 *
 * 동작:
 *  - searchMalls.json fetch (캐싱됨)
 *  - flattenMalls로 카테고리 순서대로 일렬화
 *  - 각 셀 클릭 → useExternalNavigate (첫 회 모달 → 외부 브라우저)
 *
 * 셀 디자인:
 *  - aspect-square + rounded-[7px] (메모리 디자인 결정)
 *  - 아이콘만 (라벨 없음, 환경설정 토글로 추후 표시 가능)
 *  - active 시 배경 변화로 탭 피드백
 *
 * 접근성:
 *  - button의 aria-label에 mall.name 포함
 *  - title 속성으로 hover 시 표시
 * ========================================================= */
import { useEffect, useState } from "react";
import { useExternalNavigate } from "../lib/externalLinkContext";
import {
  fetchSearchMalls,
  flattenMalls,
  buildSearchUrl,
  buildIconUrl,
} from "../lib/searchMalls";

export default function SearchResults({ query }) {
  const [state, setState] = useState({ status: "loading", data: null, error: null });
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

  const malls = flattenMalls(state.data);
  const iconBase = state.data.iconBase || "";

  const handleClick = (mall) => {
    const url = buildSearchUrl(mall.url, query);
    if (url) navigate(url);
  };

  return (
    <div className="pb-6">
      {/* 검색어 + 카운트 */}
      <div className="px-4 py-3 text-xs text-mosaic-muted">
        <span className="text-mosaic-text font-medium">"{query}"</span>
        <span className="mx-1">·</span>
        <span>{malls.length}개 쇼핑몰</span>
      </div>

      {/* 6열 격자 */}
      <div className="grid grid-cols-6 gap-2.5 px-4">
        {malls.map((mall, i) => (
          <MallCell
            key={`${mall._categoryId}-${mall.name}-${i}`}
            mall={mall}
            iconBase={iconBase}
            onClick={() => handleClick(mall)}
          />
        ))}
      </div>

      {/* 안내 — 각 쇼핑몰의 검색 결과는 외부 브라우저에서 열림 */}
      <p className="mt-6 px-4 text-[11px] text-mosaic-muted-3 text-center leading-relaxed">
        쇼핑몰 아이콘을 누르면<br />
        해당 쇼핑몰의 검색 결과를 새 창에서 열어요.
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
      aria-label={`${mall._categoryName} - ${mall.name}에서 검색`}
      title={mall.name}
      className="
        aspect-square
        rounded-[7px]
        bg-mosaic-surface
        border border-mosaic-line
        flex items-center justify-center
        overflow-hidden
        active:bg-mosaic-min-bg/30
        active:border-mosaic-accent/40
        transition-colors
      "
    >
      {iconUrl && !imgError ? (
        <img
          src={iconUrl}
          alt=""
          loading="lazy"
          onError={() => setImgError(true)}
          className="w-full h-full object-contain p-1.5"
        />
      ) : (
        // fallback: 아이콘 없거나 로드 실패 시 mall 이름 첫 글자
        <span className="text-xs font-medium text-mosaic-muted truncate px-1">
          {(mall.name || "?").slice(0, 2)}
        </span>
      )}
    </button>
  );
}
