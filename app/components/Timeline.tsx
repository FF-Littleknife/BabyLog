import type { CSSProperties } from "react";
import { Fragment, useRef } from "react";
import type { BabyRecord } from "@/lib/types";
import { RECORD_LABEL } from "@/lib/types";
import { formatClock, formatDayTitle, groupByDay } from "@/lib/time";

/**
 * 时间线参数
 * 后面想调时间线位置、字号、间距、圆点、颜色、长按编辑时间，优先改这里。
 */
const TIMELINE_CONFIG = {
  /* =========================
     时间轴横向布局
     ========================= */

  axisLeft: "28%", // 时间轴竖线在屏幕中的横向位置。数值越小越靠左
  axisWidth: 32, // 中间时间轴区域宽度，会影响时间列和内容列的分隔
  rowGap: 20, // 每条记录之间的纵向间距。越小越紧凑

  /* =========================
     日期分组标题
     例如：今天 / 昨天 / 5月18日 周一
     ========================= */

  dayTitleColor: "#8e8e93", // 日期分组标题颜色
  dayTitleSize: 12, // 日期分组标题字号
  dayTitleWeight: 400, // 日期分组标题字重

  /* =========================
     左侧时间
     例如：08:05
     ========================= */

  timeColor: "#111111", // 左侧时间颜色
  timeSize: 13, // 左侧时间字号

  /* =========================
     左侧日期
     例如：5/22
     ========================= */

  dateColor: "rgba(142,142,147,.58)", // 左侧小日期颜色
  dateSize: 11, // 左侧小日期字号
  dateMarginTop: 3, // 时间和日期之间的距离

  /* =========================
     时间轴竖线
     ========================= */

  lineColor: "rgba(0,0,0,.14)", // 中间竖线颜色
  lineWidth: 1.5, // 中间竖线宽度

  /* =========================
     时间轴圆点
     ========================= */

  dotSize: 8, // 圆点大小
  dotRingColor: "#f4f1f6", // 圆点外圈颜色，通常和背景接近
  dotRingSize: 5, // 圆点外圈厚度

  /* =========================
     右侧记录内容区域
     ========================= */

  contentMinHeight: 56, // 每条记录的最小高度。越小一屏显示越多
  contentPaddingTop: 13, // 右侧内容顶部内边距，会影响标题和圆点的纵向对齐

  /* =========================
     间隔时间行
     只在筛选单一类型时显示
     例如：间隔时间 2小时10分钟
     ========================= */

  intervalHeight: 20, // 间隔时间行高度
  intervalColor: "rgba(142,142,147,.58)", // 间隔时间文字颜色
  intervalSize: 11, // 间隔时间字号
  intervalWeight: 400, // 间隔时间字重
  intervalPaddingLeft: 10, // 间隔时间文字距离时间轴的左侧距离

  intervalIcon: "/time.svg", // 间隔时间前的小图标，需要放在 public/time.svg
  intervalIconSize: 10, // 图标大小
  intervalIconOpacity: 0.42, // 图标透明度。越小越淡
  intervalIconGap: 4, // 图标和文字之间的距离
  intervalIconFilter: "grayscale(1) brightness(0) opacity(0.45)", // 把图标压成灰色

  /* =========================
     主标题文字
     例如：母乳 / 小便 / 乳糖酶
     ========================= */

  mainColor: "#111111", // 主标题颜色
  mainSize: 13, // 主标题字号
  mainWeight: 500, // 主标题字重
  mainLetterSpacing: "-0.04em", // 主标题字距。负值更紧凑

  /* =========================
     副标题文字
     例如：左侧15分钟 · 右侧15分钟 · 共30分钟
     ========================= */

  subColor: "#8e8e93", // 副标题颜色
  subSize: 11, // 副标题字号
  subMarginTop: 0, // 主标题和副标题之间的距离

  /* =========================
     不同记录类型的圆点颜色
     ========================= */

  feedColor: "#ff3b30", // 喂养类颜色：母乳 / 奶粉 / 瓶喂母乳
  peeColor: "#00b8c8", // 小便颜色
  poopColor: "#7ac70c", // 大便颜色
  pumpColor: "#af52de", // 泵奶颜色
  noteColor: "#8e8e93", // note / 备注类颜色，例如乳糖酶、维生素D

  /* =========================
     交互
     ========================= */

  longPressMs: 650, // 长按多少毫秒后进入编辑。数值越小越灵敏
};

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
  if (record.type === "note") return record.note || "备注";
  return RECORD_LABEL[record.type];
}

function detail(record: BabyRecord) {
  if (record.type === "note") return "";

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
  if (type === "note") return TIMELINE_CONFIG.noteColor;

  return "#8e8e93";
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
    return <div className="timeline-empty">还没有记录。第一条，马上开始。</div>;
  }

  return (
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

        return (
          <section className="timeline-day" key={day}>
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
              }}
            >
              {formatDayTitle(day)}
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
  );
}