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

  tabWidth: 72,
  tabPadding: "12px 0",
  tabRadius: 999,
  tabColor: "var(--muted, #8e8e93)",
  tabActiveColor: "var(--blue, #0a84ff)",
  tabSize: 13.4,
  tabWeight: 720,

  activeThumbBg:
    "var(--bottom-tab-active-bg, rgba(255, 255, 255, 0.96))",
  activeThumbShadow:
    "var(--bottom-tab-active-shadow, 0 8px 22px rgba(0, 0, 0, 0.10))",

  // iOS 感滑动：起步快，中后段柔和吸附到位
  activeThumbTransition:
    "transform .42s cubic-bezier(0.16, 1, 0.3, 1), background .18s ease, box-shadow .18s ease",

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
  const activeIndex = view === "timeline" ? 1 : 0;

  const activeThumbTranslateX =
    activeIndex === 0
      ? 0
      : BOTTOM_BAR_CONFIG.tabWidth + BOTTOM_BAR_CONFIG.pillGap;

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

        @media (prefers-reduced-motion: reduce) {
          .bottom-active-thumb {
            transition: none !important;
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
            position: "relative",
            overflow: "hidden",
            isolation: "isolate",
          }}
        >
          <span
            aria-hidden
            className="bottom-active-thumb"
            style={{
              position: "absolute",
              left: BOTTOM_BAR_CONFIG.pillPadding,
              top: BOTTOM_BAR_CONFIG.pillPadding,
              bottom: BOTTOM_BAR_CONFIG.pillPadding,
              width: BOTTOM_BAR_CONFIG.tabWidth,
              borderRadius: BOTTOM_BAR_CONFIG.tabRadius,
              background: BOTTOM_BAR_CONFIG.activeThumbBg,
              boxShadow: BOTTOM_BAR_CONFIG.activeThumbShadow,
              transform: `translateX(${activeThumbTranslateX}px)`,
              transition: BOTTOM_BAR_CONFIG.activeThumbTransition,
              zIndex: 0,
              willChange: "transform",
            }}
          />

          {TABS.map((item) => {
            const active = view === item.view;

            return (
              <button
                key={item.view}
                type="button"
                onClick={() => onChange(item.view)}
                style={{
                  width: BOTTOM_BAR_CONFIG.tabWidth,
                  padding: BOTTOM_BAR_CONFIG.tabPadding,
                  borderRadius: BOTTOM_BAR_CONFIG.tabRadius,
                  color: active
                    ? BOTTOM_BAR_CONFIG.tabActiveColor
                    : BOTTOM_BAR_CONFIG.tabColor,
                  background: "transparent",
                  boxShadow: "none",
                  fontSize: BOTTOM_BAR_CONFIG.tabSize,
                  fontWeight: BOTTOM_BAR_CONFIG.tabWeight,
                  border: 0,
                  position: "relative",
                  zIndex: 1,
                  textAlign: "center",
                  transition:
                    "color .22s ease, transform .16s ease, opacity .16s ease",
                  WebkitTapHighlightColor: "transparent",
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