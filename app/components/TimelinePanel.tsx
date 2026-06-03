import { useEffect, useMemo, useRef, useState } from "react";
import type { BabyRecord } from "@/lib/types";
import { groupByDay } from "@/lib/time";
import Timeline from "./Timeline";
import TimelineDateWheel, {
  type TimelineDateWheelItem,
} from "./TimelineDateWheel";
import TimelineFilterBar, { type TimelineFilterKey } from "./TimelineFilterBar";

/**
 * 时间线页面参数
 * 后面想调时间线顶部留白、底部遮罩、筛选条位置、日期滚轮位置、滚动跳转位置，优先改这里。
 */
const TIMELINE_PANEL = {
  initialTopSpace: "18svh", // 时间线顶部预留空间；越大，第一天内容离屏幕顶部越远

  bottomBarHeight: 66, // 底部 BottomBar 的视觉高度；用于计算筛选条在 BottomBar 上方的位置
  bottomBarBottom: 0, // BottomBar 距离屏幕底部的基础距离；实际还会叠加 safe-area
  filterGapAboveBottomBar: 6, // 筛选条和 BottomBar 之间的垂直间距；越大筛选条越往上

  filterZIndex: 38, // 筛选条层级；需要高于底部遮罩
  dateWheelZIndex: 38, // 日期滚轮层级；和筛选条同级，保证盖在底部遮罩上方

  timelinePaddingBottom: 250, // 时间线底部内边距；避免最后几条记录被筛选条、日期滚轮、BottomBar 遮住

  topGradientHeight: 86, // 时间线内部顶部渐隐遮罩高度；越大顶部淡出范围越长

  bottomCoverHeight: 260, // 时间线内部底部遮罩高度；越大底部内容越早被遮住
  bottomCoverZIndex: 34, // 顶部 / 底部遮罩层级；低于筛选条和日期滚轮

  // 日期滚轮位置
  // 这里现在和 BottomBar 使用同一套外层宽度 + 左右安全边距 + space-between 逻辑
  dateWheelBottomOffset: 0, // 日期滚轮距离屏幕底部的基础距离；实际还会叠加 safe-area
  dateWheelPaddingX: 26, // 日期滚轮外层容器左右安全边距；需要和 BottomBar 的 paddingX 对齐

  // BottomBar 左侧胶囊实际占位宽度：
  // tabWidth 72 * 2 + pillGap 4 + pillPadding 5 * 2 = 158
  leftBottomPillWidth: 158, // 日期滚轮左侧占位宽度；用来模拟 BottomBar 左侧“记录/时间线”胶囊宽度
  bottomSlotHeight: 68, // 日期滚轮外层占位高度；和 BottomBar 右侧按钮区域高度对齐

  scrollDetectTop: 120, // 滚动时间线时，用距离屏幕顶部 120px 的位置判断当前日期
  scrollSyncDelayMs: 80, // 页面滚动后延迟多少毫秒同步日期滚轮；避免滚动时过于频繁计算
  scrollToOffsetTop: 94, // 点击 / 滚动日期滚轮跳转时，目标日期距离屏幕顶部的偏移量

  timelineScrollDuration: 460, // 点击日期滚轮后，时间线自动滚动动画时长；越大越柔，越小越利落
  wheelSelectingLockMs: 520, // 日期滚轮触发时间线跳转后，暂停反向同步的时间；避免互相抢控制权
};

const FILTER_BOTTOM =
  TIMELINE_PANEL.bottomBarHeight +
  TIMELINE_PANEL.bottomBarBottom +
  TIMELINE_PANEL.filterGapAboveBottomBar;

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function animateWindowScrollTo(targetTop: number, duration: number) {
  const startTop = window.scrollY;
  const distance = targetTop - startTop;
  const startTime = performance.now();

  if (duration <= 0 || Math.abs(distance) < 1) {
    window.scrollTo(0, targetTop);
    return;
  }

  function frame(now: number) {
    const elapsed = now - startTime;
    const progress = Math.min(1, elapsed / duration);
    const eased = easeInOutCubic(progress);

    window.scrollTo(0, startTop + distance * eased);

    if (progress < 1) {
      window.requestAnimationFrame(frame);
    }
  }

  window.requestAnimationFrame(frame);
}

