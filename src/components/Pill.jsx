/* =========================================================
 * src/components/Pill.jsx
 * 공용 배지 — PC sidepanel.css 정합 + 모바일 +2pt 보정.
 *
 * v4 변경 (2026-04-30, 사용자 catch):
 *  - 폰트 +1pt 추가 (전체 +2pt 누적). PC 9px → v4 11px.
 *  - 색상 hex 직접 지정 (v3 유지).
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
  fontSize: "11px",  // PC 9px + 2 (모바일 가독성)
  padding: "2px 8px",
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
