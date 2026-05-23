"use client";

import { useEffect, useMemo, useState } from "react";
import type { GrowthRecord } from "@/lib/growthApi";
import GrowthCharts from "@/app/components/GrowthCharts";

const GROWTH_SHEET = {
  overlayBg: "rgba(244,241,246,.36)",

  panelWidth: "min(calc(100% - 44px), 386px)",
  panelRadius: 34,
  panelBg: "rgba(244,241,246,.98)",
  panelPadding: "22px",
  panelShadow: "0 24px 80px rgba(0,0,0,.18)",

  titleColor: "#111111",
  titleSize: 20,
  titleWeight: 820,

  ageTextColor: "#8e8e93",
  ageTextSize: 12,
  ageTextWeight: 650,
  ageTextMarginTop: 8,

  titleMarginBottom: 22,

  cardBg: "rgba(255,255,255,.82)",
  cardRadius: 28,
  cardPadding: "20px 20px 18px",
  cardShadow: "0 10px 34px rgba(0,0,0,.05)",

  statGap: 16,

  valueColor: "#111111",
  valueSize: 28,
  valueWeight: 820,

  unitColor: "#8e8e93",
  unitSize: 13,
  unitWeight: 600,

  statDateColor: "rgba(142,142,147,.72)",
  statDateSize: 10,
  statDateMarginTop: 7,

  addIconWrapMarginTop: 18,
  addIconButtonSize: 58,
  addIconButtonBg: "rgba(255,255,255,.82)",
  addIconButtonShadow: "0 10px 34px rgba(0,0,0,.05)",
  addIconSize: 30,
  addIconOpacity: 0.92,

  fieldGap: 12,
  labelColor: "#8e8e93",
  labelSize: 12,
  labelWeight: 700,

  inputBg: "rgba(255,255,255,.76)",
  inputColor: "#111111",
  inputRadius: 18,
  inputPadding: "14px 14px",
  inputBorder: "1px solid rgba(0,0,0,.06)",

  saveBg: "#0a84ff",
  saveColor: "#ffffff",
  cancelBg: "rgba(0,0,0,.06)",
  cancelColor: "#8e8e93",

  buttonRadius: 22,
  buttonPadding: 16,
  buttonWeight: 760,
};

const BABY_BIRTH_DATE = "2026-04-19";

type StatKey = "weightKg" | "heightCm" | "headCm";

function getBabyAgeText() {
  const birth = new Date(`${BABY_BIRTH_DATE}T00:00:00`);
  const today = new Date();

  const todayDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const birthDate = new Date(
    birth.getFullYear(),
    birth.getMonth(),
    birth.getDate()
  );

  const diffDays = Math.max(
    0,
    Math.floor((todayDate.getTime() - birthDate.getTime()) / 86400000)
  );

  const birthDayIndex = diffDays + 1;

  let months =
    (todayDate.getFullYear() - birthDate.getFullYear()) * 12 +
    todayDate.getMonth() -
    birthDate.getMonth();

  if (todayDate.getDate() < birthDate.getDate()) {
    months -= 1;
  }

  const safeMonths = Math.max(0, months);

  const monthAnchor = new Date(
    birthDate.getFullYear(),
    birthDate.getMonth() + safeMonths,
    birthDate.getDate()
  );

  const extraDays = Math.max(
    0,
    Math.floor((todayDate.getTime() - monthAnchor.getTime()) / 86400000)
  );

  const monthAgeText =
    safeMonths > 0
      ? `${safeMonths}月龄${extraDays ? `${extraDays}天` : ""}`
      : `${diffDays}天龄`;

  return `出生${birthDayIndex}天 · ${monthAgeText}`;
}

function todayValue() {
  const date = new Date();

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatDate(dateString?: string) {
  if (!dateString) return "暂无记录";

  const date = new Date(`${dateString}T00:00:00`);
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
}

function textToNumber(value: string) {
  if (!value.trim()) return undefined;

  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
}

function findLatestValueRecord(records: GrowthRecord[], key: StatKey) {
  return [...records]
    .filter((record) => typeof record[key] === "number")
    .sort((a, b) => {
      const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();

      if (dateDiff !== 0) return dateDiff;

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })[0];
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
          color: GROWTH_SHEET.labelColor,
          fontSize: GROWTH_SHEET.labelSize,
          fontWeight: GROWTH_SHEET.labelWeight,
          marginBottom: 6,
        }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}

