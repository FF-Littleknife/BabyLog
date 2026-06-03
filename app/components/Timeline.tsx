import type { CSSProperties } from "react";
import { Fragment, useRef } from "react";
import type { BabyRecord } from "@/lib/types";
import { RECORD_LABEL } from "@/lib/types";
import { formatClock, groupByDay } from "@/lib/time";

/**
 * 时间线参数
 * 后面想调时间线位置、字号、间距、圆点、颜色、长按编辑时间，优先改这里。
 */
const TIMELINE_CONFIG = {
  /* =========================
     时间轴横向布局
     ========================= */

  axisLeft: "28%",
  axisWidth: 32,
  rowGap: 20,

  /* =========================
     日期分组标题
     ========================= */

  dayTitleColor: "var(--muted)",
  dayTitleSize: 12,
  dayTitleWeight: 400,

  dayTitleYearColor: "color-mix(in srgb, var(--muted) 48%, transparent)",
  dayTitleYearSize: 10,
  dayTitleYearWeight: 400,
  dayTitleYearMarginTop: 3,

  /* =========================
     左侧时间
     ========================= */

  timeColor: "var(--text)",
  timeSize: 13,

  /* =========================
     左侧日期
     ========================= */

  dateColor: "color-mix(in srgb, var(--muted) 68%, transparent)",
  dateSize: 11,
  dateMarginTop: 3,

  /* =========================
     时间轴竖线
     ========================= */

  lineColor: "var(--timeline-line-color, rgba(60, 60, 67, 0.14))",
  lineWidth: 1.5,

  /* =========================
     时间轴圆点
     ========================= */

  dotSize: 8,
  dotRingColor: "var(--bg)",
  dotRingSize: 5,

  /* =========================
     右侧记录内容区域
     ========================= */

  contentMinHeight: 56,
  contentPaddingTop: 13,

  /* =========================
     间隔时间行
     ========================= */

  intervalHeight: 20,
  intervalColor: "color-mix(in srgb, var(--muted) 68%, transparent)",
  intervalSize: 11,
  intervalWeight: 400,
  intervalPaddingLeft: 10,

  intervalIcon: "/time.svg",
  intervalIconSize: 10,
  intervalIconOpacity: 0.42,
  intervalIconGap: 4,
  intervalIconFilter:
    "var(--timeline-interval-icon-filter, grayscale(1) brightness(0) opacity(0.45))",

  /* =========================
     主标题文字
     ========================= */

  mainColor: "var(--text)",
  mainSize: 13,
  mainWeight: 500,
  mainLetterSpacing: "-0.04em",

  /* =========================
     副标题文字
     ========================= */

  subColor: "var(--muted)",
  subSize: 11,
  subMarginTop: 0,

  /* =========================
     不同记录类型的圆点颜色
     ========================= */

  feedColor: "var(--feed-label-color)",
  peeColor: "var(--pee-label-color)",
  poopColor: "var(--poop-label-color)",
  pumpColor: "var(--pump-label-color)",
  otherColor: "var(--muted)",

  /* =========================
     交互
     ========================= */

  longPressMs: 650,
};

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

function formatDayYear(day: string) {
  const date = parseDay(day);

  if (!date) return "";

  return String(date.getFullYear());
}

