/* =========================================================
 * src/pages/Events.jsx
 * 핫딜 모음 페이지 — PC 사이드패널 "쇼핑몰 핫딜 모음" 정합.
 *
 * v5 변경 (2026-04-30, 트랙 E — Mixpanel):
 *  - 🆕 mall click 시 trackMallClick("event", ...) 호출.
 *    PC sidepanel.js event_mall_click + peopleAdd({total_event_clicks: 1}) 정합.
 *    + url이 쿠팡이면 coupang_hop_triggered + peopleAdd({total_coupang_hops: 1}) 추가.
 *
 * v4 (유지): user_settings 필터/병합/커스텀 라벨.
 * ========================================================= */
import { useEffect, useState } from "react";
import { useExternalNavigate } from "../lib/externalLinkContext";
import { fetchEventMalls, pickEventUrl } from "../lib/eventMalls";
import { fetchUserSettings, applyMallFilters } from "../lib/mallFilters";
import { trackMallClick } from "../lib/trackMallClick";
import SharedMallCell from "../components/MallCell";

export default function Events() {
  const [state, setState] = useState({ status: "loading", categories: [], iconBase: "", error: null });
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

  // v5: mall click 시 트랙 + 외부 navigate.
  // category는 mall이 속한 cat의 key (또는 label) 전달.
  const handleClick = (mall, category) => {
    const url = pickEventUrl(mall);
    // 트랙 — mall.url이 트랙용 url인데 pickEventUrl이 변환할 수도. 변환된 url로 트랙.
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

  return (
    <div className="pt-3 pb-6">
      {categories.map((cat) => {
        const items = cat.items || [];
        if (items.length === 0) return null;
        const catKey = cat.key || cat.id || "";
        return (
          <section
            key={catKey}
            className="first:mt-0"
            style={{ marginTop: "5px" }}
          >
            <CategoryHeader label={cat.label || cat.name} fallback={catKey} />
            <div className="grid grid-cols-6 gap-2 px-4">
              {items.map((mall, i) => (
                <MallCell
                  key={`${catKey}-${mall.name}-${i}`}
                  mall={mall}
                  iconBase={iconBase}
                  onClick={() => handleClick(mall, catKey)}
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
  return <SharedMallCell mall={mall} iconBase={iconBase} onClick={onClick} />;
}
