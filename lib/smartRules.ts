import type { RecordType } from "@/lib/types";

/**
 * 快捷记录识别规则
 *
 * 这里只放“正式记录类型”的关键词。
 * 没匹配上的内容，会自动保存成 note。
 *
 * 例如：
 * 10点乳糖酶 → note，备注：乳糖酶
 * 11点维生素D → note，备注：维生素D
 * 12点洗澡 → note，备注：洗澡
 */

export type SmartRecordRule = {
  type: Exclude<RecordType, "note">;
  label: string;
  words: string[];
};

export const SMART_RECORD_RULES: SmartRecordRule[] = [
  /**
   * 注意顺序：
   * 奶粉、瓶喂母乳要放在母乳前面。
   * 否则“瓶喂母乳”里包含“母乳”，可能会被提前识别成母乳。
   */
  {
    type: "formula",
    label: "奶粉",
    words: ["奶粉", "配方奶", "粉奶"],
  },
  {
    type: "bottle_breast",
    label: "瓶喂母乳",
    words: ["瓶喂母乳", "母乳瓶喂", "瓶喂", "瓶母", "瓶奶"],
  },
  {
    type: "pump",
    label: "泵奶",
    words: ["泵奶", "吸奶", "挤奶", "追奶"],
  },
  {
    type: "pee",
    label: "小便",
    words: ["小便", "尿尿", "尿了", "尿", "嘘嘘"],
  },
  {
    type: "poop",
    label: "大便",
    words: ["大便", "便便", "粑粑", "拉屎", "拉了", "臭臭"],
  },
  {
    type: "breast",
    label: "母乳",
    words: ["母乳", "亲喂", "胸喂", "吃奶"],
  },
];

/**
 * 大小便组合词
 * 命中这些词时，会同时生成：
 * 1 条大便记录
 * 1 条小便记录
 */
export const PEE_POOP_COMBO_WORDS = ["大小便"];

/**
 * 母乳左右侧关键词
 */
export const BREAST_SIDE_WORDS = {
  left: ["左", "左侧", "左边"],
  right: ["右", "右侧", "右边"],
};