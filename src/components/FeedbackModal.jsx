/* =========================================================
 * src/components/FeedbackModal.jsx
 * 오류 제보 + 사업 제휴 모달 — 단일 컴포넌트, type prop 분기.
 *
 * v1 신규 (2026-05-01, 트랙 E 3):
 *  - 단일 모달. type="report" | "partner".
 *  - 디자인: 모자이크 톤 (#FFFFFF + radius 12 + accent #E8762B).
 *  - 발송: lib/feedback.js의 sendFeedback. PC와 동일 URL.
 *  - 결과: alert 단순 처리 ("전송되었습니다" / "전송 실패").
 *  - ESC + 백드롭 클릭 닫기.
 *
 * 사용:
 *   <FeedbackModal type="report" onClose={() => setOpen(false)} />
 * ========================================================= */
import { useEffect, useState } from "react";
import {
  sendFeedback,
  REPORT_OPTIONS,
  PARTNER_OPTIONS,
} from "../lib/feedback";

const CONFIG = {
  report: {
    title: "오류 제보",
    options: REPORT_OPTIONS,
    placeholder: "내용을 입력해주세요",
  },
  partner: {
    title: "사업 제휴",
    options: PARTNER_OPTIONS,
    placeholder: "제휴 관련 내용을 입력해주세요\n(회사명, 담당자, 연락처 포함)",
  },
};

export default function FeedbackModal({ type, onClose }) {
  const config = CONFIG[type];
  const [selectedValue, setSelectedValue] = useState(config.options[0].value);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && !sending) onClose();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose, sending]);

  const handleSubmit = async () => {
    const trimmed = content.trim();
    if (!trimmed) return;
    const opt = config.options.find((o) => o.value === selectedValue);
    setSending(true);
    try {
      await sendFeedback({
        category: type,
        label: opt?.label || "",
        content: trimmed,
      });
      alert("전송되었습니다. 감사합니다!");
      onClose();
    } catch (e) {
      alert("전송 실패 — 잠시 후 다시 시도해주세요");
      setSending(false);
    }
  };

  const canSend = content.trim().length > 0 && !sending;

  return (
    <>
      <div
        onClick={() => !sending && onClose()}
        className="fixed inset-0 z-40"
        style={{ background: "rgba(0,0,0,0.4)" }}
        aria-hidden="true"
      />

      <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center pointer-events-none">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="feedback-title"
          className="pointer-events-auto w-full sm:max-w-md mx-0 sm:mx-4 overflow-hidden"
          style={{
            background: "#FFFFFF",
            borderRadius: "16px 16px 0 0",
            boxShadow: "0 -4px 16px rgba(0,0,0,0.18)",
          }}
        >
          {/* 헤더 */}
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: "1px solid #EFECE3" }}
          >
            <h2
              id="feedback-title"
              style={{ fontSize: "16px", fontWeight: 600, color: "#1A1A1A" }}
            >
              {config.title}
            </h2>
            <button
              type="button"
              aria-label="닫기"
              onClick={() => !sending && onClose()}
              style={{
                background: "transparent",
                border: "none",
                color: "#9F9F9F",
                fontSize: "22px",
                lineHeight: 1,
                cursor: "pointer",
                padding: "4px 8px",
              }}
            >
              ×
            </button>
          </div>

          {/* 본문 */}
          <div className="px-5 py-4 flex flex-col gap-3">
            <select
              value={selectedValue}
              onChange={(e) => setSelectedValue(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                fontSize: "14px",
                color: "#1A1A1A",
                background: "#FFFFFF",
                border: "1px solid #D4D0C4",
                borderRadius: "8px",
                outline: "none",
                cursor: "pointer",
              }}
            >
              {config.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={config.placeholder}
              rows={5}
              style={{
                width: "100%",
                padding: "10px 12px",
                fontSize: "14px",
                color: "#1A1A1A",
                background: "#FFFFFF",
                border: "1px solid #D4D0C4",
                borderRadius: "8px",
                outline: "none",
                resize: "vertical",
                fontFamily: "inherit",
                lineHeight: 1.5,
                minHeight: "120px",
              }}
            />
          </div>

          {/* 보내기 버튼 */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSend}
            style={{
              width: "100%",
              padding: "14px",
              fontSize: "15px",
              fontWeight: 600,
              color: "#FFFFFF",
              background: canSend ? "#E8762B" : "#C8C4B5",
              border: "none",
              cursor: canSend ? "pointer" : "default",
              transition: "background 0.15s",
            }}
          >
            {sending ? "전송중..." : "보내기"}
          </button>
        </div>
      </div>
    </>
  );
}
