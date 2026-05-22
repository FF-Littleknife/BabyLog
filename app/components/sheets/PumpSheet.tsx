import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { BabyRecord } from "@/lib/types";

const SHEET = {
  maxWidth: 430,
  bg: "rgba(255, 255, 255, 0.9)",
  radius: 28,
  padding: 18,
  bottomGap: 30,

  title: "泵奶",
  titleColor: "#111111",
  titleSize: 24,
  titleWeight: 760,

  labelColor: "#8e8e93",
  labelSize: 13,

  inputBg: "rgba(0, 0, 0, 0.045)",
  inputColor: "#111111",
  inputRadius: 18,
  inputPadding: 14,
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

  closeBg: "rgba(0,0,0,.08)",
  closeColor: "#0a84ff",
  submitBg: "#0a84ff",
};

function pad2(v: number) {
  return String(v).padStart(2, "0");
}

function dateValue(date: Date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function makeDate(dateValueString: string, hour: number, minute: number) {
  const [year, month, day] = dateValueString.split("-").map(Number);
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
  const scrollTimer = useRef<number | null>(null);
  const values = Array.from({ length: max + 1 }, (_, index) => index);

  useEffect(() => {
    const wheel = wheelRef.current;
    if (!wheel) return;
    wheel.scrollTop = value * SHEET.wheelItemHeight;
  }, [value]);

  function updateByScroll() {
    const wheel = wheelRef.current;
    if (!wheel) return;

    const nextValue = Math.round(wheel.scrollTop / SHEET.wheelItemHeight);
    const safeValue = Math.max(0, Math.min(max, nextValue));

    if (safeValue !== value) onChange(safeValue);

    if (scrollTimer.current) window.clearTimeout(scrollTimer.current);

    scrollTimer.current = window.setTimeout(() => {
      wheel.scrollTo({
        top: safeValue * SHEET.wheelItemHeight,
        behavior: "smooth",
      });
    }, 80);
  }

  return (
    <div
      className="ios-wheel"
      ref={wheelRef}
      onScroll={updateByScroll}
      style={{
        height: SHEET.wheelHeight,
        borderRadius: SHEET.wheelRadius,
        background: SHEET.wheelBg,
      }}
    >
      <div
        className="ios-wheel-mask"
        style={{
          top: SHEET.wheelItemHeight,
          height: SHEET.wheelItemHeight,
          marginBottom: -SHEET.wheelItemHeight,
          background: SHEET.wheelMaskBg,
          borderTop: SHEET.wheelMaskBorder,
          borderBottom: SHEET.wheelMaskBorder,
        }}
      />

      <div className="ios-wheel-list" style={{ padding: `${SHEET.wheelItemHeight}px 0` }}>
        {values.map((item) => {
          const active = item === value;

          return (
            <button
              type="button"
              key={item}
              onClick={() => onChange(item)}
              style={{
                height: SHEET.wheelItemHeight,
                color: active ? SHEET.wheelActiveColor : SHEET.wheelTextColor,
                fontSize: active ? SHEET.wheelActiveSize : SHEET.wheelTextSize,
                fontWeight: active ? SHEET.wheelActiveWeight : SHEET.wheelTextWeight,
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

export default function PumpSheet({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (record: BabyRecord) => void;
}) {
  const now = useMemo(() => new Date(), []);

  const [date, setDate] = useState(dateValue(now));
  const [hour, setHour] = useState(now.getHours());
  const [minute, setMinute] = useState(now.getMinutes());
  const [durationMin, setDurationMin] = useState("");
  const [amountMl, setAmountMl] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    const scrollY = window.scrollY;

    function preventTouchMove(event: TouchEvent) {
      const target = event.target as HTMLElement | null;
      if (target?.closest(".ios-wheel")) return;
      event.preventDefault();
    }

    document.addEventListener("touchmove", preventTouchMove, { passive: false });

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

      window.scrollTo(0, scrollY);
    };
  }, []);

  const fieldStyle: CSSProperties = { margin: "14px 0" };

  const labelStyle: CSSProperties = {
    display: "block",
    color: SHEET.labelColor,
    fontSize: SHEET.labelSize,
    marginBottom: 8,
  };

  const inputStyle: CSSProperties = {
    width: "100%",
    minWidth: 0,
    maxWidth: "100%",
    boxSizing: "border-box",
    border: SHEET.inputBorder,
    background: SHEET.inputBg,
    color: SHEET.inputColor,
    borderRadius: SHEET.inputRadius,
    padding: SHEET.inputPadding,
    outline: "none",
    WebkitAppearance: "none",
    appearance: "none",
  };

  function save() {
    const recordDate = makeDate(date, hour, minute);

    onSave({
      id: crypto.randomUUID(),
      type: "pump",
      time: recordDate.toISOString(),
      createdAt: new Date().toISOString(),
      durationMin: durationMin ? Number(durationMin) : undefined,
      amountMl: amountMl ? Number(amountMl) : undefined,
      note: note || undefined,
    });
  }

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div
        className="sheet"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: `min(100%, ${SHEET.maxWidth}px)`,
          background: SHEET.bg,
          borderRadius: SHEET.radius,
          padding: SHEET.padding,
          marginBottom: SHEET.bottomGap,
          boxShadow: "0 -24px 80px rgba(0,0,0,.16)",
        }}
      >
        <div className="sheet-head">
          <div
            className="sheet-title"
            style={{
              color: SHEET.titleColor,
              fontSize: SHEET.titleSize,
              fontWeight: SHEET.titleWeight,
            }}
          >
            {SHEET.title}
          </div>

          <button
            className="close"
            onClick={onClose}
            style={{
              background: SHEET.closeBg,
              color: SHEET.closeColor,
            }}
          >
            ×
          </button>
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>日期</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle} />
        </div>

        <div className="time-picker-field" style={fieldStyle}>
          <label style={labelStyle}>时间</label>

          <div
            className="ios-time-picker"
            style={{
              gap: SHEET.timePickerGap,
              padding: SHEET.timePickerPadding,
              background: SHEET.timePickerBg,
              borderRadius: SHEET.timePickerRadius,
              border: SHEET.timePickerBorder,
            }}
          >
            <WheelColumn value={hour} max={23} onChange={setHour} />

            <div
              className="ios-time-colon"
              style={{
                color: SHEET.colonColor,
                fontSize: SHEET.colonSize,
                fontWeight: SHEET.colonWeight,
              }}
            >
              :
            </div>

            <WheelColumn value={minute} max={59} onChange={setMinute} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 10 }}>
          <div style={fieldStyle}>
            <label style={labelStyle}>时长 分钟</label>
            <input inputMode="numeric" value={durationMin} onChange={(e) => setDurationMin(e.target.value)} style={inputStyle} />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>泵奶量 ml</label>
            <input inputMode="numeric" value={amountMl} onChange={(e) => setAmountMl(e.target.value)} style={inputStyle} />
          </div>
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>备注 可选</label>
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="" style={inputStyle} />
        </div>

        <div className="sheet-actions">
          <button
            className="record-submit"
            onClick={save}
            style={{
              background: SHEET.submitBg,
              color: "white",
              borderRadius: 20,
              padding: 16,
              fontWeight: 760,
            }}
          >
            记录
          </button>
        </div>
      </div>
    </div>
  );
}