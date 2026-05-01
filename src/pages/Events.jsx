/* =========================================================
 * src/pages/Events.jsx
 * 핫딜 모음 페이지 — PC 사이드패널 "쇼핑몰 핫딜 모음" 정합.
 *
 * v9 변경 (2026-05-01, 트랙 E 3 — 사용자 catch):
 *  - 🐛 이용 안내 좌측 padding 추가. col-span-6 grid 패턴은 효과 작음 (cell edge가
 *    grid container 좌측 edge와 같음). 단순 px-4 + pl-[5px]로 시각적 indent 추가.
 *    총 좌측 padding 21px. 첫 쇼핑몰 아이콘 본체와 시각적으로 가까워짐.
 *
 * v8 (제거): col-span-6 grid 안 텍스트 — left edge가 px-4와 같아서 효과 없음.
 * v7 (유지): 이용 안내 CategoryHeader 패턴 통일.
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

      {/* v9: 이용 안내 — px-4 + pl-[5px]로 좌측 indent 추가 */}
      <section style={{ marginTop: "5px" }}>
        <CategoryHeader label="이용 안내" />
        <p
          className="px-4 pl-[21px] leading-relaxed text-left"
          style={{ fontSize: "11.5px", color: "#A8A699", paddingTop: "6px" }}
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
