"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent } from "react";
import type { GrowthRecord } from "@/lib/growthApi";

/**
 * 成长曲线卡片参数
 * 后面想调卡片高度、曲线颜色、日期、点间距、默认滚动位置、展开明细、侧滑按钮，优先改这里。
 */
const CHARTS = {
  /* =========================
     整体布局
     ========================= */

  marginTop: 10, // 成长曲线模块距离上方内容的距离；越大越往下
  listGap: 10, // 三张曲线卡片之间的垂直间距；越大越松

  /* =========================
     单张曲线卡片
     ========================= */

  cardMinHeight: 160, // 单张曲线卡片最小高度；越大卡片越高
  cardBg: "var(--glass-bg)", // 曲线卡片背景；跟随浅色 / 深色模式
  cardRadius: 26, // 曲线卡片圆角；越大越圆润
  cardPadding: 14, // 曲线卡片内部边距；越大内容离边缘越远
  cardShadow: "var(--shadow-card)", // 曲线卡片阴影；控制卡片浮起感
  cardTransition: "height .22s ease, box-shadow .22s ease", // 卡片展开 / 阴影变化动画

  /* =========================
     卡片标题
     ========================= */

  titleColor: "var(--muted)", // 卡片标题颜色
  titleSize: 12, // 卡片标题字号
  titleWeight: 400, // 卡片标题字重

  /* =========================
     右上角展开箭头
     ========================= */

  arrowSize: 16, // 展开箭头尺寸
  arrowStrokeWidth: 3.2, // 展开箭头线条粗细
  arrowColor: "color-mix(in srgb, var(--muted) 72%, transparent)", // 展开箭头颜色
  arrowTransition: "transform .18s ease", // 展开箭头旋转动画

  /* =========================
     曲线区域
     ========================= */

  chartMarginTop: 8, // 曲线区域距离标题行的距离
  chartHeight: 108, // 曲线区域高度

  pointGap: 54, // 曲线点之间的横向距离；越大横向滚动越明显
  chartPaddingX: 18, // 曲线左右内边距；避免点贴边

  lineWidth: 3, // 曲线线条粗细
  pointRadius: 4.2, // 曲线圆点半径
  pointHitRadius: 17, // 曲线圆点点击热区半径；越大越容易点中

  axisY: 86, // 横轴 Y 坐标；越大横轴越往下
  labelY: 102, // 横轴日期文字 Y 坐标；越大日期越往下

  axisColor: "var(--border)", // 横轴颜色
  labelColor: "color-mix(in srgb, var(--muted) 72%, transparent)", // 横轴日期颜色
  labelSize: 10, // 横轴日期字号
  labelWeight: 400, // 横轴日期字重

  guideLineColor: "color-mix(in srgb, var(--muted) 42%, transparent)", // 选中点到横轴的虚线颜色
  guideLineWidth: 1.1, // 选中点虚线粗细
  guideLineDash: "3 4", // 选中点虚线样式；第一个数字是线段，第二个数字是间隔
  guideLineGapFromPoint: 7, // 虚线距离圆点的间隙

  tooltipSize: 10, // 曲线点数值文字字号
  tooltipWeight: 760, // 曲线点数值文字字重
  tooltipOffsetY: 7, // 曲线点数值距离圆点的垂直距离

  tooltipSideOffsetX: 18, // 曲线点数值左右避让距离
  tooltipEdgePadding: 18, // 曲线点数值靠近边缘时的安全距离

  /* =========================
     展开明细
     ========================= */

  detailMarginTop: 4, // 展开明细距离曲线区域的距离；分割线删掉后稍微收紧
  detailPaddingTop: 0, // 展开明细顶部内边距；设为0，让明细自然接在曲线下面
  detailMaxHeight: 184, // 展开明细最大高度；加高一点，避免最后一行被卡片圆角裁掉
  detailListPaddingBottom: 4, // 展开明细列表底部安全距离；避免最后一行贴到卡片底部
  detailRowPadding: "12px 0", // 明细每一行内边距；上下越大行距越松
  detailRowDivider: "1px solid var(--border)", // 明细行之间的细分割线

  detailDateColor: "color-mix(in srgb, var(--muted) 82%, transparent)", // 明细日期颜色
  detailDateSize: 11, // 明细日期字号
  detailDateWeight: 500, // 明细日期字重

  detailValueColor: "var(--text)", // 明细数值颜色
  detailValueSize: 13, // 明细数值字号
  detailValueWeight: 760, // 明细数值字重

  detailUnitColor: "var(--muted)", // 明细单位颜色
  detailUnitSize: 11, // 明细单位字号
  detailUnitWeight: 650, // 明细单位字重

  detailEmptyText: "暂无记录", // 明细空状态文案
  detailEmptyColor: "color-mix(in srgb, var(--muted) 68%, transparent)", // 明细空状态文字颜色
  detailEmptySize: 12, // 明细空状态文字字号

  /* =========================
     明细行侧滑
     ========================= */

  swipeActionWidth: 58, // 单个侧滑按钮宽度；越大按钮越宽
  swipeActionGap: 2, // 侧滑按钮之间的间距；0就是连在一起
  swipeOpenThreshold: 42, // 左滑超过多少 px 后自动展开按钮
  swipeCloseThreshold: 18, // 右滑回到多少 px 内自动收起按钮
  swipeStartThreshold: 8, // 横向滑动超过多少 px 才判定为侧滑，避免误伤上下滚动
  swipeVerticalTolerance: 8, // 纵向移动比横向多多少时，判定为上下滚动而不是侧滑
  swipeTransition: "transform .22s cubic-bezier(0.16, 1, 0.3, 1)", // 明细行侧滑动画
  swipeActionTransition:
    "transform .22s cubic-bezier(0.16, 1, 0.3, 1)", // 侧滑按钮从右侧外面推进来的动画
  swipeActionRadius: 18, // 侧滑按钮圆角
  swipeEditBg: "color-mix(in srgb, var(--blue) 92%, transparent)", // 编辑按钮背景色
  swipeDeleteBg: "#ff3b30", // 删除按钮背景色
  swipeActionColor: "#ffffff", // 侧滑按钮文字颜色
  swipeActionSize: 12, // 侧滑按钮文字字号
  swipeActionWeight: 760, // 侧滑按钮文字字重

  /* =========================
     空状态
     ========================= */

  emptyColor: "color-mix(in srgb, var(--muted) 68%, transparent)", // 曲线空状态文字颜色
  emptySize: 12, // 曲线空状态文字字号

  /* =========================
     三项曲线颜色
     ========================= */

  heightColor: "var(--blue)", // 身高曲线颜色
  weightColor: "var(--feed-label-color)", // 体重曲线颜色
  headColor: "var(--pump-label-color)", // 头围曲线颜色
};

