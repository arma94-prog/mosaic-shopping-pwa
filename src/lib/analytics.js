/* =========================================================
 * src/lib/analytics.js
 * PWA Mixpanel — Mosaic Shopping Multi project + Simplified ID Merge.
 *
 * v2 변경 (2026-04-30, 트랙 E 2.1):
 *   - 새 project token (b2cde0...) 사용 (PC v1.24.4와 같은 project).
 *   - Simplified ID Merge 패턴: $device_id (+ 인증 후 $user_id) 매 이벤트 첨부.
 *     PC와 같은 Supabase user.id로 인증 → 자동 retroactive merge → 단일 프로필.
 *   - 새 API: setUserId / clearUserId / getCurrentUserId.
 *     AuthGate에서 session=true 시 setUserId, session=null 시 clearUserId.
 *   - storage key: ms_device_id (의미 명확), ms_user_id 신규.
 *
 * 정책 (PC 정합):
 *  - 모든 사용자에게 ON. OFF 스위치 없음.
 *  - fetch 실패 조용히 무시.
 *  - keepalive: true.
 * ========================================================= */

// v2 (트랙 E 2.1): Mosaic Shopping Multi (Simplified ID Merge)
const MIXPANEL_TOKEN = "b2cde0753d921eaf2fed3bfb6de34583";
const MIXPANEL_TRACK = "https://api-js.mixpanel.com/track/?verbose=0&ip=0";
const MIXPANEL_ENGAGE = "https://api.mixpanel.com/engage?verbose=0&ip=0";

// vite define으로 주입. package.json version 자동 sync.
const APP_VERSION =
  typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "unknown";

const STORAGE_KEY_DEVICE_ID = "ms_device_id";
const STORAGE_KEY_USER_ID = "ms_user_id";

/** PWA platform 식별 — PC "chrome_extension"과 명확 구분 */
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

const PLATFORM = detectPlatform();

// 메모리 캐시
let _cachedDeviceId = null;
let _cachedUserId = null;
let _userIdLoaded = false;

/** $device_id — localStorage UUID. 없으면 새로 생성. */
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
    // localStorage 차단 환경 (Safari private mode 등)
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

/** 사용자 인증 시 호출. 이후 모든 이벤트에 $user_id 자동 첨부. */
function setUserId(userId) {
  if (!userId) return;
  _cachedUserId = String(userId);
  _userIdLoaded = true;
  try {
    localStorage.setItem(STORAGE_KEY_USER_ID, _cachedUserId);
  } catch (_) {}
}

/** 로그아웃 시 호출. user_id 제거. device_id는 유지. */
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

/** 이벤트 전송. v2: $device_id + (조건부) $user_id 자동 첨부. */
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
};