function TopGradient() {
  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        top: 0,
        height: TIMELINE_PANEL.topGradientHeight,
        pointerEvents: "none",
        zIndex: TIMELINE_PANEL.bottomCoverZIndex,
        background:
          "linear-gradient(180deg, rgba(var(--app-bg-rgb),0.98) 0%, rgba(var(--app-bg-rgb),0.72) 48%, rgba(var(--app-bg-rgb),0) 100%)",
        maskImage:
          "linear-gradient(90deg, transparent 0%, black 18%, black 82%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(90deg, transparent 0%, black 18%, black 82%, transparent 100%)",
      }}
    />
  );
}

function BottomCover() {
  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        height: TIMELINE_PANEL.bottomCoverHeight,
        pointerEvents: "none",
        zIndex: TIMELINE_PANEL.bottomCoverZIndex,
        background:
          "linear-gradient(0deg, rgba(var(--app-bg-rgb),1) 0%, rgba(var(--app-bg-rgb),1) 58%, rgba(var(--app-bg-rgb),0.86) 76%, rgba(var(--app-bg-rgb),0) 100%)",
      }}
    />
  );
}

function filterRecords(records: BabyRecord[], selectedKeys: TimelineFilterKey[]) {
  if (!selectedKeys.length) return records;

  return records.filter((record) => {
    if (
      selectedKeys.includes("feed") &&
      (record.type === "breast" ||
        record.type === "bottle_breast" ||
        record.type === "formula")
    ) {
      return true;
    }

    if (selectedKeys.includes("poop") && record.type === "poop") return true;
    if (selectedKeys.includes("pee") && record.type === "pee") return true;
    if (selectedKeys.includes("pump") && record.type === "pump") return true;

    return false;
  });
}

function getTimelineDays(records: BabyRecord[]) {
  const grouped = groupByDay(records);

  return Object.keys(grouped).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );
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

function getDayElement(day: string) {
  if (typeof document === "undefined") return null;

  return document.querySelector<HTMLElement>(
    `[data-timeline-day="${CSS.escape(day)}"]`
  );
}

function getCurrentDay(days: string[]) {
  if (!days.length) return "";

  const targetY = TIMELINE_PANEL.scrollDetectTop;
  let bestDay = days[0];
  let bestDistance = Number.POSITIVE_INFINITY;

  days.forEach((day) => {
    const element = getDayElement(day);
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const distance = Math.abs(rect.top - targetY);

    if (distance < bestDistance) {
      bestDistance = distance;
      bestDay = day;
    }
  });

  return bestDay;
}

function scrollToDay(day: string) {
  const element = getDayElement(day);
  if (!element) return;

  const top =
    element.getBoundingClientRect().top +
    window.scrollY -
    TIMELINE_PANEL.scrollToOffsetTop;

  animateWindowScrollTo(
    Math.max(0, top),
    TIMELINE_PANEL.timelineScrollDuration
  );
}

