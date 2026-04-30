/* =========================================================
 * src/components/Pill.jsx
 * 공용 배지 — PC sidepanel.css 정확 매핑.
 *
 * v3 변경 (2026-04-30, 사용자 catch):
 *  - 모든 색을 hex 직접 지정 (Tailwind 토큰 의존 우회).
 *  - 폰트 9px → 10px (PC 9 +1, 모바일 가독성).
 *
 * PC 정확 명세 (sidepanel.css):
 *  - .bm-new-badge:    bg #F5B800 / color #fff / weight 600 / pad 1px 6px / radius 999px / 9px
 *  - .bm-m-lowest:     bg #FBE8D9 / color #E8762B / weight 700 / pad 1px 6px / 9px
 *  - .bm-g-target.unset:    bg #F0EFEA / color #999 / weight 500 / 9px
 *  - .bm-g-target.active:   bg #F0EFEA / color #666 / weight 600 / 9px
 *  - .bm-g-target.achieved: bg #E1F5EE / color #0F6E56 / weight 700 / 9px
 * ========================================================= */
import React from "react";

const VARIANT_STYLES = {
  lowest: {
    background: "#FBE8D9",
    color: "#E8762B",
    fontWeight: 700,
  },
  "target-achieved": {
    background: "#E1F5EE",
    color: "#0F6E56",
    fontWeight: 700,
  },
  "target-default": {
    background: "#F0EFEA",
    color: "#999",
    fontWeight: 500,
  },
  new: {
    background: "#F5B800",
    color: "#FFFFFF",
    fontWeight: 600,
  },
};

const BASE_STYLE = {
  display: "inline-block",
  flexShrink: 0,
  fontSize: "10px",  // PC 9px + 1
  padding: "1px 7px",  // PC 1px 6px - 살짝 넓힘 (10px 폰트 균형)
  borderRadius: "999px",
  letterSpacing: "0.3px",
  lineHeight: 1.4,
  whiteSpace: "nowrap",
};

export default function Pill({
  variant = "target-default",
  children,
  className = "",
  ...rest
}) {
  const variantStyle = VARIANT_STYLES[variant] || VARIANT_STYLES["target-default"];
  return (
    <span
      className={className}
      style={{ ...BASE_STYLE, ...variantStyle }}
      {...rest}
    >
      {children}
    </span>
  );
}
