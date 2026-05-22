import type { StatusCardConfig } from "./statusCardConfig";

const STATUS_VALUE_STYLE = {
  unitSize: 13,
  unitColor: "#8e8e93",
  unitWeight: 500,
  unitMarginLeft: 3,
  groupGap: 6,

  timeColor: "#8e8e93",
  timeSize: 12,
  timeWeight: 500,

  arrowSize: 7,
  arrowColor: "#8e8e93",
  arrowBorderWidth: 1.5,
  arrowMarginLeft: 7,
};

function NumberPart({
  children,
  config,
}: {
  children: string;
  config: StatusCardConfig;
}) {
  return (
    <span
      style={{
        display: "inline",
        color: config.valueColor,
        fontSize: config.valueSize,
        fontWeight: config.valueWeight,
        letterSpacing: config.valueLetterSpacing,
        lineHeight: 1,
      }}
    >
      {children}
    </span>
  );
}

function UnitPart({ children }: { children: string }) {
  return (
    <span
      style={{
        display: "inline",
        marginLeft: STATUS_VALUE_STYLE.unitMarginLeft,
        color: STATUS_VALUE_STYLE.unitColor,
        fontSize: STATUS_VALUE_STYLE.unitSize,
        fontWeight: STATUS_VALUE_STYLE.unitWeight,
        lineHeight: 1,
      }}
    >
      {children}
    </span>
  );
}

function RightArrow() {
  return (
    <span
      aria-hidden
      style={{
        width: STATUS_VALUE_STYLE.arrowSize,
        height: STATUS_VALUE_STYLE.arrowSize,
        borderTop: `${STATUS_VALUE_STYLE.arrowBorderWidth}px solid ${STATUS_VALUE_STYLE.arrowColor}`,
        borderRight: `${STATUS_VALUE_STYLE.arrowBorderWidth}px solid ${STATUS_VALUE_STYLE.arrowColor}`,
        transform: "rotate(45deg)",
        marginLeft: STATUS_VALUE_STYLE.arrowMarginLeft,
        flexShrink: 0,
      }}
    />
  );
}

function renderValue(value: string, config: StatusCardConfig) {
  if (value === "刚刚") {
    return (
      <span
        style={{
          color: config.valueColor,
          fontSize: config.valueSize,
          fontWeight: config.valueWeight,
          letterSpacing: config.valueLetterSpacing,
          lineHeight: 1,
          whiteSpace: "nowrap",
        }}
      >
        刚刚
      </span>
    );
  }

  const hourMatch = value.match(/^(\d+)小时(?:(\d+)分钟)?前$/);

  if (hourMatch) {
    const hours = hourMatch[1];
    const minutes = hourMatch[2];

    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "baseline",
          whiteSpace: "nowrap",
          flexWrap: "nowrap",
          lineHeight: 1,
        }}
      >
        <NumberPart config={config}>{hours}</NumberPart>
        <UnitPart>小时</UnitPart>

        {minutes && (
          <>
            <span
              style={{
                display: "inline-block",
                width: STATUS_VALUE_STYLE.groupGap,
              }}
            />
            <NumberPart config={config}>{minutes}</NumberPart>
            <UnitPart>分钟前</UnitPart>
          </>
        )}

        {!minutes && <UnitPart>前</UnitPart>}
      </span>
    );
  }

  const minuteMatch = value.match(/^(\d+)分钟前$/);

  if (minuteMatch) {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "baseline",
          whiteSpace: "nowrap",
          flexWrap: "nowrap",
          lineHeight: 1,
        }}
      >
        <NumberPart config={config}>{minuteMatch[1]}</NumberPart>
        <UnitPart>分钟前</UnitPart>
      </span>
    );
  }

  return (
    <span
      style={{
        color: config.valueColor,
        fontSize: config.valueSize,
        fontWeight: config.valueWeight,
        letterSpacing: config.valueLetterSpacing,
        lineHeight: 1,
        whiteSpace: "nowrap",
      }}
    >
      {value}
    </span>
  );
}

export default function StatusCard({
  config,
  value,
  lastTime,
  onClick,
}: {
  config: StatusCardConfig;
  value: string;
  lastTime?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`status-hero ${config.className}`}
      style={{
        minHeight: config.height,
        border: 0,
        borderRadius: config.radius,
        padding: `${config.paddingY}px ${config.paddingX}px`,
        background: config.background,
        boxShadow: config.shadow,

        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        textAlign: "left",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            minWidth: 0,
          }}
        >
          <img
            src={config.icon}
            alt=""
            style={{
              width: config.iconSize,
              height: config.iconSize,
              objectFit: "contain",
              display: "block",
              opacity: config.iconOpacity,
              flexShrink: 0,
            }}
          />

          <span
            style={{
              color: config.labelColor,
              fontSize: config.labelSize,
              fontWeight: config.labelWeight,
              letterSpacing: config.labelLetterSpacing,
              lineHeight: 1,
              whiteSpace: "nowrap",
            }}
          >
            {config.label}
          </span>
        </div>

        <span
          style={{
            display: "flex",
            alignItems: "center",
            lineHeight: 1,
            whiteSpace: "nowrap",
          }}
        >
          {lastTime && (
            <span
              style={{
                color: STATUS_VALUE_STYLE.timeColor,
                fontSize: STATUS_VALUE_STYLE.timeSize,
                fontWeight: STATUS_VALUE_STYLE.timeWeight,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {lastTime}
            </span>
          )}

          <RightArrow />
        </span>
      </div>

      <div
        style={{
          display: "block",
          width: "100%",
          overflow: "visible",
          whiteSpace: "nowrap",
        }}
      >
        {renderValue(value, config)}
      </div>
    </button>
  );
}