type GrowthMetric = {
  key: "heightCm" | "weightKg" | "headCm";
  title: string;
  unit: string;
  color: string;
};

type GrowthPoint = {
  id: string;
  date: string;
  value: number;
  createdAt: string;
};

type NormalizedGrowthPoint = GrowthPoint & {
  x: number;
  y: number;
  dateIndex: number;
};

const METRICS: GrowthMetric[] = [
  {
    key: "heightCm",
    title: "身高",
    unit: "cm",
    color: CHARTS.heightColor,
  },
  {
    key: "weightKg",
    title: "体重",
    unit: "kg",
    color: CHARTS.weightColor,
  },
  {
    key: "headCm",
    title: "头围",
    unit: "cm",
    color: CHARTS.headColor,
  },
];

function formatDate(dateString?: string) {
  if (!dateString) return "";

  const date = new Date(`${dateString}T00:00:00`);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function formatFullDate(dateString?: string) {
  if (!dateString) return "";

  const date = new Date(`${dateString}T00:00:00`);
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
}

function formatValue(value?: number) {
  if (typeof value !== "number") return "—";
  if (Number.isInteger(value)) return String(value);
  return String(Number(value.toFixed(1)));
}

function getMetricPoints(records: GrowthRecord[], key: GrowthMetric["key"]) {
  return records
    .filter((record) => typeof record[key] === "number")
    .sort((a, b) => {
      const dateDiff = new Date(a.date).getTime() - new Date(b.date).getTime();

      if (dateDiff !== 0) return dateDiff;

      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    })
    .map((record) => ({
      id: record.id,
      date: record.date,
      value: record[key] as number,
      createdAt: record.createdAt,
    }));
}

function getLatestPointByDate(points: GrowthPoint[]) {
  const map = new Map<string, GrowthPoint>();

  for (const point of points) {
    const existing = map.get(point.date);

    if (
      !existing ||
      new Date(point.createdAt).getTime() >
        new Date(existing.createdAt).getTime()
    ) {
      map.set(point.date, point);
    }
  }

  return map;
}

function getMetricDates(points: GrowthPoint[]) {
  return Array.from(new Set(points.map((point) => point.date))).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );
}

