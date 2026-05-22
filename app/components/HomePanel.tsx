import type { BabyRecord, RecordType } from "@/lib/types";
import type { GrowthRecord } from "@/lib/growthApi";
import type { TimelineFilterKey } from "./TimelineFilterBar";
import QuickActions from "./QuickActions";
import SmartInput from "./SmartInput";
import StatusCards from "./StatusCards";
import Summary24h from "./Summary24h";

type SheetMode = "quick" | "full";

type AddRecordOptions = {
  silent?: boolean;
};

const HOME_TITLE = {
  text: "叶票票喂养记录",
  margin: "64px 0 30px",
  fontSize: 24,
  lineHeight: 1.05,
  fontWeight: 950,
  letterSpacing: "-0.02em",
  color: "#111111",
};

const GROWTH_BUTTON = {
  top: -4,
  right: 4,
  zIndex: 30,
  size: 42,
  icon: "/growth.svg",
  iconSize: 42,
  opacity: 1,
};

const SECTION_LABEL = {
  margin: "0 0 8px 4px",
  color: "#8e8e93",
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "0.04em",
};

function SectionLabel({ children }: { children: string }) {
  return <div style={SECTION_LABEL}>{children}</div>;
}

export default function HomePanel({
  records,
  onOpen,
  onQuickAdd,
  onSave,
  onSmartReceipt,
  onNurse,
  onOpenTimelineFilter,
  onOpenGrowth,
}: {
  records: BabyRecord[];
  latestGrowth?: GrowthRecord;
  onOpen: (type: RecordType, mode?: SheetMode) => void;
  onQuickAdd: (type: RecordType) => void;
  onSave: (record: BabyRecord, options?: AddRecordOptions) => void;
  onSmartReceipt: (text: string, warn?: boolean, undoIds?: string[]) => void;
  onDelete: (id: string) => void;
  onNurse: () => void;
  onOpenTimelineFilter: (key: TimelineFilterKey) => void;
  onOpenGrowth: () => void;
}) {
  return (
    <section
      className="view-panel"
      style={{
        position: "relative",
      }}
    >
      <button
        type="button"
        onClick={onOpenGrowth}
        aria-label="体测数据"
        style={{
          position: "absolute",
          top: GROWTH_BUTTON.top,
          right: GROWTH_BUTTON.right,
          zIndex: GROWTH_BUTTON.zIndex,
          pointerEvents: "auto",
          width: GROWTH_BUTTON.size,
          height: GROWTH_BUTTON.size,
          border: 0,
          borderRadius: 999,
          background: "transparent",
          boxShadow: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
          cursor: "pointer",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        <img
          src={GROWTH_BUTTON.icon}
          alt=""
          style={{
            width: GROWTH_BUTTON.iconSize,
            height: GROWTH_BUTTON.iconSize,
            objectFit: "contain",
            display: "block",
            opacity: GROWTH_BUTTON.opacity,
            pointerEvents: "none",
          }}
        />
      </button>

      <h1
        style={{
          margin: HOME_TITLE.margin,
          fontSize: HOME_TITLE.fontSize,
          lineHeight: HOME_TITLE.lineHeight,
          fontWeight: HOME_TITLE.fontWeight,
          letterSpacing: HOME_TITLE.letterSpacing,
          color: HOME_TITLE.color,
        }}
      >
        {HOME_TITLE.text}
      </h1>

      <SectionLabel>最近记录</SectionLabel>
      <StatusCards records={records} onOpenTimelineFilter={onOpenTimelineFilter} />

      <div style={{ height: 18 }} />

      <div className="smart-section">
        <SmartInput
          onSave={(record) => onSave(record, { silent: true })}
          onReceipt={onSmartReceipt}
        />
      </div>

      <QuickActions
        records={records}
        onOpen={onOpen}
        onQuickAdd={onQuickAdd}
        onSave={onSave}
        onNurse={onNurse}
      />

      <SectionLabel>摘要</SectionLabel>
      <Summary24h records={records} />
    </section>
  );
}