"use client";

import type { CSSProperties } from "react";

type NursingFabButtonProps = {
  size: number;
  nursing: boolean;
  nursingRunning?: boolean;
  nursingSeconds?: number;
  onClick: () => void;
};

/**
 * 哺乳悬浮按钮参数
 * 后面想调按钮背景、描边、阴影、图标、计时文字、按压反馈，优先改这里。
 */
const NURSING_FAB_CONFIG = {
  bg: "var(--glass-bg)", // 默认按钮背景；吃全局亮暗模式变量，不再依赖 BottomBar 变量
  activeBg: "#ff0063", // 哺乳计时中按钮背景色；粉色高亮

  border: "1px solid var(--border)", // 默认按钮描边；补回边界感，并避免被 BottomBar 样式影响
  activeBorder: "1px solid transparent", // 哺乳计时中按钮描边；透明避免粉色状态出现杂边

  blur: "blur(34px) saturate(180%)", // 按钮毛玻璃强度
  color: "var(--text)", // 默认文字 / 图标理论颜色；主要给无图标状态兜底
  activeColor: "#ffffff", // 哺乳计时中文字颜色

  shadow: "var(--shadow-card)", // 默认按钮阴影；吃全局变量，亮暗模式稳定
  activeShadow: "0 18px 54px rgba(255, 0, 99, 0.32)", // 哺乳计时中按钮阴影

  activeScale: 0.93, // 按钮按下时缩放比例

  icon: "/moon.svg", // 默认按钮图标路径
  iconSize: 48, // 默认按钮图标尺寸

  timerSize: 20, // 计时文字字号
  timerWeight: 640, // 计时文字字重
};

function formatNursingButtonTime(seconds: number) {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const remainSeconds = safeSeconds % 60;

  if (minutes >= 100) return `${minutes}m`;

  return `${String(minutes).padStart(2, "0")}:${String(remainSeconds).padStart(
    2,
    "0"
  )}`;
}

export default function NursingFabButton({
  size,
  nursing,
  nursingRunning = false,
  nursingSeconds = 0,
  onClick,
}: NursingFabButtonProps) {
  return (
    <button
      type="button"
      aria-label={nursing ? "打开哺乳计时" : "哺乳"}
      onClick={onClick}
      style={
        {
          width: size,
          height: size,
          background: nursing
            ? NURSING_FAB_CONFIG.activeBg
            : NURSING_FAB_CONFIG.bg,
          backdropFilter: NURSING_FAB_CONFIG.blur,
          WebkitBackdropFilter: NURSING_FAB_CONFIG.blur,
          color: nursing
            ? NURSING_FAB_CONFIG.activeColor
            : NURSING_FAB_CONFIG.color,
          boxShadow: nursing
            ? NURSING_FAB_CONFIG.activeShadow
            : NURSING_FAB_CONFIG.shadow,

          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
          border: nursing
            ? NURSING_FAB_CONFIG.activeBorder
            : NURSING_FAB_CONFIG.border,
          borderRadius: 999,
          position: "relative",
          overflow: "visible",
          flexShrink: 0,
          pointerEvents: "auto",
          cursor: "pointer",
          boxSizing: "border-box",
          WebkitTapHighlightColor: "transparent",
          transition:
            "background .18s ease, border-color .18s ease, box-shadow .18s ease, transform .18s ease",
          "--nurse-active-scale": NURSING_FAB_CONFIG.activeScale,
        } as CSSProperties
      }
    >
      {nursing ? (
        <span
          style={{
            color: NURSING_FAB_CONFIG.activeColor,
            fontSize: NURSING_FAB_CONFIG.timerSize,
            fontWeight: NURSING_FAB_CONFIG.timerWeight,
            lineHeight: 1,
            fontVariantNumeric: "tabular-nums",
            letterSpacing: "-0.04em",
            position: "relative",
            zIndex: 2,
            opacity: nursingRunning ? 1 : 0.78,
          }}
        >
          {formatNursingButtonTime(nursingSeconds)}
        </span>
      ) : (
        <img
          src={NURSING_FAB_CONFIG.icon}
          alt=""
          style={{
            width: NURSING_FAB_CONFIG.iconSize,
            height: NURSING_FAB_CONFIG.iconSize,
            objectFit: "contain",
            display: "block",
            position: "relative",
            zIndex: 2,
          }}
        />
      )}
    </button>
  );
}