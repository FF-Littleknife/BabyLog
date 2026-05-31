import { useRef } from "react";
import type { BabyRecord, RecordType } from "@/lib/types";

type SheetMode = "quick" | "full";

const QUICK_ACTIONS = {
  margin: "18px 0 28px", // 快捷操作区整体外边距；上 18px，左右 0，下 28px
  columns: 4, // 快捷按钮列数；现在是一行 4 个
  gap: 18, // 按钮之间的横向/纵向间距 px

  buttonSize: 88, // 单个圆形按钮尺寸 px
  buttonBg: "rgba(255, 255, 255, 0.86)", // 按钮默认背景色；最后一位是透明度
  buttonActiveBg: "rgba(255, 255, 255, 0.98)", // 按钮按下/激活时背景色
  buttonRadius: 999, // 按钮圆角；999 表示完全圆形
  buttonShadow: "0 10px 34px rgba(0,0,0,.05)", // 按钮阴影

  iconSize: 30, // 按钮图标尺寸 px
  iconMarginBottom: 9, // 图标和文字之间的距离 px

  titleColor: "#111111", // 按钮文字颜色
  titleSize: 14, // 按钮文字字号 px
  titleWeight: 760, // 按钮文字字重；越大越粗
  titleLetterSpacing: "-0.03em", // 按钮文字字距；负值会让字更紧凑

  disabledOpacity: 0.48, // 禁用状态透明度；越小越淡
  doubleClickDelay: 240, // 双击/连点识别间隔，单位毫秒
};

const QUICK_ITEMS: {
  title: string;
  icon: string;
  type: RecordType;
  mode?: SheetMode;
  doubleQuickAdd?: boolean;
}[] = [
  {
    title: "哺乳",
    icon: "/feed.svg",
    type: "breast",
  },
  {
    title: "瓶喂",
    icon: "/bottle.svg",
    type: "bottle_breast",
    mode: "quick",
  },
  {
    title: "奶粉",
    icon: "/formula.svg",
    type: "formula",
    mode: "quick",
  },
  {
    title: "泵奶",
    icon: "/pump.svg",
    type: "pump",
    mode: "full",
  },
  {
    title: "大便",
    icon: "/poop.svg",
    type: "poop",
    mode: "full",
    doubleQuickAdd: true,
  },
  {
    title: "小便",
    icon: "/pee.svg",
    type: "pee",
    mode: "full",
    doubleQuickAdd: true,
  },
  {
    title: "其他",
    icon: "/add.svg",
    type: "other",
    mode: "full",
  },
];

type QuickCircleProps = {
  title: string;
  icon: string;
  onClick: () => void;
  onDoubleClick?: () => void;
  disabled?: boolean;
};

function QuickCircle({
  title,
  icon,
  onClick,
  onDoubleClick,
  disabled,
}: QuickCircleProps) {
  const clickTimerRef = useRef<number | null>(null);

  function clearClickTimer() {
    if (clickTimerRef.current) {
      window.clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
    }
  }

  function handleClick() {
    if (disabled) return;

    if (!onDoubleClick) {
      onClick();
      return;
    }

    if (clickTimerRef.current) {
      clearClickTimer();
      onDoubleClick();
      return;
    }

    clickTimerRef.current = window.setTimeout(() => {
      clickTimerRef.current = null;
      onClick();
    }, QUICK_ACTIONS.doubleClickDelay);
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onPointerDown={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = QUICK_ACTIONS.buttonActiveBg;
        }
      }}
      onPointerUp={(e) => {
        e.currentTarget.style.background = QUICK_ACTIONS.buttonBg;
      }}
      onPointerCancel={(e) => {
        e.currentTarget.style.background = QUICK_ACTIONS.buttonBg;
      }}
      onPointerLeave={(e) => {
        e.currentTarget.style.background = QUICK_ACTIONS.buttonBg;
      }}
      onClick={handleClick}
      onContextMenu={(e) => e.preventDefault()}
      style={{
        width: QUICK_ACTIONS.buttonSize,
        height: QUICK_ACTIONS.buttonSize,
        minWidth: QUICK_ACTIONS.buttonSize,
        minHeight: QUICK_ACTIONS.buttonSize,
        border: 0,
        borderRadius: QUICK_ACTIONS.buttonRadius,
        background: QUICK_ACTIONS.buttonBg,
        boxShadow: QUICK_ACTIONS.buttonShadow,
        color: QUICK_ACTIONS.titleColor,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        opacity: disabled ? QUICK_ACTIONS.disabledOpacity : 1,
        userSelect: "none",
        WebkitUserSelect: "none",
        WebkitTouchCallout: "none",
      }}
    >
      <img
        src={icon}
        alt=""
        style={{
          width: QUICK_ACTIONS.iconSize,
          height: QUICK_ACTIONS.iconSize,
          objectFit: "contain",
          display: "block",
          marginBottom: QUICK_ACTIONS.iconMarginBottom,
        }}
      />

      <div
        style={{
          color: QUICK_ACTIONS.titleColor,
          fontSize: QUICK_ACTIONS.titleSize,
          fontWeight: QUICK_ACTIONS.titleWeight,
          letterSpacing: QUICK_ACTIONS.titleLetterSpacing,
          lineHeight: 1,
        }}
      >
        {title}
      </div>
    </button>
  );
}

export default function QuickActions({
  onOpen,
  onQuickAdd,
}: {
  records: BabyRecord[];
  onOpen: (type: RecordType, mode?: SheetMode) => void;
  onQuickAdd: (type: RecordType) => void;
  onSave: (record: BabyRecord) => void;
  onNurse: () => void;
}) {
  return (
    <section
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${QUICK_ACTIONS.columns}, ${QUICK_ACTIONS.buttonSize}px)`,
        gap: QUICK_ACTIONS.gap,
        margin: QUICK_ACTIONS.margin,
        justifyContent: "center",
      }}
    >
      {QUICK_ITEMS.map((item) => (
        <QuickCircle
          key={item.type}
          title={item.title}
          icon={item.icon}
          onClick={() => onOpen(item.type, item.mode)}
          onDoubleClick={
            item.doubleQuickAdd ? () => onQuickAdd(item.type) : undefined
          }
        />
      ))}
    </section>
  );
}