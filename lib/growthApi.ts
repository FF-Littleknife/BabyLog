import { supabase } from "@/lib/supabase";

const BABY_ID = "yepiaopiao";

export type GrowthRecord = {
  id: string;
  babyId: string;
  date: string;
  weightKg?: number;
  heightCm?: number;
  headCm?: number;
  note?: string;
  createdAt: string;
};

function toDbRecord(record: GrowthRecord) {
  return {
    id: record.id,
    baby_id: BABY_ID,
    date: record.date,
    weight_kg: record.weightKg ?? null,
    height_cm: record.heightCm ?? null,
    head_cm: record.headCm ?? null,
    note: record.note ?? null,
    created_at: record.createdAt,
    updated_at: null,
    deleted_at: null,
  };
}

function fromDbRecord(row: any): GrowthRecord {
  return {
    id: row.id,
    babyId: row.baby_id,
    date: row.date,
    weightKg: row.weight_kg ?? undefined,
    heightCm: row.height_cm ?? undefined,
    headCm: row.head_cm ?? undefined,
    note: row.note ?? undefined,
    createdAt: row.created_at,
  };
}

export async function fetchGrowthRecords() {
  const { data, error } = await supabase
    .from("growth_records")
    .select("*")
    .eq("baby_id", BABY_ID)
    .is("deleted_at", null)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("fetchGrowthRecords error:", error);
    throw error;
  }

  return (data || []).map(fromDbRecord);
}

export async function insertGrowthRecord(record: GrowthRecord) {
  const { error } = await supabase
    .from("growth_records")
    .insert(toDbRecord(record));

  if (error) {
    console.error("insertGrowthRecord error:", error);
    throw error;
  }
}