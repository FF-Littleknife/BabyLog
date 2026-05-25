"use client";

import type { CSSProperties, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import DateField from "@/app/components/DateField";
import LoopWheelColumn from "@/app/components/LoopWheelColumn";
import type { BabyRecord } from "@/lib/types";
import { RECORD_LABEL } from "@/lib/types";

const EDIT_SHEET = {
  maxWidth: 430,
  bg: "rgba(244,241,246,.98)",
  radius: 28,
  padding: 22,
  outerGap: 18,

  titleColor: "#111111",
  titleSize: 20,
  titleWeight: 820,

  subColor: "#8e8e93",
  subSize: 13,

  fieldGap: 12,
  labelColor: "#8e8e93",
  labelSize: 12,
  labelWeight: 700,

  inputBg: "rgba(255,255,255,.76)",
  inputColor: "#111111",
  inputRadius: 18,
  inputPadding: "14px 14px",
  inputBorder: "1px solid rgba(0,0,0,.06)",

  timePickerBg: "rgba(0, 0, 0, 0.045)",
  timePickerRadius: 22,
  timePickerPadding: 8,
  timePickerBorder: "1px solid rgba(0,0,0,.06)",
  timePickerGap: 6,

  colonColor: "#8e8e93",
  colonSize: 24,
  colonWeight: 760,

  wheelHeight: 138,
  wheelItemHeight: 46,
  wheelRadius: 18,
  wheelBg: "rgba(255,255,255,.72)",
  wheelMaskBg: "rgba(0,0,0,.06)",
  wheelMaskBorder: "1px solid rgba(0,0,0,.08)",
  wheelTextColor: "rgba(0,0,0,.38)",
  wheelActiveColor: "#111111",
  wheelTextSize: 20,
  wheelActiveSize: 24,
  wheelTextWeight: 680,
  wheelActiveWeight: 780,

  wheelLoopCycles: 21,
  wheelRecenterDelay: 760,

  actionGap: 10,
  saveBg: "#0a84ff",
  saveColor: "#ffffff",
  deleteBg: "rgba(255, 59, 48, 0.12)",
  deleteColor: "#ff3b30",
  cancelBg: "rgba(0,0,0,.06)",
  cancelColor: "#8e8e93",

  buttonRadius: 22,
  buttonPadding: 16,
  buttonWeight: 760,

  closeBg: "rgba(0,0,0,.06)",
  closeColor: "#8e8e93",
  closeSize: 44,
  closeLineWidth: 22,
  closeLineHeight: 3,

  sheetEnterMs: 420,
  sheetExitMs: 280,
  sheetEasing: "cubic-bezier(0.16, 1, 0.3, 1)",
  sheetExitEasing: "cubic-bezier(0.32, 0, 0.67, 0)",
};

function toDateValue(iso: string) {
  const date = new Date(iso);

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
}

function toHourValue(iso: string) {
  return new Date(iso).getHours();
}

function toMinuteValue(iso: string) {
  return new Date(iso).getMinutes();
}

function mergeDateTime(dateValue: string, hour: number, minute: number) {
  const [year, month, day] = dateValue.split("-").map(Number);

  return new Date(year, month - 1, day, hour, minute, 0, 0).toISOString();
}

function numberToText(value?: number) {
  return typeof value === "number" ? String(value) : "";
}

function textToNumber(value: string) {
  if (!value.trim()) return undefined;

  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
}

function editTitle(record: BabyRecord) {
  if (record.type === "other") return "编辑其他记录";
  return `编辑${RECORD_LABEL[record.type]}`;
}

function deleteTitle(record: BabyRecord) {
  if (record.type === "other") return record.content || record.note || "其他记录";
  return RECORD_LABEL[record.type];
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="field">
      <span
        style={{
          display: "block",
          color: EDIT_SHEET.labelColor,
          fontSize: EDIT_SHEET.labelSize,
          fontWeight: EDIT_SHEET.labelWeight,
          marginBottom: 6,
        }}
      >
        {label}
      </span>

      {children}
    </div>
  );
}

function inputStyle(): CSSProperties {
  return {
    width: "100%",
    minWidth: 0,
    maxWidth: "100%",
    boxSizing: "border-box",

    border: EDIT_SHEET.inputBorder,
    borderRadius: EDIT_SHEET.inputRadius,
    padding: EDIT_SHEET.inputPadding,

    background: EDIT_SHEET.inputBg,
    backgroundColor: EDIT_SHEET.inputBg,
    color: EDIT_SHEET.inputColor,
    colorScheme: "light",

    outline: "none",

    WebkitAppearance: "none",
    appearance: "none",
  };
}

