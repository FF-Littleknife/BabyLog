import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import type { BabyRecord } from "@/lib/types";
import { RECORD_LABEL } from "@/lib/types";
import { parseSmartInputs } from "@/lib/parser";
import { formatClock } from "@/lib/time";

/**
 * 一句话记录参数
 * 后面想调标题、输入框、add 图标、预览提示，优先改这里。
 */
const SMART_INPUT_CONFIG = {
  /* =========================
     顶部小标题
     ========================= */

  titleText: "快捷记录",
  titleMargin: "0 0 8px 4px",
  titleColor: "#8e8e93",
  titleSize: 12,
  titleWeight: 700,
  titleLetterSpacing: "0.04em",

  /* =========================
     输入框外壳
     ========================= */

  placeholder: "",

  boxGap: 8,
  boxPadding: 7,
  boxBg: "rgba(255, 255, 255, 0.86)",
  boxRadius: 22,
  boxShadow: "0 10px 34px rgba(0,0,0,.05)",

  /* =========================
     输入文字
     ========================= */

  inputColor: "#111111",
  inputPlaceholderColor: "#8e8e93",
  inputPadding: "13px 10px",

  /* =========================
     add 图标按钮
     ========================= */

  buttonSize: 44,
  iconSize: 28,
  iconOpacity: 0.9,

  /* =========================
     记录预览
     ========================= */

  previewPrefix: "将记录",
  previewMarginTop: 8,
  previewSize: 12,
  previewColor: "#8e8e93",
  previewPastDateColor: "#c27a19",
  previewWarnColor: "#ff9500",

  /* =========================
     提交反馈小票
     ========================= */

  receiptPrefix: "已记录",
};

