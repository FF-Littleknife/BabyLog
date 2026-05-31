import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { BabyRecord, RecordType } from "@/lib/types";
import DateField from "@/app/components/DateField";
import LoopWheelColumn from "@/app/components/LoopWheelColumn";

type SheetMode = "quick" | "full";

const SHEET = {
  maxWidth: 430,
  bg: "rgba(255, 255, 255, 0.9)",
  radius: 28,
  padding: 18,
  outerGap: 18,

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

  wheelLoopCycles: 21,
  wheelRecenterDelay: 760,

  closeBg: "rgba(0,0,0,.08)",
  closeColor: "#0a84ff",
  closeSize: 44,
  closeLineWidth: 22,
  closeLineHeight: 3,

  submitBg: "#0a84ff",

  sheetEnterMs: 420,
  sheetExitMs: 280,
  sheetEasing: "cubic-bezier(0.16, 1, 0.3, 1)",
  sheetExitEasing: "cubic-bezier(0.32, 0, 0.67, 0)",
};

function pad2(v: number) {
  return String(v).padStart(2, "0");
}

function dateValue(date: Date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(
    date.getDate()
  )}`;
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

function getLastAmount(records: BabyRecord[], type: RecordType) {
  return records.find(
    (record) => record.type === type && typeof record.amountMl === "number"
  )?.amountMl;
}

export default function FormulaLikeSheet({
  title,
  type,
  records,
  mode,
  onClose,
  onSave,
}: {
  title: string;
  type: RecordType;
  records: BabyRecord[];
  mode: SheetMode;
  onClose: () => void;
  onSave: (record: BabyRecord) => void;
}) {
  const now = useMemo(() => new Date(), []);
  const lastAmount = getLastAmount(records, type);
  const defaultAmountMl = lastAmount ? String(lastAmount) : "";

  const [date, setDate] = useState(dateValue(now));
  const [hour, setHour] = useState(now.getHours());
  const [minute, setMinute] = useState(now.getMinutes());
  const [amountMl, setAmountMl] = useState(defaultAmountMl);
  const [amountTouched, setAmountTouched] = useState(false);
  const [note, setNote] = useState("");
  const [closing, setClosing] = useState(false);

  const closeTimerRef = useRef<number | null>(null);

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

  const fieldStyle: CSSProperties = {
    margin: "14px 0",
  };

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
    backgroundColor: SHEET.inputBg,
    color: SHEET.inputColor,
    colorScheme: "light",

    borderRadius: SHEET.inputRadius,
    padding: SHEET.inputPadding,

    outline: "none",

    WebkitAppearance: "none",
    appearance: "none",
  };

  function requestClose() {
    if (closing) return;

    setClosing(true);

    closeTimerRef.current = window.setTimeout(() => {
      onClose();
    }, SHEET.sheetExitMs);
  }

  function clearDefaultAmount() {
    if (!amountTouched && defaultAmountMl && amountMl === defaultAmountMl) {
      setAmountMl("");
    }

    setAmountTouched(true);
  }

  function save() {
    const recordDate = makeDate(date, hour, minute);

    onSave({
      id: crypto.randomUUID(),
      type,
      time: recordDate.toISOString(),
      createdAt: new Date().toISOString(),
      amountMl: amountMl ? Number(amountMl) : undefined,
      note: note || undefined,
    });
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

      <div
        className="sheet"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: `min(calc(100% - ${SHEET.outerGap * 2}px), ${
            SHEET.maxWidth
          }px)`,

          background: SHEET.bg,

          borderRadius: SHEET.radius,
          padding: SHEET.padding,

          marginBottom: `calc(${SHEET.outerGap}px + env(safe-area-inset-bottom))`,

          boxShadow: "0 -24px 80px rgba(0,0,0,.16)",

          animation: closing
            ? `sheetSlideDown ${SHEET.sheetExitMs}ms ${SHEET.sheetExitEasing} both`
            : `sheetSlideUp ${SHEET.sheetEnterMs}ms ${SHEET.sheetEasing} both`,
          willChange: "transform",
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
            {title}
          </div>

          <button
            type="button"
            className="close"
            onClick={requestClose}
            aria-label="关闭"
            style={{
              width: SHEET.closeSize,
              height: SHEET.closeSize,
              minWidth: SHEET.closeSize,
              border: 0,
              borderRadius: 999,
              background: SHEET.closeBg,
              color: SHEET.closeColor,
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
                  width: SHEET.closeLineWidth,
                  height: SHEET.closeLineHeight,
                  borderRadius: 999,
                  background: SHEET.closeColor,
                  transform: "translate(-50%, -50%) rotate(45deg)",
                  transformOrigin: "center",
                }}
              />

              <span
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  width: SHEET.closeLineWidth,
                  height: SHEET.closeLineHeight,
                  borderRadius: 999,
                  background: SHEET.closeColor,
                  transform: "translate(-50%, -50%) rotate(-45deg)",
                  transformOrigin: "center",
                }}
              />
            </span>
          </button>
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>日期</label>

          <DateField value={date} onChange={setDate} inputStyle={inputStyle} />
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
            <LoopWheelColumn
              value={hour}
              max={23}
              onChange={setHour}
              config={SHEET}
            />

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

            <LoopWheelColumn
              value={minute}
              max={59}
              onChange={setMinute}
              config={SHEET}
            />
          </div>
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>奶量 ml</label>

          <input
            inputMode="numeric"
            value={amountMl}
            onFocus={clearDefaultAmount}
            onChange={(e) => {
              setAmountTouched(true);
              setAmountMl(e.target.value);
            }}
            style={inputStyle}
          />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>备注 可选</label>

          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder=""
            style={inputStyle}
          />
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