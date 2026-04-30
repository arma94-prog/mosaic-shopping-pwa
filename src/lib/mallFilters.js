/* =========================================================
 * src/lib/mallFilters.js
 * mall 필터링 + 커스텀 병합 공용 헬퍼.
 *
 * 책임:
 *  - Supabase user_settings 단일 row fetch + 메모리 캐싱.
 *  - PC sidepanel.js의 filterDisabled() 정확 매핑.
 *  - PC sidepanel.js의 mergeWithCustom() 정확 매핑.
 *
 * 사용처:
 *  - SearchResults.jsx (mode = "search")
 *  - Events.jsx (mode = "event")
 *
 * SoC: event/search 공유 정책 = 같은 함수, mode 파라미터로 분기 (PC 정합).
 *
 * v1 (2026-04-30): PC와 1:1 정합성 확보를 위한 즉시 fix.
 *  - 사용자 catch: PC에서 OFF한 mall/카테고리가 PWA에 그대로 표시됨.
 *  - 진단: PWA가 user_settings fetch 자체를 안 함 (PC는 chrome.storage 직접 사용).
 *  - 해결: Supabase user_settings JSONB fetch + 같은 필터 알고리즘.
 * ========================================================= */
import { supabase } from "./supabase.js";

let _cache = null;
let _inFlight = null;

/**
 * Supabase user_settings 단일 row fetch.
 * 자연 키 PK = user_id. RLS로 본인 데이터만 접근.
 *
 * 메모리 캐싱 — 페이지 새로고침 전까진 1회만 fetch.
 * (mall 추가/삭제는 PC에서만 가능 = 실시간 변경 X = 캐싱 안전)
 */
export async function fetchUserSettings() {
  if (_cache) return _cache;
  if (_inFlight) return _inFlight;

  _inFlight = (async () => {
    try {
      const { data, error } = await supabase
        .from("user_settings")
        .select(
          "custom_event_malls, custom_search_malls, disabled_malls, disabled_cats, custom_cat_names, default_mall"
        )
        .maybeSingle();

      if (error) {
        // eslint-disable-next-line no-console
        console.error("[mosaic-pwa] user_settings fetch error", error);
        // 에러 시 안전 기본값 (필터 미적용 = PC 미적용과 같은 상태)
        return EMPTY_SETTINGS;
      }
      const safe = data || EMPTY_SETTINGS;
      _cache = safe;
      return safe;
    } finally {
      _inFlight = null;
    }
  })();

  return _inFlight;
}

const EMPTY_SETTINGS = {
  custom_event_malls: [],
  custom_search_malls: [],
  disabled_malls: { event: {}, search: {} },
  disabled_cats: { event: {}, search: {} },
  custom_cat_names: {},
  default_mall: null,
};

/**
 * PC sidepanel.js mergeWithCustom() 정확 매핑.
 * 원격 카테고리 + 사용자 커스텀 mall 병합.
 *
 * customItems 형식 (PC와 동일): [{ name, url, urlMobile?, icon, category }]
 *  - item.category = 합칠 cat.key (예: "종합몰", "패션")
 *  - 매칭 안 되면 "기타" 카테고리로 모음.
 */
export function mergeWithCustom(remoteCategories, customItems) {
  if (!Array.isArray(remoteCategories)) return [];
  if (!Array.isArray(customItems) || customItems.length === 0) {
    // 커스텀 없으면 원본 그대로 반환 (얕은 복사로 안전)
    return remoteCategories.map((cat) => ({
      ...cat,
      items: [...(cat.items || [])],
    }));
  }

  const merged = remoteCategories.map((cat) => ({
    ...cat,
    items: [...(cat.items || [])],
    customCount: 0,
  }));

  const idxByKey = {};
  merged.forEach((cat, i) => {
    idxByKey[cat.key] = i;
  });

  const orphans = [];
  customItems.forEach((item) => {
    const idx = idxByKey[item.category];
    if (idx != null) {
      merged[idx].items.push({ ...item, isCustom: true });
      merged[idx].customCount++;
    } else {
      orphans.push({ ...item, isCustom: true });
    }
  });

  if (orphans.length > 0) {
    merged.push({
      key: "__other",
      label: "기타",
      items: orphans,
      customCount: orphans.length,
    });
  }

  return merged;
}

/**
 * PC sidepanel.js filterDisabled() 정확 매핑.
 *
 * disabled 키 형식 (PC 정확):
 *  - disabled_cats[mode][cat.key] = true        ← 카테고리 단위 OFF
 *  - disabled_malls[mode][cat.key + ":" + item.name] = true   ← mall 단위 OFF
 *
 * @param {Array} categories - mergeWithCustom 결과
 * @param {string} mode - "event" | "search"
 * @param {Object} settings - fetchUserSettings 결과
 */
export function filterDisabled(categories, mode, settings) {
  if (!Array.isArray(categories)) return [];
  if (!settings) return categories;

  const dCats = (settings.disabled_cats && settings.disabled_cats[mode]) || {};
  const dMalls = (settings.disabled_malls && settings.disabled_malls[mode]) || {};

  return categories
    .filter((cat) => !dCats[cat.key])
    .map((cat) => {
      const filtered = (cat.items || []).filter(
        (item) => !dMalls[cat.key + ":" + item.name]
      );
      return { ...cat, items: filtered };
    })
    .filter((cat) => cat.items.length > 0);
}

/**
 * 카테고리 라벨에 사용자 커스텀 이름 적용 (PC custom_cat_names).
 * settings.custom_cat_names = { [cat.key]: "사용자 정의 이름" }
 */
export function applyCustomCatNames(categories, settings) {
  if (!Array.isArray(categories)) return [];
  if (!settings || !settings.custom_cat_names) return categories;

  const customNames = settings.custom_cat_names;
  return categories.map((cat) => {
    const customLabel = customNames[cat.key];
    if (customLabel) {
      return { ...cat, label: customLabel };
    }
    return cat;
  });
}

/**
 * 통합 파이프라인 — PC sidepanel.js renderCurrent() 정확 매핑.
 *
 * @param {Object} data - fetchEventMalls() 또는 fetchSearchMalls() 결과
 * @param {string} mode - "event" | "search"
 * @param {Object} settings - fetchUserSettings 결과
 * @returns {Array} 필터링 + 병합 + 커스텀 라벨 적용된 카테고리 배열
 */
export function applyMallFilters(data, mode, settings) {
  if (!data || !Array.isArray(data.categories)) return [];

  const customItems =
    mode === "event"
      ? settings.custom_event_malls || []
      : settings.custom_search_malls || [];

  let categories = mergeWithCustom(data.categories, customItems);
  categories = filterDisabled(categories, mode, settings);
  categories = applyCustomCatNames(categories, settings);
  return categories;
}
