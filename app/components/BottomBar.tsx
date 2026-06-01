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
  maxWidth: 430, // 底部导航最大宽度，对应整体 App 宽度
  paddingX: 26, // 底部导航左右安全边距
  bottom: 0, // 距离屏幕底部的距离；实际还会叠加 safe-area
  wideBreakpoint: 860, // 宽屏断点：屏幕宽度 >= 860px 时启用宽屏上移
  wideLiftY: 10, // 宽屏时整个底部导航向上移动距离
  zIndex: 40, // 层级，保证浮在页面内容上方

  pillGap: 4, // 左侧“记录/时间线”两个按钮之间的间距
  pillPadding: 5, // 左侧大胶囊内部边距
  pillBg: "var(--bottom-pill-bg, rgba(255, 255, 255, 0.62))", // 左侧大胶囊背景
  pillBlur: "blur(34px) saturate(180%)", // 左侧大胶囊毛玻璃模糊强度
  pillRadius: 999, // 左侧大胶囊圆角；999就是胶囊
  pillBorder:
    "1px solid var(--bottom-pill-border, rgba(255, 255, 255, 0.78))", // 左侧大胶囊描边
  pillShadow:
    "var(--bottom-pill-shadow, 0 16px 44px rgba(0, 0, 0, 0.12))", // 左侧大胶囊阴影

  tabWidth: 72, // “记录/时间线”单个按钮宽度
  tabPadding: "12px 0", // 单个按钮内边距：上下12 / 左右0
  tabRadius: 999, // 单个按钮圆角；和选中滑块一致
  tabColor: "var(--muted, #8e8e93)", // 未选中文字颜色
  tabActiveColor: "var(--blue, #0a84ff)", // 选中文字颜色
  tabSize: 13.4, // “记录/时间线”文字字号
  tabWeight: 720, // “记录/时间线”文字字重

  activeThumbBg:
    "var(--bottom-tab-active-bg, rgba(255, 255, 255, 0.96))", // 选中滑块背景
  activeThumbShadow:
    "var(--bottom-tab-active-shadow, 0 8px 22px rgba(0, 0, 0, 0.10))", // 选中滑块阴影

  activeThumbTransition:
    "transform .42s cubic-bezier(0.16, 1, 0.3, 1), background .18s ease, box-shadow .18s ease", // 选中滑块切换动画；偏 iOS 的丝滑吸附感

  fabGap: 10, // 右侧白噪音按钮和哺乳按钮之间的距离
  fabSize: 68, // 右侧两个圆形按钮尺寸
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

        @media (min-width: ${BOTTOM_BAR_CONFIG.wideBreakpoint}px) {
          .bottom-bar {
            transform: translateX(-50%)
              translateY(-${BOTTOM_BAR_CONFIG.wideLiftY}px) !important;
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