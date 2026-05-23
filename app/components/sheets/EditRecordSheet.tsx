"use client";

import { useState } from "react";
import type { BabyRecord } from "@/lib/types";
import { RECORD_LABEL } from "@/lib/types";

const EDIT_SHEET = {
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
};

function toDateValue(iso: string) {
  const date = new Date(iso);

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
}

function toTimeValue(iso: string) {
  const date = new Date(iso);

  return `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes()
  ).padStart(2, "0")}`;
}

function mergeDateTime(dateValue: string, timeValue: string) {
  const [year, month, day] = dateValue.split("-").map(Number);
  const [hour, minute] = timeValue.split(":").map(Number);

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
  children: React.ReactNode;
}) {
  return (
    <label className="field">
      <span
        style={{
          color: EDIT_SHEET.labelColor,
          fontSize: EDIT_SHEET.labelSize,
          fontWeight: EDIT_SHEET.labelWeight,
          marginBottom: 6,
        }}
      >
        {label}
      </span>

      {children}
    </label>
  );
}

function inputStyle() {
  return {
    width: "100%",
    border: EDIT_SHEET.inputBorder,
    borderRadius: EDIT_SHEET.inputRadius,
    padding: EDIT_SHEET.inputPadding,
    background: EDIT_SHEET.inputBg,
    color: EDIT_SHEET.inputColor,
    outline: "none",
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
  const [timeValue, setTimeValue] = useState(toTimeValue(record.time));
  const [amountMl, setAmountMl] = useState(numberToText(record.amountMl));
  const [durationMin, setDurationMin] = useState(
    numberToText(record.durationMin)
  );
  const [leftMin, setLeftMin] = useState(numberToText(record.leftMin));
  const [rightMin, setRightMin] = useState(numberToText(record.rightMin));
  const [content, setContent] = useState(record.content ?? record.note ?? "");
  const [note, setNote] = useState(record.content ? record.note ?? "" : "");

  const isOther = record.type === "other";

  const showAmount =
    record.type === "formula" ||
    record.type === "bottle_breast" ||
    record.type === "pump";

  const showDuration = record.type === "breast" || record.type === "pump";
  const showBreastSides = record.type === "breast";

  function save() {
    const nextLeft = textToNumber(leftMin);
    const nextRight = textToNumber(rightMin);

    const autoDuration =
      record.type === "breast" && (nextLeft || nextRight)
        ? (nextLeft || 0) + (nextRight || 0)
        : textToNumber(durationMin);

    onSave({
      ...record,
      time: mergeDateTime(dateValue, timeValue),
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
    <div className="sheet-backdrop">
      <section
        className="sheet"
        style={{
          width: "min(100%, 430px)",
          borderRadius: "34px 34px 0 0",
          background: "rgba(244,241,246,.98)",
          padding: "22px",
          boxShadow: "0 -24px 80px rgba(0,0,0,.18)",
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
            onClick={onClose}
            style={{
              width: 42,
              height: 42,
              background: "rgba(0,0,0,.06)",
              color: "#8e8e93",
              fontSize: 24,
            }}
          >
            ×
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gap: EDIT_SHEET.fieldGap,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
            }}
          >
            <Field label="日期">
              <input
                type="date"
                value={dateValue}
                onChange={(e) => setDateValue(e.target.value)}
                style={inputStyle()}
              />
            </Field>

            <Field label="时间">
              <input
                type="time"
                value={timeValue}
                onChange={(e) => setTimeValue(e.target.value)}
                style={inputStyle()}
              />
            </Field>
          </div>

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
            onClick={onClose}
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