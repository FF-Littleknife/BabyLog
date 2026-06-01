import type { BabyRecord } from "@/lib/types";
import { formatClock } from "@/lib/time";
import type { TimelineFilterKey } from "./TimelineFilterBar";
import StatusCard from "./StatusCard";
import {
  STATUS_CARD_CONFIG,
  STATUS_STACK_GAP,
  type StatusCardConfig,
} from "./statusCardConfig";

function getLatestRecord(records: BabyRecord[], config: StatusCardConfig) {
  return records.find((record) => config.types.includes(record.type));
}

function formatDistanceFromNow(time?: string) {
  if (!time) return "暂无";

  const diffMinutes = Math.max(
    0,
    Math.floor((Date.now() - new Date(time).getTime()) / 60000)
  );

  if (diffMinutes < 1) return "刚刚";
  if (diffMinutes < 60) return `${diffMinutes}分钟前`;

  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;

  if (minutes <= 0) return `${hours}小时前`;

  return `${hours}小时${minutes}分钟前`;
}

export default function StatusCards({
  records,
  onOpenTimelineFilter,
}: {
  records: BabyRecord[];
  onOpenTimelineFilter: (key: TimelineFilterKey) => void;
}) {
  return (
    <section
      className="status-stack"
      style={{
        gap: STATUS_STACK_GAP,
      }}
    >
      {STATUS_CARD_CONFIG.map((config) => {
        const latestRecord = getLatestRecord(records, config);

        return (
          <StatusCard
            key={config.key}
            config={config}
            value={formatDistanceFromNow(latestRecord?.time)}
            lastTime={latestRecord ? formatClock(latestRecord.time) : undefined}
            onClick={() => onOpenTimelineFilter(config.key)}
          />
        );
      })}
    </section>
  );
}