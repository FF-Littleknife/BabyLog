import { useMemo } from "react";
import type { BabyRecord } from "@/lib/types";
import Timeline from "./Timeline";
import TimelineFilterBar, { type TimelineFilterKey } from "./TimelineFilterBar";

const TIMELINE_PANEL = {
  initialTopSpace: "10svh",

  bottomBarHeight: 68,
  bottomBarBottom: 0,
  filterGapAboveBottomBar: 6,

  filterZIndex: 38,
  timelinePaddingBottom: 250,

  topGradientHeight: 86,

  bottomCoverHeight: 300,
  bottomCoverZIndex: 34,
};

const FILTER_BOTTOM =
  TIMELINE_PANEL.bottomBarHeight +
  TIMELINE_PANEL.bottomBarBottom +
  TIMELINE_PANEL.filterGapAboveBottomBar;

function TopGradient() {
  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        top: 0,
        height: TIMELINE_PANEL.topGradientHeight,
        pointerEvents: "none",
        zIndex: TIMELINE_PANEL.bottomCoverZIndex,
        background:
          "linear-gradient(180deg, rgba(var(--app-bg-rgb),0.98) 0%, rgba(var(--app-bg-rgb),0.72) 48%, rgba(var(--app-bg-rgb),0) 100%)",
        maskImage:
          "linear-gradient(90deg, transparent 0%, black 18%, black 82%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(90deg, transparent 0%, black 18%, black 82%, transparent 100%)",
      }}
    />
  );
}

function BottomCover() {
  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        height: TIMELINE_PANEL.bottomCoverHeight,
        pointerEvents: "none",
        zIndex: TIMELINE_PANEL.bottomCoverZIndex,
        background:
          "linear-gradient(0deg, rgba(var(--app-bg-rgb),1) 0%, rgba(var(--app-bg-rgb),1) 58%, rgba(var(--app-bg-rgb),0.86) 76%, rgba(var(--app-bg-rgb),0) 100%)",
      }}
    />
  );
}

function filterRecords(records: BabyRecord[], selectedKeys: TimelineFilterKey[]) {
  if (!selectedKeys.length) return records;

  return records.filter((record) => {
    if (
      selectedKeys.includes("feed") &&
      (record.type === "breast" ||
        record.type === "bottle_breast" ||
        record.type === "formula")
    ) {
      return true;
    }

    if (selectedKeys.includes("poop") && record.type === "poop") return true;
    if (selectedKeys.includes("pee") && record.type === "pee") return true;
    if (selectedKeys.includes("pump") && record.type === "pump") return true;

    return false;
  });
}

export default function TimelinePanel({
  records,
  onEdit,
  externalSelectedKeys,
  onExternalSelectedKeysChange,
}: {
  records: BabyRecord[];
  onEdit: (record: BabyRecord) => void;
  externalSelectedKeys: TimelineFilterKey[];
  onExternalSelectedKeysChange: (keys: TimelineFilterKey[]) => void;
}) {
  const filteredRecords = useMemo(
    () => filterRecords(records, externalSelectedKeys),
    [records, externalSelectedKeys]
  );

  return (
    <section className="view-panel">
      <TopGradient />
      <BottomCover />

      <div
        style={{
          paddingTop: TIMELINE_PANEL.initialTopSpace,
          paddingBottom: TIMELINE_PANEL.timelinePaddingBottom,
        }}
      >
        <Timeline
          records={filteredRecords}
          onEdit={onEdit}
          showIntervals={externalSelectedKeys.length === 1}
        />
      </div>

      <div
        style={{
          position: "fixed",
          left: "50%",
          bottom: `calc(${FILTER_BOTTOM}px + env(safe-area-inset-bottom))`,
          transform: "translateX(-50%)",
          zIndex: TIMELINE_PANEL.filterZIndex,
          width: "min(100%, 430px)",
          pointerEvents: "auto",
        }}
      >
        <TimelineFilterBar
          selectedKeys={externalSelectedKeys}
          onChange={onExternalSelectedKeysChange}
        />
      </div>
    </section>
  );
}