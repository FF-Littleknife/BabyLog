"use client";

import type { CSSProperties } from "react";

type NoticePillProps = {
  text: string;
  tone?: "default" | "warn";
  leaving?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
};

const NOTICE = {
  top: 16,
  maxWidth: "min(calc(100% - 32px), 390px)",
  zIndex: 160,
  minHeight: 42,
  padding: "10px 15px",
  radius: 999,
  gap: 10,

  bg: "var(--glass-bg)",
  textColor: "var(--text)",
  warnColor: "var(--orange)",
  actionColor: "var(--blue)",

  fontSize: 13,
  fontWeight: 470,
  lineHeight: 1.2,
  letterSpacing: "0.01em",

  shadow: "0 12px 30px var(--surface-muted-strong)",
  blur: "blur(18px)",

  enterDurationMs: 340,
  exitDurationMs: 240,
  enterEase: "cubic-bezier(0.2, 0.85, 0.2, 1)",
  exitEase: "cubic-bezier(0.4, 0, 1, 1)",
};

export const NOTICE_EXIT_MS = NOTICE.exitDurationMs;

const noticeTextStyle: CSSProperties = {
  fontFamily: "inherit",
  fontSize: NOTICE.fontSize,
  fontWeight: NOTICE.fontWeight,
  lineHeight: NOTICE.lineHeight,
  letterSpacing: NOTICE.letterSpacing,
  WebkitFontSmoothing: "antialiased",
};

export default function NoticePill({
  text,
  tone = "default",
  leaving = false,
  action,
}: NoticePillProps) {
  return (
    <>
      <style jsx global>{`
        @keyframes noticePillSlideIn {
          0% {
            opacity: 0;
            transform: translate3d(-50%, -18px, 0) scale(0.985);
            filter: blur(2px);
          }

          58% {
            opacity: 1;
            transform: translate3d(-50%, 2px, 0) scale(1);
            filter: blur(0);
          }

          100% {
            opacity: 1;
            transform: translate3d(-50%, 0, 0) scale(1);
            filter: blur(0);
          }
        }

        @keyframes noticePillSlideOut {
          0% {
            opacity: 1;
            transform: translate3d(-50%, 0, 0) scale(1);
            filter: blur(0);
          }

          100% {
            opacity: 0;
            transform: translate3d(-50%, -16px, 0) scale(0.985);
            filter: blur(2px);
          }
        }

        @media (prefers-color-scheme: dark) {
          .notice-pill {
            --notice-pill-shadow: none;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .notice-pill {
            animation: none !important;
          }
        }
      `}</style>

      <div
        className="notice-pill"
        aria-live="polite"
        style={{
          position: "fixed",
          left: "50%",
          top: `calc(${NOTICE.top}px + env(safe-area-inset-top))`,
          transform: "translateX(-50%)",
          width: "fit-content",
          maxWidth: NOTICE.maxWidth,
          minHeight: NOTICE.minHeight,
          zIndex: NOTICE.zIndex,

          padding: NOTICE.padding,
          borderRadius: NOTICE.radius,

          background: NOTICE.bg,
          color: tone === "warn" ? NOTICE.warnColor : NOTICE.textColor,

          boxShadow: `var(--notice-pill-shadow, ${NOTICE.shadow})`,
          backdropFilter: NOTICE.blur,
          WebkitBackdropFilter: NOTICE.blur,

          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: NOTICE.gap,
          textAlign: "center",
          pointerEvents: action && !leaving ? "auto" : "none",
          whiteSpace: "normal",

          animation: leaving
            ? `noticePillSlideOut ${NOTICE.exitDurationMs}ms ${NOTICE.exitEase} both`
            : `noticePillSlideIn ${NOTICE.enterDurationMs}ms ${NOTICE.enterEase} both`,

          willChange: "transform, opacity, filter",

          ...noticeTextStyle,
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            ...noticeTextStyle,
          }}
        >
          {text}
        </span>

        {action && (
          <button
            type="button"
            onClick={action.onClick}
            style={{
              appearance: "none",
              WebkitAppearance: "none",
              border: 0,
              margin: 0,
              padding: 0,
              background: "transparent",
              color: NOTICE.actionColor,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              whiteSpace: "nowrap",
              WebkitTapHighlightColor: "transparent",
              ...noticeTextStyle,
            }}
          >
            {action.label}
          </button>
        )}
      </div>
    </>
  );
}