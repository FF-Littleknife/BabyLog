"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { BabyRecord, RecordType } from "@/lib/types";
import { RECORD_LABEL } from "@/lib/types";
import { formatClock } from "@/lib/time";
import {
  deleteRecordFromCloud,
  fetchRecords,
  insertRecord,
  updateRecordToCloud,
} from "@/lib/recordsApi";
import {
  fetchGrowthRecords,
  insertGrowthRecord,
  type GrowthRecord,
} from "@/lib/growthApi";
import {
  enqueueGrowthSync,
  enqueueRecordSync,
  getPendingSyncItems,
  removePendingSyncItems,
} from "@/lib/offlineQueue";
import type { TimelineFilterKey } from "./components/TimelineFilterBar";

import BottomBar from "./components/BottomBar";
import HomePanel from "./components/HomePanel";
import NursingTimer from "./components/NursingTimer";
import TimelinePanel from "./components/TimelinePanel";

import BreastRecordSheet from "./components/sheets/BreastRecordSheet";
import BottleBreastSheet from "./components/sheets/BottleBreastSheet";
import EditRecordSheet from "./components/sheets/EditRecordSheet";
import FormulaSheet from "./components/sheets/FormulaSheet";
import GrowthSheet from "./components/sheets/GrowthSheet";
import OtherSheet from "./components/sheets/OtherSheet";
import PeeSheet from "./components/sheets/PeeSheet";
import PoopSheet from "./components/sheets/PoopSheet";
import PumpSheet from "./components/sheets/PumpSheet";
import RecordSheet from "./components/sheets/RecordSheet";

const STORAGE_KEY = "baby-log-demo-records";
const GROWTH_STORAGE_KEY = "baby-log-growth-records";

type ViewType = "home" | "timeline";
type SheetMode = "quick" | "full";

type AddRecordOptions = {
  silent?: boolean;
};

const PULL_REFRESH = {
  triggerDistance: 74,
  maxDistance: 96,
  indicatorTop: 18,
  indicatorSize: 34,
};

const AUTO_REFRESH = {
  tickMs: 60 * 1000,
};

const SMART_RECEIPT = {
  bottom: 126,
  left: "50%",
  width: "min(calc(100% - 32px), 390px)",
  zIndex: 120,
  padding: "10px 14px",
  radius: 18,
  bg: "rgba(255,255,255,.86)",
  color: "#111111",
  warnColor: "#ff9500",
  fontSize: 12,
  lineHeight: 1.35,
  shadow: "0 14px 34px rgba(0,0,0,.12)",

  undoMarginLeft: 10,
  undoColor: "#007aff",
  undoFontWeight: 800,
};

const TOAST_CONFIG = {
  bottom: 72,
  left: "50%",
  width: "fit-content",
  maxWidth: "min(calc(100% - 40px), 360px)",
  zIndex: 130,

  padding: "9px 14px",
  radius: 999,

  bg: "rgba(255,255,255,.86)",
  color: "#111111",
  fontSize: 12,
  fontWeight: 680,
  lineHeight: 1.25,

  shadow: "0 12px 30px rgba(0,0,0,.12)",
  blur: "blur(18px)",
};

const seedRecords: BabyRecord[] = [
  {
    id: "demo-1",
    type: "breast",
    time: new Date(Date.now() - 70 * 60000).toISOString(),
    durationMin: 12,
    leftMin: 6,
    rightMin: 6,
    createdAt: new Date().toISOString(),
  },
  {
    id: "demo-2",
    type: "pee",
    time: new Date(Date.now() - 42 * 60000).toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: "demo-3",
    type: "formula",
    time: new Date(Date.now() - 3 * 60 * 60000).toISOString(),
    amountMl: 60,
    createdAt: new Date().toISOString(),
  },
  {
    id: "demo-4",
    type: "poop",
    time: new Date(Date.now() - 4.5 * 60 * 60000).toISOString(),
    note: "少量",
    createdAt: new Date().toISOString(),
  },
];