function makePath(points: { x: number; y: number }[]) {
  if (!points.length) return "";

  if (points.length === 1) {
    const point = points[0];
    return `M ${point.x} ${point.y}`;
  }

  return points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
}

function getChartWidth(count: number, containerWidth: number) {
  const safeContainerWidth = Math.max(1, containerWidth);

  if (count <= 1) return safeContainerWidth;

  const dataWidth = CHARTS.chartPaddingX * 2 + (count - 1) * CHARTS.pointGap;

  return Math.max(safeContainerWidth, dataWidth);
}

function getXForDateIndex(index: number, dateCount: number, chartWidth: number) {
  if (dateCount <= 1) return chartWidth / 2;

  const usableWidth = chartWidth - CHARTS.chartPaddingX * 2;

  return (
    CHARTS.chartPaddingX +
    (index / Math.max(dateCount - 1, 1)) * usableWidth
  );
}

function normalizeMetricPoints({
  points,
  metricDates,
  chartWidth,
}: {
  points: GrowthPoint[];
  metricDates: string[];
  chartWidth: number;
}) {
  if (!points.length || !metricDates.length) return [];

  const values = points.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;

  const pointByDate = getLatestPointByDate(points);

  return metricDates
    .map((date, index) => {
      const point = pointByDate.get(date);
      if (!point) return null;

      const x = getXForDateIndex(index, metricDates.length, chartWidth);
      const ratio = range === 0 ? 0.5 : (point.value - min) / range;
      const y = CHARTS.axisY - ratio * 56 - 10;

      return {
        ...point,
        x,
        y,
        dateIndex: index,
      };
    })
    .filter((point): point is NormalizedGrowthPoint => Boolean(point));
}

