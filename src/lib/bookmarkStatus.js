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
 *
 * v3 (2026-06-02, 체감가 승격 — 익스텐션 v1.34.332~335): effectivePrice = 배송포함가 − 표시적립금.
 *  displayedReward(max_reward − 네이버 결제적립 2%) 추가. 정렬/최저가/목표가 모두 체감가에 라이드.
 *  적립금 상수 가정 → bookmarkIsLowest(역대최저 판정)는 무변경(델타 상쇄).
 * ========================================================= */
import { toKrw } from "./fxRate.js";

/** 표시 적립금(KRW) — 익스텐션 _displayedReward() 정합 (sidepanel.js:3071).
 *  max_reward(원본, 결제적립 미차감)에서 네이버 결제적립(내 할인가 2%)을 제외.
 *   - max_reward<=0 또는 max_reward_type 없음 → null.
 *   - naver_npay / naver_super: r −= round(current_price × 0.02). (current_price=KRW 정수)
 *   - gmarket_ggok: 원본 그대로.
 *   - 결과 r>0 일 때만 반환, 아니면 null. */
export function displayedReward(bm) {
  const mr = bm && bm.max_reward != null ? Number(bm.max_reward) : null;
  const type = bm && bm.max_reward_type ? bm.max_reward_type : null;
  if (mr == null || !(mr > 0) || !type) return null;
  let r = mr;
  const cur = bm.current_price != null ? Number(bm.current_price) : null;
  if (
    (type === "naver_npay" || type === "naver_super") &&
    cur != null &&
    cur > 0
  ) {
    r = r - Math.round(cur * 0.02); // 결제적립(내 할인가 2%) 제외
  }
  return r > 0 ? r : null;
}

/** 체감가(KRW 환산) = 배송포함가 − 표시적립금. 익스텐션 effectivePrice() 정합 (sidepanel.js:2784).
 *  ★ 가격추적 메인 비교 기준(v1.34.332) — 정렬/목표가/최저가가 모두 이 값에 라이드.
 *  base = current_price(KRW 정수) + 유료 배송비. current_price는 이미 KRW 환산(USD는 ×환율, KRW 항등).
 *  delivery_fee는 native 통화 → USD면 KRW 환산 후 합산(무료0/조건부·불명null → +0, 보수적).
 *  최종 = max(0, base − displayedReward).
 *  ※ 적립금은 시간 상수 가정 → 하락/상승 델타·역대최저 판정엔 영향 없음(bookmarkIsLowest 무변경). */
export function effectivePrice(bm) {
  const cur = bm && bm.current_price != null ? Number(bm.current_price) : null;
  if (cur == null || !(cur > 0)) return null;
  let base = cur;
  const fee = bm.delivery_fee != null ? Number(bm.delivery_fee) : null;
  if (fee != null && fee > 0) {
    const feeKrw = bm.price_currency === "USD" ? toKrw(fee, "USD") : fee;
    base += feeKrw != null ? feeKrw : 0;
  }
  const reward = displayedReward(bm) || 0;
  return Math.max(0, base - reward);
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