export default function EditRecordSheet({
  record,
  onClose,
  onSave,
  onDelete,
}: {
  record: BabyRecord;
  onClose: () => void;
  onSave: (record: BabyRecord) => void;
  onDelete: (id: string) => void;
}) {
  const [dateValue, setDateValue] = useState(toDateValue(record.time));
  const [hour, setHour] = useState(toHourValue(record.time));
  const [minute, setMinute] = useState(toMinuteValue(record.time));

  const [amountMl, setAmountMl] = useState(numberToText(record.amountMl));
  const [durationMin, setDurationMin] = useState(
    numberToText(record.durationMin)
  );
  const [leftMin, setLeftMin] = useState(numberToText(record.leftMin));
  const [rightMin, setRightMin] = useState(numberToText(record.rightMin));
  const [content, setContent] = useState(record.content ?? record.note ?? "");
  const [note, setNote] = useState(record.content ? record.note ?? "" : "");
  const [closing, setClosing] = useState(false);

  const closeTimerRef = useRef<number | null>(null);

  const isOther = record.type === "other";

  const showAmount =
    record.type === "formula" ||
    record.type === "bottle_breast" ||
    record.type === "pump";

  const showDuration = record.type === "breast" || record.type === "pump";
  const showBreastSides = record.type === "breast";

  useEffect(() => {
    const scrollY = window.scrollY;

    function preventTouchMove(event: TouchEvent) {
      const target = event.target as HTMLElement | null;

      if (target?.closest(".ios-wheel")) return;
      if (target?.closest(".date-field-overlay")) return;

      event.preventDefault();
    }

    document.addEventListener("touchmove", preventTouchMove, {
      passive: false,
    });

    document.documentElement.style.overflow = "hidden";

    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";

    return () => {
      document.removeEventListener("touchmove", preventTouchMove);

      document.documentElement.style.overflow = "";

      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";

      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
      }

      window.scrollTo(0, scrollY);
    };
  }, []);

  function requestClose() {
    if (closing) return;

    setClosing(true);

    closeTimerRef.current = window.setTimeout(() => {
      onClose();
    }, EDIT_SHEET.sheetExitMs);
  }

  function save() {
    const nextLeft = textToNumber(leftMin);
    const nextRight = textToNumber(rightMin);

    const autoDuration =
      record.type === "breast" && (nextLeft || nextRight)
        ? (nextLeft || 0) + (nextRight || 0)
        : textToNumber(durationMin);

    onSave({
      ...record,
      time: mergeDateTime(dateValue, hour, minute),
      amountMl: showAmount ? textToNumber(amountMl) : undefined,
      durationMin: showDuration ? autoDuration : undefined,
      leftMin: showBreastSides ? nextLeft : undefined,
      rightMin: showBreastSides ? nextRight : undefined,
      content: isOther ? content.trim() || undefined : undefined,
      note: note.trim() || undefined,
    });
  }

  function remove() {
    const ok = window.confirm(`删除这条「${deleteTitle(record)}」记录吗？`);

    if (!ok) return;

    onDelete(record.id);
  }

  return (
    <div
      className="sheet-backdrop"
      onClick={requestClose}
      style={{
        alignItems: "flex-end",
        justifyContent: "center",
      }}
    >
      <style jsx>{`
        @keyframes sheetSlideUp {
          from {
            transform: translate3d(0, calc(100% + 40px), 0);
          }

          to {
            transform: translate3d(0, 0, 0);
          }
        }

        @keyframes sheetSlideDown {
          from {
            transform: translate3d(0, 0, 0);
          }

          to {
            transform: translate3d(0, calc(100% + 40px), 0);
          }
        }
      `}</style>

      <section
        className="sheet"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: `min(calc(100% - ${EDIT_SHEET.outerGap * 2}px), ${
            EDIT_SHEET.maxWidth
          }px)`,

          borderRadius: EDIT_SHEET.radius,
          background: EDIT_SHEET.bg,
          padding: EDIT_SHEET.padding,

          marginBottom: `calc(${EDIT_SHEET.outerGap}px + env(safe-area-inset-bottom))`,

          boxShadow: "0 -24px 80px rgba(0,0,0,.18)",

          animation: closing
            ? `sheetSlideDown ${EDIT_SHEET.sheetExitMs}ms ${EDIT_SHEET.sheetExitEasing} both`
            : `sheetSlideUp ${EDIT_SHEET.sheetEnterMs}ms ${EDIT_SHEET.sheetEasing} both`,
          willChange: "transform",
        }}
      >
        <div className="sheet-head">
          <div>
            <div
              style={{
                color: EDIT_SHEET.titleColor,
                fontSize: EDIT_SHEET.titleSize,
                fontWeight: EDIT_SHEET.titleWeight,
              }}
            >
              {editTitle(record)}
            </div>

            <div
              style={{
                color: EDIT_SHEET.subColor,
                fontSize: EDIT_SHEET.subSize,
                marginTop: 5,
              }}
            >
              修改后会同步到云端
            </div>
          </div>

          <button
            className="close"
            type="button"
            onClick={requestClose}
            aria-label="关闭"
            style={{
              width: EDIT_SHEET.closeSize,
              height: EDIT_SHEET.closeSize,
              minWidth: EDIT_SHEET.closeSize,
              border: 0,
              borderRadius: 999,
              background: EDIT_SHEET.closeBg,
              color: EDIT_SHEET.closeColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
              cursor: "pointer",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <span
              aria-hidden
              style={{
                position: "relative",
                width: 20,
                height: 20,
                display: "block",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  width: EDIT_SHEET.closeLineWidth,
                  height: EDIT_SHEET.closeLineHeight,
                  borderRadius: 999,
                  background: EDIT_SHEET.closeColor,
                  transform: "translate(-50%, -50%) rotate(45deg)",
                  transformOrigin: "center",
                }}
              />

              <span
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  width: EDIT_SHEET.closeLineWidth,
                  height: EDIT_SHEET.closeLineHeight,
                  borderRadius: 999,
                  background: EDIT_SHEET.closeColor,
                  transform: "translate(-50%, -50%) rotate(-45deg)",
                  transformOrigin: "center",
                }}
              />
            </span>
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gap: EDIT_SHEET.fieldGap,
          }}
        >
          <Field label="日期">
            <DateField
              value={dateValue}
              onChange={setDateValue}
              inputStyle={inputStyle()}
            />
          </Field>

          <Field label="时间">
            <div
              className="ios-time-picker"
              style={{
                gap: EDIT_SHEET.timePickerGap,
                padding: EDIT_SHEET.timePickerPadding,
                background: EDIT_SHEET.timePickerBg,
                borderRadius: EDIT_SHEET.timePickerRadius,
                border: EDIT_SHEET.timePickerBorder,
              }}
            >
              <LoopWheelColumn
                value={hour}
                max={23}
                onChange={setHour}
                config={EDIT_SHEET}
              />

              <div
                className="ios-time-colon"
                style={{
                  color: EDIT_SHEET.colonColor,
                  fontSize: EDIT_SHEET.colonSize,
                  fontWeight: EDIT_SHEET.colonWeight,
                }}
              >
                :
              </div>

              <LoopWheelColumn
                value={minute}
                max={59}
                onChange={setMinute}
                config={EDIT_SHEET}
              />
            </div>
          </Field>

          {showAmount && (
            <Field label="奶量 ml">
              <input
                inputMode="numeric"
                value={amountMl}
                onChange={(e) => setAmountMl(e.target.value)}
                style={inputStyle()}
              />
            </Field>
          )}

          {showBreastSides && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
              }}
            >
              <Field label="左侧 分钟">
                <input
                  inputMode="numeric"
                  value={leftMin}
                  onChange={(e) => setLeftMin(e.target.value)}
                  style={inputStyle()}
                />
              </Field>

              <Field label="右侧 分钟">
                <input
                  inputMode="numeric"
                  value={rightMin}
                  onChange={(e) => setRightMin(e.target.value)}
                  style={inputStyle()}
                />
              </Field>
            </div>
          )}

          {showDuration && !showBreastSides && (
            <Field label="时长 分钟">
              <input
                inputMode="numeric"
                value={durationMin}
                onChange={(e) => setDurationMin(e.target.value)}
                style={inputStyle()}
              />
            </Field>
          )}

          {isOther && (
            <Field label="内容">
              <input
                value={content}
                onChange={(e) => setContent(e.target.value)}
                style={inputStyle()}
                placeholder="比如：乳糖酶 / 维生素D / 洗澡"
              />
            </Field>
          )}

          <Field label="备注">
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              style={inputStyle()}
              placeholder="可不填"
            />
          </Field>
        </div>

        <div
          style={{
            display: "grid",
            gap: EDIT_SHEET.actionGap,
            marginTop: 18,
          }}
        >
          <button
            type="button"
            onClick={save}
            style={{
              border: 0,
              borderRadius: EDIT_SHEET.buttonRadius,
              padding: EDIT_SHEET.buttonPadding,
              background: EDIT_SHEET.saveBg,
              color: EDIT_SHEET.saveColor,
              fontWeight: EDIT_SHEET.buttonWeight,
            }}
          >
            保存修改
          </button>

          <button
            type="button"
            onClick={remove}
            style={{
              border: 0,
              borderRadius: EDIT_SHEET.buttonRadius,
              padding: EDIT_SHEET.buttonPadding,
              background: EDIT_SHEET.deleteBg,
              color: EDIT_SHEET.deleteColor,
              fontWeight: EDIT_SHEET.buttonWeight,
            }}
          >
            删除这条记录
          </button>

          <button
            type="button"
            onClick={requestClose}
            style={{
              border: 0,
              borderRadius: EDIT_SHEET.buttonRadius,
              padding: EDIT_SHEET.buttonPadding,
              background: EDIT_SHEET.cancelBg,
              color: EDIT_SHEET.cancelColor,
              fontWeight: EDIT_SHEET.buttonWeight,
            }}
          >
            取消
          </button>
        </div>
      </section>
    </div>
  );
}