function formatSmallDate(dateString: string) {
  const date = new Date(dateString);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function formatInterval(from: string, to: string) {
  const diffMinutes = Math.max(
    0,
    Math.round(
      Math.abs(new Date(from).getTime() - new Date(to).getTime()) / 60000
    )
  );

  if (diffMinutes < 1) return "间隔时间 不到1分钟";

  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;

  if (hours <= 0) return `间隔时间 ${minutes}分钟`;
  if (minutes <= 0) return `间隔时间 ${hours}小时`;

  return `间隔时间 ${hours}小时${minutes}分钟`;
}

function title(record: BabyRecord) {
  if (record.type === "other") return record.content || record.note || "其他";
  return RECORD_LABEL[record.type];
}

function detail(record: BabyRecord) {
  if (record.type === "other") return record.note || "";

  if (record.type === "pump") {
    const parts = [];
    if (record.amountMl) parts.push(`${record.amountMl}ml`);
    if (record.durationMin) parts.push(`${record.durationMin}分钟`);
    if (record.note) parts.push(record.note);
    return parts.join(" · ");
  }

  if (record.type === "formula" || record.type === "bottle_breast") {
    const parts = [];
    if (record.amountMl) parts.push(`${record.amountMl}ml`);
    if (record.note) parts.push(record.note);
    return parts.join(" · ");
  }

  if (record.type === "breast") {
    const parts = [];
    const left = record.leftMin || 0;
    const right = record.rightMin || 0;
    const total = record.durationMin || left + right;

    if (left > 0) parts.push(`左侧${left}分钟`);
    if (right > 0) parts.push(`右侧${right}分钟`);

    if (left > 0 && right > 0 && total > 0) {
      parts.push(`共${total}分钟`);
    }

    if (!left && !right && record.durationMin) {
      parts.push(`${record.durationMin}分钟`);
    }

    if (record.note) parts.push(record.note);
    return parts.join(" · ");
  }

  return record.note || "";
}

function getDotColor(type: BabyRecord["type"]) {
  if (type === "pump") return TIMELINE_CONFIG.pumpColor;

  if (type === "breast" || type === "formula" || type === "bottle_breast") {
    return TIMELINE_CONFIG.feedColor;
  }

  if (type === "pee") return TIMELINE_CONFIG.peeColor;
  if (type === "poop") return TIMELINE_CONFIG.poopColor;
  if (type === "other") return TIMELINE_CONFIG.otherColor;

  return "var(--muted)";
}

function TimelineThemeVars() {
  return (
    <style jsx global>{`
      :root {
        --timeline-line-color: rgba(60, 60, 67, 0.14);
        --timeline-interval-icon-filter: grayscale(1) brightness(0) opacity(0.45);
      }

      @media (prefers-color-scheme: dark) {
        :root {
          --timeline-line-color: rgba(84, 84, 88, 0.48);
          --timeline-interval-icon-filter: grayscale(1) brightness(4) opacity(0.36);
        }
      }
    `}</style>
  );
}

function TimelineInterval({ text }: { text: string }) {
  return (
    <article
      className="timeline-row"
      style={{ minHeight: TIMELINE_CONFIG.intervalHeight }}
    >
      <div />
      <div />
      <div
        style={{
          paddingLeft: TIMELINE_CONFIG.intervalPaddingLeft,
          color: TIMELINE_CONFIG.intervalColor,
          fontSize: TIMELINE_CONFIG.intervalSize,
          fontWeight: TIMELINE_CONFIG.intervalWeight,
          lineHeight: 1,
          display: "flex",
          alignItems: "center",
          gap: TIMELINE_CONFIG.intervalIconGap,
        }}
      >
        <img
          src={TIMELINE_CONFIG.intervalIcon}
          alt=""
          aria-hidden
          style={{
            width: TIMELINE_CONFIG.intervalIconSize,
            height: TIMELINE_CONFIG.intervalIconSize,
            objectFit: "contain",
            display: "block",
            opacity: TIMELINE_CONFIG.intervalIconOpacity,
            filter: TIMELINE_CONFIG.intervalIconFilter,
            flexShrink: 0,
          }}
        />

        <span>{text}</span>
      </div>
    </article>
  );
}

function TimelineItem({
  record,
  onEdit,
}: {
  record: BabyRecord;
  onEdit?: (record: BabyRecord) => void;
}) {
  const timerRef = useRef<number | null>(null);
  const main = title(record);
  const extra = detail(record);

  function startLongPress() {
    if (!onEdit) return;

    timerRef.current = window.setTimeout(() => {
      onEdit(record);
    }, TIMELINE_CONFIG.longPressMs);
  }

  function cancelLongPress() {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  return (
    <article className="timeline-row">
      <time
        className="timeline-time"
        style={{
          color: TIMELINE_CONFIG.timeColor,
          fontSize: TIMELINE_CONFIG.timeSize,
          textAlign: "right",
          paddingRight: 10,
        }}
      >
        <div>{formatClock(record.time)}</div>

        <div
          style={{
            marginTop: TIMELINE_CONFIG.dateMarginTop,
            color: TIMELINE_CONFIG.dateColor,
            fontSize: TIMELINE_CONFIG.dateSize,
            lineHeight: 1,
            textAlign: "right",
          }}
        >
          {formatSmallDate(record.time)}
        </div>
      </time>

      <div className="timeline-axis">
        <span
          className="timeline-dot"
          style={{
            width: TIMELINE_CONFIG.dotSize,
            height: TIMELINE_CONFIG.dotSize,
            background: getDotColor(record.type),
            boxShadow: `0 0 0 ${TIMELINE_CONFIG.dotRingSize}px ${TIMELINE_CONFIG.dotRingColor}`,
          }}
        />
      </div>

      <div
        className="timeline-content"
        onPointerDown={startLongPress}
        onPointerUp={cancelLongPress}
        onPointerCancel={cancelLongPress}
        onPointerLeave={cancelLongPress}
        onContextMenu={(e) => e.preventDefault()}
        style={{
          minHeight: TIMELINE_CONFIG.contentMinHeight,
          paddingTop: TIMELINE_CONFIG.contentPaddingTop,
          paddingLeft: 10,
          userSelect: "none",
          WebkitUserSelect: "none",
          WebkitTouchCallout: "none",
        }}
      >
        <div
          className="timeline-main"
          style={{
            color: TIMELINE_CONFIG.mainColor,
            fontSize: TIMELINE_CONFIG.mainSize,
            fontWeight: TIMELINE_CONFIG.mainWeight,
            letterSpacing: TIMELINE_CONFIG.mainLetterSpacing,
          }}
        >
          {main}
        </div>

        {extra && (
          <div
            className="timeline-sub"
            style={{
              color: TIMELINE_CONFIG.subColor,
              fontSize: TIMELINE_CONFIG.subSize,
              marginTop: TIMELINE_CONFIG.subMarginTop,
            }}
          >
            {extra}
          </div>
        )}
      </div>
    </article>
  );
}

export default function Timeline({
  records,
  onEdit,
  limit,
  showIntervals = false,
}: {
  records: BabyRecord[];
  onEdit?: (record: BabyRecord) => void;
  limit?: number;
  showIntervals?: boolean;
}) {
  const list = typeof limit === "number" ? records.slice(0, limit) : records;
  const grouped = groupByDay(list);
  const days = Object.keys(grouped).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  if (!records.length) {
    return (
      <>
        <TimelineThemeVars />
        <div className="timeline-empty">还没有记录。第一条，马上开始。</div>
      </>
    );
  }

  return (
    <>
      <TimelineThemeVars />

      <div
        className="timeline"
        style={
          {
            "--timeline-axis-left": TIMELINE_CONFIG.axisLeft,
            "--timeline-time-width": `calc(${TIMELINE_CONFIG.axisLeft} - ${
              TIMELINE_CONFIG.axisWidth / 2
            }px)`,
            "--timeline-axis-width": `${TIMELINE_CONFIG.axisWidth}px`,
            "--timeline-row-gap": `${TIMELINE_CONFIG.rowGap}px`,
          } as CSSProperties
        }
      >
        {days.map((day) => {
          const dayRecords = grouped[day];
          const year = formatDayYear(day);

          return (
            <section
              className="timeline-day"
              key={day}
              data-timeline-day={day}
            >
              <div
                className="timeline-day-title"
                style={{
                  width: "max-content",
                  marginLeft: TIMELINE_CONFIG.axisLeft,
                  transform: "translateX(-50%)",
                  color: TIMELINE_CONFIG.dayTitleColor,
                  fontSize: TIMELINE_CONFIG.dayTitleSize,
                  fontWeight: TIMELINE_CONFIG.dayTitleWeight,
                  textAlign: "center",
                  lineHeight: 1,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                <div>{formatWheelDate(day)}</div>

                {year && (
                  <div
                    style={{
                      marginTop: TIMELINE_CONFIG.dayTitleYearMarginTop,
                      color: TIMELINE_CONFIG.dayTitleYearColor,
                      fontSize: TIMELINE_CONFIG.dayTitleYearSize,
                      fontWeight: TIMELINE_CONFIG.dayTitleYearWeight,
                      lineHeight: 1,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {year}
                  </div>
                )}
              </div>

              <div className="timeline-list" style={{ position: "relative" }}>
                <span
                  aria-hidden
                  style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    left: `calc(${TIMELINE_CONFIG.axisLeft} - ${
                      TIMELINE_CONFIG.lineWidth / 2
                    }px)`,
                    width: TIMELINE_CONFIG.lineWidth,
                    borderRadius: 999,
                    background: TIMELINE_CONFIG.lineColor,
                  }}
                />

                {dayRecords.map((record, index) => {
                  const nextRecord = dayRecords[index + 1];

                  return (
                    <Fragment key={record.id}>
                      <TimelineItem record={record} onEdit={onEdit} />

                      {showIntervals && nextRecord && (
                        <TimelineInterval
                          text={formatInterval(record.time, nextRecord.time)}
                        />
                      )}
                    </Fragment>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}