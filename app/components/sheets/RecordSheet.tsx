import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { BabyRecord, RecordType } from "@/lib/types";
import { RECORD_LABEL } from "@/lib/types";

const RECORD_SHEET_CONFIG = {
  sheetMaxWidth: 430,
  sheetBg: "#2c2c2e",
  sheetRadius: 28,
  sheetPadding: 18,
  sheetShadow: "0 -20px 70px rgba(0, 0, 0, 0.45)",

  titleSize: 24,
  titleWeight: 760,
  titleColor: "#ffffff",

  closeSize: 34,
  closeBg: "rgba(255, 255, 255, 0.08)",
  closeColor: "#ffffff",
  closeFontSize: 22,

  fieldMargin: "14px 0",
  labelColor: "#8e8e93",
  labelSize: 13,
  labelMarginBottom: 8,

  inputBg: "#1c1c1e",
  inputColor: "#ffffff",
  inputRadius: 18,
  inputPadding: 14,
  inputBorder: "1px solid rgba(255, 255, 255, 0.08)",

  timePickerBg: "#1c1c1e",
  timePickerRadius: 22,
  timePickerPadding: 8,
  timePickerBorder: "1px solid rgba(255, 255, 255, 0.08)",
  timePickerGap: 6,

  colonColor: "#8e8e93",
  colonSize: 24,
  colonWeight: 760,

  wheelHeight: 138,
  wheelItemHeight: 46,
  wheelRadius: 18,
  wheelBg: "rgba(255, 255, 255, 0.045)",
  wheelMaskBg: "rgba(255, 255, 255, 0.085)",
  wheelMaskBorder: "1px solid rgba(255, 255, 255, 0.08)",
  wheelTextColor: "rgba(255, 255, 255, 0.42)",
  wheelActiveColor: "#ffffff",
  wheelTextSize: 20,
  wheelActiveSize: 24,
  wheelTextWeight: 680,
  wheelActiveWeight: 780,

  submitBg: "#0a84ff",
  submitColor: "#ffffff",
  submitRadius: 20,
  submitPadding: 16,
  submitWeight: 760,
};

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

