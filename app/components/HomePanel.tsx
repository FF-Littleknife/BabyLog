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

/**
 * 首页响应式布局参数
 * 后面想调 iPad / 电脑端两列宽度、整体居中、摘要宽度，优先改这里。
 */
const HOME_LAYOUT = {
  /* =========================
     响应式断点
     ========================= */

  wideBreakpoint: 860, // 屏幕宽度达到这个值后，首页变成左右两列

  /* =========================
     手机端
     ========================= */

  mobileMaxWidth: 430, // 手机端首页最大宽度

  /* =========================
     宽屏端两列布局
     ========================= */

  wideMaxWidth: 780, // 宽屏时两列整体总宽度：左列 430 + 间距 30 + 右列 320
  wideLeftWidth: 430, // 左列宽度：最近记录 + 快捷记录 + 快捷按钮
  wideSummaryWidth: 320, // 右列宽度：摘要
  wideGap: 30, // 左右两列之间的距离

  /* =========================
     间距
     ========================= */

  mobileStatusBottomGap: 18, // 最近记录和快捷记录之间的距离
  summaryStickyTop: 18, // 宽屏时右侧摘要 sticky 的顶部距离
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
      className="view-panel home-panel"
      style={{
        position: "relative",
      }}
    >
      <style jsx>{`
        .home-panel {
          width: min(100%, ${HOME_LAYOUT.mobileMaxWidth}px);
          max-width: ${HOME_LAYOUT.mobileMaxWidth}px;
          margin-left: auto;
          margin-right: auto;
        }

        .home-main-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0;
          align-items: start;
        }

        .home-summary-column {
          margin-top: ${HOME_LAYOUT.mobileStatusBottomGap}px;
        }

        @media (min-width: ${HOME_LAYOUT.wideBreakpoint}px) {
          .home-panel {
            width: min(calc(100vw - 48px), ${HOME_LAYOUT.wideMaxWidth}px);
            max-width: ${HOME_LAYOUT.wideMaxWidth}px;
            margin-left: 0;
            margin-right: 0;
            left: 50%;
            transform: translateX(-50%);
          }

          .home-main-layout {
            grid-template-columns:
              ${HOME_LAYOUT.wideLeftWidth}px
              ${HOME_LAYOUT.wideSummaryWidth}px;
            gap: ${HOME_LAYOUT.wideGap}px;
            align-items: start;
          }

          .home-left-column,
          .home-summary-column {
            min-width: 0;
          }

          .home-summary-column {
            margin-top: 0;
            position: sticky;
            top: ${HOME_LAYOUT.summaryStickyTop}px;
          }
        }
      `}</style>

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

      <div className="home-main-layout">
        <div className="home-left-column">
          <SectionLabel>最近记录</SectionLabel>

          <StatusCards
            records={records}
            onOpenTimelineFilter={onOpenTimelineFilter}
          />

          <div style={{ height: HOME_LAYOUT.mobileStatusBottomGap }} />

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
        </div>

        <aside className="home-summary-column">
          <SectionLabel>摘要</SectionLabel>
          <Summary24h records={records} />
        </aside>
      </div>
    </section>
  );
}