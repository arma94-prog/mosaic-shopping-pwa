/* =========================================================
 * src/lib/analytics.js
 * PWA Mixpanel — Mosaic Shopping Multi project + Simplified ID Merge.
 *
 * v3 변경 (2026-05-01, 트랙 E 2.3 — display_mode):
 *   - 🆕 detectDisplayMode() — PWA 실행 모드 검출 (standalone / browser / minimal-ui / fullscreen).
 *     window.navigator.standalone (iOS Safari) + matchMedia("(display-mode: standalone)") (표준).
 *   - 🆕 매 track event에 display_mode property 자동 첨부.
 *     "PWA 설치 사용자 비중" Insights 쿼리용.
 *   - 매 호출 시 다시 검출 (사용자가 브라우저 → 홈 아이콘 전환 시 즉시 반영).
 *
 * v2 (유지): 새 token (b2cde0...) + Simplified ID Merge.
 * ========================================================= */

// v2: Mosaic Shopping Multi (Simplified ID Merge)
const MIXPANEL_TOKEN = "b2cde0753d921eaf2fed3bfb6de34583";
const MIXPANEL_TRACK = "https://api-js.mixpanel.com/track/?verbose=0&ip=0";
const MIXPANEL_ENGAGE = "https://api.mixpanel.com/engage?verbose=0&ip=0";

const APP_VERSION =
  typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "unknown";

const STORAGE_KEY_DEVICE_ID = "ms_device_id";
const STORAGE_KEY_USER_ID = "ms_user_id";

function detectPlatform() {
  if (typeof navigator === "undefined") return "pwa_web";
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return "pwa_ios";
  if (/Android/.test(ua)) return "pwa_android";
  return "pwa_web";
}

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

/** v3: PWA 실행 모드 검출.
 *  "PWA 설치 사용자 비중" 측정용 핵심 property.
 *
 *  반환값:
 *    "standalone"   — 홈 아이콘으로 진입, 브라우저 chrome 없음 ⭐ "설치 후 사용"
 *    "minimal-ui"   — 일부 chrome 표시 (드물음)
 *    "fullscreen"   — 전체화면 (드물음)
 *    "browser"      — 브라우저에서 직접 URL 진입 (미설치 또는 미사용)
 *    "unknown"      — SSR 또는 검출 실패
 *
 *  검출 우선순위:
 *    1. iOS Safari: navigator.standalone (Apple 비표준 API, iOS PWA 유일 신호)
 *    2. 표준: matchMedia("(display-mode: standalone)") (Android Chrome 등)
 */
function detectDisplayMode() {
  if (typeof window === "undefined") return "unknown";
  try {
    // iOS Safari standalone (홈 아이콘으로 진입)
    if (window.navigator.standalone === true) return "standalone";
    // 표준 W3C display-mode media query
    if (window.matchMedia("(display-mode: standalone)").matches) return "standalone";
    if (window.matchMedia("(display-mode: minimal-ui)").matches) return "minimal-ui";
    if (window.matchMedia("(display-mode: fullscreen)").matches) return "fullscreen";
    return "browser";
  } catch (_) {
    return "unknown";
  }
}

const PLATFORM = detectPlatform();

// 메모리 캐시
let _cachedDeviceId = null;
let _cachedUserId = null;
let _userIdLoaded = false;

function getDeviceId() {
  if (_cachedDeviceId) return _cachedDeviceId;
  try {
    let id = localStorage.getItem(STORAGE_KEY_DEVICE_ID);
    if (!id) {
      const uuid = crypto?.randomUUID
        ? crypto.randomUUID()
        : Date.now() + "_" + Math.random().toString(36).slice(2, 10);
      id = "ms_pwa_" + uuid;
      localStorage.setItem(STORAGE_KEY_DEVICE_ID, id);
    }
    _cachedDeviceId = id;
    return id;
  } catch (_) {
    if (!_cachedDeviceId) {
      _cachedDeviceId = "ms_pwa_anon_" + Math.random().toString(36).slice(2, 10);
    }
    return _cachedDeviceId;
  }
}

function _loadUserIdOnce() {
  if (_userIdLoaded) return;
  _userIdLoaded = true;
  try {
    const id = localStorage.getItem(STORAGE_KEY_USER_ID);
    if (id) _cachedUserId = id;
  } catch (_) {}
}

function setUserId(userId) {
  if (!userId) return;
  _cachedUserId = String(userId);
  _userIdLoaded = true;
  try {
    localStorage.setItem(STORAGE_KEY_USER_ID, _cachedUserId);
  } catch (_) {}
}

function clearUserId() {
  _cachedUserId = null;
  _userIdLoaded = true;
  try {
    localStorage.removeItem(STORAGE_KEY_USER_ID);
  } catch (_) {}
}

function getCurrentUserId() {
  _loadUserIdOnce();
  return _cachedUserId;
}

function getCanonicalDistinctId() {
  const userId = getCurrentUserId();
  if (userId) return userId;
  return "$device:" + getDeviceId();
}

/** 이벤트 전송. v3: display_mode 자동 첨부. */
async function track(eventName, props) {
  if (!MIXPANEL_TOKEN) return;
  try {
    const deviceId = getDeviceId();
    const userId = getCurrentUserId();

    const properties = {
      token: MIXPANEL_TOKEN,
      time: Math.floor(Date.now() / 1000),
      app_version: APP_VERSION,
      platform: PLATFORM,
      display_mode: detectDisplayMode(),
      $device_id: deviceId,
      ...(props || {}),
    };

    if (userId) {
      properties.$user_id = userId;
      properties.distinct_id = userId;
    } else {
      properties.distinct_id = "$device:" + deviceId;
    }

    const payload = { event: eventName, properties };
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

async function _peopleCall(op, props) {
  if (!MIXPANEL_TOKEN) return false;
  try {
    const distinctId = getCanonicalDistinctId();
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

function formatLocalYmd(date) {
  const d = date || new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

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
 * 글로벌 에러 핸들러 (PC installGlobalErrorHandlers 정합)
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
  getDeviceId,
  getCurrentUserId,
  setUserId,
  clearUserId,
  peopleSet,
  peopleSetOnce,
  peopleAdd,
  getCurrentStateProps,
  formatLocalYmd,
  detectDisplayMode, // v3 신규
};
