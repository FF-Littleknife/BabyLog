"use client";

import type { CSSProperties } from "react";
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
  text: "叶票票喂养记录", // 标题文字
  margin: "45px 0 10px", // 标题外边距：上62 / 左右0 / 下20；下方数值控制标题离顶部卡片距离
  fontSize: 24, // 标题字号
  lineHeight: 1.05, // 标题行高，越小越紧凑
  fontWeight: 950, // 标题字重，越大越粗
  letterSpacing: "-0.02em", // 标题字距，负值更紧
  color: "var(--text)", // 标题颜色，跟随亮暗模式
};

const GROWTH_BUTTON = {
  size: 52, // 成长记录按钮点击区域尺寸
  icon: "/growth.svg", // 成长记录图标路径
  iconSize: 44, // 图标视觉尺寸，不建议超过 size
  opacity: 1, // 图标透明度，1是不透明
};

const SECTION_LABEL = {
  margin: "0 0 8px 4px", // 小标题外边距：上0 / 右0 / 下8 / 左4
  color: "var(--muted)", // 小标题颜色，跟随亮暗模式
  fontSize: 10.5, // 小标题字号
  fontWeight: 650, // 小标题字重
  letterSpacing: "0.03em", // 小标题字距
};

/**
 * 首页响应式布局参数
 *
 * 手机端：
 * 不 zoom，不 transform，不 clip。
 * 所有模块按真实宽度自适应。
 *
 * 电脑 / 宽屏：
 * 切换为 780px 双栏，并让两列整体相对屏幕居中。
 */
const HOME_LAYOUT = {
  bottomPadding: 100, // 首页底部留白，避免内容被底部导航栏遮住

  wideBreakpoint: 860, // 宽屏断点：屏幕宽度 >= 860px 时切换为双栏布局
  wideMaxWidth: 780, // 宽屏双栏整体宽度
  wideLeftWidth: 430, // 宽屏左侧主内容栏宽度
  wideSummaryWidth: 320, // 宽屏右侧摘要栏宽度
  wideGap: 10, // 宽屏左右两栏之间的间距

  mobileStatusBottomGap: 18, // 手机端顶部三张卡片和下面快捷记录区域之间的距离
  summaryStickyTop: 18, // 宽屏右侧摘要栏吸顶时距离顶部的距离
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
    <section className="home-panel-outer">
      <style jsx>{`
        .home-panel-outer {
          width: 100%;
          max-width: 100%;
          min-width: 0;
          display: flex;
          justify-content: center;
          overflow: visible;
          box-sizing: border-box;
        }

        .home-panel-inner {
          position: relative;
          width: 100%;
          max-width: 100%;
          min-width: 0;
          box-sizing: border-box;
          padding-bottom: calc(
            ${HOME_LAYOUT.bottomPadding}px + env(safe-area-inset-bottom)
          );
          -webkit-text-size-adjust: 100%;
          text-size-adjust: 100%;
          overflow: visible;
        }

        .home-title-row {
          margin: ${HOME_TITLE.margin};
          display: grid;
          grid-template-columns: minmax(0, 1fr) ${GROWTH_BUTTON.size}px;
          align-items: center;
          column-gap: 14px;
          width: 100%;
          min-width: 0;
          box-sizing: border-box;
          overflow: visible;
        }

        .home-title {
          margin: 0;
          min-width: 0;
          color: ${HOME_TITLE.color};
          font-size: ${HOME_TITLE.fontSize}px;
          line-height: ${HOME_TITLE.lineHeight};
          font-weight: ${HOME_TITLE.fontWeight};
          letter-spacing: ${HOME_TITLE.letterSpacing};
        }

        .growth-button {
          width: ${GROWTH_BUTTON.size}px;
          height: ${GROWTH_BUTTON.size}px;
          justify-self: end;
          transform: translateY(-1px);
          overflow: visible;
        }

        .home-main-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          gap: 0;
          align-items: start;
          width: 100%;
          min-width: 0;
          max-width: 100%;
          box-sizing: border-box;
          overflow: visible;
        }

        .home-left-column,
        .home-summary-column {
          min-width: 0;
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
          overflow: visible;
        }

        .home-summary-column {
          margin-top: ${HOME_LAYOUT.mobileStatusBottomGap}px;
        }

        @media (min-width: ${HOME_LAYOUT.wideBreakpoint}px) {
          .home-panel-outer {
            position: relative;
            left: 50%;
            width: ${HOME_LAYOUT.wideMaxWidth}px;
            max-width: ${HOME_LAYOUT.wideMaxWidth}px;
            min-width: ${HOME_LAYOUT.wideMaxWidth}px;
            transform: translateX(-50%);
            display: block;
          }

          .home-panel-inner {
            width: ${HOME_LAYOUT.wideMaxWidth}px;
            max-width: ${HOME_LAYOUT.wideMaxWidth}px;
            min-width: ${HOME_LAYOUT.wideMaxWidth}px;
          }

          .home-main-layout {
            grid-template-columns:
              ${HOME_LAYOUT.wideLeftWidth}px
              ${HOME_LAYOUT.wideSummaryWidth}px;
            gap: ${HOME_LAYOUT.wideGap}px;
            align-items: start;
          }

          .home-summary-column {
            margin-top: 0;
            position: sticky;
            top: ${HOME_LAYOUT.summaryStickyTop}px;
          }
        }
      `}</style>

      <div className="home-panel-inner">
        <div className="home-title-row">
          <h1 className="home-title">{HOME_TITLE.text}</h1>

          <button
            type="button"
            className="growth-button"
            onClick={onOpenGrowth}
            aria-label="体测数据"
            style={{
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
        </div>

        <div className="home-main-layout">
          <div className="home-left-column">
            <SectionLabel>最近记录</SectionLabel>

            <StatusCards
              records={records}
              onOpenTimelineFilter={onOpenTimelineFilter}
            />

            <div style={{ height: HOME_LAYOUT.mobileStatusBottomGap }} />

            <SectionLabel>快捷记录</SectionLabel>

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
      </div>
    </section>
  );
}