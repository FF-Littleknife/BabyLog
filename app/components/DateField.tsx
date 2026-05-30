"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import LoopWheelColumn from "@/app/components/LoopWheelColumn";

const DATE_FIELD = {
  inputHeight: 48,
  inputTextAlign: "center" as const,

  displayTextColor: "var(--text)",
  displayTextSize: 24,
  displayTextWeight: 780,

  // 不再叠加第二层毛玻璃。
  // Sheet 外层已经有背景模糊，这里只做极轻遮罩，避免“双层雾”。
  overlayBg: "var(--surface-overlay)",
  overlayBlur: "none",
  overlayZIndex: 220,

  panelWidth: "min(calc(100% - 40px), 360px)",
  panelBg: "var(--surface-strong)",
  panelRadius: 28,
  panelPadding: 16,
  panelShadow: "var(--shadow-sheet)",

  titleColor: "var(--text)",
  titleSize: 18,
  titleWeight: 820,

  wheelWrapBg: "var(--input-bg)",
  wheelWrapRadius: 22,
  wheelWrapPadding: 8,
  wheelGap: 6,

  wheelHeight: 138,
  wheelItemHeight: 46,
  wheelRadius: 18,
  wheelBg: "var(--surface-soft)",
  wheelMaskBg: "var(--surface-muted)",
  wheelMaskBorder: "1px solid var(--surface-muted-strong)",
  wheelTextColor: "var(--wheel-text)",
  wheelActiveColor: "var(--text)",
  wheelTextSize: 18,
  wheelActiveSize: 22,
  wheelTextWeight: 680,
  wheelActiveWeight: 780,

  wheelLoopCycles: 21,
  wheelRecenterDelay: 760,

  actionGap: 10,
  actionMarginTop: 14,

  buttonRadius: 18,
  buttonPadding: "13px 14px",
  buttonWeight: 760,

  cancelBg: "var(--surface-muted)",
  cancelColor: "var(--muted)",
  confirmBg: "var(--blue)",
  confirmColor: "var(--white)",

  yearBefore: 6,
  yearAfter: 1,
};

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

