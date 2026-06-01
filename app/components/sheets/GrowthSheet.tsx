"use client";

import { useEffect, useMemo, useState } from "react";
import type { GrowthRecord } from "@/lib/growthApi";
import DateField from "@/app/components/DateField";
import GrowthCharts from "@/app/components/GrowthCharts";

/**
 * 成长记录弹窗参数
 * 后面想调背景、标题、卡片、按钮、输入框、间距、字号，优先改这里。
 */
const GROWTH_SHEET = {
  /* =========================
     整体遮罩 / 背景毛玻璃
     ========================= */

  overlayBg: "var(--surface-overlay)",
  overlayBlur: "blur(18px) saturate(120%)",
  overlayPadding: "10px",

  overlayEnterMs: 130,
  overlayEnterEasing: "ease-out",

  /* =========================
     内容容器
     ========================= */

  panelWidth: "min(calc(100% - 20px), 410px)",
  panelMaxHeight: "calc(100svh - 20px)",
  panelRadius: 0,
  panelBg: "transparent",
  panelPadding: "12px",
  panelShadow: "none",

  panelEnterMs: 170,
  panelEnterEasing: "cubic-bezier(0.16, 1, 0.3, 1)",
  panelEnterMoveY: 8,

  contentEnterMs: 150,
  contentEnterEasing: "cubic-bezier(0.16, 1, 0.3, 1)",
  contentEnterMoveY: 6,

  /* =========================
     主标题
     ========================= */

  titleText: "叶票票成长记录",
  titleColor: "var(--text)",
  titleSize: 20,
  titleWeight: 820,
  titleMarginBottom: 12,

  /* =========================
     出生天数 / 月龄文字
     ========================= */

  ageTextColor: "var(--muted)",
  ageTextSize: 12,
  ageTextWeight: 400,
  ageTextMarginTop: 0,

  /* =========================
     顶部三项最新数据卡片
     ========================= */

  cardBg: "var(--glass-bg)",
  cardRadius: 28,
  cardPadding: "20px 16px 18px",
  cardShadow: "var(--shadow-card)",

  statGap: 10,

  valueColor: "var(--text)",
  valueSize: 28,
  valueWeight: 820,

  unitColor: "var(--muted)",
  unitSize: 13,
  unitWeight: 600,
  unitMarginLeft: 3,

  statDateColor: "color-mix(in srgb, var(--muted) 72%, transparent)",
  statDateSize: 10,
  statDateMarginTop: 2,

  statValueRowHeight: 32,
  statDateRowHeight: 12,

  /* =========================
     底部圆形操作按钮
     ========================= */

  actionRowMarginTop: 22,
  actionRowGap: 18,

  iconButtonSize: 58,
  iconButtonBg: "var(--glass-bg)",
  iconButtonShadow: "var(--shadow-card)",
  iconButtonActiveScale: 0.94,
  iconButtonTransition:
    "transform .12s ease, background .18s ease, box-shadow .18s ease",

  addIcon: "/add.svg",
  addIconSize: 30,
  addIconOpacity: 1,

  closeIcon: "/delete.svg",
  closeIconSize: 26,
  closeIconOpacity: 1,

  /* =========================
     新增数据表单卡片
     ========================= */

  fieldGap: 12,

  labelColor: "var(--muted)",
  labelSize: 12,
  labelWeight: 700,
  labelMarginBottom: 6,

  inputBg: "var(--input-bg)",
  inputColor: "var(--input-text)",
  inputRadius: 18,
  inputPadding: "14px 14px",
  inputBorder: "1px solid var(--border)",

  formGridGap: 10,

  /* =========================
     新增数据表单按钮
     ========================= */

  formButtonGap: 10,
  formButtonMarginTop: 18,

  saveBg: "var(--blue)",
  saveColor: "var(--white)",

  cancelBg: "var(--surface-muted)",
  cancelColor: "var(--muted)",

  buttonRadius: 22,
  buttonPadding: 16,
  buttonWeight: 760,
  buttonActiveScale: 0.97,
  buttonTransition:
    "transform .12s ease, background .18s ease, color .18s ease, box-shadow .18s ease",
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
    <div className="field">
      <span
        style={{
          display: "block",
          color: GROWTH_SHEET.labelColor,
          fontSize: GROWTH_SHEET.labelSize,
          fontWeight: GROWTH_SHEET.labelWeight,
          marginBottom: GROWTH_SHEET.labelMarginBottom,
        }}
      >
        {label}
      </span>

      {children}
    </div>
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
    <div
      style={{
        width: "100%",
        minWidth: 0,
        display: "flex",
        justifyContent: "center",
        textAlign: "left",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateRows: `${GROWTH_SHEET.statValueRowHeight}px ${GROWTH_SHEET.statDateRowHeight}px`,
          rowGap: GROWTH_SHEET.statDateMarginTop,
          alignItems: "center",
          justifyItems: "start",
          width: "fit-content",
          maxWidth: "100%",
        }}
      >
        <div
          style={{
            height: GROWTH_SHEET.statValueRowHeight,
            display: "flex",
            alignItems: "baseline",
            justifyContent: "flex-start",
            whiteSpace: "nowrap",
            lineHeight: 1,
          }}
        >
          <span
            style={{
              color: GROWTH_SHEET.valueColor,
              fontSize: GROWTH_SHEET.valueSize,
              fontWeight: GROWTH_SHEET.valueWeight,
              lineHeight: 1,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {typeof value === "number" ? value : "—"}
          </span>

          {typeof value === "number" && (
            <span
              style={{
                marginLeft: GROWTH_SHEET.unitMarginLeft,
                color: GROWTH_SHEET.unitColor,
                fontSize: GROWTH_SHEET.unitSize,
                fontWeight: GROWTH_SHEET.unitWeight,
                lineHeight: 1,
              }}
            >
              {unit}
            </span>
          )}
        </div>

        <div
          style={{
            height: GROWTH_SHEET.statDateRowHeight,
            color: GROWTH_SHEET.statDateColor,
            fontSize: GROWTH_SHEET.statDateSize,
            lineHeight: `${GROWTH_SHEET.statDateRowHeight}px`,
            whiteSpace: "nowrap",
            textAlign: "left",
            overflow: "hidden",
            textOverflow: "ellipsis",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {date ? formatDate(date) : "暂无日期"}
        </div>
      </div>
    </div>
  );
}

function inputStyle() {
  return {
    width: "100%",
    minWidth: 0,
    maxWidth: "100%",
    border: GROWTH_SHEET.inputBorder,
    borderRadius: GROWTH_SHEET.inputRadius,
    padding: GROWTH_SHEET.inputPadding,
    background: GROWTH_SHEET.inputBg,
    backgroundColor: GROWTH_SHEET.inputBg,
    color: GROWTH_SHEET.inputColor,
    colorScheme: "light dark",
    outline: "none",
    boxSizing: "border-box" as const,
    WebkitAppearance: "none" as const,
    appearance: "none" as const,
  };
}

function CircleIconButton({
  label,
  icon,
  iconSize,
  iconOpacity,
  onClick,
}: {
  label: string;
  icon: string;
  iconSize: number;
  iconOpacity: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="growth-icon-button growth-sheet-safe"
      aria-label={label}
      onClick={onClick}
      style={{
        width: GROWTH_SHEET.iconButtonSize,
        height: GROWTH_SHEET.iconButtonSize,
        border: 0,
        borderRadius: 999,
        background: GROWTH_SHEET.iconButtonBg,
        boxShadow: GROWTH_SHEET.iconButtonShadow,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
        WebkitTapHighlightColor: "transparent",
        transition: GROWTH_SHEET.iconButtonTransition,
      }}
    >
      <img
        src={icon}
        alt=""
        style={{
          width: iconSize,
          height: iconSize,
          objectFit: "contain",
          display: "block",
          opacity: iconOpacity,
        }}
      />
    </button>
  );
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

  function handleBackdropPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement | null;

    if (target?.closest(".growth-sheet-safe")) return;
    if (target?.closest(".date-field-overlay")) return;
    if (target?.closest(".ios-wheel")) return;

    onClose();
  }

  return (
    <div
      className="growth-sheet-backdrop"
      onPointerDown={handleBackdropPointerDown}
      onTouchMove={(event) => {
        const target = event.target as HTMLElement | null;

        if (target?.closest(".ios-wheel")) return;
        if (target?.closest(".date-field-overlay")) return;
        if (target?.closest(".growth-sheet-safe")) return;

        event.preventDefault();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 80,
        background: GROWTH_SHEET.overlayBg,
        backdropFilter: GROWTH_SHEET.overlayBlur,
        WebkitBackdropFilter: GROWTH_SHEET.overlayBlur,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: GROWTH_SHEET.overlayPadding,
        overscrollBehavior: "contain",
        boxSizing: "border-box",
        animation: `growthOverlayIn ${GROWTH_SHEET.overlayEnterMs}ms ${GROWTH_SHEET.overlayEnterEasing} both`,
      }}
    >
      <style jsx>{`
        @keyframes growthOverlayIn {
          from {
            opacity: 0;
            backdrop-filter: blur(0px) saturate(100%);
            -webkit-backdrop-filter: blur(0px) saturate(100%);
          }

          to {
            opacity: 1;
            backdrop-filter: ${GROWTH_SHEET.overlayBlur};
            -webkit-backdrop-filter: ${GROWTH_SHEET.overlayBlur};
          }
        }

        @keyframes growthPanelIn {
          from {
            opacity: 0;
            transform: translate3d(0, ${GROWTH_SHEET.panelEnterMoveY}px, 0)
              scale(0.985);
          }

          to {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
        }

        @keyframes growthContentIn {
          from {
            opacity: 0;
            transform: translate3d(0, ${GROWTH_SHEET.contentEnterMoveY}px, 0)
              scale(0.99);
          }

          to {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
        }

        .growth-sheet-panel {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .growth-sheet-panel::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }

        .growth-icon-button:active {
          transform: scale(${GROWTH_SHEET.iconButtonActiveScale});
        }

        .growth-form-button:active {
          transform: scale(${GROWTH_SHEET.buttonActiveScale});
        }
      `}</style>

      <section
        className="growth-sheet-panel"
        style={{
          width: GROWTH_SHEET.panelWidth,
          maxHeight: GROWTH_SHEET.panelMaxHeight,
          overflowY: "auto",
          borderRadius: GROWTH_SHEET.panelRadius,
          background: GROWTH_SHEET.panelBg,
          padding: GROWTH_SHEET.panelPadding,
          boxShadow: GROWTH_SHEET.panelShadow,
          boxSizing: "border-box",
          animation: `growthPanelIn ${GROWTH_SHEET.panelEnterMs}ms ${GROWTH_SHEET.panelEnterEasing} both`,
          willChange: "transform, opacity",
        }}
      >
        <div
          className="growth-sheet-safe"
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
            {GROWTH_SHEET.titleText}
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
          <div
            key="growth-view"
            style={{
              animation: `growthContentIn ${GROWTH_SHEET.contentEnterMs}ms ${GROWTH_SHEET.contentEnterEasing} both`,
              willChange: "transform, opacity",
            }}
          >
            <section
              className="growth-sheet-safe"
              style={{
                width: "100%",
                background: GROWTH_SHEET.cardBg,
                borderRadius: GROWTH_SHEET.cardRadius,
                padding: GROWTH_SHEET.cardPadding,
                boxShadow: GROWTH_SHEET.cardShadow,
                boxSizing: "border-box",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                  gap: GROWTH_SHEET.statGap,
                  alignItems: "start",
                  justifyItems: "stretch",
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

            <div className="growth-sheet-safe">
              <GrowthCharts records={records} />
            </div>

            <div
              style={{
                marginTop: GROWTH_SHEET.actionRowMarginTop,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: GROWTH_SHEET.actionRowGap,
                pointerEvents: "none",
              }}
            >
              <div style={{ pointerEvents: "auto" }}>
                <CircleIconButton
                  label="新增数据"
                  icon={GROWTH_SHEET.addIcon}
                  iconSize={GROWTH_SHEET.addIconSize}
                  iconOpacity={GROWTH_SHEET.addIconOpacity}
                  onClick={() => setAdding(true)}
                />
              </div>

              <div style={{ pointerEvents: "auto" }}>
                <CircleIconButton
                  label="关闭"
                  icon={GROWTH_SHEET.closeIcon}
                  iconSize={GROWTH_SHEET.closeIconSize}
                  iconOpacity={GROWTH_SHEET.closeIconOpacity}
                  onClick={onClose}
                />
              </div>
            </div>
          </div>
        ) : (
          <div
            key="growth-form"
            style={{
              animation: `growthContentIn ${GROWTH_SHEET.contentEnterMs}ms ${GROWTH_SHEET.contentEnterEasing} both`,
              willChange: "transform, opacity",
            }}
          >
            <div
              className="growth-sheet-safe"
              style={{
                display: "grid",
                gap: GROWTH_SHEET.fieldGap,
                background: GROWTH_SHEET.cardBg,
                borderRadius: GROWTH_SHEET.cardRadius,
                padding: GROWTH_SHEET.cardPadding,
                boxShadow: GROWTH_SHEET.cardShadow,
                boxSizing: "border-box",
              }}
            >
              <Field label="日期">
                <DateField
                  value={date}
                  onChange={setDate}
                  inputStyle={inputStyle()}
                />
              </Field>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: GROWTH_SHEET.formGridGap,
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

            <div
              style={{
                display: "grid",
                gap: GROWTH_SHEET.formButtonGap,
                marginTop: GROWTH_SHEET.formButtonMarginTop,
              }}
            >
              <button
                type="button"
                className="growth-form-button growth-sheet-safe"
                onClick={save}
                style={{
                  border: 0,
                  borderRadius: GROWTH_SHEET.buttonRadius,
                  padding: GROWTH_SHEET.buttonPadding,
                  background: GROWTH_SHEET.saveBg,
                  color: GROWTH_SHEET.saveColor,
                  fontWeight: GROWTH_SHEET.buttonWeight,
                  boxShadow: GROWTH_SHEET.cardShadow,
                  transition: GROWTH_SHEET.buttonTransition,
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                保存记录
              </button>

              <button
                type="button"
                className="growth-form-button growth-sheet-safe"
                onClick={() => setAdding(false)}
                style={{
                  border: 0,
                  borderRadius: GROWTH_SHEET.buttonRadius,
                  padding: GROWTH_SHEET.buttonPadding,
                  background: GROWTH_SHEET.cancelBg,
                  color: GROWTH_SHEET.cancelColor,
                  fontWeight: GROWTH_SHEET.buttonWeight,
                  boxShadow: GROWTH_SHEET.cardShadow,
                  transition: GROWTH_SHEET.buttonTransition,
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                返回
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}