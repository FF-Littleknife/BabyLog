export type RecordType =
  | "breast"
  | "formula"
  | "bottle_breast"
  | "pee"
  | "poop"
  | "pump"
  | "note";

export type BabyRecord = {
  id: string;
  type: RecordType;
  time: string;
  createdAt: string;
  amountMl?: number;
  durationMin?: number;
  leftMin?: number;
  rightMin?: number;
  note?: string;
};

export const RECORD_LABEL: Record<RecordType, string> = {
  breast: "母乳",
  formula: "奶粉",
  bottle_breast: "瓶喂母乳",
  pee: "小便",
  poop: "大便",
  pump: "泵奶",
  note: "备注",
};