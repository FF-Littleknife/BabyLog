"use client";

import { useEffect, useState } from "react";
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
  text: "叶票票喂养记录",
  margin: "74px 0 30px",
  fontSize: 24,
  lineHeight: 1.05,
  fontWeight: 950,
  letterSpacing: "-0.02em",
  color: "#111111",
};

const GROWTH_BUTTON = {
  top: 68,
  right: 4,
  zIndex: 30,
  size: 42,
  icon: "/growth.svg",
  iconSize: 42,
  opacity: 1,
};

const SECTION_LABEL = {
  margin: "0 0 8px 4px",
  color: "rgba(142,142,147,.72)",
  fontSize: 10.5,
  fontWeight: 650,
  letterSpacing: "0.03em",
};

/**
 * 首页响应式布局参数
 * 这版采用「设计稿整体 zoom 缩放」：
 * 手机端内部按 430px 设计，小屏幕不足时整体等比缩小。
 *
 * 注意：
 * 不用 transform: scale()，因为 transform 只缩视觉，不缩布局盒子，
 * 容易导致两侧被裁。
 */
const HOME_LAYOUT = {
  /* =========================
     手机端设计稿
     ========================= */

  designWidth: 430, // 首页单列设计宽度
  mobileSideGap: 16, // 小屏左右安全边距。16 = 左右各 16
  bottomPadding: 118, // 给底部导航预留空间

  /* =========================
     宽屏两列
     ========================= */

  wideBreakpoint: 860,
  wideMaxWidth: 780,
  wideLeftWidth: 430,
  wideSummaryWidth: 320,
  wideGap: 30,

  /* =========================
     间距
     ========================= */

  mobileStatusBottomGap: 18,
  summaryStickyTop: 18,
};

function SectionLabel({ children }: { children: string }) {
  return <div style={SECTION_LABEL}>{children}</div>;
}

function getHomeZoom() {
  if (typeof window === "undefined") return 1;

  if (window.innerWidth >= HOME_LAYOUT.wideBreakpoint) {
    return 1;
  }

  const availableWidth = window.innerWidth - HOME_LAYOUT.mobileSideGap * 2;

  return Math.min(1, availableWidth / HOME_LAYOUT.designWidth);
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
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    function updateZoom() {
      setZoom(getHomeZoom());
    }

    updateZoom();

    window.addEventListener("resize", updateZoom);
    window.addEventListener("orientationchange", updateZoom);

    return () => {
      window.removeEventListener("resize", updateZoom);
      window.removeEventListener("orientationchange", updateZoom);
    };
  }, []);

  return (
    <section className="home-panel-outer">
      <style jsx>{`
        .home-panel-outer {
          width: 100%;
          max-width: 100vw;
          display: flex;
          justify-content: center;
          overflow-x: visible;
          box-sizing: border-box;
        }

        .home-panel-inner {
          position: relative;
          width: ${HOME_LAYOUT.designWidth}px;
          min-width: ${HOME_LAYOUT.designWidth}px;
          box-sizing: border-box;
          padding-bottom: calc(
            ${HOME_LAYOUT.bottomPadding}px + env(safe-area-inset-bottom)
          );
          -webkit-text-size-adjust: 100%;
          text-size-adjust: 100%;
        }

        .home-main-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          gap: 0;
          align-items: start;
          width: 100%;
          box-sizing: border-box;
        }

        .home-left-column,
        .home-summary-column {
          min-width: 0;
          width: 100%;
          box-sizing: border-box;
        }

        .home-summary-column {
          margin-top: ${HOME_LAYOUT.mobileStatusBottomGap}px;
        }

        @media (min-width: ${HOME_LAYOUT.wideBreakpoint}px) {
          .home-panel-outer {
            width: 100%;
            max-width: 100vw;
          }

          .home-panel-inner {
            width: ${HOME_LAYOUT.wideMaxWidth}px;
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

      <div
        className="home-panel-inner"
        style={
          {
            zoom,
          } as CSSProperties
        }
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