"use client";

import { useRef } from "react";
import type { BabyRecord, RecordType } from "@/lib/types";

type SheetMode = "quick" | "full";

const QUICK_ACTIONS = {
  margin: "18px 0 28px",
  columns: 4,

  // 响应式尺寸：小屏自动缩，大屏保持原来的 88px
  gap: "clamp(8px, 3vw, 18px)",
  buttonSize: "clamp(72px, 20vw, 88px)",

  buttonBg: "var(--glass-bg)",
  buttonActiveBg: "var(--surface-strong)",
  buttonRadius: 999,
  buttonShadow: "var(--shadow-card)",

  iconSize: "clamp(25px, 7vw, 30px)",
  iconMarginBottom: "clamp(7px, 2vw, 9px)",

  titleColor: "var(--text)",
  titleSize: "clamp(12px, 3.4vw, 14px)",
  titleWeight: 760,
  titleLetterSpacing: "-0.03em",

  disabledOpacity: 0.48,
  doubleClickDelay: 240,
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

  function setButtonBg(
    event: React.PointerEvent<HTMLButtonElement>,
    background: string
  ) {
    event.currentTarget.style.background = background;
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onPointerDown={(event) => {
        if (!disabled) {
          setButtonBg(event, QUICK_ACTIONS.buttonActiveBg);
        }
      }}
      onPointerUp={(event) => {
        setButtonBg(event, QUICK_ACTIONS.buttonBg);
      }}
      onPointerCancel={(event) => {
        setButtonBg(event, QUICK_ACTIONS.buttonBg);
      }}
      onPointerLeave={(event) => {
        setButtonBg(event, QUICK_ACTIONS.buttonBg);
      }}
      onClick={handleClick}
      onContextMenu={(event) => event.preventDefault()}
      style={{
        width: QUICK_ACTIONS.buttonSize,
        height: QUICK_ACTIONS.buttonSize,
        minWidth: 0,
        minHeight: 0,
        maxWidth: "100%",
        maxHeight: "100%",
        aspectRatio: "1 / 1",

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
        WebkitTapHighlightColor: "transparent",

        transition:
          "background .16s ease, box-shadow .16s ease, transform .16s ease",
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
          whiteSpace: "nowrap",
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
        width: "100%",
        minWidth: 0,
        maxWidth: "100%",
        display: "grid",
        gridTemplateColumns: `repeat(${QUICK_ACTIONS.columns}, minmax(0, 1fr))`,
        gap: QUICK_ACTIONS.gap,
        margin: QUICK_ACTIONS.margin,
        justifyItems: "center",
        alignItems: "center",
        overflow: "visible",
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