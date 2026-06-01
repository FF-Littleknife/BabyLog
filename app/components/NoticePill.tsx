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
  top: 2, // 通知框距离屏幕顶部的距离；实际还会叠加 safe-area

  maxWidth: "calc(100vw - 32px)", // 通知框最大宽度；保留左右各16px安全边距

  zIndex: 160, // 通知框层级，保证盖在普通弹窗和页面内容上方
  minHeight: 42, // 通知框最小高度
  padding: "10px 15px", // 通知框内边距：上下10 / 左右15
  radius: 999, // 通知框圆角；999就是胶囊形状
  gap: 10, // 文本和“撤销”等操作按钮之间的距离

  bg: "var(--glass-bg)", // 通知框背景，跟随亮暗模式
  textColor: "var(--text)", // 普通通知文字颜色
  warnColor: "var(--orange)", // 警告通知文字颜色
  actionColor: "var(--blue)", // 操作按钮文字颜色，比如“撤销”

  fontSize: 13, // 通知文字字号
  fontWeight: 470, // 通知文字字重
  lineHeight: 1.28, // 通知文字行高；多行文字时会影响舒适度
  letterSpacing: "0.01em", // 通知文字字距

  shadow: "0 12px 30px var(--surface-muted-strong)", // 亮色模式下通知框阴影
  blur: "blur(18px)", // 通知框毛玻璃模糊强度

  enterDurationMs: 340, // 滑入动画时长
  exitDurationMs: 240, // 滑出动画时长
  enterEase: "cubic-bezier(0.2, 0.85, 0.2, 1)", // 滑入动画曲线
  exitEase: "cubic-bezier(0.4, 0, 1, 1)", // 滑出动画曲线
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

          width: "max-content",
          maxWidth: NOTICE.maxWidth,
          minHeight: NOTICE.minHeight,
          zIndex: NOTICE.zIndex,

          padding: NOTICE.padding,
          borderRadius: NOTICE.radius,
          boxSizing: "border-box",

          background: NOTICE.bg,
          color: tone === "warn" ? NOTICE.warnColor : NOTICE.textColor,

          boxShadow: `var(--notice-pill-shadow, ${NOTICE.shadow})`,
          backdropFilter: NOTICE.blur,
          WebkitBackdropFilter: NOTICE.blur,

          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: NOTICE.gap,
          textAlign: "center",
          pointerEvents: action && !leaving ? "auto" : "none",

          overflow: "hidden",
          whiteSpace: "normal",
          overflowWrap: "anywhere",
          wordBreak: "break-word",

          animation: leaving
            ? `noticePillSlideOut ${NOTICE.exitDurationMs}ms ${NOTICE.exitEase} both`
            : `noticePillSlideIn ${NOTICE.enterDurationMs}ms ${NOTICE.enterEase} both`,

          willChange: "transform, opacity, filter",

          ...noticeTextStyle,
        }}
      >
        <span
          style={{
            display: "block",
            minWidth: 0,
            maxWidth: "100%",
            flex: "1 1 auto",
            textAlign: "center",

            whiteSpace: "normal",
            overflowWrap: "anywhere",
            wordBreak: "break-word",

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
              flex: "0 0 auto",
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