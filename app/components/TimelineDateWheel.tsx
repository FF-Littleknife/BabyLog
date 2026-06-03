"use client";

import { useEffect, useMemo, useRef } from "react";

export type TimelineDateWheelItem = {
  day: string;
  label: string;
};

const DATE_WHEEL = {
  outerHeight: 68, // 外层占位高度；和 BottomBar 右侧圆按钮 fabSize=68 对齐

  /* =========================
     轻胶囊外壳
     ========================= */

  width: 200, // 整个日期滚轮宽度；右边固定对齐，越宽越向左靠近 BottomBar
  height: 48, // 外层轻胶囊高度；比之前 54 更轻
  radius: 999, // 外层轻胶囊圆角

  bg: "var(--timeline-wheel-bg, rgba(var(--app-bg-rgb), 0.34))", // 外层轻胶囊背景，跟随亮暗模式
  blur: "blur(22px) saturate(150%)", // 外层轻胶囊毛玻璃强度
  border: "1px solid var(--timeline-wheel-border, var(--border))", // 外层轻胶囊描边
  shadow: "var(--timeline-wheel-shadow, none)", // 外层轻胶囊阴影；默认无阴影，避免太重

  /* =========================
     日期项
     ========================= */

  gap: 0, // 日期按钮之间的横向间距；越小越紧凑
  itemWidth: 48, // 单个日期按钮宽度
  itemHeight: 34, // 日期按钮 / 中间选区高度
  itemRadius: 999, // 日期按钮和高亮选区圆角

  /* =========================
     中间固定高亮选区
     ========================= */

  activeBg: "var(--timeline-wheel-active-bg, var(--surface-strong))", // 中间固定选区背景
  activeBorder:
    "1px solid var(--timeline-wheel-active-border, rgba(255, 255, 255, 0.72))", // 中间固定选区描边
  activeShadow: "var(--timeline-wheel-active-shadow, var(--shadow-soft))", // 中间固定选区阴影
  activeBlur: "blur(18px) saturate(160%)", // 中间固定选区毛玻璃

  /* =========================
     文字
     ========================= */

  color: "var(--muted)", // 非选中日期文字颜色
  activeColor: "var(--blue)", // 选中日期文字颜色

  sideOpacityNear: 0.56, // 选中日期左右第一格透明度
  sideOpacityFar: 0.24, // 更远日期透明度
  sideScaleNear: 0.94, // 选中日期左右第一格缩放
  sideScaleFar: 0.9, // 更远日期缩放

  size: 13, // 日期文字字号
  weight: 760, // 日期文字字重

  /* =========================
     交互
     ========================= */

  settleDelayMs: 120, // 用户横向滚动停止后，多久吸附到最近日期

  programmaticScrollMs: 520, // 外部同步日期时的保护时间，防止误触发 onSelect
  initialProgrammaticScrollMs: 180, // 首次进入时间线时的保护时间，防止初始化误跳转
};

function getSidePadding() {
  return Math.max(0, (DATE_WHEEL.width - DATE_WHEEL.itemWidth) / 2);
}

