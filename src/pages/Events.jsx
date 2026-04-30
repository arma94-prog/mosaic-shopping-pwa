/* =========================================================
 * src/pages/Events.jsx
 * 핫딜 모음 페이지 — PC 사이드패널 "쇼핑몰 핫딜 모음" 정합.
 *
 * v6 변경 (2026-04-30, 사용자 catch — 디자인 미세조정):
 *  - 🎨 태그 아이콘 좌측 여백 +5px (paddingLeft 16 → 21px).
 *  - 🎨 타이틀 폰트 16 → 15px (-1pt 작게).
 *  - 🎨 볼드 해제 fontWeight 700 → 500.
 *
 * v5 변경 (2026-04-30): PC 정합 본문 타이틀 추가.
 * v4 변경 (2026-04-30): disabled_malls.event 필터 + custom_event_malls 병합.
 * v3 변경 (2026-04-30): 페이지 헤더 + PriceTagIcon 함수 제거 (v5에서 부활).
 * v2 변경 (2026-04-30): mosaic-events.json fetch + 6열 격자.
 *
 * 책임:
 *  - mosaic-events.json fetch (PC와 공유)
 *  - user_settings fetch + 필터/병합/커스텀 라벨 적용
 *  - mall 클릭 시 이벤트 페이지로 이동 (urlMobile 우선)
 * ========================================================= */
import { useEffect, useState } from "react";
import { useExternalNavigate } from "../lib/externalLinkContext";
import {
  fetchEventMalls,
  pickEventUrl,
} from "../lib/eventMalls";
import { fetchUserSettings, applyMallFilters } from "../lib/mallFilters";
import SharedMallCell from "../components/MallCell";

/** 본문 타이틀 옆 작은 태그 아이콘 (BottomNav PriceTagIcon outline 패턴 정합). */
function PageTitleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M3 4l8.5-1 9 9-9 9-9-9 1-8z"
        fill="none"
        stroke="#6B6B6B"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="7.5" cy="8" r="1.3" fill="#6B6B6B" />
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
        // event mall 데이터 + user_settings 병렬 fetch
        const [data, settings] = await Promise.all([
          fetchEventMalls(),
          fetchUserSettings(),
        ]);
        if (cancelled) return;

        // PC sidepanel.js renderCurrent() 정확 매핑 (mode = "event")
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

  const { categories, iconBase } = state;

  return (
    <div className="pt-3 pb-6">
      {/* v6 (2026-04-30): 디자인 미세조정 — paddingLeft +5px, font -1pt, 볼드 해제 */}
      <div
        className="flex items-center gap-2"
        style={{
          paddingLeft: "21px", // v6: 16 → 21 (+5px)
          paddingRight: "16px",
          paddingBottom: "12px",
        }}
      >
        <PageTitleIcon />
        <h2
          style={{
            fontSize: "15px",   // v6: 16 → 15 (-1pt)
            fontWeight: 500,     // v6: 700 → 500 (볼드 해제)
            color: "#1A1A1A",
            lineHeight: 1.2,
            letterSpacing: "-0.01em",
          }}
        >
          쇼핑몰 핫딜 모음
        </h2>
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
  // v5 (2026-04-30): 공용 컴포넌트 사용. PC .chip-fb 정합 + isCustom 도메인 자동 추정.
  return <SharedMallCell mall={mall} iconBase={iconBase} onClick={onClick} />;
}
