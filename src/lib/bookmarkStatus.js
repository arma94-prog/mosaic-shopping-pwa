/* =========================================================
 * src/lib/bookmarkStatus.js
 * 북마크 "현재 상태" 판정 — 익스텐션 sidepanel.js 정합 (단일 진실).
 *
 * 요약 수치(BookmarkReport)와 화면 배지(BookmarkGroup 최저가 pill / 목표가 달성)가
 * 반드시 같은 술어를 공유하도록 한 곳에 모은다. (숫자 ≠ 배지면 버그 — Arma 2026-05-31)
 *
 * 데이터 감사 (supabase-sync.js):
 *  - lowest_price ← m.minPrice (역대최저 '상품가' raw 미러).
 *  - current_price / initial_price ← priceHistory 끝/처음 (raw).
 *  - delivery_fee ← m.deliveryFee (N>0 유료 / 0 무료 / -1·null → null. 조건부는 미보존).
 *  - priceHistory 컬럼은 server 미보존 → 익스텐션도 pull 시 [initial, current] 2점 재구성.
 *  - 배송비 몰별 상수 가정(#358) → 단일 몰 "현재가==역대최저" 판정은 raw==effective 동치.
 *    (fee가 비교 양변에 같이 더해져 상쇄.) → lowest_price(raw) 직접 비교로 충분/정확.
 *
 * v2 (2026-06-01, 해외몰 USD): current_price가 KRW 환산 정수라 비교 로직 무변경.
 *  delivery_fee만 native 통화 → effectivePrice에서 USD fee를 KRW 환산해 합산.
 * ========================================================= */
import { toKrw } from "./fxRate.js";

/** 실결제가(KRW 환산) = current_price(KRW 정수) + 유료 배송비.
 *  ★ current_price는 이미 KRW 환산 정수(USD는 ×환율, KRW는 항등) → 한국몰 cross 비교 정합.
 *    (lowest_price/initial_price도 KRW 정수라 bookmarkIsLowest와 동일 기준 유지.)
 *  delivery_fee는 native 통화(USD몰이면 USD)라, USD면 KRW 환산 후 합산(통화 혼합 방지).
 *  무료(0) / 조건부무료(-1) / 불명(null) → +0 (보수적). 익스텐션 effectivePrice() 정합. */
export function effectivePrice(bm) {
  const cur = bm && bm.current_price != null ? Number(bm.current_price) : null;
  if (cur == null || !(cur > 0)) return null;
  const fee = bm.delivery_fee != null ? Number(bm.delivery_fee) : null;
  if (fee == null || !(fee > 0)) return cur;
  const feeKrw = bm.price_currency === "USD" ? toKrw(fee, "USD") : fee;
  return cur + (feeKrw != null ? feeKrw : 0);
}

/** 가격 신뢰 가능(ok) 몰인지. sold_out / not_found / blocked / 실패 = false. */
export function isMallValid(bm) {
  return !(bm && bm.last_check_status && bm.last_check_status !== "ok");
}

/** 단일 몰이 자기 가격 이력에서 '현재 역대최저' 상태인지.
 *  익스텐션 computePriceChangeInfo().isLowest 정합:
 *   - uniqueValues ≥ 2  ⟺  initial_price !== current_price (2점 재구성에서 등가, 단 movement 보장)
 *   - curr === minEff    ⟺  current_price === lowest_price (lowest_price = 역대최저 raw 미러)
 *  배송비 상수 가정으로 effective 기준과 동치. */
export function bookmarkIsLowest(bm) {
  if (!isMallValid(bm)) return false;
  const cur = bm.current_price != null ? Number(bm.current_price) : null;
  const low = bm.lowest_price != null ? Number(bm.lowest_price) : null;
  const init = bm.initial_price != null ? Number(bm.initial_price) : null;
  if (cur == null || low == null || init == null) return false;
  if (!(cur > 0) || !(low > 0)) return false;
  if (cur !== low) return false; // 현재가 == 역대최저
  if (init === cur) return false; // 움직임 있었음 (uniqueValues ≥ 2 proxy)
  return true;
}

/** 그룹 내 실결제가 최소 + 유효(ok) 몰. 익스텐션 groupHasLowestMall 내부 선정 정합. */
export function cheapestBookmark(bookmarks) {
  let cheapest = null;
  let cheapestEff = Infinity;
  for (const bm of bookmarks || []) {
    if (!isMallValid(bm)) continue;
    const eff = effectivePrice(bm);
    if (eff != null && eff < cheapestEff) {
      cheapestEff = eff;
      cheapest = bm;
    }
  }
  return cheapest;
}

/** M 술어 — 그룹의 '가장 싼 몰'이 현재 역대최저 상태인 그룹.
 *  익스텐션 groupHasLowestMall() + '최저가' 배지(L2292) 정합. */
export function groupHasLowestMall(group) {
  const cheapest = cheapestBookmark(group && group.bookmarks);
  return !!cheapest && bookmarkIsLowest(cheapest);
}

/** N 술어 — 목표가 설정(>0) + 현재 달성. 익스텐션 'bm-g-target achieved' 배지 정합. */
export function groupTargetAchieved(group) {
  return !!(
    group &&
    group.target_price != null &&
    Number(group.target_price) > 0 &&
    group.target_achieved
  );
}