export default function TimelinePanel({
  records,
  onEdit,
  externalSelectedKeys,
  onExternalSelectedKeysChange,
}: {
  records: BabyRecord[];
  onEdit: (record: BabyRecord) => void;
  externalSelectedKeys: TimelineFilterKey[];
  onExternalSelectedKeysChange: (keys: TimelineFilterKey[]) => void;
}) {
  const [activeDay, setActiveDay] = useState("");

  const scrollTimerRef = useRef<number | null>(null);
  const wheelSelectingRef = useRef(false);
  const wheelSelectingTimerRef = useRef<number | null>(null);

  const filteredRecords = useMemo(
    () => filterRecords(records, externalSelectedKeys),
    [records, externalSelectedKeys]
  );

  const timelineDays = useMemo(
    () => getTimelineDays(filteredRecords),
    [filteredRecords]
  );

  const dateWheelItems = useMemo<TimelineDateWheelItem[]>(
    () =>
      timelineDays.map((day) => ({
        day,
        label: formatWheelDate(day),
      })),
    [timelineDays]
  );

  useEffect(() => {
    if (!timelineDays.length) {
      setActiveDay("");
      return;
    }

    setActiveDay((prev) => {
      if (prev && timelineDays.includes(prev)) return prev;
      return timelineDays[0];
    });
  }, [timelineDays]);

  useEffect(() => {
    function syncActiveDayFromScroll() {
      if (wheelSelectingRef.current) return;
      if (!timelineDays.length) return;

      if (scrollTimerRef.current) {
        window.clearTimeout(scrollTimerRef.current);
      }

      scrollTimerRef.current = window.setTimeout(() => {
        const currentDay = getCurrentDay(timelineDays);

        if (currentDay) {
          setActiveDay(currentDay);
        }
      }, TIMELINE_PANEL.scrollSyncDelayMs);
    }

    window.addEventListener("scroll", syncActiveDayFromScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", syncActiveDayFromScroll);

      if (scrollTimerRef.current) {
        window.clearTimeout(scrollTimerRef.current);
      }
    };
  }, [timelineDays]);

  useEffect(() => {
    return () => {
      if (wheelSelectingTimerRef.current) {
        window.clearTimeout(wheelSelectingTimerRef.current);
      }
    };
  }, []);

  function handleSelectDay(day: string) {
    if (!day) return;

    wheelSelectingRef.current = true;

    if (wheelSelectingTimerRef.current) {
      window.clearTimeout(wheelSelectingTimerRef.current);
    }

    setActiveDay(day);
    scrollToDay(day);

    wheelSelectingTimerRef.current = window.setTimeout(() => {
      wheelSelectingRef.current = false;
    }, TIMELINE_PANEL.wheelSelectingLockMs);
  }

  return (
    <section className="view-panel">
      <TopGradient />
      <BottomCover />

      <div
        style={{
          paddingTop: TIMELINE_PANEL.initialTopSpace,
          paddingBottom: TIMELINE_PANEL.timelinePaddingBottom,
        }}
      >
        <Timeline
          records={filteredRecords}
          onEdit={onEdit}
          showIntervals={externalSelectedKeys.length === 1}
        />
      </div>

      <div
        style={{
          position: "fixed",
          left: "50%",
          bottom: `calc(${FILTER_BOTTOM}px + env(safe-area-inset-bottom))`,
          transform: "translateX(-50%)",
          zIndex: TIMELINE_PANEL.filterZIndex,
          width: "min(100%, 430px)",
          pointerEvents: "auto",
        }}
      >
        <TimelineFilterBar
          selectedKeys={externalSelectedKeys}
          onChange={onExternalSelectedKeysChange}
        />
      </div>

      {dateWheelItems.length > 0 && (
        <div
          style={{
            position: "fixed",
            left: "50%",
            bottom: `calc(${TIMELINE_PANEL.dateWheelBottomOffset}px + env(safe-area-inset-bottom))`,
            transform: "translateX(-50%)",
            zIndex: TIMELINE_PANEL.dateWheelZIndex,
            width: "min(100%, 430px)",
            paddingInline: TIMELINE_PANEL.dateWheelPaddingX,
            boxSizing: "border-box",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pointerEvents: "none",
          }}
        >
          <div
            aria-hidden
            style={{
              width: TIMELINE_PANEL.leftBottomPillWidth,
              height: TIMELINE_PANEL.bottomSlotHeight,
              flexShrink: 0,
              pointerEvents: "none",
            }}
          />

          <TimelineDateWheel
            days={dateWheelItems}
            activeDay={activeDay}
            onSelect={handleSelectDay}
          />
        </div>
      )}
    </section>
  );
}