function sortBabyRecords(records: BabyRecord[]) {
  return [...records].sort(
    (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
  );
}

function sortGrowthRecords(records: GrowthRecord[]) {
  return [...records].sort((a, b) => {
    const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
    if (dateDiff !== 0) return dateDiff;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

function readLocalBabyRecords() {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? (JSON.parse(saved) as BabyRecord[]) : seedRecords;
}

function readLocalGrowthRecords() {
  const saved = localStorage.getItem(GROWTH_STORAGE_KEY);
  return saved ? (JSON.parse(saved) as GrowthRecord[]) : [];
}

function formatBreastDetail(record: BabyRecord) {
  const parts = [];
  const left = record.leftMin || 0;
  const right = record.rightMin || 0;
  const total = record.durationMin || left + right;

  if (left > 0) parts.push(`左侧${left}分钟`);
  if (right > 0) parts.push(`右侧${right}分钟`);

  if (left > 0 && right > 0 && total > 0) {
    parts.push(`共${total}分钟`);
  }

  if (!left && !right && record.durationMin) {
    parts.push(`${record.durationMin}分钟`);
  }

  if (record.note) parts.push(record.note);

  return parts;
}

function formatReceiptRecord(record: BabyRecord) {
  const time = formatClock(record.time);

  if (record.type === "other") {
    const content = record.content || record.note || "其他";
    const note = record.content && record.note ? ` · ${record.note}` : "";

    return `${time} ${content}${note}`;
  }

  if (record.type === "formula" || record.type === "bottle_breast") {
    const amount = record.amountMl ? ` ${record.amountMl}ml` : "";
    const note = record.note ? ` · ${record.note}` : "";

    return `${time} ${RECORD_LABEL[record.type]}${amount}${note}`;
  }

  if (record.type === "pump") {
    const parts = [];

    if (record.amountMl) parts.push(`${record.amountMl}ml`);
    if (record.durationMin) parts.push(`${record.durationMin}分钟`);
    if (record.note) parts.push(record.note);

    return `${time} ${RECORD_LABEL[record.type]}${
      parts.length ? ` ${parts.join(" · ")}` : ""
    }`;
  }

  if (record.type === "breast") {
    const parts = formatBreastDetail(record);

    return `${time} 母乳${parts.length ? `｜${parts.join(" · ")}` : ""}`;
  }

  if (record.type === "pee" || record.type === "poop") {
    return `${time} ${RECORD_LABEL[record.type]}${
      record.note ? ` · ${record.note}` : ""
    }`;
  }

  return `${time} ${RECORD_LABEL[record.type]}`;
}

export default function Home() {
  const [records, setRecords] = useState<BabyRecord[]>([]);
  const [growthRecords, setGrowthRecords] = useState<GrowthRecord[]>([]);
  const [activeSheet, setActiveSheet] = useState<RecordType | null>(null);
  const [activeSheetMode, setActiveSheetMode] = useState<SheetMode>("quick");
  const [editingRecord, setEditingRecord] = useState<BabyRecord | null>(null);
  const [growthOpen, setGrowthOpen] = useState(false);
  const [view, setView] = useState<ViewType>("home");
  const [toast, setToast] = useState("");

  const [smartReceipt, setSmartReceipt] = useState("");
  const [smartReceiptWarn, setSmartReceiptWarn] = useState(false);
  const [smartReceiptUndoIds, setSmartReceiptUndoIds] = useState<string[]>([]);

  const [nursingOpen, setNursingOpen] = useState(false);
  const [timelineFilter, setTimelineFilter] = useState<TimelineFilterKey[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [nowTick, setNowTick] = useState(Date.now());

  const touchStartYRef = useRef<number | null>(null);
  const pullingRef = useRef(false);
  const toastTimerRef = useRef<number | null>(null);
  const smartReceiptTimerRef = useRef<number | null>(null);
  const syncingPendingRef = useRef(false);

  function showToast(text: string) {
    setToast(text);

    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }

    toastTimerRef.current = window.setTimeout(() => setToast(""), 1200);
  }

  function clearSmartReceipt() {
    setSmartReceipt("");
    setSmartReceiptWarn(false);
    setSmartReceiptUndoIds([]);

    if (smartReceiptTimerRef.current) {
      window.clearTimeout(smartReceiptTimerRef.current);
      smartReceiptTimerRef.current = null;
    }
  }

  function showSmartReceipt(text: string, warn = false, undoIds: string[] = []) {
    setSmartReceipt(text);
    setSmartReceiptWarn(warn);
    setSmartReceiptUndoIds(undoIds);

    if (smartReceiptTimerRef.current) {
      window.clearTimeout(smartReceiptTimerRef.current);
    }

    smartReceiptTimerRef.current = window.setTimeout(() => {
      clearSmartReceipt();
    }, 5200);
  }

  async function syncPendingQueue({ silent = false }: { silent?: boolean } = {}) {
    if (syncingPendingRef.current) return;

    const pendingItems = getPendingSyncItems();
    if (!pendingItems.length) return;

    syncingPendingRef.current = true;

    const syncedItems: { kind: "record" | "growth"; id: string }[] = [];

    try {
      for (const item of pendingItems) {
        try {
          if (item.kind === "record") {
            await insertRecord(item.record);
          }

          if (item.kind === "growth") {
            await insertGrowthRecord(item.record);
          }

          syncedItems.push({
            kind: item.kind,
            id: item.id,
          });
        } catch (error) {
          console.error("sync pending item failed:", error);
        }
      }

      if (syncedItems.length) {
        removePendingSyncItems(syncedItems);

        if (!silent) {
          showToast(`已自动同步 ${syncedItems.length} 条离线记录`);
        }
      }
    } finally {
      syncingPendingRef.current = false;
    }
  }

  async function undoSmartReceipt() {
    const ids = smartReceiptUndoIds;

    if (!ids.length) return;

    setRecords((prev) => prev.filter((record) => !ids.includes(record.id)));

    removePendingSyncItems(ids.map((id) => ({ kind: "record", id })));

    clearSmartReceipt();
    buzz();
    showToast("已撤销");

    try {
      await Promise.all(ids.map((id) => deleteRecordFromCloud(id)));
    } catch (error) {
      console.error(error);
      showToast("本地已撤销，云端同步失败");
    }
  }

  async function reloadRecords({ showSuccess }: { showSuccess?: boolean }) {
    await syncPendingQueue({ silent: true });

    const [cloudRecords, cloudGrowthRecords] = await Promise.all([
      fetchRecords(),
      fetchGrowthRecords(),
    ]);

    setRecords(sortBabyRecords(cloudRecords));
    setGrowthRecords(sortGrowthRecords(cloudGrowthRecords));
    setNowTick(Date.now());

    if (showSuccess) showToast("✓ 已刷新");
  }

  useEffect(() => {
    async function loadRecords() {
      try {
        await reloadRecords({});
      } catch (error) {
        console.error(error);

        setRecords(sortBabyRecords(readLocalBabyRecords()));
        setGrowthRecords(sortGrowthRecords(readLocalGrowthRecords()));

        showToast("云端读取失败，已使用本地缓存");
      }
    }

    loadRecords();
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNowTick(Date.now());
    }, AUTO_REFRESH.tickMs);

    async function handleVisibilityChange() {
      if (document.visibilityState !== "visible") return;

      setNowTick(Date.now());

      try {
        await syncPendingQueue({ silent: false });
        await reloadRecords({});
      } catch (error) {
        console.error(error);
      }
    }

    async function handleOnline() {
      try {
        await syncPendingQueue({ silent: false });
        await reloadRecords({});
      } catch (error) {
        console.error(error);
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("online", handleOnline);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("online", handleOnline);

      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }

      if (smartReceiptTimerRef.current) {
        window.clearTimeout(smartReceiptTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem(GROWTH_STORAGE_KEY, JSON.stringify(growthRecords));
  }, [growthRecords]);

  const sortedRecords = useMemo(
    () => sortBabyRecords(records),
    [records, nowTick]
  );

  const latestGrowth = growthRecords[0];

  function buzz() {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.(18);
    }
  }

  function handleTouchStart(event: React.TouchEvent<HTMLElement>) {
    if (activeSheet || nursingOpen || editingRecord || growthOpen || refreshing)
      return;
    if (window.scrollY > 0) return;

    touchStartYRef.current = event.touches[0].clientY;
    pullingRef.current = true;
  }

  function handleTouchMove(event: React.TouchEvent<HTMLElement>) {
    if (!pullingRef.current || touchStartYRef.current === null) return;
    if (window.scrollY > 0) return;

    const deltaY = event.touches[0].clientY - touchStartYRef.current;

    if (deltaY <= 0) {
      setPullDistance(0);
      return;
    }

    setPullDistance(Math.min(deltaY * 0.45, PULL_REFRESH.maxDistance));
  }

  async function handleTouchEnd() {
    if (!pullingRef.current) return;

    const shouldRefresh = pullDistance >= PULL_REFRESH.triggerDistance;

    pullingRef.current = false;
    touchStartYRef.current = null;
    setPullDistance(0);

    if (!shouldRefresh || refreshing) return;

    setRefreshing(true);

    try {
      await reloadRecords({ showSuccess: true });
      buzz();
    } catch (error) {
      console.error(error);
      showToast("刷新失败");
    } finally {
      setRefreshing(false);
    }
  }

  function openSheet(type: RecordType, mode: SheetMode = "quick") {
    setActiveSheet(type);
    setActiveSheetMode(mode);
  }

  function closeSheet() {
    setActiveSheet(null);
    setActiveSheetMode("quick");
  }

  async function addRecord(record: BabyRecord, options: AddRecordOptions = {}) {
    setRecords((prev) => sortBabyRecords([record, ...prev]));

    closeSheet();
    buzz();

    if (!options.silent) {
      showSmartReceipt(`已记录：${formatReceiptRecord(record)}`, false, [
        record.id,
      ]);
    }

    try {
      await insertRecord(record);
    } catch (error) {
      console.error(error);
      enqueueRecordSync(record);
      showToast("本地已记录，联网后自动同步");
    }
  }

  async function addGrowthRecord(record: GrowthRecord) {
    setGrowthRecords((prev) => sortGrowthRecords([record, ...prev]));

    setGrowthOpen(false);
    buzz();
    showToast("✓ 已记录");

    try {
      await insertGrowthRecord(record);
    } catch (error) {
      console.error(error);
      enqueueGrowthSync(record);
      showToast("本地已显示，联网后自动同步");
    }
  }

  async function updateRecord(record: BabyRecord) {
    const oldRecord = records.find((item) => item.id === record.id);

    setRecords((prev) =>
      sortBabyRecords(prev.map((item) => (item.id === record.id ? record : item)))
    );

    setEditingRecord(null);
    buzz();
    showToast("✓ 已更新");

    try {
      await updateRecordToCloud(record);
    } catch (error) {
      console.error(error);

      if (oldRecord) {
        setRecords((prev) =>
          sortBabyRecords(
            prev.map((item) => (item.id === oldRecord.id ? oldRecord : item))
          )
        );
      }

      showToast("云端更新失败，已恢复");
    }
  }

  function quickAdd(type: RecordType) {
    addRecord({
      id: crypto.randomUUID(),
      type,
      time: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });
  }

  async function deleteRecord(id: string) {
    const deletedRecord = records.find((record) => record.id === id);

    setRecords((prev) => prev.filter((record) => record.id !== id));
    setEditingRecord(null);

    removePendingSyncItems([{ kind: "record", id }]);

    showToast("已删除");

    try {
      await deleteRecordFromCloud(id);
    } catch (error) {
      console.error(error);

      if (deletedRecord) {
        setRecords((prev) => sortBabyRecords([deletedRecord, ...prev]));
      }

      showToast("云端删除失败，已恢复记录");
    }
  }

  function finishNursing(result: {
    durationMin: number;
    leftMin: number;
    rightMin: number;
  }) {
    addRecord({
      id: crypto.randomUUID(),
      type: "breast",
      time: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      durationMin: result.durationMin,
      leftMin: result.leftMin,
      rightMin: result.rightMin,
    });

    setNursingOpen(false);
  }

  function jumpToTimelineWithFilter(key: TimelineFilterKey) {
    setTimelineFilter([key]);
    setView("timeline");
  }

  return (
    <main
      className="app-shell"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform:
          pullDistance > 0 ? `translateY(${pullDistance}px)` : undefined,
        transition: pullDistance > 0 ? "none" : "transform 0.18s ease",
      }}
    >
      <style jsx>{`
        @keyframes refreshSpin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>

      {(pullDistance > 0 || refreshing) && (
        <div
          style={{
            position: "fixed",
            left: "50%",
            top: `calc(${PULL_REFRESH.indicatorTop}px + env(safe-area-inset-top))`,
            width: PULL_REFRESH.indicatorSize,
            height: PULL_REFRESH.indicatorSize,
            transform: "translateX(-50%)",
            borderRadius: 999,
            background: "rgba(255,255,255,.72)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            color: "#8e8e93",
            fontSize: 18,
            fontWeight: 760,
          }}
        >
          <span
            style={{
              display: "inline-block",
              lineHeight: 1,
              animation: refreshing
                ? "refreshSpin 0.8s linear infinite"
                : undefined,
              transform: refreshing
                ? undefined
                : `rotate(${
                    Math.min(pullDistance / PULL_REFRESH.triggerDistance, 1) *
                    180
                  }deg)`,
            }}
          >
            ↻
          </span>
        </div>
      )}

      {view === "home" ? (
        <HomePanel
          records={sortedRecords}
          latestGrowth={latestGrowth}
          onOpen={openSheet}
          onQuickAdd={quickAdd}
          onSave={addRecord}
          onSmartReceipt={showSmartReceipt}
          onDelete={deleteRecord}
          onNurse={() => setNursingOpen(true)}
          onOpenTimelineFilter={jumpToTimelineWithFilter}
          onOpenGrowth={() => setGrowthOpen(true)}
        />
      ) : (
        <TimelinePanel
          records={sortedRecords}
          onEdit={setEditingRecord}
          externalSelectedKeys={timelineFilter}
          onExternalSelectedKeysChange={setTimelineFilter}
        />
      )}

      {activeSheet === "breast" && (
        <BreastRecordSheet onClose={closeSheet} onSave={addRecord} />
      )}

      {activeSheet === "bottle_breast" && (
        <BottleBreastSheet
          records={sortedRecords}
          mode={activeSheetMode}
          onClose={closeSheet}
          onSave={addRecord}
        />
      )}

      {activeSheet === "formula" && (
        <FormulaSheet
          records={sortedRecords}
          mode={activeSheetMode}
          onClose={closeSheet}
          onSave={addRecord}
        />
      )}

      {activeSheet === "pee" && activeSheetMode === "full" && (
        <PeeSheet onClose={closeSheet} onSave={addRecord} />
      )}

      {activeSheet === "poop" && activeSheetMode === "full" && (
        <PoopSheet onClose={closeSheet} onSave={addRecord} />
      )}

      {activeSheet === "pump" && (
        <PumpSheet onClose={closeSheet} onSave={addRecord} />
      )}

      {activeSheet === "other" && (
        <OtherSheet onClose={closeSheet} onSave={addRecord} />
      )}

      {activeSheet &&
        activeSheet !== "breast" &&
        activeSheet !== "bottle_breast" &&
        activeSheet !== "formula" &&
        activeSheet !== "pump" &&
        activeSheet !== "other" &&
        !(activeSheet === "pee" && activeSheetMode === "full") &&
        !(activeSheet === "poop" && activeSheetMode === "full") && (
          <RecordSheet
            type={activeSheet}
            onClose={closeSheet}
            onSave={addRecord}
          />
        )}

      {editingRecord && (
        <EditRecordSheet
          record={editingRecord}
          onClose={() => setEditingRecord(null)}
          onSave={updateRecord}
          onDelete={deleteRecord}
        />
      )}

      {growthOpen && (
        <GrowthSheet
          records={growthRecords}
          onClose={() => setGrowthOpen(false)}
          onSave={addGrowthRecord}
        />
      )}

      {nursingOpen && (
        <NursingTimer
          onCancel={() => setNursingOpen(false)}
          onFinish={finishNursing}
        />
      )}

      {!activeSheet && !nursingOpen && !editingRecord && !growthOpen && (
        <BottomBar
          view={view}
          onChange={setView}
          onNurse={() => setNursingOpen(true)}
          nursing={nursingOpen}
          showNurse={view === "home"}
        />
      )}

      {smartReceipt && (
        <div
          style={{
            position: "fixed",
            left: SMART_RECEIPT.left,
            bottom: `calc(${SMART_RECEIPT.bottom}px + env(safe-area-inset-bottom))`,
            transform: "translateX(-50%)",
            width: SMART_RECEIPT.width,
            zIndex: SMART_RECEIPT.zIndex,
            padding: SMART_RECEIPT.padding,
            borderRadius: SMART_RECEIPT.radius,
            background: SMART_RECEIPT.bg,
            color: smartReceiptWarn
              ? SMART_RECEIPT.warnColor
              : SMART_RECEIPT.color,
            fontSize: SMART_RECEIPT.fontSize,
            lineHeight: SMART_RECEIPT.lineHeight,
            boxShadow: SMART_RECEIPT.shadow,
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            pointerEvents: "auto",
            textAlign: "center",
          }}
        >
          <span>{smartReceipt}</span>

          {smartReceiptUndoIds.length > 0 && (
            <button
              type="button"
              onClick={undoSmartReceipt}
              style={{
                marginLeft: SMART_RECEIPT.undoMarginLeft,
                border: 0,
                padding: 0,
                background: "transparent",
                color: SMART_RECEIPT.undoColor,
                fontSize: SMART_RECEIPT.fontSize,
                fontWeight: SMART_RECEIPT.undoFontWeight,
                lineHeight: 1,
                cursor: "pointer",
              }}
            >
              撤销
            </button>
          )}
        </div>
      )}

      {toast && (
        <div
          className="toast"
          style={{
            position: "fixed",
            left: TOAST_CONFIG.left,
            bottom: `calc(${TOAST_CONFIG.bottom}px + env(safe-area-inset-bottom))`,
            transform: "translateX(-50%)",
            width: TOAST_CONFIG.width,
            maxWidth: TOAST_CONFIG.maxWidth,
            zIndex: TOAST_CONFIG.zIndex,

            padding: TOAST_CONFIG.padding,
            borderRadius: TOAST_CONFIG.radius,

            background: TOAST_CONFIG.bg,
            color: TOAST_CONFIG.color,
            fontSize: TOAST_CONFIG.fontSize,
            fontWeight: TOAST_CONFIG.fontWeight,
            lineHeight: TOAST_CONFIG.lineHeight,

            boxShadow: TOAST_CONFIG.shadow,
            backdropFilter: TOAST_CONFIG.blur,
            WebkitBackdropFilter: TOAST_CONFIG.blur,

            textAlign: "center",
            pointerEvents: "none",
            whiteSpace: "normal",
          }}
        >
          {toast}
        </div>
      )}
    </main>
  );
}