function StatItem({
  value,
  unit,
  date,
}: {
  value?: number;
  unit: string;
  date?: string;
}) {
  return (
    <div style={{ textAlign: "left" }}>
      <div style={{ whiteSpace: "nowrap" }}>
        <span
          style={{
            color: GROWTH_SHEET.valueColor,
            fontSize: GROWTH_SHEET.valueSize,
            fontWeight: GROWTH_SHEET.valueWeight,
            lineHeight: 1,
          }}
        >
          {typeof value === "number" ? value : "—"}
        </span>

        {typeof value === "number" && (
          <span
            style={{
              marginLeft: 3,
              color: GROWTH_SHEET.unitColor,
              fontSize: GROWTH_SHEET.unitSize,
              fontWeight: GROWTH_SHEET.unitWeight,
            }}
          >
            {unit}
          </span>
        )}
      </div>

      <div
        style={{
          marginTop: GROWTH_SHEET.statDateMarginTop,
          color: GROWTH_SHEET.statDateColor,
          fontSize: GROWTH_SHEET.statDateSize,
          lineHeight: 1,
          whiteSpace: "nowrap",
        }}
      >
        {date ? formatDate(date) : "暂无日期"}
      </div>
    </div>
  );
}

function inputStyle() {
  return {
    width: "100%",
    border: GROWTH_SHEET.inputBorder,
    borderRadius: GROWTH_SHEET.inputRadius,
    padding: GROWTH_SHEET.inputPadding,
    background: GROWTH_SHEET.inputBg,
    color: GROWTH_SHEET.inputColor,
    outline: "none",
  };
}

