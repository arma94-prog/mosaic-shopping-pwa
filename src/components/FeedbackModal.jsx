/* =========================================================
 * src/components/FeedbackModal.jsx
 * 오류 제보 + 사업 제휴 모달 — 단일 컴포넌트, type prop 분기.
 *
 * v2 변경 (2026-05, Phase 1.7 — alert → toast 마이그):
 *  - 🆕 useToast 훅 사용 — alert 2곳 (성공/실패) → showToast.
 *  - duration 2500ms — 사용자가 결과 메시지 읽을 시간 보장
 *    (갱신 토스트 500ms와 구분).
 *  - TECH_DEBT 🟢 alert→toast 부채 1개 해소.
 *
 * v1 (유지): 단일 모달, type="report" | "partner".
 * ========================================================= */
import { useEffect, useState } from "react";
import {
  sendFeedback,
  REPORT_OPTIONS,
  PARTNER_OPTIONS,
} from "../lib/feedback";
import { useToast } from "./ToastProvider";

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

const TOAST_DURATION_MS = 2500; // 피드백 결과는 사용자가 읽어야 하므로 길게.

export default function FeedbackModal({ type, onClose }) {
  const config = CONFIG[type];
  const [selectedValue, setSelectedValue] = useState(config.options[0].value);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const { showToast } = useToast();

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
      // v2: alert → showToast. 모달 닫고 토스트 표시.
      showToast("전송되었습니다. 감사합니다!", TOAST_DURATION_MS);
      onClose();
    } catch (e) {
      // v2: alert → showToast. 모달은 유지 (사용자 재시도 가능).
      showToast("전송 실패 — 잠시 후 다시 시도해주세요", TOAST_DURATION_MS);
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
