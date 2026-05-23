"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { GrowthRecord } from "@/lib/growthApi";

/**
 * 成长曲线卡片参数
 * 后面想调卡片高度、曲线颜色、日期、点间距、默认滚动位置、展开明细，优先改这里。
 */
const CHARTS = {
  /* =========================
     整体布局
     ========================= */

  marginTop: 10,
  listGap: 10,

  /* =========================
     单张曲线卡片
     ========================= */

  cardMinHeight: 160,
  cardBg: "rgba(255,255,255,.82)",
  cardRadius: 26,
  cardPadding: 14,
  cardShadow: "0 10px 34px rgba(0,0,0,.05)",
  cardTransition: "height .22s ease, box-shadow .22s ease",

  /* =========================
     卡片标题
     ========================= */

  titleColor: "#8e8e93",
  titleSize: 12,
  titleWeight: 400,

  /* =========================
     当前最新数值
     ========================= */

  valueColor: "#111111",
  valueSize: 22,
  valueWeight: 820,

  unitColor: "#8e8e93",
  unitSize: 12,
  unitWeight: 650,
  unitMarginLeft: 3,

  /* =========================
     右上角最新日期 / 展开箭头
     ========================= */

  dateColor: "rgba(142,142,147,.72)",
  dateSize: 10,
  arrowSize: 12,
  arrowColor: "rgba(142,142,147,.72)",
  arrowGap: 6,
  arrowTransition: "transform .18s ease",

  /* =========================
     曲线区域
     ========================= */

  chartMarginTop: 10,
  chartHeight: 96,
  svgHeight: 82,

  pointGap: 54,
  chartPaddingX: 18,

  lineWidth: 3,
  pointRadius: 3.2,

  axisY: 66,
  labelY: 82,

  axisColor: "rgba(0,0,0,.08)",
  labelColor: "rgba(142,142,147,.72)",
  labelSize: 10,
  labelWeight: 400,

  /* =========================
     展开明细
     ========================= */

  detailMarginTop: 10,
  detailPaddingTop: 10,
  detailBorderTop: "1px solid rgba(0,0,0,.06)",
  detailMaxHeight: 156,
  detailRowPadding: "8px 0",
  detailRowBorder: "1px solid rgba(0,0,0,.045)",

  detailDateColor: "rgba(142,142,147,.82)",
  detailDateSize: 11,
  detailDateWeight: 500,

  detailValueColor: "#111111",
  detailValueSize: 13,
  detailValueWeight: 760,

  detailUnitColor: "#8e8e93",
  detailUnitSize: 11,
  detailUnitWeight: 650,

  detailEmptyText: "暂无记录",
  detailEmptyColor: "rgba(142,142,147,.68)",
  detailEmptySize: 12,

  /* =========================
     空状态
     ========================= */

  emptyColor: "rgba(142,142,147,.68)",
  emptySize: 12,

  /* =========================
     三项曲线颜色
     ========================= */

  heightColor: "#0a84ff",
  weightColor: "#ff3b30",
  headColor: "#af52de",
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

function normalizePoints(values: number[], chartWidth: number) {
  if (!values.length) return [];

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;

  const usableWidth = chartWidth - CHARTS.chartPaddingX * 2;

  return values.map((value, index) => {
    const x =
      values.length === 1
        ? chartWidth / 2
        : CHARTS.chartPaddingX +
          (index / Math.max(values.length - 1, 1)) * usableWidth;

    const ratio = range === 0 ? 0.5 : (value - min) / range;

    // 曲线区域控制在横轴上方，底部留给日期
    const y = CHARTS.axisY - ratio * 42 - 8;

    return { x, y };
  });
}

function GrowthDetailList({
  points,
  unit,
}: {
  points: GrowthPoint[];
  unit: string;
}) {
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
      style={{
        maxHeight: CHARTS.detailMaxHeight,
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
        scrollbarWidth: "none",
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
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: 12,
            padding: CHARTS.detailRowPadding,
            borderTop: index === 0 ? 0 : CHARTS.detailRowBorder,
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
                marginLeft: CHARTS.unitMarginLeft,
                color: CHARTS.detailUnitColor,
                fontSize: CHARTS.detailUnitSize,
                fontWeight: CHARTS.detailUnitWeight,
              }}
            >
              {unit}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function GrowthMiniChartCard({
  metric,
  records,
}: {
  metric: GrowthMetric;
  records: GrowthRecord[];
}) {
  const cardRef = useRef<HTMLElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [chartViewportWidth, setChartViewportWidth] = useState(1);
  const [expanded, setExpanded] = useState(false);

  const points = useMemo(
    () => getMetricPoints(records, metric.key),
    [records, metric.key]
  );

  const latest = points[points.length - 1];

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

  const chartWidth = getChartWidth(points.length, chartViewportWidth);

  const normalizedPoints = normalizePoints(
    points.map((point) => point.value),
    chartWidth
  );

  const path = makePath(normalizedPoints);

  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;

    // 默认展示最新数据：滚到最右侧
    scrollEl.scrollLeft = scrollEl.scrollWidth;
  }, [points.length, chartWidth]);

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
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <div>
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

          <div style={{ marginTop: 7, whiteSpace: "nowrap" }}>
            <span
              style={{
                color: CHARTS.valueColor,
                fontSize: CHARTS.valueSize,
                fontWeight: CHARTS.valueWeight,
                lineHeight: 1,
              }}
            >
              {formatValue(latest?.value)}
            </span>

            {latest && (
              <span
                style={{
                  marginLeft: CHARTS.unitMarginLeft,
                  color: CHARTS.unitColor,
                  fontSize: CHARTS.unitSize,
                  fontWeight: CHARTS.unitWeight,
                }}
              >
                {metric.unit}
              </span>
            )}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: CHARTS.arrowGap,
            color: CHARTS.dateColor,
            fontSize: CHARTS.dateSize,
            lineHeight: 1,
            whiteSpace: "nowrap",
            marginTop: 1,
          }}
        >
          <span>{latest ? formatDate(latest.date) : "暂无"}</span>

          <span
            aria-hidden
            style={{
              display: "inline-block",
              color: CHARTS.arrowColor,
              fontSize: CHARTS.arrowSize,
              transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
              transition: CHARTS.arrowTransition,
              lineHeight: 1,
            }}
          >
            ⌄
          </span>
        </div>
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

            {points.length > 1 && (
              <path
                d={path}
                fill="none"
                stroke={metric.color}
                strokeWidth={CHARTS.lineWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {normalizedPoints.map((point, index) => (
              <g key={`${points[index].id}-${index}`}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={CHARTS.pointRadius}
                  fill={metric.color}
                />

                <text
                  x={point.x}
                  y={CHARTS.labelY}
                  textAnchor="middle"
                  fill={CHARTS.labelColor}
                  fontSize={CHARTS.labelSize}
                  fontWeight={CHARTS.labelWeight}
                >
                  {formatDate(points[index].date)}
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
            borderTop: CHARTS.detailBorderTop,
            cursor: "default",
          }}
        >
          <GrowthDetailList points={points} unit={metric.unit} />
        </div>
      )}
    </article>
  );
}

export default function GrowthCharts({ records }: { records: GrowthRecord[] }) {
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
        />
      ))}
    </section>
  );
}