/* =========================================================
 * src/components/Pill.jsx
 * 공용 배지(pill) 컴포넌트.
 *
 * PC sidepanel.css의 .bm-g-lowest / .bm-g-target / .bm-m-lowest / .bm-m-target
 * 4종이 모두 동일 패턴 (9px / weight 700 / pill rounded-full / 다른 색만).
 * 이 패턴을 단일 컴포넌트로 추출 — 일관성 + 향후 변형 추가 쉬움.
 *
 * Variants:
 *  - lowest         : 최저가 (oranje accent)
 *  - target-achieved: 목표가 달성 (success green)
 *  - target-default : 목표가 미달성 (회색)
 *  - new            : 24시간 이내 추가된 신규 mall (oranje 변형)
 *
 * 디자인 명세 (PC 매핑):
 *  - .bm-g-lowest:    bg #FBE8D9 / color #E8762B / 9px / 700 / pill 999px
 *  - .bm-g-target.achieved: bg #E1F5EE / color #0F6E56 / 9px / 700
 *  - .bm-g-target.active:   bg #F0EFEA / color #666     / 9px / 700
 *  - new (PWA 신규):  bg #FFE8CC / color #D06820 / 9px / 700
 * ========================================================= */
import React from "react";

const VARIANT_STYLES = {
  lowest: "bg-mosaic-accent-bg text-mosaic-accent",
  "target-achieved": "bg-mosaic-success-bg text-mosaic-success",
  "target-default": "bg-mosaic-surface-pill text-mosaic-text-muted",
  new: "bg-mosaic-new-bg text-mosaic-new",
};

const BASE_STYLES =
  "inline-block flex-shrink-0 text-[9px] font-bold px-1.5 py-[2px] rounded-full tracking-[0.3px] leading-[1.4]";

export default function Pill({
  variant = "target-default",
  children,
  className = "",
  ...rest
}) {
  const variantClass = VARIANT_STYLES[variant] || VARIANT_STYLES["target-default"];
  return (
    <span
      className={`${BASE_STYLES} ${variantClass} ${className}`}
      {...rest}
    >
      {children}
    </span>
  );
}