function isToday(date: Date) {
  const now = new Date();

  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

function hasNonTodayRecord(records: BabyRecord[]) {
  return records.some((record) => !isToday(new Date(record.time)));
}

function formatRecordTime(record: BabyRecord) {
  const date = new Date(record.time);
  const clock = formatClock(record.time);

  if (isToday(date)) {
    return clock;
  }

  return `${date.getMonth() + 1}/${date.getDate()} ${clock}`;
}

function formatRecord(record: BabyRecord) {
  const time = formatRecordTime(record);

  if (record.type === "note") {
    return `${time} ${record.note || "备注"}`;
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
    const parts = [];
    const left = record.leftMin || 0;
    const right = record.rightMin || 0;
    const total = record.durationMin || left + right;

    if (left || right) {
      parts.push(`左侧${left}分钟 · 右侧${right}分钟 · 共${total}分钟`);
    } else if (record.durationMin) {
      parts.push(`共${record.durationMin}分钟`);
    }

    if (record.note) parts.push(record.note);

    return `${time} 母乳${parts.length ? `｜${parts.join(" · ")}` : ""}`;
  }

  if (record.type === "pee" || record.type === "poop") {
    return `${time} ${RECORD_LABEL[record.type]}${
      record.note ? ` · ${record.note}` : ""
    }`;
  }

  return `${time} ${RECORD_LABEL[record.type]}`;
}

function formatRecords(records: BabyRecord[]) {
  if (!records.length) return "";

  if (records.length === 1) {
    return formatRecord(records[0]);
  }

  return records.map(formatRecord).join(" / ");
}

function formatPreview(records: BabyRecord[], failed: string[]) {
  if (records.length) {
    const content = formatRecords(records);

    if (records.length === 1) {
      return `${SMART_INPUT_CONFIG.previewPrefix}：${content}`;
    }

    return `${SMART_INPUT_CONFIG.previewPrefix} ${records.length} 条：${content}`;
  }

  if (failed.length) {
    return `暂时没看懂：${failed.join(" / ")}`;
  }

  return "";
}

function formatReceipt(records: BabyRecord[], failed: string[]) {
  if (records.length) {
    const content = formatRecords(records);

    if (failed.length) {
      return `已记录 ${records.length} 条：${content}；未识别 ${
        failed.length
      } 条：${failed.join(" / ")}`;
    }

    if (records.length === 1) {
      return `${SMART_INPUT_CONFIG.receiptPrefix}：${content}`;
    }

    return `${SMART_INPUT_CONFIG.receiptPrefix} ${records.length} 条：${content}`;
  }

  if (failed.length) {
    return `未识别：${failed.join(" / ")}`;
  }

  return "";
}

export default function SmartInput({
  onSave,
  onReceipt,
}: {
  onSave: (record: BabyRecord) => void;
  onReceipt?: (text: string, warn?: boolean, undoIds?: string[]) => void;
}) {
  const [text, setText] = useState("");

  const previewResult = useMemo(() => {
    const trimmed = text.trim();

    if (!trimmed) {
      return {
        records: [],
        failed: [],
      };
    }

    return parseSmartInputs(trimmed);
  }, [text]);

  const preview = useMemo(
    () => formatPreview(previewResult.records, previewResult.failed),
    [previewResult]
  );

  const showPreview = Boolean(text.trim()) && Boolean(preview);
  const previewHasPastDate = hasNonTodayRecord(previewResult.records);

  function submit() {
    const trimmed = text.trim();
    if (!trimmed) return;

    const result = parseSmartInputs(trimmed);

    if (!result.records.length && !result.failed.length) return;

    const receipt = formatReceipt(result.records, result.failed);
    const undoIds = result.records.map((record) => record.id);

    onReceipt?.(receipt, Boolean(result.failed.length), undoIds);

    if (result.records.length) {
      setText("");
    }

    result.records.forEach(onSave);
  }

  return (
    <div>
      <div
        style={{
          margin: SMART_INPUT_CONFIG.titleMargin,
          color: SMART_INPUT_CONFIG.titleColor,
          fontSize: SMART_INPUT_CONFIG.titleSize,
          fontWeight: SMART_INPUT_CONFIG.titleWeight,
          letterSpacing: SMART_INPUT_CONFIG.titleLetterSpacing,
        }}
      >
        {SMART_INPUT_CONFIG.titleText}
      </div>

      <div
        className="smart-box"
        style={
          {
            gap: SMART_INPUT_CONFIG.boxGap,
            padding: SMART_INPUT_CONFIG.boxPadding,
            background: SMART_INPUT_CONFIG.boxBg,
            borderRadius: SMART_INPUT_CONFIG.boxRadius,
            boxShadow: SMART_INPUT_CONFIG.boxShadow,
            "--smart-placeholder-color":
              SMART_INPUT_CONFIG.inputPlaceholderColor,
          } as CSSProperties
        }
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          placeholder={SMART_INPUT_CONFIG.placeholder}
          style={{
            color: SMART_INPUT_CONFIG.inputColor,
            padding: SMART_INPUT_CONFIG.inputPadding,
            background: "transparent",
            WebkitTapHighlightColor: "transparent",
            WebkitAppearance: "none",
            appearance: "none",
          }}
        />

        <button
          type="button"
          aria-label="记录"
          onClick={submit}
          style={{
            width: SMART_INPUT_CONFIG.buttonSize,
            height: SMART_INPUT_CONFIG.buttonSize,
            minWidth: SMART_INPUT_CONFIG.buttonSize,
            border: 0,
            background: "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
            WebkitTapHighlightColor: "transparent",
          }}
        >
          <img
            src="/add.svg"
            alt=""
            style={{
              width: SMART_INPUT_CONFIG.iconSize,
              height: SMART_INPUT_CONFIG.iconSize,
              objectFit: "contain",
              display: "block",
              opacity: SMART_INPUT_CONFIG.iconOpacity,
            }}
          />
        </button>
      </div>

      {showPreview && (
        <div
          style={{
            marginTop: SMART_INPUT_CONFIG.previewMarginTop,
            fontSize: SMART_INPUT_CONFIG.previewSize,
            color: previewResult.failed.length
              ? SMART_INPUT_CONFIG.previewWarnColor
              : previewHasPastDate
              ? SMART_INPUT_CONFIG.previewPastDateColor
              : SMART_INPUT_CONFIG.previewColor,
          }}
        >
          {preview}
        </div>
      )}
    </div>
  );
}