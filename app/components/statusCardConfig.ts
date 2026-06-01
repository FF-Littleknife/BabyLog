import type { RecordType } from "@/lib/types";

export type StatusCardKey = "feed" | "pee" | "poop";

export type StatusCardConfig = {
  key: StatusCardKey;
  className: string;
  label: string;
  icon: string;
  types: RecordType[];

  height: number;
  radius: number;
  paddingX: number;
  paddingY: number;
  background: string;
  shadow: string;

  iconSize: number;
  iconOpacity: number;
  iconMarginBottom: number;

  labelColor: string;
  labelSize: number;
  labelWeight: number;
  labelLetterSpacing: string;
  labelMarginBottom: number;

  valueColor: string;
  valueSize: number;
  valueWeight: number;
  valueLetterSpacing: string;
  valueLineHeight: number;
};

export const STATUS_STACK_GAP = 10;

const CARD_BG = "var(--glass-bg)";
const CARD_SHADOW = "var(--shadow-card)";
const CARD_VALUE_COLOR = "var(--text)";

export const STATUS_CARD_CONFIG: StatusCardConfig[] = [
  {
    key: "feed", // 卡片唯一标识：喂养
    className: "status-feed", // 卡片 class 名，方便单独做样式
    label: "上次喂养", // 卡片左上角标题
    icon: "/feed.svg", // 卡片图标路径
    types: ["breast", "formula", "bottle_breast"], // 归入喂养的记录类型：母乳 / 奶粉 / 瓶喂母乳

    height: 86, // 卡片高度
    radius: 28, // 卡片圆角
    paddingX: 22, // 卡片左右内边距
    paddingY: 14, // 卡片上下内边距
    background: CARD_BG, // 卡片背景色，统一变量
    shadow: CARD_SHADOW, // 卡片阴影，统一变量

    iconSize: 15, // 图标尺寸
    iconOpacity: 1, // 图标透明度
    iconMarginBottom: 0, // 图标下方距离

    labelColor: "var(--feed-label-color)", // 标题颜色：喂养红
    labelSize: 12, // 标题字号
    labelWeight: 700, // 标题字重
    labelLetterSpacing: "0.05em", // 标题字距
    labelMarginBottom: 7, // 标题和下面时间数字之间的距离

    valueColor: CARD_VALUE_COLOR, // 时间数字颜色，统一变量
    valueSize: 28, // 时间数字字号
    valueWeight: 780, // 时间数字字重
    valueLetterSpacing: "0.02em", // 时间数字字距
    valueLineHeight: 1, // 时间数字行高
  },
  {
    key: "poop", // 卡片唯一标识：大便
    className: "status-poop", // 卡片 class 名，方便单独做样式
    label: "上次大便", // 卡片左上角标题
    icon: "/poop.svg", // 卡片图标路径
    types: ["poop"], // 归入大便的记录类型

    height: 86, // 卡片高度
    radius: 28, // 卡片圆角
    paddingX: 22, // 卡片左右内边距
    paddingY: 14, // 卡片上下内边距
    background: CARD_BG, // 卡片背景色，统一变量
    shadow: CARD_SHADOW, // 卡片阴影，统一变量

    iconSize: 15, // 图标尺寸
    iconOpacity: 1, // 图标透明度
    iconMarginBottom: 0, // 图标下方距离

    labelColor: "var(--poop-label-color)", // 标题颜色：大便绿
    labelSize: 12, // 标题字号
    labelWeight: 700, // 标题字重
    labelLetterSpacing: "0.05em", // 标题字距
    labelMarginBottom: 7, // 标题和下面时间数字之间的距离

    valueColor: CARD_VALUE_COLOR, // 时间数字颜色，统一变量
    valueSize: 28, // 时间数字字号
    valueWeight: 780, // 时间数字字重
    valueLetterSpacing: "0.02em", // 时间数字字距
    valueLineHeight: 1, // 时间数字行高
  },
  {
    key: "pee", // 卡片唯一标识：小便
    className: "status-pee", // 卡片 class 名，方便单独做样式
    label: "上次小便", // 卡片左上角标题
    icon: "/pee.svg", // 卡片图标路径
    types: ["pee"], // 归入小便的记录类型

    height: 86, // 卡片高度
    radius: 28, // 卡片圆角
    paddingX: 22, // 卡片左右内边距
    paddingY: 14, // 卡片上下内边距
    background: CARD_BG, // 卡片背景色，统一变量
    shadow: CARD_SHADOW, // 卡片阴影，统一变量

    iconSize: 15, // 图标尺寸
    iconOpacity: 1, // 图标透明度
    iconMarginBottom: 0, // 图标下方距离

    labelColor: "var(--pee-label-color)", // 标题颜色：小便蓝绿
    labelSize: 12, // 标题字号
    labelWeight: 700, // 标题字重
    labelLetterSpacing: "0.05em", // 标题字距
    labelMarginBottom: 7, // 标题和下面时间数字之间的距离

    valueColor: CARD_VALUE_COLOR, // 时间数字颜色，统一变量
    valueSize: 28, // 时间数字字号
    valueWeight: 780, // 时间数字字重
    valueLetterSpacing: "0.02em", // 时间数字字距
    valueLineHeight: 1, // 时间数字行高
  },
];