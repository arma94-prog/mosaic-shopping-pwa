/* =========================================================
 * src/lib/analytics.js
 * PWA Mixpanel — PC analytics.js (chrome 확장) 정합.
 *
 * 차이점:
 *  - chrome.storage → localStorage (PWA 환경)
 *  - platform: "pwa_ios" / "pwa_android" / "pwa_web" (PC: "chrome_extension")
 *  - distinct_id: localStorage UUID (PC와 별개. Phase 2에서 alias 검토)
 *  - app_version: __APP_VERSION__ (vite define에서 주입, package.json version)
 *
 * 정책 (PC와 동일):
 *  - 모든 사용자에게 ON. OFF 스위치 없음.
 *  - fetch 실패 조용히 무시 (UX 영향 0)
 *  - keepalive: true (페이지 unload 시에도 전송)
 * ========================================================= */

const MIXPANEL_TOKEN = "0074e8d9a7fc086c5eb65b0eae1a6761";
const MIXPANEL_TRACK = "https://api-js.mixpanel.com/track/?verbose=0&ip=0";
const MIXPANEL_ENGAGE = "https://api.mixpanel.com/engage?verbose=0&ip=0";

// vite define으로 주입. package.json version 자동 sync.
// fallback "unknown" — define 안 된 경우 (예: dev 환경에서 build 안 함)
const APP_VERSION =
  typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "unknown";

/** PWA platform 식별 — PC "chrome_extension"과 명확 구분 */
function detectPlatform() {
  if (typeof navigator === "undefined") return "pwa_web";
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return "pwa_ios";
  if (/Android/.test(ua)) return "pwa_android";
  return "pwa_web";
}

/** OS 종류 — People property `os`용. PC getCurrentStateProps 정합 */
function detectOs() {
  if (typeof navigator === "undefined") return "";
  if (navigator.userAgentData?.platform) return navigator.userAgentData.platform;
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return "iOS";
  if (/Android/.test(ua)) return "Android";
  if (/Win/.test(ua)) return "Windows";
  if (/Mac/.test(ua)) return "macOS";
  if (/Linux/.test(ua)) return "Linux";
  return "";
}

const PLATFORM = detectPlatform();

/** distinct_id — localStorage UUID. PC chrome.storage 패턴 정합. */
function getDistinctId() {
  try {
    let id = localStorage.getItem("ms_distinct_id");
    if (!id) {
      const uuid = crypto?.randomUUID
        ? crypto.randomUUID()
        : Date.now() + "_" + Math.random().toString(36).slice(2, 10);
      id = "ms_pwa_" + uuid;
      localStorage.setItem("ms_distinct_id", id);
    }
    return id;
  } catch (_) {
    // localStorage 차단 환경 (Safari private mode 등)
    return "ms_pwa_anon_" + Math.random().toString(36).slice(2, 10);
  }
}

/** 이벤트 전송. 실패 조용히 무시 (PC 정합). */
async function track(eventName, props) {
  if (!MIXPANEL_TOKEN) return;
  try {
    const distinctId = getDistinctId();
    const payload = {
      event: eventName,
      properties: {
        token: MIXPANEL_TOKEN,
        distinct_id: distinctId,
        time: Math.floor(Date.now() / 1000),
        app_version: APP_VERSION,
        platform: PLATFORM,
        ...(props || {}),
      },
    };
    const body = "data=" + encodeURIComponent(JSON.stringify(payload));
    await fetch(MIXPANEL_TRACK, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      keepalive: true,
    });
  } catch (e) {
    console.warn("[analytics] track fail:", eventName, e);
  }
}

/** People $set / $set_once / $add. PC peopleSet/peopleSetOnce/peopleAdd 정합. */
async function _peopleCall(op, props) {
  if (!MIXPANEL_TOKEN) return false;
  try {
    const distinctId = getDistinctId();
    const payload = {
      $token: MIXPANEL_TOKEN,
      $distinct_id: distinctId,
      [op]: props || {},
    };
    const body = "data=" + encodeURIComponent(JSON.stringify(payload));
    const res = await fetch(MIXPANEL_ENGAGE, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      keepalive: true,
    });
    return res.ok;
  } catch (e) {
    console.warn("[analytics] people fail:", op, e);
    return false;
  }
}

