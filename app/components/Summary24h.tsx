"use client";

import { useState } from "react";
import type { BabyRecord } from "@/lib/types";

const SUMMARY_CONFIG = {
  stackGap: 10, // 摘要卡片之间的纵向间距

  cardBg: "var(--glass-bg)", // 摘要卡片背景，跟随亮暗模式
  cardRadius: 30, // 摘要卡片圆角
  cardPadding: "15px 20px 15px", // 摘要卡片内边距：上22 / 左右20 / 下20
  cardShadow: "var(--shadow-card)", // 摘要卡片阴影

  icon: "/time.svg", // 标题左侧图标路径
  iconSize: 15, // 标题图标尺寸
  iconMarginRight: 7, // 图标和标题文字之间的距离

  titleColor: "var(--blue)", // 标题颜色
  titleSize: 12, // 标题字号
  titleWeight: 760, // 标题字重

  chevronSize: 7, // 右侧展开箭头尺寸
  chevronBorder: "1.5px solid var(--muted)", // 展开箭头线条样式
  chevronOffsetRight: 2, // 展开箭头向右偏移量
  chevronTransition: "transform 0.18s ease", // 展开箭头旋转动画速度

  statGap: 18, // 三项统计之间的横向间距

  labelSize: 13, // 统计标签字号，比如“喂养”
  labelWeight: 760, // 统计标签字重

  numberColor: "var(--text)", // 统计数字颜色
  numberSize: 24, // 统计数字字号
  numberWeight: 780, // 统计数字字重

  unitColor: "var(--muted)", // 单位文字颜色，比如“次 / ml”
  unitSize: 13, // 单位文字字号
  unitWeight: 600, // 单位文字字重

  detailColor: "var(--muted)", // 详情说明文字颜色
  detailSize: 11, // 详情说明文字字号
  detailWeight: 500, // 详情说明文字字重
  detailMarginTop: 4, // 详情说明距离上方数字的距离
  detailLineHeight: 1.35, // 详情说明行高

  detailPanelMarginTop: 10, // 展开详情区域距离上方统计区域的距离

  feedColor: "var(--feed-label-color)", // 喂养统计颜色
  poopColor: "var(--poop-label-color)", // 大便统计颜色
  peeColor: "var(--pee-label-color)", // 小便统计颜色
};

function getStartOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

function getStartOfYesterday() {
  return getStartOfToday() - 24 * 60 * 60 * 1000;
}

function filterByMode(
  records: BabyRecord[],
  mode: "last24h" | "today" | "yesterday"
) {
  const now = Date.now();
  const todayStart = getStartOfToday();
  const yesterdayStart = getStartOfYesterday();

  return records.filter((record) => {
    const time = new Date(record.time).getTime();

    if (mode === "last24h") {
      return time >= now - 24 * 60 * 60 * 1000;
    }

    if (mode === "today") {
      return time >= todayStart;
    }

    return time >= yesterdayStart && time < todayStart;
  });
}

function count(records: BabyRecord[], types: BabyRecord["type"][]) {
  return records.filter((record) => types.includes(record.type)).length;
}

function totalAmount(records: BabyRecord[], type: BabyRecord["type"]) {
  return records
    .filter((record) => record.type === type)
    .reduce((total, record) => total + (record.amountMl || 0), 0);
}

function hasAnyNote(records: BabyRecord[], type: BabyRecord["type"]) {
  return records.some(
    (record) => record.type === type && Boolean(record.note?.trim())
  );
}

function Chevron({ expanded }: { expanded: boolean }) {
  return (
    <span
      aria-hidden
      style={{
        width: SUMMARY_CONFIG.chevronSize,
        height: SUMMARY_CONFIG.chevronSize,
        borderRight: SUMMARY_CONFIG.chevronBorder,
        borderBottom: SUMMARY_CONFIG.chevronBorder,
        transform: expanded ? "rotate(-135deg)" : "rotate(45deg)",
        transition: SUMMARY_CONFIG.chevronTransition,
        marginRight: SUMMARY_CONFIG.chevronOffsetRight,
      }}
    />
  );
}

function StatValue({
  value,
  unit,
}: {
  value: number | string;
  unit: string;
}) {
  return (
    <div style={{ whiteSpace: "nowrap" }}>
      <span
        style={{
          color: SUMMARY_CONFIG.numberColor,
          fontSize: SUMMARY_CONFIG.numberSize,
          fontWeight: SUMMARY_CONFIG.numberWeight,
          lineHeight: 1,
        }}
      >
        {value}
      </span>

      <span
        style={{
          marginLeft: 3,
          color: SUMMARY_CONFIG.unitColor,
          fontSize: SUMMARY_CONFIG.unitSize,
          fontWeight: SUMMARY_CONFIG.unitWeight,
        }}
      >
        {unit}
      </span>
    </div>
  );
}

