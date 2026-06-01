/* =========================================================
 * src/lib/fxRate.js
 * USD→KRW 환율 — Supabase fx_rate(pair='USDKRW') 6h 캐시.
 * 익스텐션 sidepanel.js _usdKrwRate / _toKrw / _fmtMoney 정합 (PWA_USD_HANDOFF.md 2026-06-01).
 *
 * 정책 (확장과 동일):
 *  - 표시 = native 통화 ($8.50), USD는 (≈12,931원) 환산 병기.
 *  - 비교/최저가/목표가 = KRW 환산값(current_price 정수)으로 판정 (한국몰 cross 비교 정합).
 *  - 환산값(≈KRW)은 송신환율(ECB×1.01) 근사 — 카드수수료·관부가세 미반영(≈ 유지).
 *
 * 모듈 캐시(_usdKrwRate): 순수 함수(bookmarkStatus.effectivePrice 등)가 환율을 동기 참조하도록
 *  익스텐션 패턴을 미러. useUsdKrwRate() 훅이 SWR 로드 성공 시 캐시 갱신.
 *  ★ 표시 컴포넌트 트리 상단(Bookmarks)에서 훅을 호출해 구독 → 환율 도착 시 subtree 재렌더.
 * ========================================================= */
import useSWR from "swr";
import { supabase } from "./supabase.js";

// PWA_USD_HANDOFF.md 권장 폴백(1450). 서버 환율 미도착/실패 시 사용.
const FALLBACK_USDKRW = 1450;
let _usdKrwRate = FALLBACK_USDKRW;

/** 현재 USD→KRW 환율(모듈 캐시). 순수 함수에서 동기 참조용. */
export function getUsdKrwRate() {
  return _usdKrwRate > 0 ? _usdKrwRate : FALLBACK_USDKRW;
}

async function fetchUsdKrwRate() {
  const { data, error } = await supabase
    .from("fx_rate")
    .select("rate")
    .eq("pair", "USDKRW")
    .single();
  if (error) throw error;
  const r = data && data.rate != null ? Number(data.rate) : null;
  return r && r > 0 ? r : FALLBACK_USDKRW;
}

/** 환율 SWR 훅 — 6h dedupe. 로드 성공 시 모듈 캐시 갱신.
 *  반환값으로도 환율 제공하지만, 주 목적은 구독(환율 도착 시 호출 컴포넌트 트리 재렌더). */
export function useUsdKrwRate() {
  const { data } = useSWR("fx:usdkrw", fetchUsdKrwRate, {
    dedupingInterval: 6 * 60 * 60 * 1000,
    revalidateOnFocus: false,
  });
  // 렌더 중 캐시 갱신 — 동일 렌더 패스의 하위 effectivePrice/표시가 즉시 fresh rate 참조.
  if (data && data > 0) _usdKrwRate = data;
  return getUsdKrwRate();
}

/** native value → KRW 환산. USD면 ×환율 반올림, KRW는 반올림 항등. 익스텐션 _toKrw 정합. */
export function toKrw(value, currency) {
  if (value == null || isNaN(value)) return null;
  if (currency === "USD") return Math.round(Number(value) * getUsdKrwRate());
  return Math.round(Number(value));
}

/** 통화 표시 — USD "$X.XX", KRW "N원". 익스텐션 _fmtMoney 정합. */
export function fmtMoney(value, currency) {
  if (value == null || isNaN(value)) return "";
  if (currency === "USD") {
    return (
      "$" +
      Number(value).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  }
  return Number(value).toLocaleString("ko-KR") + "원";
}