function parseDay(day: string) {
  const normalizedDay = String(day || "").trim();

  if (!normalizedDay) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(normalizedDay)) {
    const date = new Date(`${normalizedDay}T00:00:00`);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const date = new Date(normalizedDay);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatWheelDate(day: string) {
  const normalizedDay = String(day || "").trim();
  const date = parseDay(normalizedDay);

  if (!date) return normalizedDay;

  return `${date.getMonth() + 1}.${String(date.getDate()).padStart(2, "0")}`;
}

export default function TimelineDateWheel({
  days,
  activeDay,
  onSelect,
}: {
  days: TimelineDateWheelItem[];
  activeDay: string;
  onSelect: (day: string) => void;
}) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const settleTimerRef = useRef<number | null>(null);
  const internalScrollRef = useRef(false);
  const mountedRef = useRef(false);

  const activeIndex = useMemo(
    () => days.findIndex((item) => item.day === activeDay),
    [days, activeDay]
  );

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || activeIndex < 0) return;

    const targetLeft = activeIndex * (DATE_WHEEL.itemWidth + DATE_WHEEL.gap);

    internalScrollRef.current = true;

    if (settleTimerRef.current) {
      window.clearTimeout(settleTimerRef.current);
      settleTimerRef.current = null;
    }

    scroller.scrollTo({
      left: targetLeft,
      behavior: mountedRef.current ? "smooth" : "auto",
    });

    const timer = window.setTimeout(
      () => {
        internalScrollRef.current = false;
        mountedRef.current = true;
      },
      mountedRef.current
        ? DATE_WHEEL.programmaticScrollMs
        : DATE_WHEEL.initialProgrammaticScrollMs
    );

    return () => window.clearTimeout(timer);
  }, [activeIndex]);

  useEffect(() => {
    return () => {
      if (settleTimerRef.current) {
        window.clearTimeout(settleTimerRef.current);
      }
    };
  }, []);

  function getNearestDay() {
    const scroller = scrollerRef.current;
    if (!scroller || !days.length) return null;

    const step = DATE_WHEEL.itemWidth + DATE_WHEEL.gap;
    const index = Math.round(scroller.scrollLeft / step);
    const safeIndex = Math.max(0, Math.min(days.length - 1, index));

    return days[safeIndex]?.day || null;
  }

  function settleToNearest() {
    const day = getNearestDay();
    if (!day) return;

    onSelect(day);
  }

  function handleScroll() {
    if (internalScrollRef.current) {
      if (settleTimerRef.current) {
        window.clearTimeout(settleTimerRef.current);
        settleTimerRef.current = null;
      }

      return;
    }

    if (!mountedRef.current) return;

    if (settleTimerRef.current) {
      window.clearTimeout(settleTimerRef.current);
    }

    settleTimerRef.current = window.setTimeout(() => {
      settleToNearest();
    }, DATE_WHEEL.settleDelayMs);
  }

  if (!days.length) return null;

  const sidePadding = getSidePadding();

  return (
    <>
      <style jsx global>{`
        @media (prefers-color-scheme: dark) {
          :root {
            --timeline-wheel-bg: rgba(28, 28, 30, 0.42);
            --timeline-wheel-border: rgba(99, 99, 102, 0.22);
            --timeline-wheel-shadow: none;

            --timeline-wheel-active-bg: rgba(58, 58, 60, 0.92);
            --timeline-wheel-active-border: rgba(99, 99, 102, 0.32);
            --timeline-wheel-active-shadow: 0 10px 24px rgba(0, 0, 0, 0.34);
          }
        }

        .timeline-date-wheel-scroll {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .timeline-date-wheel-scroll::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }
      `}</style>

      <div
        style={{
          width: DATE_WHEEL.width,
          height: DATE_WHEEL.outerHeight,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "auto",
        }}
      >
        <div
          style={{
            width: DATE_WHEEL.width,
            height: DATE_WHEEL.height,
            borderRadius: DATE_WHEEL.radius,
            background: DATE_WHEEL.bg,
            backdropFilter: DATE_WHEEL.blur,
            WebkitBackdropFilter: DATE_WHEEL.blur,
            border: DATE_WHEEL.border,
            boxShadow: DATE_WHEEL.shadow,
            overflow: "hidden",
            boxSizing: "border-box",
            display: "flex",
            alignItems: "center",
            pointerEvents: "auto",
            position: "relative",
            isolation: "isolate",
          }}
        >
          <span
            aria-hidden
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: DATE_WHEEL.itemWidth,
              height: DATE_WHEEL.itemHeight,
              transform: "translate(-50%, -50%)",
              borderRadius: DATE_WHEEL.itemRadius,
              background: DATE_WHEEL.activeBg,
              border: DATE_WHEEL.activeBorder,
              boxShadow: DATE_WHEEL.activeShadow,
              backdropFilter: DATE_WHEEL.activeBlur,
              WebkitBackdropFilter: DATE_WHEEL.activeBlur,
              pointerEvents: "none",
              zIndex: 0,
              boxSizing: "border-box",
            }}
          />

          <div
            ref={scrollerRef}
            className="timeline-date-wheel-scroll"
            onScroll={handleScroll}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: DATE_WHEEL.gap,
              overflowX: "auto",
              overflowY: "hidden",
              WebkitOverflowScrolling: "touch",
              scrollSnapType: "x mandatory",
              padding: `0 ${sidePadding}px`,
              boxSizing: "border-box",
              position: "relative",
              zIndex: 1,
              maskImage:
                "linear-gradient(90deg, transparent 0%, black 14%, black 86%, transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(90deg, transparent 0%, black 14%, black 86%, transparent 100%)",
            }}
          >
            {days.map((item, index) => {
              const active = item.day === activeDay;

              const distance =
                activeIndex >= 0
                  ? Math.abs(index - activeIndex)
                  : Number.POSITIVE_INFINITY;

              const opacity = active
                ? 1
                : distance === 1
                ? DATE_WHEEL.sideOpacityNear
                : DATE_WHEEL.sideOpacityFar;

              const scale = active
                ? 1
                : distance === 1
                ? DATE_WHEEL.sideScaleNear
                : DATE_WHEEL.sideScaleFar;

              const text = formatWheelDate(item.day);

              return (
                <button
                  key={item.day}
                  type="button"
                  onClick={() => onSelect(item.day)}
                  aria-label={`跳转到 ${text}`}
                  style={{
                    width: DATE_WHEEL.itemWidth,
                    height: DATE_WHEEL.itemHeight,
                    flex: `0 0 ${DATE_WHEEL.itemWidth}px`,
                    border: 0,
                    borderRadius: DATE_WHEEL.itemRadius,
                    background: "transparent",
                    boxShadow: "none",
                    color: active ? DATE_WHEEL.activeColor : DATE_WHEEL.color,
                    opacity,
                    transform: `scale(${scale})`,
                    fontSize: DATE_WHEEL.size,
                    fontWeight: DATE_WHEEL.weight,
                    lineHeight: 1,
                    fontVariantNumeric: "tabular-nums",
                    scrollSnapAlign: "center",
                    padding: 0,
                    transition:
                      "color .18s ease, opacity .18s ease, transform .18s ease",
                    WebkitTapHighlightColor: "transparent",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  {text}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}