const peopleSet = (props) => _peopleCall("$set", props);
const peopleSetOnce = (props) => _peopleCall("$set_once", props);
const peopleAdd = (props) => _peopleCall("$add", props);

/** 매 mount 시 갱신할 People props (PC getCurrentStateProps 정합) */
function getCurrentStateProps() {
  let locale = "";
  try {
    locale = navigator.language || "";
  } catch (_) {}
  return {
    os: detectOs(),
    locale,
    current_version: APP_VERSION,
  };
}

/** 로컬 시간대 YYYY-MM-DD (PC formatLocalYmd 정합) */
function formatLocalYmd(date) {
  const d = date || new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** bookmark_tab_view daily — 하루 1번만 발동 (PC trackBookmarkTabViewDaily 정합) */
async function trackBookmarkTabViewDaily(extraProps) {
  try {
    const today = formatLocalYmd();
    const last = localStorage.getItem("ms_bookmark_tab_last_day");
    if (last === today) return;
    localStorage.setItem("ms_bookmark_tab_last_day", today);
    track("bookmark_tab_view", extraProps || {});
  } catch (e) {
    console.warn("[analytics] daily fail:", e);
  }
}

/* =========================================================
 * 글로벌 에러 핸들러 — PC installGlobalErrorHandlers 정합
 * ========================================================= */
const ERROR_DEDUP_MS = 5 * 60 * 1000;
const ERROR_SESSION_MAX = 10;
const _errorDedupMap = new Map();
let _errorSessionCount = 0;
let _errorHandlerInstalled = false;

function _truncate(s, n) {
  if (s == null) return "";
  s = String(s);
  return s.length > n ? s.slice(0, n) : s;
}

async function trackError(info) {
  try {
    if (_errorSessionCount >= ERROR_SESSION_MAX) return;
    const key =
      (info.errorName || "Error") + "|" + (info.sourceFile || "") + "|" + (info.lineNumber || 0);
    const now = Date.now();
    const last = _errorDedupMap.get(key) || 0;
    if (now - last < ERROR_DEDUP_MS) return;
    _errorDedupMap.set(key, now);
    _errorSessionCount++;
    track("app_error", {
      error_type: info.errorType || "manual",
      error_name: _truncate(info.errorName || "Error", 64),
      error_message: _truncate(info.errorMessage || "", 200),
      error_stack: _truncate(info.errorStack || "", 500),
      source_file: _truncate(info.sourceFile || "", 80),
      line_number: info.lineNumber || null,
      column_number: info.columnNumber || null,
      surface: info.surface || "pwa",
    });
  } catch (_) {}
}

function installGlobalErrorHandlers() {
  if (_errorHandlerInstalled) return;
  _errorHandlerInstalled = true;
  try {
    window.addEventListener("error", (ev) => {
      try {
        trackError({
          errorType: "uncaught",
          errorName: (ev.error && ev.error.name) || "Error",
          errorMessage: ev.message || (ev.error && ev.error.message) || "",
          errorStack: (ev.error && ev.error.stack) || "",
          sourceFile: ev.filename ? ev.filename.split("/").pop() : "",
          lineNumber: ev.lineno,
          columnNumber: ev.colno,
          surface: "pwa",
        });
      } catch (_) {}
    });
    window.addEventListener("unhandledrejection", (ev) => {
      try {
        const reason = ev.reason;
        const isErr = reason instanceof Error;
        trackError({
          errorType: "unhandled_promise",
          errorName: isErr ? reason.name : typeof reason,
          errorMessage: isErr ? reason.message : String(reason).slice(0, 200),
          errorStack: isErr ? reason.stack || "" : "",
          surface: "pwa",
        });
      } catch (_) {}
    });
  } catch (_) {}
}

export const analytics = {
  track,
  trackBookmarkTabViewDaily,
  trackError,
  installGlobalErrorHandlers,
  getDistinctId,
  peopleSet,
  peopleSetOnce,
  peopleAdd,
  getCurrentStateProps,
  formatLocalYmd,
};
