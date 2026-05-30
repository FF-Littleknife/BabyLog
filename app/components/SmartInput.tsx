import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import type { BabyRecord } from "@/lib/types";
import { RECORD_LABEL } from "@/lib/types";
import { parseSmartInputs } from "@/lib/parser";
import { formatClock } from "@/lib/time";

/**
 * 一句话记录参数
 * 后面想调输入框、add 图标、预览提示，优先改这里。
 *
 * 注意：
 * 「快捷记录」标题现在由 HomePanel 的 SectionLabel 统一渲染，
 * 这里不再单独显示标题，避免 Safari / PWA 模式下字号不一致。
 */
const SMART_INPUT_CONFIG = {
  /* =========================
     输入框外壳
     ========================= */

  placeholder: "",

  boxGap: 8,
  boxPadding: 7,
  boxBg: "var(--glass-bg)",
  boxRadius: 22,
  boxShadow: "var(--shadow-soft)",

  /* =========================
     输入文字
     ========================= */

  inputColor: "var(--text)",
  inputPlaceholderColor: "var(--muted)",
  inputPadding: "13px 10px",

  // iOS Safari 里 input 字号小于 16px 会自动放大页面。
  // 由于首页在小屏会整体 zoom 缩放，所以这里用 20 更稳。
  inputSize: 16,
  inputLineHeight: 1.2,

  /* =========================
     add 图标按钮
     ========================= */

  buttonSize: 44,
  iconSize: 28,
  iconOpacity: 0.9,

  // add.svg 的视觉重心微调。
  // 正数向下，负数向上。比如 1 / -1。
  iconTranslateY: 0,

  /* =========================
     记录预览
     ========================= */

  previewPrefix: "将记录",
  previewMarginTop: 8,
  previewSize: 12,
  previewColor: "var(--muted)",
  previewPastDateColor: "var(--orange)",
  previewWarnColor: "var(--orange)",

  /* =========================
     提交反馈小票
     ========================= */

  receiptPrefix: "已记录",
};

type ParseResult = {
  records: BabyRecord[];
  failed: string[];
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

function formatRecord(record: BabyRecord) {
  const time = formatRecordTime(record);

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

function normalizeMinute(value: string) {
  const num = Number(value);

  if (!Number.isFinite(num)) return 0;

  return Math.max(0, Math.round(num));
}

function getRecordPlainText(record: BabyRecord) {
  return `${record.content || ""} ${record.note || ""}`.replace(/\s+/g, "");
}

function isTotalMinuteOtherRecord(record: BabyRecord, totalMin: number) {
  if (record.type !== "other") return false;

  const plainText = getRecordPlainText(record);

  if (!plainText) return false;

  const totalPatterns = [
    `共${totalMin}分钟`,
    `共${totalMin}分`,
    `总共${totalMin}分钟`,
    `总共${totalMin}分`,
    `合计${totalMin}分钟`,
    `合计${totalMin}分`,
    `一共${totalMin}分钟`,
    `一共${totalMin}分`,
  ];

  return totalPatterns.some((pattern) => plainText.includes(pattern));
}

/**
 * 修复这类输入：
 *
 * 20:44 母乳 双侧各15分钟，共30分钟
 * 20:44 母乳 左右各15分钟
 * 20:44 亲喂 两侧各15分钟
 *
 * 正确结果应该是一条：
 * leftMin: 15
 * rightMin: 15
 * durationMin: 30
 *
 * 如果 parser 把“共30分钟”额外识别成 other，也在这里删掉。
 */
function normalizeBothSideBreastInput(input: string, result: ParseResult) {
  const normalizedInput = input.replace(/\s+/g, "");

  const bothSideMatch = normalizedInput.match(
    /(?:母乳|亲喂).*(?:双侧|两侧|左右|两边|双边|双乳).*各(\d+(?:\.\d+)?)(?:分钟|分|min|mins?)?/i
  );

  if (!bothSideMatch) return result;

  const eachMin = normalizeMinute(bothSideMatch[1]);
  if (!eachMin) return result;

  const totalMatch = normalizedInput.match(
    /(?:共|总共|合计|一共)(\d+(?:\.\d+)?)(?:分钟|分|min|mins?)?/i
  );

  const totalMin = totalMatch
    ? normalizeMinute(totalMatch[1])
    : eachMin * 2;

  const firstBreastRecord = result.records.find(
    (record) => record.type === "breast"
  );

  if (!firstBreastRecord) return result;

  const mergedBreastRecord: BabyRecord = {
    ...firstBreastRecord,
    type: "breast",
    leftMin: eachMin,
    rightMin: eachMin,
    durationMin: totalMin || eachMin * 2,
  };

  let hasInsertedBreast = false;

  const records = result.records.reduce<BabyRecord[]>((list, record) => {
    if (record.type === "breast") {
      if (!hasInsertedBreast) {
        list.push(mergedBreastRecord);
        hasInsertedBreast = true;
      }

      return list;
    }

    if (totalMin && isTotalMinuteOtherRecord(record, totalMin)) {
      return list;
    }

    list.push(record);
    return list;
  }, []);

  return {
    ...result,
    records,
  };
}

function safeParseSmartInputs(input: string) {
  try {
    const result = parseSmartInputs(input);

    return normalizeBothSideBreastInput(input, result);
  } catch (error) {
    console.error("parseSmartInputs error:", error);

    return {
      records: [],
      failed: [input],
    };
  }
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

    return safeParseSmartInputs(trimmed);
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

    const result = safeParseSmartInputs(trimmed);

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
        className="smart-box"
        style={
          {
            display: "flex",
            alignItems: "center",
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
            fontSize: SMART_INPUT_CONFIG.inputSize,
            lineHeight: SMART_INPUT_CONFIG.inputLineHeight,
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
              transform: `translateY(${SMART_INPUT_CONFIG.iconTranslateY}px)`,
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