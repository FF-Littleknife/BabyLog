import type { BabyRecord } from "@/lib/types";
import { supabase } from "@/lib/supabase";

const BABY_ID = "yepiaopiao";

function toDbRecord(record: BabyRecord) {
  return {
    id: record.id,
    baby_id: BABY_ID,
    type: record.type,
    time: record.time,
    created_at: record.createdAt,
    updated_at: null,
    deleted_at: null,

    amount_ml: record.amountMl ?? null,
    duration_min: record.durationMin ?? null,
    left_min: record.leftMin ?? null,
    right_min: record.rightMin ?? null,
    note: record.note ?? null,

    source: null,
    device_id: null,
  };
}

function toDbUpdate(record: BabyRecord) {
  return {
    type: record.type,
    time: record.time,
    updated_at: new Date().toISOString(),

    amount_ml: record.amountMl ?? null,
    duration_min: record.durationMin ?? null,
    left_min: record.leftMin ?? null,
    right_min: record.rightMin ?? null,
    note: record.note ?? null,
  };
}

function fromDbRecord(row: any): BabyRecord {
  return {
    id: row.id,
    type: row.type,
    time: row.time,
    createdAt: row.created_at,

    amountMl: row.amount_ml ?? undefined,
    durationMin: row.duration_min ?? undefined,
    leftMin: row.left_min ?? undefined,
    rightMin: row.right_min ?? undefined,
    note: row.note ?? undefined,
  };
}

export async function fetchRecords() {
  const { data, error } = await supabase
    .from("records")
    .select("*")
    .eq("baby_id", BABY_ID)
    .is("deleted_at", null)
    .order("time", { ascending: false });

  if (error) {
    console.error("fetchRecords error:", error);
    throw error;
  }

  return (data || []).map(fromDbRecord);
}

export async function insertRecord(record: BabyRecord) {
  const { error } = await supabase.from("records").insert(toDbRecord(record));

  if (error) {
    console.error("insertRecord error:", error);
    throw error;
  }
}

export async function updateRecordToCloud(record: BabyRecord) {
  const { error } = await supabase
    .from("records")
    .update(toDbUpdate(record))
    .eq("baby_id", BABY_ID)
    .eq("id", record.id)
    .is("deleted_at", null);

  if (error) {
    console.error("updateRecordToCloud error:", error);
    throw error;
  }
}

export async function deleteRecordFromCloud(id: string) {
  const { error } = await supabase
    .from("records")
    .update({
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("baby_id", BABY_ID)
    .eq("id", id);

  if (error) {
    console.error("deleteRecordFromCloud error:", error);
    throw error;
  }
}