function DetailLines({ lines }: { lines: string[] }) {
  return (
    <div
      style={{
        marginTop: SUMMARY_CONFIG.detailMarginTop,
        color: SUMMARY_CONFIG.detailColor,
        fontSize: SUMMARY_CONFIG.detailSize,
        fontWeight: SUMMARY_CONFIG.detailWeight,
        lineHeight: SUMMARY_CONFIG.detailLineHeight,
      }}
    >
      {lines.map((item) => (
        <div key={item} style={{ whiteSpace: "nowrap" }}>
          {item}
        </div>
      ))}
    </div>
  );
}

function StatItem({
  label,
  value,
  unit,
  color,
  detail,
  expanded,
}: {
  label: string;
  value: number | string;
  unit: string;
  color: string;
  detail?: string[];
  expanded: boolean;
}) {
  return (
    <div>
      <div
        style={{
          color,
          fontSize: SUMMARY_CONFIG.labelSize,
          fontWeight: SUMMARY_CONFIG.labelWeight,
          marginBottom: 5,
        }}
      >
        {label}
      </div>

      <StatValue value={value} unit={unit} />

      {expanded && detail && <DetailLines lines={detail} />}
    </div>
  );
}

function SummaryCard({
  title,
  records,
}: {
  title: string;
  records: BabyRecord[];
}) {
  const [expanded, setExpanded] = useState(false);

  const breastCount = count(records, ["breast"]);
  const bottleCount = count(records, ["bottle_breast"]);
  const formulaCount = count(records, ["formula"]);

  const feedCount = breastCount + bottleCount + formulaCount;
  const bottleMl = totalAmount(records, "bottle_breast");
  const formulaMl = totalAmount(records, "formula");

  const poopRecords = records.filter((record) => record.type === "poop");
  const peeRecords = records.filter((record) => record.type === "pee");

  const poopCount = poopRecords.length;
  const peeCount = peeRecords.length;

  const feedDetail = [
    `母乳${breastCount}次`,
    `瓶喂${bottleCount}次 · ${bottleMl}ml`,
    `奶粉${formulaCount}次 · ${formulaMl}ml`,
  ];

  const poopDetail = [hasAnyNote(records, "poop") ? "有备注" : "无备注"];
  const peeDetail = [hasAnyNote(records, "pee") ? "有备注" : "无备注"];

  return (
    <section
      onClick={() => setExpanded((prev) => !prev)}
      style={{
        background: SUMMARY_CONFIG.cardBg,
        borderRadius: SUMMARY_CONFIG.cardRadius,
        padding: SUMMARY_CONFIG.cardPadding,
        boxShadow: SUMMARY_CONFIG.cardShadow,
        cursor: "pointer",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            minWidth: 0,
          }}
        >
          <img
            src={SUMMARY_CONFIG.icon}
            alt=""
            style={{
              width: SUMMARY_CONFIG.iconSize,
              height: SUMMARY_CONFIG.iconSize,
              objectFit: "contain",
              display: "block",
              marginRight: SUMMARY_CONFIG.iconMarginRight,
            }}
          />

          <div
            style={{
              color: SUMMARY_CONFIG.titleColor,
              fontSize: SUMMARY_CONFIG.titleSize,
              fontWeight: SUMMARY_CONFIG.titleWeight,
              lineHeight: 1,
            }}
          >
            {title}
          </div>
        </div>

        <Chevron expanded={expanded} />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: SUMMARY_CONFIG.statGap,
        }}
      >
        <StatItem
          label="喂养"
          value={feedCount}
          unit="次"
          detail={feedDetail}
          expanded={expanded}
          color={SUMMARY_CONFIG.feedColor}
        />

        <StatItem
          label="大便"
          value={poopCount}
          unit="次"
          detail={poopDetail}
          expanded={expanded}
          color={SUMMARY_CONFIG.poopColor}
        />

        <StatItem
          label="小便"
          value={peeCount}
          unit="次"
          detail={peeDetail}
          expanded={expanded}
          color={SUMMARY_CONFIG.peeColor}
        />
      </div>
    </section>
  );
}

export default function Summary24h({ records }: { records: BabyRecord[] }) {
  return (
    <div
      style={{
        display: "grid",
        gap: SUMMARY_CONFIG.stackGap,
      }}
    >
      <SummaryCard title="过去24小时" records={filterByMode(records, "last24h")} />
      <SummaryCard title="今天" records={filterByMode(records, "today")} />
      <SummaryCard title="昨天" records={filterByMode(records, "yesterday")} />
    </div>
  );
}