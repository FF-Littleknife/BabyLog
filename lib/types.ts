export type RecordType =
  | "breast"
  | "formula"
  | "bottle_breast"
  | "pee"
  | "poop"
  | "pump"
  | "other";

export type BabyRecord = {
  id: string;
  type: RecordType;
  time: string;
  createdAt: string;
  amountMl?: number;
  durationMin?: number;
  leftMin?: number;
  rightMin?: number;

  /**
   * 记录主体内容。
   * 目前主要给 other 使用：
   * 例如：乳糖酶 / 维生素D / 洗澡
   */
  content?: string;

  /**
   * 备注。
   * 这是对某条记录的补充说明，不应该再承担“其他记录内容”的职责。
   */
  note?: string;
};

export const RECORD_LABEL: Record<RecordType, string> = {
  breast: "母乳",
  formula: "奶粉",
  bottle_breast: "瓶喂母乳",
  pee: "小便",
  poop: "大便",
  pump: "泵奶",
  other: "其他",
};