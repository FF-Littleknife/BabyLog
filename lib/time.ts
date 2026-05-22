import type { BabyRecord } from "./types";

export function formatClock(input: string | Date) {
  const d = typeof input === "string" ? new Date(input) : input;
  return d.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false });
}

export function formatDayTitle(input: string | Date) {
  const d = typeof input === "string" ? new Date(input) : input;
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === now.toDateString()) return "今天";
  if (d.toDateString() === yesterday.toDateString()) return "昨天";
  return d.toLocaleDateString("zh-CN", { month: "long", day: "numeric", weekday: "short" });
}

export function timeAgo(input?: string) {
  if (!input) return "暂无记录";
  const diff = Date.now() - new Date(input).getTime();
  const min = Math.max(0, Math.floor(diff / 60000));
  if (min < 1) return "刚刚";
  if (min < 60) return `${min}分钟前`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h < 24) return m ? `${h}小时${m}分钟前` : `${h}小时前`;
  const d = Math.floor(h / 24);
  return `${d}天前`;
}

export function groupByDay(records: BabyRecord[]) {
  return records.reduce<Record<string, BabyRecord[]>>((acc, item) => {
    const key = new Date(item.time).toDateString();
    acc[key] ||= [];
    acc[key].push(item);
    return acc;
  }, {});
}