export default function GrowthSheet({
  records,
  onClose,
  onSave,
}: {
  records: GrowthRecord[];
  onClose: () => void;
  onSave: (record: GrowthRecord) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [date, setDate] = useState(todayValue());
  const [weightKg, setWeightKg] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [headCm, setHeadCm] = useState("");
  const [note, setNote] = useState("");

  const latestWeight = useMemo(
    () => findLatestValueRecord(records, "weightKg"),
    [records]
  );

  const latestHeight = useMemo(
    () => findLatestValueRecord(records, "heightCm"),
    [records]
  );

  const latestHead = useMemo(
    () => findLatestValueRecord(records, "headCm"),
    [records]
  );

  useEffect(() => {
    const oldOverflow = document.body.style.overflow;
    const oldTouchAction = document.body.style.touchAction;

    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";

    return () => {
      document.body.style.overflow = oldOverflow;
      document.body.style.touchAction = oldTouchAction;
    };
  }, []);

  function save() {
    onSave({
      id: crypto.randomUUID(),
      babyId: "yepiaopiao",
      date,
      weightKg: textToNumber(weightKg),
      heightCm: textToNumber(heightCm),
      headCm: textToNumber(headCm),
      note: note.trim() || undefined,
      createdAt: new Date().toISOString(),
    });
  }

  return (
    <div
      className="growth-sheet-backdrop"
      onTouchMove={(e) => e.preventDefault()}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 80,
        background: GROWTH_SHEET.overlayBg,
        backdropFilter: "blur(18px) saturate(120%)",
        WebkitBackdropFilter: "blur(18px) saturate(120%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "22px",
        overscrollBehavior: "contain",
      }}
    >
      <section
        style={{
          width: GROWTH_SHEET.panelWidth,
          maxHeight: "calc(100svh - 44px)",
          overflowY: "auto",
          borderRadius: GROWTH_SHEET.panelRadius,
          background: GROWTH_SHEET.panelBg,
          padding: GROWTH_SHEET.panelPadding,
          boxShadow: GROWTH_SHEET.panelShadow,
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: GROWTH_SHEET.titleMarginBottom,
          }}
        >
          <div
            style={{
              color: GROWTH_SHEET.titleColor,
              fontSize: GROWTH_SHEET.titleSize,
              fontWeight: GROWTH_SHEET.titleWeight,
            }}
          >
            叶票票成长记录
          </div>

          <div
            style={{
              marginTop: GROWTH_SHEET.ageTextMarginTop,
              color: GROWTH_SHEET.ageTextColor,
              fontSize: GROWTH_SHEET.ageTextSize,
              fontWeight: GROWTH_SHEET.ageTextWeight,
            }}
          >
            {getBabyAgeText()}
          </div>
        </div>

        {!adding ? (
          <>
            <section
              style={{
                width: "100%",
                background: GROWTH_SHEET.cardBg,
                borderRadius: GROWTH_SHEET.cardRadius,
                padding: GROWTH_SHEET.cardPadding,
                boxShadow: GROWTH_SHEET.cardShadow,
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: GROWTH_SHEET.statGap,
                  alignItems: "start",
                }}
              >
                <StatItem
                  value={latestHeight?.heightCm}
                  unit="cm"
                  date={latestHeight?.date}
                />

                <StatItem
                  value={latestWeight?.weightKg}
                  unit="kg"
                  date={latestWeight?.date}
                />

                <StatItem
                  value={latestHead?.headCm}
                  unit="cm"
                  date={latestHead?.date}
                />
              </div>
            </section>

            <GrowthCharts records={records} />

            <div
              style={{
                marginTop: GROWTH_SHEET.addIconWrapMarginTop,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <button
                type="button"
                aria-label="新增数据"
                onClick={() => setAdding(true)}
                style={{
                  width: GROWTH_SHEET.addIconButtonSize,
                  height: GROWTH_SHEET.addIconButtonSize,
                  border: 0,
                  borderRadius: 999,
                  background: GROWTH_SHEET.addIconButtonBg,
                  boxShadow: GROWTH_SHEET.addIconButtonShadow,
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
                    width: GROWTH_SHEET.addIconSize,
                    height: GROWTH_SHEET.addIconSize,
                    objectFit: "contain",
                    display: "block",
                    opacity: GROWTH_SHEET.addIconOpacity,
                  }}
                />
              </button>
            </div>

            <div style={{ display: "grid", gap: 10, marginTop: 30 }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  border: 0,
                  borderRadius: GROWTH_SHEET.buttonRadius,
                  padding: GROWTH_SHEET.buttonPadding,
                  background: GROWTH_SHEET.cancelBg,
                  color: GROWTH_SHEET.cancelColor,
                  fontWeight: GROWTH_SHEET.buttonWeight,
                }}
              >
                关闭
              </button>
            </div>
          </>
        ) : (
          <>
            <div
              style={{
                display: "grid",
                gap: GROWTH_SHEET.fieldGap,
              }}
            >
              <Field label="日期">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  style={inputStyle()}
                />
              </Field>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 10,
                }}
              >
                <Field label="身高 cm">
                  <input
                    inputMode="decimal"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                    style={inputStyle()}
                  />
                </Field>

                <Field label="体重 kg">
                  <input
                    inputMode="decimal"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    style={inputStyle()}
                  />
                </Field>

                <Field label="头围 cm">
                  <input
                    inputMode="decimal"
                    value={headCm}
                    onChange={(e) => setHeadCm(e.target.value)}
                    style={inputStyle()}
                  />
                </Field>
              </div>

              <Field label="备注">
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  style={inputStyle()}
                  placeholder="可不填"
                />
              </Field>
            </div>

            <div style={{ display: "grid", gap: 10, marginTop: 18 }}>
              <button
                type="button"
                onClick={save}
                style={{
                  border: 0,
                  borderRadius: GROWTH_SHEET.buttonRadius,
                  padding: GROWTH_SHEET.buttonPadding,
                  background: GROWTH_SHEET.saveBg,
                  color: GROWTH_SHEET.saveColor,
                  fontWeight: GROWTH_SHEET.buttonWeight,
                }}
              >
                保存记录
              </button>

              <button
                type="button"
                onClick={() => setAdding(false)}
                style={{
                  border: 0,
                  borderRadius: GROWTH_SHEET.buttonRadius,
                  padding: GROWTH_SHEET.buttonPadding,
                  background: GROWTH_SHEET.cancelBg,
                  color: GROWTH_SHEET.cancelColor,
                  fontWeight: GROWTH_SHEET.buttonWeight,
                }}
              >
                返回
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}