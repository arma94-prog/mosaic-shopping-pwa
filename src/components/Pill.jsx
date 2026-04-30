/* =========================================================
 * src/components/Pill.jsx
 * 공용 배지(pill) 컴포넌트 — PC sidepanel.css 정확 매핑.
 *
 * v2 변경 (2026-04-30, 사용자 catch):
 *  - new variant: weight 700 → weight 600 (PC .bm-new-badge 정합).
 *  - new 색: 토큰 갱신 (살구 → 앰버 옐로우, index.css에서 처리).
 *
 * Variants:
 *  - lowest         : 최저가 (bg #FBE8D9 / text #E8762B / weight 700)
 *  - target-achieved: 목표가 달성 (bg #E1F5EE / text #0F6E56 / weight 700)
 *  - target-default : 목표가 미달성 (bg #F0EFEA / text #666 / weight 700)
 *  - new            : 24시간 이내 신규 (bg #F5B800 / text #fff / weight 600)
 *
 * PC 정확 명세 (sidepanel.css):
 *  - .bm-new-badge:    bg #F5B800 / color #fff / 9px / 600 / pad 1px 6px / radius 999px
 *  - .bm-m-lowest:     bg #FBE8D9 / color #E8762B / 9px / 700 / pad 1px 6px / radius 999px
 *  - .bm-m-target:     bg #E1F5EE / color #0F6E56 / 9px / 700 / pad 1px 6px / radius 999px
 * ========================================================= */
import React from "react";

// 각 variant가 자기 weight 결정. NEW는 PC 정확 매핑으로 weight 600.
const VARIANT_STYLES = {
  lowest: "bg-mosaic-accent-bg text-mosaic-accent font-bold",
  "target-achieved": "bg-mosaic-success-bg text-mosaic-success font-bold",
  "target-default": "bg-mosaic-surface-pill text-mosaic-text-muted font-bold",
  new: "bg-mosaic-new-bg text-mosaic-new font-semibold",  // PC weight 600 → font-semibold
};

const BASE_STYLES =
  "inline-block flex-shrink-0 text-[9px] px-1.5 py-[1px] rounded-full tracking-[0.3px] leading-[1.4]";

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