function SwipeGrowthDetailRow({
  point,
  unit,
  opened,
  canDelete,
  onOpen,
  onClose,
  onEdit,
  onDelete,
}: {
  point: GrowthPoint;
  unit: string;
  opened: boolean;
  canDelete: boolean;
  onOpen: () => void;
  onClose: () => void;
  onEdit?: (recordId: string) => void;
  onDelete?: (recordId: string) => void;
}) {
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const draggingRef = useRef(false);
  const horizontalRef = useRef(false);
  const [dragX, setDragX] = useState(0);

  const actionCount = canDelete ? 2 : 1;
  const actionsWidth =
    actionCount * CHARTS.swipeActionWidth +
    Math.max(0, actionCount - 1) * CHARTS.swipeActionGap;

  const translateX = draggingRef.current
    ? dragX
    : opened
    ? -actionsWidth
    : 0;

  const actionTranslateX = Math.max(0, actionsWidth + translateX);

  function clampDragX(value: number) {
    return Math.max(-actionsWidth, Math.min(0, value));
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    startXRef.current = event.clientX;
    startYRef.current = event.clientY;
    draggingRef.current = true;
    horizontalRef.current = false;
    setDragX(opened ? -actionsWidth : 0);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!draggingRef.current) return;

    const deltaX = event.clientX - startXRef.current;
    const deltaY = event.clientY - startYRef.current;

    if (!horizontalRef.current) {
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      if (absY > absX + CHARTS.swipeVerticalTolerance) {
        draggingRef.current = false;
        setDragX(opened ? -actionsWidth : 0);
        return;
      }

      if (absX < CHARTS.swipeStartThreshold) return;

      horizontalRef.current = true;
      onOpen();
    }

    const baseX = opened ? -actionsWidth : 0;
    setDragX(clampDragX(baseX + deltaX));
  }

  function finishDrag() {
    if (!draggingRef.current) return;

    draggingRef.current = false;

    if (!horizontalRef.current) {
      setDragX(opened ? -actionsWidth : 0);
      return;
    }

    if (dragX <= -CHARTS.swipeOpenThreshold) {
      onOpen();
      setDragX(-actionsWidth);
      return;
    }

    if (Math.abs(dragX) <= CHARTS.swipeCloseThreshold) {
      onClose();
      setDragX(0);
      return;
    }

    if (opened && dragX < -CHARTS.swipeCloseThreshold) {
      onOpen();
      setDragX(-actionsWidth);
      return;
    }

    onClose();
    setDragX(0);
  }

  function handleContentClick(event: React.MouseEvent<HTMLDivElement>) {
    if (!opened) return;

    event.stopPropagation();
    onClose();
    setDragX(0);
  }

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        background: "transparent",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width: actionsWidth,
          display: "flex",
          alignItems: "stretch",
          justifyContent: "flex-end",
          gap: CHARTS.swipeActionGap,
          transform: `translateX(${actionTranslateX}px)`,
          transition: draggingRef.current ? "none" : CHARTS.swipeActionTransition,
          pointerEvents: opened ? "auto" : "none",
        }}
      >
        <button
          type="button"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation();
            onClose();
            setDragX(0);
            onEdit?.(point.id);
          }}
          style={{
            width: CHARTS.swipeActionWidth,
            border: 0,
            borderRadius: CHARTS.swipeActionRadius,
            background: CHARTS.swipeEditBg,
            color: CHARTS.swipeActionColor,
            fontSize: CHARTS.swipeActionSize,
            fontWeight: CHARTS.swipeActionWeight,
            padding: 0,
            WebkitTapHighlightColor: "transparent",
          }}
        >
          编辑
        </button>

        {canDelete && (
          <button
            type="button"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              onClose();
              setDragX(0);
              onDelete?.(point.id);
            }}
            style={{
              width: CHARTS.swipeActionWidth,
              border: 0,
              borderRadius: CHARTS.swipeActionRadius,
              background: CHARTS.swipeDeleteBg,
              color: CHARTS.swipeActionColor,
              fontSize: CHARTS.swipeActionSize,
              fontWeight: CHARTS.swipeActionWeight,
              padding: 0,
              WebkitTapHighlightColor: "transparent",
            }}
          >
            删除
          </button>
        )}
      </div>

      <div
        onClick={handleContentClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
        onPointerLeave={finishDrag}
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 12,
          padding: CHARTS.detailRowPadding,
          background: CHARTS.cardBg,
          transform: `translateX(${translateX}px)`,
          transition: draggingRef.current ? "none" : CHARTS.swipeTransition,
          userSelect: "none",
          WebkitUserSelect: "none",
          WebkitTouchCallout: "none",
          touchAction: "pan-y",
        }}
      >
        <div
          style={{
            color: CHARTS.detailDateColor,
            fontSize: CHARTS.detailDateSize,
            fontWeight: CHARTS.detailDateWeight,
            whiteSpace: "nowrap",
          }}
        >
          {formatFullDate(point.date)}
        </div>

        <div
          style={{
            whiteSpace: "nowrap",
            textAlign: "right",
          }}
        >
          <span
            style={{
              color: CHARTS.detailValueColor,
              fontSize: CHARTS.detailValueSize,
              fontWeight: CHARTS.detailValueWeight,
            }}
          >
            {formatValue(point.value)}
          </span>

          <span
            style={{
              marginLeft: 3,
              color: CHARTS.detailUnitColor,
              fontSize: CHARTS.detailUnitSize,
              fontWeight: CHARTS.detailUnitWeight,
            }}
          >
            {unit}
          </span>
        </div>
      </div>
    </div>
  );
}

