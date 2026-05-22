import type { BabyRecord, RecordType } from "@/lib/types";
import type { TimelineFilterKey } from "./TimelineFilterBar";
import StatusCard from "./StatusCard";
import {
  STATUS_CARD_CONFIG,
  STATUS_STACK_GAP,
  type StatusCardKey,
} from "./statusCardConfig";
import { formatClock } from "@/lib/time";

const STATUS_TO_FILTER: Record<StatusCardKey, TimelineFilterKey> = {
  feed: "feed",
  poop: "poop",
  pee: "pee",
};

/**
 * 找到指定类型中，事件发生时间最新的一条记录。
 *
 * 注意：
 * 必须用 record.time，不要用 createdAt。
 *
 * record.time = 宝宝事件真正发生的时间
 * record.createdAt = 你把这条记录写进系统的时间
 */
function getLast(records: BabyRecord[], types: RecordType[]) {
  return records
    .filter((record) => types.includes(record.type))
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())[0];
}

function formatAgo(dateString?: string) {
  if (!dateString) return "暂无记录";

  const diff = Date.now() - new Date(dateString).getTime();

  /**
   * 如果记录时间明显在未来，不要显示“刚刚”。
   * 这通常说明旧数据里有补录时间被存成了未来时间。
   */
  if (diff < -2 * 60 * 1000) {
    return "时间异常";
  }

  const minutes = Math.max(0, Math.floor(diff / 60000));

  if (minutes < 1) return "刚刚";
  if (minutes < 60) return `${minutes}分钟前`;

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (mins === 0) return `${hours}小时前`;
  return `${hours}小时${mins}分钟前`;
}

export default function StatusCards({
  records,
  onOpenTimelineFilter,
}: {
  records: BabyRecord[];
  onOpenTimelineFilter: (key: TimelineFilterKey) => void;
}) {
  return (
    <section className="status-stack" style={{ gap: STATUS_STACK_GAP }}>
      {STATUS_CARD_CONFIG.map((config) => {
        const lastRecord = getLast(records, config.types);

        return (
          <StatusCard
            key={config.key}
            config={config}
            value={formatAgo(lastRecord?.time)}
            lastTime={lastRecord ? formatClock(lastRecord.time) : undefined}
            onClick={() => onOpenTimelineFilter(STATUS_TO_FILTER[config.key])}
          />
        );
      })}
    </section>
  );
}