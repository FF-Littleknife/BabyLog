"use client";

import type { CSSProperties } from "react";

type NursingFabButtonProps = {
  size: number;
  nursing: boolean;
  nursingRunning?: boolean;
  nursingSeconds?: number;
  onClick: () => void;
};

const NURSING_FAB_CONFIG = {
  bg: "var(--surface-soft)",
  activeBg: "#ff0063",
  blur: "blur(34px) saturate(180%)",
  color: "var(--text)",
  activeColor: "#ffffff",
  shadow: "var(--shadow-float)",
  activeShadow: "0 18px 54px rgba(255, 59, 48, 0.32)",
  activeScale: 0.93,
  iconSize: 48,
  timerSize: 20,
  timerWeight: 640,
};

function formatNursingButtonTime(seconds: number) {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const remainSeconds = safeSeconds % 60;

  if (minutes >= 100) return `${minutes}m`;

  return `${String(minutes).padStart(2, "0")}:${String(remainSeconds).padStart(2, "0")}`;
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
          background: nursing ? NURSING_FAB_CONFIG.activeBg : NURSING_FAB_CONFIG.bg,
          backdropFilter: NURSING_FAB_CONFIG.blur,
          WebkitBackdropFilter: NURSING_FAB_CONFIG.blur,
          color: nursing ? NURSING_FAB_CONFIG.activeColor : NURSING_FAB_CONFIG.color,
          boxShadow: nursing ? NURSING_FAB_CONFIG.activeShadow : NURSING_FAB_CONFIG.shadow,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
          border: 0,
          borderRadius: 999,
          position: "relative",
          overflow: "visible",
          flexShrink: 0,
          pointerEvents: "auto",
          cursor: "pointer",
          WebkitTapHighlightColor: "transparent",
          transition: "background .18s ease, box-shadow .18s ease, transform .18s ease",
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
          src="/moon.svg"
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