function GrowthDetailList({
  points,
  unit,
  onEditRecord,
  onDeleteRecord,
}: {
  points: GrowthPoint[];
  unit: string;
  onEditRecord?: (recordId: string) => void;
  onDeleteRecord?: (recordId: string) => void;
}) {
  const [openedId, setOpenedId] = useState<string | null>(null);
  const list = [...points].reverse();

  if (!list.length) {
    return (
      <div
        style={{
          padding: CHARTS.detailRowPadding,
          color: CHARTS.detailEmptyColor,
          fontSize: CHARTS.detailEmptySize,
          textAlign: "center",
        }}
      >
        {CHARTS.detailEmptyText}
      </div>
    );
  }

  return (
    <div
      onClick={() => setOpenedId(null)}
      style={{
        maxHeight: CHARTS.detailMaxHeight,
        paddingBottom: CHARTS.detailListPaddingBottom,
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
        scrollbarWidth: "none",
        boxSizing: "border-box",
      }}
    >
      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }
      `}</style>

      {list.map((point, index) => (
        <div
          key={`${point.id}-${point.date}-${index}`}
          style={{
            borderBottom:
              index < list.length - 1 ? CHARTS.detailRowDivider : "none",
          }}
        >
          <SwipeGrowthDetailRow
            point={point}
            unit={unit}
            opened={openedId === point.id}
            canDelete={Boolean(onDeleteRecord)}
            onOpen={() => setOpenedId(point.id)}
            onClose={() =>
              setOpenedId((current) => (current === point.id ? null : current))
            }
            onEdit={onEditRecord}
            onDelete={onDeleteRecord}
          />
        </div>
      ))}
    </div>
  );
}

function GrowthMiniChartCard({
  metric,
  records,
  onEditRecord,
  onDeleteRecord,
}: {
  metric: GrowthMetric;
  records: GrowthRecord[];
  onEditRecord?: (recordId: string) => void;
  onDeleteRecord?: (recordId: string) => void;
}) {
  const cardRef = useRef<HTMLElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [chartViewportWidth, setChartViewportWidth] = useState(1);
  const [expanded, setExpanded] = useState(false);
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);

  const points = useMemo(
    () => getMetricPoints(records, metric.key),
    [records, metric.key]
  );

  const metricDates = useMemo(() => getMetricDates(points), [points]);

  useEffect(() => {
    function updateWidth() {
      const cardEl = cardRef.current;
      if (!cardEl) return;

      const innerWidth = Math.max(
        1,
        cardEl.clientWidth - CHARTS.cardPadding * 2
      );

      setChartViewportWidth(innerWidth);
    }

    updateWidth();

    const cardEl = cardRef.current;
    if (!cardEl) return;

    const observer = new ResizeObserver(updateWidth);
    observer.observe(cardEl);

    return () => {
      observer.disconnect();
    };
  }, []);

  const chartWidth = getChartWidth(metricDates.length, chartViewportWidth);

  const normalizedPoints = normalizeMetricPoints({
    points,
    metricDates,
    chartWidth,
  });

  const path = makePath(normalizedPoints);
  const latestPoint = normalizedPoints[normalizedPoints.length - 1] ?? null;
  const selectedPoint =
    normalizedPoints.find((point) => point.id === selectedPointId) || null;
  const activePoint = selectedPoint ?? latestPoint;

  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;

    scrollEl.scrollLeft = scrollEl.scrollWidth;
  }, [metricDates.length, chartWidth]);

  useEffect(() => {
    setSelectedPointId(null);
  }, [metric.key, records]);

  function toggleSelectedPoint(point: NormalizedGrowthPoint) {
    setSelectedPointId((current) => (current === point.id ? null : point.id));
  }

  function getTooltipX(point: NormalizedGrowthPoint) {
    const pointIndex = normalizedPoints.findIndex(
      (item) => item.id === point.id
    );

    const prevPoint = pointIndex > 0 ? normalizedPoints[pointIndex - 1] : null;
    const nextPoint =
      pointIndex >= 0 && pointIndex < normalizedPoints.length - 1
        ? normalizedPoints[pointIndex + 1]
        : null;

    let direction = 0;

    const nearLeftEdge =
      point.x < CHARTS.chartPaddingX + CHARTS.tooltipEdgePadding;

    const nearRightEdge =
      point.x > chartWidth - CHARTS.chartPaddingX - CHARTS.tooltipEdgePadding;

    if (nearLeftEdge) {
      direction = 1;
    } else if (nearRightEdge) {
      direction = -1;
    } else {
      const leftClear = prevPoint ? prevPoint.y - point.y : 999;
      const rightClear = nextPoint ? nextPoint.y - point.y : 999;

      if (leftClear > rightClear + 2) {
        direction = -1;
      } else if (rightClear > leftClear + 2) {
        direction = 1;
      } else {
        direction = 0;
      }
    }

    const rawTextX = point.x + direction * CHARTS.tooltipSideOffsetX;

    return Math.max(
      CHARTS.chartPaddingX,
      Math.min(chartWidth - CHARTS.chartPaddingX, rawTextX)
    );
  }

  function renderPointValue(point: NormalizedGrowthPoint) {
    return (
      <g pointerEvents="none">
        <text
          x={getTooltipX(point)}
          y={point.y - CHARTS.tooltipOffsetY}
          textAnchor="middle"
          fill={metric.color}
          fontSize={CHARTS.tooltipSize}
          fontWeight={CHARTS.tooltipWeight}
        >
          {formatValue(point.value)}
          <tspan
            fill={metric.color}
            fontSize={CHARTS.tooltipSize}
            fontWeight={CHARTS.tooltipWeight}
          >
            {metric.unit}
          </tspan>
        </text>
      </g>
    );
  }

  function renderGuideLine(point: NormalizedGrowthPoint) {
    const y1 = point.y + CHARTS.pointRadius + CHARTS.guideLineGapFromPoint;
    const y2 = CHARTS.axisY;

    if (y1 >= y2) return null;

    return (
      <line
        x1={point.x}
        y1={y1}
        x2={point.x}
        y2={y2}
        stroke={CHARTS.guideLineColor}
        strokeWidth={CHARTS.guideLineWidth}
        strokeDasharray={CHARTS.guideLineDash}
        strokeLinecap="round"
        pointerEvents="none"
      />
    );
  }

  function ArrowIcon() {
    return (
      <span
        aria-hidden
        style={{
          width: CHARTS.arrowSize,
          height: CHARTS.arrowSize,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
          transition: CHARTS.arrowTransition,
          flexShrink: 0,
        }}
      >
        <svg
          width={CHARTS.arrowSize}
          height={CHARTS.arrowSize}
          viewBox="0 0 24 24"
          fill="none"
          style={{
            display: "block",
            overflow: "visible",
          }}
        >
          <path
            d="M6 9.5L12 15.5L18 9.5"
            stroke={CHARTS.arrowColor}
            strokeWidth={CHARTS.arrowStrokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  }

  return (
    <article
      ref={cardRef}
      onClick={() => setExpanded((value) => !value)}
      style={{
        width: "100%",
        minHeight: CHARTS.cardMinHeight,
        borderRadius: CHARTS.cardRadius,
        background: CHARTS.cardBg,
        boxShadow: CHARTS.cardShadow,
        padding: CHARTS.cardPadding,
        boxSizing: "border-box",
        overflow: "hidden",
        cursor: "pointer",
        transition: CHARTS.cardTransition,
        WebkitTapHighlightColor: "transparent",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          height: 14,
        }}
      >
        <div
          style={{
            color: CHARTS.titleColor,
            fontSize: CHARTS.titleSize,
            fontWeight: CHARTS.titleWeight,
            lineHeight: 1,
          }}
        >
          {metric.title}
        </div>

        <ArrowIcon />
      </div>

      <div
        ref={scrollRef}
        onClick={(event) => event.stopPropagation()}
        style={{
          marginTop: CHARTS.chartMarginTop,
          height: CHARTS.chartHeight,
          overflowX: "auto",
          overflowY: "hidden",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          cursor: "default",
        }}
      >
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
            width: 0;
            height: 0;
          }
        `}</style>

        {!points.length ? (
          <div
            style={{
              width: "100%",
              height: CHARTS.chartHeight,
              color: CHARTS.emptyColor,
              fontSize: CHARTS.emptySize,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            暂无曲线
          </div>
        ) : (
          <svg
            width={chartWidth}
            height={CHARTS.chartHeight}
            viewBox={`0 0 ${chartWidth} ${CHARTS.chartHeight}`}
            style={{
              display: "block",
              overflow: "visible",
            }}
          >
            <line
              x1={0}
              y1={CHARTS.axisY}
              x2={chartWidth}
              y2={CHARTS.axisY}
              stroke={CHARTS.axisColor}
              strokeWidth="1"
            />

            {normalizedPoints.length > 1 && (
              <path
                d={path}
                fill="none"
                stroke={metric.color}
                strokeWidth={CHARTS.lineWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {activePoint && renderGuideLine(activePoint)}
            {activePoint && renderPointValue(activePoint)}

            {normalizedPoints.map((point, index) => (
              <g key={`${point.id}-${point.date}-${index}`}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={CHARTS.pointRadius}
                  fill={metric.color}
                />

                <circle
                  cx={point.x}
                  cy={point.y}
                  r={CHARTS.pointHitRadius}
                  fill="transparent"
                  style={{ cursor: "pointer" }}
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleSelectedPoint(point);
                  }}
                />

                <text
                  x={point.x}
                  y={CHARTS.labelY}
                  textAnchor="middle"
                  fill={CHARTS.labelColor}
                  fontSize={CHARTS.labelSize}
                  fontWeight={CHARTS.labelWeight}
                  pointerEvents="none"
                >
                  {formatDate(point.date)}
                </text>
              </g>
            ))}
          </svg>
        )}
      </div>

      {expanded && (
        <div
          onClick={(event) => event.stopPropagation()}
          style={{
            marginTop: CHARTS.detailMarginTop,
            paddingTop: CHARTS.detailPaddingTop,
            cursor: "default",
          }}
        >
          <GrowthDetailList
            points={points}
            unit={metric.unit}
            onEditRecord={onEditRecord}
            onDeleteRecord={onDeleteRecord}
          />
        </div>
      )}
    </article>
  );
}

export default function GrowthCharts({
  records,
  onEditRecord,
  onDeleteRecord,
}: {
  records: GrowthRecord[];
  onEditRecord?: (recordId: string) => void;
  onDeleteRecord?: (recordId: string) => void;
}) {
  return (
    <section
      style={{
        marginTop: CHARTS.marginTop,
        display: "grid",
        gap: CHARTS.listGap,
        width: "100%",
      }}
    >
      {METRICS.map((metric) => (
        <GrowthMiniChartCard
          key={metric.key}
          metric={metric}
          records={records}
          onEditRecord={onEditRecord}
          onDeleteRecord={onDeleteRecord}
        />
      ))}
    </section>
  );
}