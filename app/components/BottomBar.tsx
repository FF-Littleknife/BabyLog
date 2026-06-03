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

/**
 * 底部导航参数
 * 后面想调底部导航尺寸、位置、图标、字体、颜色、圆角、阴影，优先改这里。
 */
const BOTTOM_BAR_CONFIG = {
  maxWidth: 430, // 底部导航最大宽度，对应整体 App 宽度
  paddingX: 26, // 底部导航左右安全边距
  bottom: 0, // 距离屏幕底部的基础距离；实际还会叠加 safe-area
  wideBreakpoint: 860, // 宽屏断点；屏幕宽度 >= 860px 时启用宽屏上移
  wideLiftY: 0, // 宽屏时整个底部导航向上移动距离
  zIndex: 40, // 底部导航层级，保证浮在页面内容上方

  pillGap: 4, // 左侧“记录/时间线”两个按钮之间的间距
  pillPadding: 5, // 左侧大胶囊内部边距
  pillBg: "var(--glass-bg)", // 左侧大胶囊背景；吃全局亮暗变量，避免刷新瞬间闪白
  pillBlur: "blur(34px) saturate(180%)", // 左侧大胶囊毛玻璃模糊强度
  pillRadius: 999, // 左侧大胶囊圆角；999 就是胶囊
  pillBorder: "1px solid var(--border)", // 左侧大胶囊描边；吃全局变量，避免暗色首帧错色
  pillShadow: "var(--shadow-card)", // 左侧大胶囊阴影；吃全局变量，避免首帧切换

  tabWidth: 76, // “记录/时间线”单个按钮宽度
  tabPadding: "8px 4px 7px", // 单个按钮内边距；上8 / 左右4 / 下7
  tabRadius: 999, // 单个按钮圆角；和选中滑块一致
  tabColor: "var(--muted)", // 未选中文字颜色；吃全局变量，避免 fallback 闪色
  tabActiveColor: "var(--blue)", // 选中文字颜色；吃全局系统蓝
  tabSize: 10, // “记录/时间线”文字字号
  tabWeight: 520, // “记录/时间线”文字字重
  tabLineHeight: 1, // “记录/时间线”文字行高

  tabIconSize: 24, // tab 顶部 icon 尺寸
  tabIconMarginBottom: 6, // icon 和文字之间的距离
  tabIconActiveOpacity: 1, // 选中 icon 透明度
  tabIconInactiveOpacity: 0.58, // 未选中 icon 透明度

  tabIconActiveFilter:
    "var(--bottom-tab-icon-active-filter, invert(47%) sepia(99%) saturate(2720%) hue-rotate(194deg) brightness(101%) contrast(101%))", // 选中 icon 滤镜；统一压成系统蓝 #0a84ff 附近
  tabIconInactiveFilter:
    "var(--bottom-tab-icon-inactive-filter, grayscale(1) brightness(0) opacity(0.55))", // 未选中 icon 滤镜；浅色模式转深灰

  activeThumbBg: "var(--surface-strong)", // 选中滑块背景；吃全局亮暗变量，避免刷新瞬间闪白
  activeThumbShadow: "var(--shadow-soft)", // 选中滑块阴影；吃全局变量，避免首帧错色

  activeThumbTransition:
    "transform .42s cubic-bezier(0.16, 1, 0.3, 1), background .18s ease, box-shadow .18s ease", // 选中滑块切换动画

  tabActiveScale: 0.98, // tab 按下时缩放比例
  tabTransition:
    "color .22s ease, transform .16s ease, opacity .16s ease", // tab 颜色 / 按压 / 透明度动效

  fabGap: 10, // 右侧白噪音按钮和哺乳按钮之间的距离
  fabSize: 68, // 右侧两个圆形按钮尺寸
};

const TABS: { view: ViewType; label: string; icon: string }[] = [
  { view: "home", label: "记录", icon: "/add.svg" },
  { view: "timeline", label: "时间线", icon: "/time.svg" },
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
            --bottom-tab-icon-inactive-filter: grayscale(1) brightness(5)
              opacity(0.52);
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

        .bottom-tab-button:active {
          transform: scale(${BOTTOM_BAR_CONFIG.tabActiveScale});
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
                className="bottom-tab-button"
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
                  transition: BOTTOM_BAR_CONFIG.tabTransition,
                  WebkitTapHighlightColor: "transparent",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  lineHeight: BOTTOM_BAR_CONFIG.tabLineHeight,
                }}
              >
                <img
                  src={item.icon}
                  alt=""
                  aria-hidden
                  style={{
                    width: BOTTOM_BAR_CONFIG.tabIconSize,
                    height: BOTTOM_BAR_CONFIG.tabIconSize,
                    objectFit: "contain",
                    display: "block",
                    marginBottom: BOTTOM_BAR_CONFIG.tabIconMarginBottom,
                    opacity: active
                      ? BOTTOM_BAR_CONFIG.tabIconActiveOpacity
                      : BOTTOM_BAR_CONFIG.tabIconInactiveOpacity,
                    filter: active
                      ? BOTTOM_BAR_CONFIG.tabIconActiveFilter
                      : BOTTOM_BAR_CONFIG.tabIconInactiveFilter,
                    pointerEvents: "none",
                  }}
                />

                <span
                  style={{
                    display: "block",
                    lineHeight: BOTTOM_BAR_CONFIG.tabLineHeight,
                    pointerEvents: "none",
                  }}
                >
                  {item.label}
                </span>
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