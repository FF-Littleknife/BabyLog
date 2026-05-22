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

export const STATUS_CARD_CONFIG: StatusCardConfig[] = [
  {
    key: "feed",
    className: "status-feed",
    label: "上次喂养",
    icon: "/feed.svg",
    types: ["breast", "formula", "bottle_breast"],

    height: 96,
    radius: 28,
    paddingX: 22,
    paddingY: 14,
    background: "rgba(255, 255, 255, 0.88)",
    shadow: "0 10px 34px rgba(0,0,0,.05)",

    iconSize: 15,
    iconOpacity: 1,
    iconMarginBottom: 0,

    labelColor: "#ff3b30",
    labelSize: 12,
    labelWeight: 700,
    labelLetterSpacing: "0.05em",
    labelMarginBottom: 7,

    valueColor: "#111111",
    valueSize: 28,
    valueWeight: 780,
    valueLetterSpacing: "0.02em",
    valueLineHeight: 1,
  },
  {
    key: "poop",
    className: "status-poop",
    label: "上次大便",
    icon: "/poop.svg",
    types: ["poop"],

    height: 96,
    radius: 28,
    paddingX: 22,
    paddingY: 14,
    background: "rgba(255, 255, 255, 0.88)",
    shadow: "0 10px 34px rgba(0,0,0,.05)",

    iconSize: 15,
    iconOpacity: 1,
    iconMarginBottom: 0,

    labelColor: "#7ac70c",
    labelSize: 12,
    labelWeight: 700,
    labelLetterSpacing: "0.05em",
    labelMarginBottom: 7,

    valueColor: "#111111",
    valueSize: 28,
    valueWeight: 780,
    valueLetterSpacing: "0.02em",
    valueLineHeight: 1,
  },
  {
    key: "pee",
    className: "status-pee",
    label: "上次小便",
    icon: "/pee.svg",
    types: ["pee"],

    height: 96,
    radius: 28,
    paddingX: 22,
    paddingY: 14,
    background: "rgba(255, 255, 255, 0.88)",
    shadow: "0 10px 34px rgba(0,0,0,.05)",

    iconSize: 15,
    iconOpacity: 1,
    iconMarginBottom: 0,

    labelColor: "#00b8c8",
    labelSize: 12,
    labelWeight: 700,
    labelLetterSpacing: "0.05em",
    labelMarginBottom: 7,

    valueColor: "#111111",
    valueSize: 28,
    valueWeight: 780,
    valueLetterSpacing: "0.02em",
    valueLineHeight: 1,
  },
];