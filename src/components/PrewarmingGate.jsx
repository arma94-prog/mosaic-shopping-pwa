/* =========================================================
 * src/components/PrewarmingGate.jsx
 * 첫 설치 시 mall 데이터 + 아이콘 prewarming 화면.
 *
 * Phase 1.7 신규 (2026-05, 사용자 catch — 첫인상):
 *  - 트리거 조건: SW 캐시 (mosaic-mall-icons)가 비어 있을 때만.
 *    재실행/재진입 시에는 즉시 통과 (사용자에게 화면 안 보임).
 *  - prewarming 내용: events + search mall data + 모든 mall 아이콘 fetch.
 *    SW가 fetch 가로채서 캐시 저장 → 메인 진입 시 모든 아이콘 즉시 표시.
 *  - 안전망: 5초 타임아웃. 못 끝나도 메인 진입 (background fetch는 계속).
 *  - 에러 발생 시 즉시 통과 — 사용자 차단 X.
 *
 * 적용 위치: AuthGate 안쪽, AppShell 바깥 (App.jsx).
 *  - 인증 후 화면. 미인증 사용자는 prewarming 화면 못 봄.
 *  - settings 라우트는 비적용 (mall 아이콘 안 씀).
 *
 * 사용자 통찰: search mall 아이콘 = events mall 아이콘 100% 동일 PNG.
 *  → 같은 URL은 Set dedup으로 단일 fetch. SW 캐시 슬롯도 자동 공유.
 * ========================================================= */
import { useEffect, useState } from "react";
import {
  fetchEventMalls,
  buildIconUrl as buildEventIconUrl,
} from "../lib/eventMalls";
import {
  fetchSearchMalls,
  buildIconUrl as buildSearchIconUrl,
} from "../lib/searchMalls";
import MosaicLogo from "./MosaicLogo";

const TIMEOUT_MS = 5000;
const ICON_CACHE_NAME = "mosaic-mall-icons";

export default function PrewarmingGate({ children }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // SW/Cache API 미지원 → skip prewarming.
        // (개발 모드 dev에서도 SW 비활성이라 caches는 있지만 캐시 비어 있음 →
        //  prewarming 시도 후 통과. 정상 동작.)
        if (typeof caches === "undefined") {
          if (!cancelled) setReady(true);
          return;
        }

        // 1. SW 캐시 비어 있는지 체크.
        let isEmpty = false;
        try {
          const cacheNames = await caches.keys();
          if (!cacheNames.includes(ICON_CACHE_NAME)) {
            isEmpty = true;
          } else {
            const cache = await caches.open(ICON_CACHE_NAME);
            const keys = await cache.keys();
            isEmpty = keys.length === 0;
          }
        } catch (_) {
          // 체크 실패 → 안전하게 skip prewarming (사용자 차단 회피).
          isEmpty = false;
        }

        if (cancelled) return;

        if (!isEmpty) {
          // 캐시 있음 → 즉시 통과 (사용자에게 화면 안 보임).
          setReady(true);
          return;
        }

        // 2. Prewarming 시작 — 5초 타임아웃 또는 완료 중 먼저.
        // doPrewarm 내부 fetch는 5초 후에도 background에서 계속 진행 (abort X).
        // → 메인 진입 후 짧은 시간 내 캐시 채워짐.
        const prewarmPromise = doPrewarm();
        const timeoutPromise = new Promise((resolve) =>
          setTimeout(resolve, TIMEOUT_MS),
        );
        await Promise.race([prewarmPromise, timeoutPromise]);
      } catch (e) {
        // 어떤 에러든 무시. 사용자 차단 회피.
        // eslint-disable-next-line no-console
        console.warn("[prewarming] error", e);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!ready) {
    return <PrewarmingScreen />;
  }

  return children;
}

/**
 * Mall data + 모든 아이콘 fetch.
 * SW 룰이 매칭되어 자동으로 캐시 저장.
 */
async function doPrewarm() {
  // events + search mall data 병렬 fetch.
  const [eventData, searchData] = await Promise.all([
    fetchEventMalls().catch(() => null),
    fetchSearchMalls().catch(() => null),
  ]);

  // 모든 아이콘 URL 수집 — Set으로 dedup (events/search 동일 PNG는 단일 fetch).
  const iconUrls = new Set();

  if (eventData?.iconBase) {
    for (const cat of eventData.categories || []) {
      for (const item of cat.items || []) {
        if (item.icon) {
          const url = buildEventIconUrl(eventData.iconBase, item.icon);
          if (url) iconUrls.add(url);
        }
      }
    }
  }

  if (searchData?.iconBase) {
    for (const cat of searchData.categories || []) {
      for (const item of cat.items || []) {
        if (item.icon) {
          const url = buildSearchIconUrl(searchData.iconBase, item.icon);
          if (url) iconUrls.add(url);
        }
      }
    }
  }

  // 모든 unique 아이콘 fetch — 개별 실패 무시.
  // SW 룰이 매칭 → 응답을 mosaic-mall-icons 캐시에 저장.
  await Promise.all(
    Array.from(iconUrls).map((url) => fetch(url).catch(() => null)),
  );
}

function PrewarmingScreen() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#FAFAF7",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "24px",
        // iOS PWA standalone safe-area 고려 (가운데 정렬이라 영향 거의 없지만 안전망).
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <MosaicLogo size={80} />
      <p
        style={{
          fontSize: "13px",
          color: "#6B6B6B",
          margin: 0,
        }}
      >
        쇼핑몰 정보를 불러오는 중...
      </p>
      <Spinner />
    </div>
  );
}

function Spinner() {
  return (
    <>
      <div
        style={{
          width: "20px",
          height: "20px",
          border: "2px solid #EFECE3",
          borderTopColor: "#5C3D1F",
          borderRadius: "50%",
          animation: "mosaic-prewarm-spin 0.8s linear infinite",
        }}
        aria-hidden="true"
      />
      <style>{`
        @keyframes mosaic-prewarm-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
