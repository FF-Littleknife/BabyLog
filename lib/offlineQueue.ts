import type { BabyRecord } from "@/lib/types";
import type { GrowthRecord } from "@/lib/growthApi";

const PENDING_SYNC_KEY = "baby-log-pending-sync";

export type PendingSyncItem =
  | {
      kind: "record";
      id: string;
      record: BabyRecord;
      createdAt: string;
    }
  | {
      kind: "growth";
      id: string;
      record: GrowthRecord;
      createdAt: string;
    };

type PendingSyncIdentity = {
  kind: PendingSyncItem["kind"];
  id: string;
};

function canUseLocalStorage() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function safeParsePendingSync(raw: string | null): PendingSyncItem[] {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) return [];

    return parsed.filter((item) => {
      return (
        item &&
        (item.kind === "record" || item.kind === "growth") &&
        typeof item.id === "string" &&
        item.record &&
        typeof item.createdAt === "string"
      );
    }) as PendingSyncItem[];
  } catch (error) {
    console.error("parse pending sync error:", error);
    return [];
  }
}

export function getPendingSyncItems() {
  if (!canUseLocalStorage()) return [];

  return safeParsePendingSync(localStorage.getItem(PENDING_SYNC_KEY));
}

function savePendingSyncItems(items: PendingSyncItem[]) {
  if (!canUseLocalStorage()) return;

  localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(items));
}

function upsertPendingSyncItem(item: PendingSyncItem) {
  const list = getPendingSyncItems();

  const next = [
    ...list.filter(
      (oldItem) => !(oldItem.kind === item.kind && oldItem.id === item.id)
    ),
    item,
  ];

  savePendingSyncItems(next);
}

export function enqueueRecordSync(record: BabyRecord) {
  upsertPendingSyncItem({
    kind: "record",
    id: record.id,
    record,
    createdAt: new Date().toISOString(),
  });
}

export function enqueueGrowthSync(record: GrowthRecord) {
  upsertPendingSyncItem({
    kind: "growth",
    id: record.id,
    record,
    createdAt: new Date().toISOString(),
  });
}

export function removePendingSyncItems(items: PendingSyncIdentity[]) {
  if (!items.length) return;

  const list = getPendingSyncItems();

  const next = list.filter((item) => {
    return !items.some(
      (removeItem) => removeItem.kind === item.kind && removeItem.id === item.id
    );
  });

  savePendingSyncItems(next);
}

export function getPendingSyncCount() {
  return getPendingSyncItems().length;
}