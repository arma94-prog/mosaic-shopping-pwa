/* =========================================================
 * src/pages/Events.jsx
 * 핫딜 모음 페이지 — PC 사이드패널 "쇼핑몰 핫딜 모음" 정합.
 *
 * v12 변경 (2026-05-01, 트랙 E 3 — 사용자 catch + 캡쳐):
 *  - 🐛 페이지 헤더 디자인 정확화:
 *    - 색상: #1A1A1A (검정) → #5C3D1F (진한 갈색, 옵션 5).
 *      모자이크 검정+주황 사이 따뜻한 톤.
 *    - 좌측 여백: px-4 (16px) → pl-[21px] (16+5).
 *      카테고리 헤더보다 약간 들여쓰기.
 *    - 볼드 해제: fontWeight 800 → 400. 부드러운 강조.
 *    - 위/아래 padding +2px씩 (paddingTop/Bottom 2px).
 *
 * v11 (제거): fontWeight 800, color #1A1A1A, marginBottom 8px만.
 * v10 (유지): 이용 안내 px-4 pl-[24px].
 * ========================================================= */
import { useEffect, useState } from "react";
import { useExternalNavigate } from "../lib/externalLinkContext";
import { fetchEventMalls, pickEventUrl } from "../lib/eventMalls";
import { fetchUserSettings, applyMallFilters } from "../lib/mallFilters";
import { trackMallClick } from "../lib/trackMallClick";
import SharedMallCell from "../components/MallCell";

/** PC sidepanel.js 옛 v2의 가격 태그 아이콘 정확 path */
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
      {/* v12: 헤더 — 진한 갈색 #5C3D1F, 좌측 +5px, 볼드 해제, 위아래 +2px */}
      <div
        className="flex items-center gap-2 pl-[21px] pr-4"
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

      <section style={{ marginTop: "5px" }}>
        <CategoryHeader label="이용 안내" />
        <p
          className="px-4 pl-[24px] leading-relaxed text-left"
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
