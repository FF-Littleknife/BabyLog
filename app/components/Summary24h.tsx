"use client";

import { useState } from "react";
import type { BabyRecord } from "@/lib/types";

const SUMMARY_CONFIG = {
  stackGap: 10,

  cardBg: "rgba(255, 255, 255, 0.9)",
  cardRadius: 30,
  cardPadding: "18px 20px 20px",
  cardShadow: "0 12px 38px rgba(0,0,0,.05)",

  icon: "/time.svg",
  iconSize: 15,
  iconMarginRight: 7,

  titleColor: "#007ef6",
  titleSize: 12,
  titleWeight: 760,

  chevronSize: 7,
  chevronBorder: "1.5px solid #8e8e93",
  chevronOffsetRight: 2,
  chevronTransition: "transform 0.18s ease",

  statGap: 18,

  labelSize: 13,
  labelWeight: 760,

  numberColor: "#111111",
  numberSize: 24,
  numberWeight: 780,

  unitColor: "#8e8e93",
  unitSize: 13,
  unitWeight: 600,

  detailColor: "#8e8e93",
  detailSize: 11,
  detailWeight: 500,
  detailMarginTop: 4,
  detailLineHeight: 1.35,

  detailPanelMarginTop: 10,

  feedColor: "#ff3b30",
  poopColor: "#7ac70c",
  peeColor: "#00b8c8",
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