"use client";

import { useEffect, useState } from "react";
import type { GrowthRecord } from "@/lib/growthApi";

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

  subColor: "#8e8e93",
  subSize: 13,

  cardBg: "rgba(255,255,255,.82)",
  cardRadius: 28,
  cardPadding: "18px 20px",
  cardShadow: "0 10px 34px rgba(0,0,0,.05)",

  statGap: 16,
  labelColor: "#8e8e93",
  labelSize: 12,
  labelWeight: 700,

  valueColor: "#111111",
  valueSize: 28,
  valueWeight: 820,

  unitColor: "#8e8e93",
  unitSize: 13,
  unitWeight: 600,

  fieldGap: 12,

  inputBg: "rgba(255,255,255,.76)",
  inputColor: "#111111",
  inputRadius: 18,
  inputPadding: "14px 14px",
  inputBorder: "1px solid rgba(0,0,0,.06)",

  saveBg: "#0a84ff",
  saveColor: "#ffffff",
  addBg: "#0a84ff",
  addColor: "#ffffff",
  cancelBg: "rgba(0,0,0,.06)",
  cancelColor: "#8e8e93",

  buttonRadius: 22,
  buttonPadding: 16,
  buttonWeight: 760,
};

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
  label,
  value,
  unit,
}: {
  label: string;
  value?: number;
  unit: string;
}) {
  return (
    <div>
      <div
        style={{
          color: GROWTH_SHEET.labelColor,
          fontSize: GROWTH_SHEET.labelSize,
          fontWeight: GROWTH_SHEET.labelWeight,
          marginBottom: 7,
        }}
      >
        {label}
      </div>

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
  latest,
  onClose,
  onSave,
}: {
  latest?: GrowthRecord;
  onClose: () => void;
  onSave: (record: GrowthRecord) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [date, setDate] = useState(todayValue());
  const [weightKg, setWeightKg] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [headCm, setHeadCm] = useState("");
  const [note, setNote] = useState("");

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
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 14,
            marginBottom: 20,
          }}
        >
          <div>
            <div
              style={{
                color: GROWTH_SHEET.titleColor,
                fontSize: GROWTH_SHEET.titleSize,
                fontWeight: GROWTH_SHEET.titleWeight,
              }}
            >
              体测数据
            </div>

            <div
              style={{
                color: GROWTH_SHEET.subColor,
                fontSize: GROWTH_SHEET.subSize,
                marginTop: 5,
              }}
            >
              最新记录：{formatDate(latest?.date)}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              width: 42,
              height: 42,
              border: 0,
              borderRadius: 999,
              background: "rgba(0,0,0,.06)",
              color: "#8e8e93",
              fontSize: 24,
              lineHeight: 1,
              flexShrink: 0,
            }}
          >
            ×
          </button>
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
                }}
              >
                <StatItem label="体重" value={latest?.weightKg} unit="kg" />
                <StatItem label="身高" value={latest?.heightCm} unit="cm" />
                <StatItem label="头围" value={latest?.headCm} unit="cm" />
              </div>
            </section>

            <div style={{ display: "grid", gap: 10, marginTop: 18 }}>
              <button
                type="button"
                onClick={() => setAdding(true)}
                style={{
                  border: 0,
                  borderRadius: GROWTH_SHEET.buttonRadius,
                  padding: GROWTH_SHEET.buttonPadding,
                  background: GROWTH_SHEET.addBg,
                  color: GROWTH_SHEET.addColor,
                  fontWeight: GROWTH_SHEET.buttonWeight,
                }}
              >
                新增数据
              </button>

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
                <Field label="体重 kg">
                  <input
                    inputMode="decimal"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    style={inputStyle()}
                  />
                </Field>

                <Field label="身高 cm">
                  <input
                    inputMode="decimal"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
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