function toDateInputValue(date: Date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(
    date.getDate()
  )}`;
}

function makeDate(dateValue: string, hour: number, minute: number) {
  const [year, month, day] = dateValue.split("-").map(Number);
  const date = new Date();

  date.setFullYear(year);
  date.setMonth(month - 1);
  date.setDate(day);
  date.setHours(hour);
  date.setMinutes(minute);
  date.setSeconds(0);
  date.setMilliseconds(0);

  return date;
}

function WheelColumn({
  value,
  max,
  onChange,
}: {
  value: number;
  max: number;
  onChange: (value: number) => void;
}) {
  const wheelRef = useRef<HTMLDivElement | null>(null);
  const values = Array.from({ length: max + 1 }, (_, index) => index);

  useEffect(() => {
    const wheel = wheelRef.current;
    if (!wheel) return;

    wheel.scrollTop = value * RECORD_SHEET_CONFIG.wheelItemHeight;
  }, [value]);

  return (
    <div
      className="ios-wheel"
      ref={wheelRef}
      style={{
        height: RECORD_SHEET_CONFIG.wheelHeight,
        borderRadius: RECORD_SHEET_CONFIG.wheelRadius,
        background: RECORD_SHEET_CONFIG.wheelBg,
      }}
    >
      <div
        className="ios-wheel-mask"
        style={{
          top: RECORD_SHEET_CONFIG.wheelItemHeight,
          height: RECORD_SHEET_CONFIG.wheelItemHeight,
          marginBottom: -RECORD_SHEET_CONFIG.wheelItemHeight,
          background: RECORD_SHEET_CONFIG.wheelMaskBg,
          borderTop: RECORD_SHEET_CONFIG.wheelMaskBorder,
          borderBottom: RECORD_SHEET_CONFIG.wheelMaskBorder,
        }}
      />

      <div
        className="ios-wheel-list"
        style={{
          padding: `${RECORD_SHEET_CONFIG.wheelItemHeight}px 0`,
        }}
      >
        {values.map((item) => {
          const active = item === value;

          return (
            <button
              type="button"
              key={item}
              className={active ? "active" : ""}
              onClick={() => onChange(item)}
              style={{
                height: RECORD_SHEET_CONFIG.wheelItemHeight,
                color: active
                  ? RECORD_SHEET_CONFIG.wheelActiveColor
                  : RECORD_SHEET_CONFIG.wheelTextColor,
                fontSize: active
                  ? RECORD_SHEET_CONFIG.wheelActiveSize
                  : RECORD_SHEET_CONFIG.wheelTextSize,
                fontWeight: active
                  ? RECORD_SHEET_CONFIG.wheelActiveWeight
                  : RECORD_SHEET_CONFIG.wheelTextWeight,
              }}
            >
              {pad2(item)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function RecordSheet({
  type,
  onClose,
  onSave,
}: {
  type: RecordType;
  onClose: () => void;
  onSave: (r: BabyRecord) => void;
}) {
  const now = useMemo(() => new Date(), []);

  const [dateValue, setDateValue] = useState(toDateInputValue(now));
  const [hour, setHour] = useState(now.getHours());
  const [minute, setMinute] = useState(now.getMinutes());

  const [amountMl, setAmountMl] = useState(
    type === "formula" || type === "bottle_breast" ? "60" : ""
  );
  const [durationMin, setDurationMin] = useState(type === "breast" ? "10" : "");
  const [note, setNote] = useState("");

  function save() {
    const selectedDate = makeDate(dateValue, hour, minute);

    const record: BabyRecord = {
      id: crypto.randomUUID(),
      type,
      time: selectedDate.toISOString(),
      createdAt: new Date().toISOString(),
      amountMl: amountMl ? Number(amountMl) : undefined,
      durationMin: durationMin ? Number(durationMin) : undefined,
      note: note || undefined,
    };

    onSave(record);
  }

  const fieldStyle: CSSProperties = {
    margin: RECORD_SHEET_CONFIG.fieldMargin,
    minWidth: 0,
  };

  const labelStyle: CSSProperties = {
    color: RECORD_SHEET_CONFIG.labelColor,
    fontSize: RECORD_SHEET_CONFIG.labelSize,
    marginBottom: RECORD_SHEET_CONFIG.labelMarginBottom,
  };

  const inputStyle: CSSProperties = {
    width: "100%",
    minWidth: 0,
    boxSizing: "border-box",
    border: RECORD_SHEET_CONFIG.inputBorder,
    background: RECORD_SHEET_CONFIG.inputBg,
    color: RECORD_SHEET_CONFIG.inputColor,
    borderRadius: RECORD_SHEET_CONFIG.inputRadius,
    padding: RECORD_SHEET_CONFIG.inputPadding,
    outline: "none",
  };

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div
        className="sheet"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: `min(100%, ${RECORD_SHEET_CONFIG.sheetMaxWidth}px)`,
          background: RECORD_SHEET_CONFIG.sheetBg,
          borderRadius: RECORD_SHEET_CONFIG.sheetRadius,
          padding: RECORD_SHEET_CONFIG.sheetPadding,
          boxShadow: RECORD_SHEET_CONFIG.sheetShadow,
        }}
      >
        <div className="sheet-head">
          <div
            className="sheet-title"
            style={{
              color: RECORD_SHEET_CONFIG.titleColor,
              fontSize: RECORD_SHEET_CONFIG.titleSize,
              fontWeight: RECORD_SHEET_CONFIG.titleWeight,
            }}
          >
            {RECORD_LABEL[type]}
          </div>

          <button
            className="close"
            onClick={onClose}
            style={{
              width: RECORD_SHEET_CONFIG.closeSize,
              height: RECORD_SHEET_CONFIG.closeSize,
              background: RECORD_SHEET_CONFIG.closeBg,
              color: RECORD_SHEET_CONFIG.closeColor,
              fontSize: RECORD_SHEET_CONFIG.closeFontSize,
            }}
          >
            ×
          </button>
        </div>

        <div className="field" style={fieldStyle}>
          <label style={labelStyle}>日期</label>
          <input
            type="date"
            value={dateValue}
            onChange={(e) => setDateValue(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div className="time-picker-field" style={fieldStyle}>
          <label style={labelStyle}>时间</label>

          <div
            className="ios-time-picker"
            style={{
              gap: RECORD_SHEET_CONFIG.timePickerGap,
              padding: RECORD_SHEET_CONFIG.timePickerPadding,
              background: RECORD_SHEET_CONFIG.timePickerBg,
              borderRadius: RECORD_SHEET_CONFIG.timePickerRadius,
              border: RECORD_SHEET_CONFIG.timePickerBorder,
            }}
          >
            <WheelColumn value={hour} max={23} onChange={setHour} />

            <div
              className="ios-time-colon"
              style={{
                color: RECORD_SHEET_CONFIG.colonColor,
                fontSize: RECORD_SHEET_CONFIG.colonSize,
                fontWeight: RECORD_SHEET_CONFIG.colonWeight,
              }}
            >
              :
            </div>

            <WheelColumn value={minute} max={59} onChange={setMinute} />
          </div>
        </div>

        {(type === "formula" || type === "bottle_breast") && (
          <div className="field" style={fieldStyle}>
            <label style={labelStyle}>奶量 ml</label>
            <input
              inputMode="numeric"
              value={amountMl}
              onChange={(e) => setAmountMl(e.target.value)}
              style={inputStyle}
            />
          </div>
        )}

        {type === "breast" && (
          <div className="field" style={fieldStyle}>
            <label style={labelStyle}>时长 分钟</label>
            <input
              inputMode="numeric"
              value={durationMin}
              onChange={(e) => setDurationMin(e.target.value)}
              style={inputStyle}
            />
          </div>
        )}

        <div className="field" style={fieldStyle}>
          <label style={labelStyle}>备注 可选</label>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="比如：颜色、状态、左/右侧"
            style={inputStyle}
          />
        </div>

        <div className="sheet-actions">
          <button
            className="record-submit"
            onClick={save}
            style={{
              background: RECORD_SHEET_CONFIG.submitBg,
              color: RECORD_SHEET_CONFIG.submitColor,
              borderRadius: RECORD_SHEET_CONFIG.submitRadius,
              padding: RECORD_SHEET_CONFIG.submitPadding,
              fontWeight: RECORD_SHEET_CONFIG.submitWeight,
            }}
          >
            记录
          </button>
        </div>
      </div>
    </div>
  );
}