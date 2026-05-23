"use client";

import { useMemo } from "react";
import type { GrowthRecord } from "@/lib/growthApi";

const CHARTS = {
  marginTop: 16,

  listGap: 12,

  cardHeight: 158,
  cardBg: "rgba(255,255,255,.82)",
  cardRadius: 26,
  cardPadding: 14,
  cardShadow: "0 10px 34px rgba(0,0,0,.05)",

  titleColor: "#8e8e93",
  titleSize: 12,
  titleWeight: 760,

  valueColor: "#111111",
  valueSize: 22,
  valueWeight: 820,

  unitColor: "#8e8e93",
  unitSize: 12,
  unitWeight: 650,

  dateColor: "rgba(142,142,147,.72)",
  dateSize: 10,

  chartMarginTop: 10,

  svgHeight: 82,
  chartHeight: 96,
  pointGap: 54,
  minChartWidth: 300,
  chartPaddingX: 18,

  lineWidth: 3,
  pointRadius: 3.2,

  axisY: 66,
  labelY: 82,

  axisColor: "rgba(0,0,0,.08)",
  labelColor: "rgba(142,142,147,.72)",
  labelSize: 10,

  emptyColor: "rgba(142,142,147,.68)",
  emptySize: 12,

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

type MetricPoint = {
  id: string;
  date: string;
  value: number;
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

function getChartWidth(count: number) {
  if (count <= 1) return CHARTS.minChartWidth;

  return Math.max(
    CHARTS.minChartWidth,
    CHARTS.chartPaddingX * 2 + (count - 1) * CHARTS.pointGap
  );
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

    // 曲线区域控制在轴线以上，给底部日期留空间
    const y = CHARTS.axisY - ratio * 42 - 8;

    return { x, y };
  });
}

function GrowthMiniChartCard({
  metric,
  records,
}: {
  metric: GrowthMetric;
  records: GrowthRecord[];
}) {
  const points = useMemo(
    () => getMetricPoints(records, metric.key),
    [records, metric.key]
  );

  const latest = points[points.length - 1];
  const chartWidth = getChartWidth(points.length);
  const normalizedPoints = normalizePoints(
    points.map((point) => point.value),
    chartWidth
  );
  const path = makePath(normalizedPoints);

  return (
    <article
      style={{
        width: "100%",
        height: CHARTS.cardHeight,
        borderRadius: CHARTS.cardRadius,
        background: CHARTS.cardBg,
        boxShadow: CHARTS.cardShadow,
        padding: CHARTS.cardPadding,
        boxSizing: "border-box",
        overflow: "hidden",
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
                  marginLeft: 3,
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
            color: CHARTS.dateColor,
            fontSize: CHARTS.dateSize,
            lineHeight: 1,
            whiteSpace: "nowrap",
            marginTop: 1,
          }}
        >
          {latest ? formatDate(latest.date) : "暂无"}
        </div>
      </div>

      <div
        style={{
          marginTop: CHARTS.chartMarginTop,
          height: CHARTS.chartHeight,
          overflowX: "auto",
          overflowY: "hidden",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
        }}
      >
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
                  fontWeight="600"
                >
                  {formatDate(points[index].date)}
                </text>
              </g>
            ))}
          </svg>
        )}
      </div>
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