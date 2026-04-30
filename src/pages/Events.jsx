/* =========================================================
 * src/pages/Events.jsx
 * 핫딜 모음 페이지 — PC 사이드패널 "쇼핑몰 핫딜 모음" 정합.
 *
 * v2 변경 (2026-04-30, c 단계):
 *  - 이전: 단순 placeholder ("Phase 2에서 추천 핫딜 표시 예정").
 *  - 이후: PC와 같은 mosaic-events.json fetch + 6열 격자 + 카테고리별 표시.
 *
 * 책임:
 *  - mosaic-events.json fetch (PC와 공유)
 *  - 카테고리별 mall 6열 격자
 *  - mall 클릭 시 이벤트 페이지로 이동 (urlMobile 우선)
 *  - 헤더에 가격 태그 아이콘 + "쇼핑몰 핫딜 모음"
 *
 * SoC: SearchResults와 별도. 검색어 의존 없음, mall.url 그대로 사용.
 *
 * 디자인 (PC 정합 + 모바일 +1pt):
 *  - 카테고리 헤더: PC .lbl 정확 (#9F9F9F, 12px)
 *  - 셀 6열 격자, 검색결과와 같은 톤
 *  - 페이지 헤더: 가격 태그 아이콘 + "쇼핑몰 핫딜 모음" 14px weight 800
 * ========================================================= */
import { useEffect, useState } from "react";
import { useExternalNavigate } from "../lib/externalLinkContext";
import {
  fetchEventMalls,
  buildIconUrl,
  pickEventUrl,
} from "../lib/eventMalls";

/** PC sidepanel.js line 565의 가격 태그 아이콘 정확 path. */
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
  const [state, setState] = useState({ status: "loading", data: null, error: null });
  const navigate = useExternalNavigate();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchEventMalls();
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

  const handleClick = (mall) => {
    const url = pickEventUrl(mall);
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

  const categories = state.data.categories || [];
  const iconBase = state.data.iconBase || "";

  return (
    <div className="pt-3 pb-6">
      {/* 페이지 헤더 — PC pt-txt 정합. 가격 태그 아이콘 + 타이틀 */}
      <div
        className="flex items-center gap-1.5 px-4 mb-2"
        style={{ color: "#1A1A1A" }}
      >
        <span style={{ color: "#E8762B", display: "flex", alignItems: "center" }}>
          <PriceTagIcon />
        </span>
        <h1 style={{ fontSize: "14px", fontWeight: 800, letterSpacing: "0.1px" }}>
          쇼핑몰 핫딜 모음
        </h1>
      </div>

      {categories.map((cat) => {
        const items = cat.items || [];
        if (items.length === 0) return null;
        return (
          <section
            key={cat.key || cat.id}
            className="first:mt-0"
            style={{ marginTop: "5px" }}
          >
            <CategoryHeader label={cat.label || cat.name} fallback={cat.key || cat.id} />
            <div className="grid grid-cols-6 gap-2 px-4">
              {items.map((mall, i) => (
                <MallCell
                  key={`${cat.key || cat.id}-${mall.name}-${i}`}
                  mall={mall}
                  iconBase={iconBase}
                  onClick={() => handleClick(mall)}
                />
              ))}
            </div>
          </section>
        );
      })}

      <p
        className="mt-8 px-4 text-center leading-relaxed"
        style={{ fontSize: "12px", color: "#A8A699" }}
      >
        쇼핑몰 아이콘을 누르면
        <br />
        해당 쇼핑몰의 핫딜 페이지가 열려요.
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
  const [imgError, setImgError] = useState(false);
  const iconUrl = buildIconUrl(iconBase, mall.icon);

  return (
    <button
      onClick={onClick}
      aria-label={mall.name}
      title={mall.name}
      className="aspect-square rounded-[10px] flex items-center justify-center overflow-hidden transition-colors active:bg-[#F1EFE8]"
      style={{
        background: "transparent",
        border: "none",
      }}
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
        <span
          className="truncate px-1"
          style={{ fontSize: "11px", fontWeight: 500, color: "#6B6B6B" }}
        >
          {(mall.name || "?").slice(0, 2)}
        </span>
      )}
    </button>
  );
}