function todayValue() {
  const date = new Date();

  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(
    date.getDate()
  )}`;
}

function parseDateValue(value: string) {
  const safeValue = value || todayValue();
  const [year, month, day] = safeValue.split("-").map(Number);
  const today = new Date();

  return {
    year: Number.isFinite(year) ? year : today.getFullYear(),
    month: Number.isFinite(month) ? month : today.getMonth() + 1,
    day: Number.isFinite(day) ? day : today.getDate(),
  };
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function formatDateValue(year: number, month: number, day: number) {
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

function formatDisplay(value: string) {
  const { year, month, day } = parseDateValue(value);

  return `${year}/${month}/${day}`;
}

export default function DateField({
  value,
  onChange,
  inputStyle,
}: {
  value: string;
  onChange: (value: string) => void;
  inputStyle: CSSProperties;
}) {
  const parsedValue = parseDateValue(value);

  const [open, setOpen] = useState(false);
  const [year, setYear] = useState(parsedValue.year);
  const [monthIndex, setMonthIndex] = useState(parsedValue.month - 1);
  const [dayIndex, setDayIndex] = useState(parsedValue.day - 1);

  const yearOptions = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const startYear = currentYear - DATE_FIELD.yearBefore;
    const endYear = currentYear + DATE_FIELD.yearAfter;

    return {
      startYear,
      endYear,
      max: endYear - startYear,
    };
  }, []);

  const currentMonth = monthIndex + 1;
  const maxDay = getDaysInMonth(year, currentMonth);
  const safeDayIndex = Math.min(dayIndex, maxDay - 1);
  const currentDay = safeDayIndex + 1;

  useEffect(() => {
    const nextParsedValue = parseDateValue(value);

    setYear(nextParsedValue.year);
    setMonthIndex(nextParsedValue.month - 1);
    setDayIndex(nextParsedValue.day - 1);
  }, [value]);

  useEffect(() => {
    const nextMaxDay = getDaysInMonth(year, currentMonth);

    if (dayIndex > nextMaxDay - 1) {
      setDayIndex(nextMaxDay - 1);
    }
  }, [year, currentMonth, dayIndex]);

  useEffect(() => {
    if (!open) return;

    const oldOverflow = document.body.style.overflow;
    const oldTouchAction = document.body.style.touchAction;

    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";

    return () => {
      document.body.style.overflow = oldOverflow;
      document.body.style.touchAction = oldTouchAction;
    };
  }, [open]);

  function confirm() {
    onChange(formatDateValue(year, currentMonth, currentDay));
    setOpen(false);
  }

  function cancel() {
    const nextParsedValue = parseDateValue(value);

    setYear(nextParsedValue.year);
    setMonthIndex(nextParsedValue.month - 1);
    setDayIndex(nextParsedValue.day - 1);
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          ...inputStyle,
          height: DATE_FIELD.inputHeight,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: DATE_FIELD.inputTextAlign,
          color: DATE_FIELD.displayTextColor,
          fontSize: DATE_FIELD.displayTextSize,
          fontWeight: DATE_FIELD.displayTextWeight,
          lineHeight: 1,
          WebkitTapHighlightColor: "transparent",
        }}
      >
        {formatDisplay(value)}
      </button>

      {open && (
        <div
          className="date-field-overlay"
          onClick={cancel}
          onTouchMove={(event) => {
            const target = event.target as HTMLElement | null;

            if (target?.closest(".ios-wheel")) return;

            event.preventDefault();
          }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: DATE_FIELD.overlayZIndex,
            background: DATE_FIELD.overlayBg,
            backdropFilter: DATE_FIELD.overlayBlur,
            WebkitBackdropFilter: DATE_FIELD.overlayBlur,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            boxSizing: "border-box",
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: DATE_FIELD.panelWidth,
              background: DATE_FIELD.panelBg,
              borderRadius: DATE_FIELD.panelRadius,
              padding: DATE_FIELD.panelPadding,
              boxShadow: DATE_FIELD.panelShadow,
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                color: DATE_FIELD.titleColor,
                fontSize: DATE_FIELD.titleSize,
                fontWeight: DATE_FIELD.titleWeight,
                textAlign: "center",
                marginBottom: 14,
              }}
            >
              选择日期
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.25fr 1fr 1fr",
                gap: DATE_FIELD.wheelGap,
                padding: DATE_FIELD.wheelWrapPadding,
                background: DATE_FIELD.wheelWrapBg,
                borderRadius: DATE_FIELD.wheelWrapRadius,
              }}
            >
              <LoopWheelColumn
                value={year - yearOptions.startYear}
                max={yearOptions.max}
                onChange={(nextIndex) =>
                  setYear(yearOptions.startYear + nextIndex)
                }
                config={DATE_FIELD}
                formatLabel={(item) => String(yearOptions.startYear + item)}
              />

              <LoopWheelColumn
                value={monthIndex}
                max={11}
                onChange={setMonthIndex}
                config={DATE_FIELD}
                formatLabel={(item) => pad2(item + 1)}
              />

              <LoopWheelColumn
                value={safeDayIndex}
                max={maxDay - 1}
                onChange={setDayIndex}
                config={DATE_FIELD}
                formatLabel={(item) => pad2(item + 1)}
              />
            </div>

            <div
              style={{
                marginTop: DATE_FIELD.actionMarginTop,
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: DATE_FIELD.actionGap,
              }}
            >
              <button
                type="button"
                onClick={cancel}
                style={{
                  border: 0,
                  borderRadius: DATE_FIELD.buttonRadius,
                  padding: DATE_FIELD.buttonPadding,
                  background: DATE_FIELD.cancelBg,
                  color: DATE_FIELD.cancelColor,
                  fontWeight: DATE_FIELD.buttonWeight,
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                取消
              </button>

              <button
                type="button"
                onClick={confirm}
                style={{
                  border: 0,
                  borderRadius: DATE_FIELD.buttonRadius,
                  padding: DATE_FIELD.buttonPadding,
                  background: DATE_FIELD.confirmBg,
                  color: DATE_FIELD.confirmColor,
                  fontWeight: DATE_FIELD.buttonWeight,
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}