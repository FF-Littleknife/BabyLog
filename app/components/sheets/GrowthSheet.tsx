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

  overlayBg: "rgba(244,241,246,.36)", // 整个页面遮罩颜色。越大越白，越小越透
  overlayBlur: "blur(18px) saturate(120%)", // 背景模糊强度和饱和度
  overlayPadding: "10px", // 弹窗距离屏幕边缘的安全距离，小手机别太大

  /* =========================
     内容容器
     注意：这里现在是透明的，不显示大外框
     只作为内容排版和滚动区域
     ========================= */

  panelWidth: "min(calc(100% - 20px), 410px)", // 整个成长记录内容宽度
  panelMaxHeight: "calc(100svh - 20px)", // 最大高度，超过后内部滚动
  panelRadius: 0, // 大容器圆角。当前透明，所以一般不用调
  panelBg: "transparent", // 大容器背景。保持 transparent 就是不要大外框
  panelPadding: "12px", // 内容整体内边距
  panelShadow: "none", // 大容器阴影。当前不要大框，所以为 none

  /* =========================
     主标题
     ========================= */

  titleText: "叶票票成长记录", // 主标题文字
  titleColor: "#111111", // 主标题颜色
  titleSize: 20, // 主标题字号
  titleWeight: 820, // 主标题字重
  titleMarginBottom: 12, // 标题区和下方数据卡之间的距离

  /* =========================
     出生天数 / 月龄文字
     ========================= */

  ageTextColor: "#8e8e93", // 出生天数文字颜色
  ageTextSize: 12, // 出生天数文字字号
  ageTextWeight: 400, // 出生天数文字字重
  ageTextMarginTop: 0, // 主标题和出生天数之间的距离

  /* =========================
     顶部三项最新数据卡片
     ========================= */

  cardBg: "rgba(255,255,255,.82)", // 白色卡片背景
  cardRadius: 28, // 白色卡片圆角
  cardPadding: "20px 16px 18px", // 白色卡片内边距
  cardShadow: "0 10px 34px rgba(0,0,0,.05)", // 白色卡片阴影

  statGap: 10, // 身高 / 体重 / 头围三列之间的距离

  valueColor: "#111111", // 数值颜色
  valueSize: 28, // 数值字号
  valueWeight: 820, // 数值字重

  unitColor: "#8e8e93", // 单位颜色
  unitSize: 13, // 单位字号
  unitWeight: 600, // 单位字重
  unitMarginLeft: 3, // 数值和单位之间的距离

  statDateColor: "rgba(142,142,147,.72)", // 日期颜色
  statDateSize: 10, // 日期字号
  statDateMarginTop: 7, // 数值和日期之间的距离

  /* =========================
     底部圆形操作按钮
     ========================= */

  actionRowMarginTop: 22, // 曲线卡片和按钮区之间的距离
  actionRowGap: 18, // 加号按钮和关闭按钮之间的距离

  iconButtonSize: 58, // 圆形按钮尺寸
  iconButtonBg: "rgba(255,255,255,.82)", // 圆形按钮背景
  iconButtonShadow: "0 10px 34px rgba(0,0,0,.05)", // 圆形按钮阴影

  addIcon: "/add.svg", // 新增按钮图标
  addIconSize: 30, // 新增按钮图标尺寸
  addIconOpacity: 1, // 新增按钮图标透明度，1 = 100%

  closeIcon: "/delete.svg", // 关闭按钮图标
  closeIconSize: 26, // 关闭按钮图标尺寸
  closeIconOpacity: 1, // 关闭按钮图标透明度，1 = 100%

  /* =========================
     新增数据表单卡片
     ========================= */

  fieldGap: 12, // 表单字段之间的距离

  labelColor: "#8e8e93", // 表单 label 颜色
  labelSize: 12, // 表单 label 字号
  labelWeight: 700, // 表单 label 字重
  labelMarginBottom: 6, // label 和输入框之间的距离

  inputBg: "rgba(255,255,255,.76)", // 输入框背景
  inputColor: "#111111", // 输入文字颜色
  inputRadius: 18, // 输入框圆角
  inputPadding: "14px 14px", // 输入框内边距
  inputBorder: "1px solid rgba(0,0,0,.06)", // 输入框边框

  formGridGap: 10, // 身高/体重/头围三个输入框之间的距离

  /* =========================
     新增数据表单按钮
     ========================= */

  formButtonGap: 10, // 保存 / 返回按钮之间的距离
  formButtonMarginTop: 18, // 表单和按钮之间的距离

  saveBg: "#0a84ff", // 保存按钮背景
  saveColor: "#ffffff", // 保存按钮文字颜色

  cancelBg: "rgba(255,255,255,.72)", // 返回按钮背景
  cancelColor: "#8e8e93", // 返回按钮文字颜色

  buttonRadius: 22, // 保存/返回按钮圆角
  buttonPadding: 16, // 保存/返回按钮内边距
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
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          display: "flex",
          alignItems: "baseline",
          justifyContent: "center",
          whiteSpace: "nowrap",
        }}
      >
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
              marginLeft: GROWTH_SHEET.unitMarginLeft,
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
          width: "100%",
          marginTop: GROWTH_SHEET.statDateMarginTop,
          color: GROWTH_SHEET.statDateColor,
          fontSize: GROWTH_SHEET.statDateSize,
          lineHeight: 1,
          whiteSpace: "nowrap",
          textAlign: "center",
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
    minWidth: 0,
    maxWidth: "100%",
    border: GROWTH_SHEET.inputBorder,
    borderRadius: GROWTH_SHEET.inputRadius,
    padding: GROWTH_SHEET.inputPadding,
    background: GROWTH_SHEET.inputBg,
    backgroundColor: GROWTH_SHEET.inputBg,
    color: GROWTH_SHEET.inputColor,
    colorScheme: "light",
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

  return (
    <div
      className="growth-sheet-backdrop"
      onTouchMove={(event) => {
        const target = event.target as HTMLElement | null;

        if (target?.closest(".ios-wheel")) return;
        if (target?.closest(".date-field-overlay")) return;
        if (target?.closest(".growth-sheet-panel")) return;

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
      }}
    >
      <style jsx>{`
        .growth-sheet-panel {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .growth-sheet-panel::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
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
          <>
            <section
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

            <GrowthCharts records={records} />

            <div
              style={{
                marginTop: GROWTH_SHEET.actionRowMarginTop,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: GROWTH_SHEET.actionRowGap,
              }}
            >
              <CircleIconButton
                label="新增数据"
                icon={GROWTH_SHEET.addIcon}
                iconSize={GROWTH_SHEET.addIconSize}
                iconOpacity={GROWTH_SHEET.addIconOpacity}
                onClick={() => setAdding(true)}
              />

              <CircleIconButton
                label="关闭"
                icon={GROWTH_SHEET.closeIcon}
                iconSize={GROWTH_SHEET.closeIconSize}
                iconOpacity={GROWTH_SHEET.closeIconOpacity}
                onClick={onClose}
              />
            </div>
          </>
        ) : (
          <>
            <div
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
                onClick={save}
                style={{
                  border: 0,
                  borderRadius: GROWTH_SHEET.buttonRadius,
                  padding: GROWTH_SHEET.buttonPadding,
                  background: GROWTH_SHEET.saveBg,
                  color: GROWTH_SHEET.saveColor,
                  fontWeight: GROWTH_SHEET.buttonWeight,
                  boxShadow: GROWTH_SHEET.cardShadow,
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
                  boxShadow: GROWTH_SHEET.cardShadow,
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