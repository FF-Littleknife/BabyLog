"use client";

import type { CSSProperties } from "react";
import WhiteNoiseButton from "@/app/components/WhiteNoiseButton";
import NursingFabButton from "@/app/components/NursingFabButton";

type ViewType = "home" | "timeline";

type BottomBarProps = {
  view: ViewType;
  onChange: (v: ViewType) => void;
  onNurse: () => void;
  nursing: boolean;
  nursingRunning?: boolean;
  nursingSeconds?: number;
  showNurse?: boolean;
};

const BOTTOM_BAR_CONFIG = {
  maxWidth: 430,
  paddingX: 26,
  bottom: 0,
  zIndex: 40,

  pillGap: 4,
  pillPadding: 5,
  pillBg: "var(--bottom-pill-bg, rgba(255, 255, 255, 0.62))",
  pillBlur: "blur(34px) saturate(180%)",
  pillRadius: 999,
  pillBorder:
    "1px solid var(--bottom-pill-border, rgba(255, 255, 255, 0.78))",
  pillShadow:
    "var(--bottom-pill-shadow, 0 16px 44px rgba(0, 0, 0, 0.12))",

  tabPadding: "12px 18px",
  tabRadius: 999,
  tabColor: "var(--muted, #8e8e93)",
  tabActiveColor: "var(--blue, #0a84ff)",
  tabActiveBg:
    "var(--bottom-tab-active-bg, rgba(255, 255, 255, 0.96))",
  tabActiveShadow:
    "var(--bottom-tab-active-shadow, 0 8px 22px rgba(0, 0, 0, 0.10))",
  tabSize: 17,
  tabWeight: 720,

  fabGap: 10,
  fabSize: 68,
};

const TABS: { view: ViewType; label: string }[] = [
  { view: "home", label: "记录" },
  { view: "timeline", label: "时间线" },
];

export default function BottomBar({
  view,
  onChange,
  onNurse,
  nursing,
  nursingRunning = false,
  nursingSeconds = 0,
  showNurse = true,
}: BottomBarProps) {
  return (
    <>
      <style jsx global>{`
        @media (prefers-color-scheme: dark) {
          :root {
            --bottom-pill-bg: rgba(44, 44, 46, 0.72);
            --bottom-pill-border: rgba(99, 99, 102, 0.36);
            --bottom-pill-shadow: 0 14px 34px rgba(0, 0, 0, 0.48);
            --bottom-tab-active-bg: rgba(58, 58, 60, 0.92);
            --bottom-tab-active-shadow: none;
          }
        }
      `}</style>

      <div
        className="bottom-bar"
        style={
          {
            width: `min(100%, ${BOTTOM_BAR_CONFIG.maxWidth}px)`,
            paddingInline: BOTTOM_BAR_CONFIG.paddingX,
            bottom: `calc(${BOTTOM_BAR_CONFIG.bottom}px + env(safe-area-inset-bottom))`,
            zIndex: BOTTOM_BAR_CONFIG.zIndex,
          } as CSSProperties
        }
      >
        <div
          className="bottom-pill"
          style={{
            gap: BOTTOM_BAR_CONFIG.pillGap,
            padding: BOTTOM_BAR_CONFIG.pillPadding,
            background: BOTTOM_BAR_CONFIG.pillBg,
            backdropFilter: BOTTOM_BAR_CONFIG.pillBlur,
            WebkitBackdropFilter: BOTTOM_BAR_CONFIG.pillBlur,
            borderRadius: BOTTOM_BAR_CONFIG.pillRadius,
            border: BOTTOM_BAR_CONFIG.pillBorder,
            boxShadow: BOTTOM_BAR_CONFIG.pillShadow,
          }}
        >
          {TABS.map((item) => {
            const active = view === item.view;

            return (
              <button
                key={item.view}
                type="button"
                onClick={() => onChange(item.view)}
                style={{
                  padding: BOTTOM_BAR_CONFIG.tabPadding,
                  borderRadius: BOTTOM_BAR_CONFIG.tabRadius,
                  color: active
                    ? BOTTOM_BAR_CONFIG.tabActiveColor
                    : BOTTOM_BAR_CONFIG.tabColor,
                  background: active
                    ? BOTTOM_BAR_CONFIG.tabActiveBg
                    : "transparent",
                  boxShadow: active
                    ? BOTTOM_BAR_CONFIG.tabActiveShadow
                    : "none",
                  fontSize: BOTTOM_BAR_CONFIG.tabSize,
                  fontWeight: BOTTOM_BAR_CONFIG.tabWeight,
                  border: 0,
                  transition:
                    "background .18s ease, color .18s ease, box-shadow .18s ease, transform .18s ease",
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {showNurse ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: BOTTOM_BAR_CONFIG.fabGap,
              flexShrink: 0,
              position: "relative",
              pointerEvents: "auto",
            }}
          >
            <WhiteNoiseButton size={BOTTOM_BAR_CONFIG.fabSize} />

            <NursingFabButton
              size={BOTTOM_BAR_CONFIG.fabSize}
              nursing={nursing}
              nursingRunning={nursingRunning}
              nursingSeconds={nursingSeconds}
              onClick={onNurse}
            />
          </div>
        ) : (
          <div
            aria-hidden
            style={{
              width: BOTTOM_BAR_CONFIG.fabSize * 2 + BOTTOM_BAR_CONFIG.fabGap,
              height: BOTTOM_BAR_CONFIG.fabSize,
              flexShrink: 0,
              pointerEvents: "none",
              opacity: 0,
            }}
          />
        )}
      </div>
    </>
  );
}