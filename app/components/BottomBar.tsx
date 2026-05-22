import type { CSSProperties } from "react";

type ViewType = "home" | "timeline";

type BottomBarProps = {
  view: ViewType;
  onChange: (v: ViewType) => void;
  onNurse: () => void;
  nursing: boolean;
  showNurse?: boolean;
};

const BOTTOM_BAR_CONFIG = {
  maxWidth: 430,
  paddingX: 26,
  bottom: 0,
  zIndex: 40,

  pillGap: 4,
  pillPadding: 5,
  pillBg: "rgba(255, 255, 255, 0.42)",
  pillBlur: "blur(34px) saturate(180%)",
  pillRadius: 999,
  pillBorder: "1px solid rgba(255,255,255,.82)",
  pillShadow: "0 18px 60px rgba(0,0,0,.14)",

  tabPadding: "12px 18px",
  tabRadius: 999,
  tabColor: "rgba(0,0,0,.58)",
  tabActiveColor: "#0a84ff",
  tabActiveBg: "rgba(255,255,255,.92)",
  tabSize: 16,
  tabWeight: 720,

  nurseSize: 68,
  nurseBg: "rgba(255,255,255,.46)",
  nurseBlur: "blur(34px) saturate(180%)",
  nurseColor: "#111111",
  nurseShadow: "0 18px 60px rgba(0,0,0,.16)",
  nurseActiveScale: 0.93,

  nurseIconSize: 48,
  nurseStopSize: 24,
  nurseStopColor: "#111111",
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
  showNurse = true,
}: BottomBarProps) {
  return (
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
                fontSize: BOTTOM_BAR_CONFIG.tabSize,
                fontWeight: BOTTOM_BAR_CONFIG.tabWeight,
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {showNurse ? (
        <button
          type="button"
          className={`nurse-fab ${nursing ? "running" : ""}`}
          onClick={onNurse}
          style={
            {
              width: BOTTOM_BAR_CONFIG.nurseSize,
              height: BOTTOM_BAR_CONFIG.nurseSize,
              background: BOTTOM_BAR_CONFIG.nurseBg,
              backdropFilter: BOTTOM_BAR_CONFIG.nurseBlur,
              WebkitBackdropFilter: BOTTOM_BAR_CONFIG.nurseBlur,
              color: BOTTOM_BAR_CONFIG.nurseColor,
              boxShadow: BOTTOM_BAR_CONFIG.nurseShadow,
              "--nurse-active-scale": BOTTOM_BAR_CONFIG.nurseActiveScale,

              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
              border: 0,
              borderRadius: 999,
            } as CSSProperties
          }
        >
          {nursing ? (
            <span
              style={{
                fontSize: BOTTOM_BAR_CONFIG.nurseStopSize,
                color: BOTTOM_BAR_CONFIG.nurseStopColor,
                lineHeight: 1,
              }}
            >
              ■
            </span>
          ) : (
            <img
              src="/moon.svg"
              alt="哺乳"
              style={{
                width: BOTTOM_BAR_CONFIG.nurseIconSize,
                height: BOTTOM_BAR_CONFIG.nurseIconSize,
                objectFit: "contain",
                display: "block",
              }}
            />
          )}
        </button>
      ) : (
        <div
          aria-hidden
          style={{
            width: BOTTOM_BAR_CONFIG.nurseSize,
            height: BOTTOM_BAR_CONFIG.nurseSize,
            flexShrink: 0,
            pointerEvents: "none",
            opacity: 0,
          }}
        />
      )}
    </div>
  );
}