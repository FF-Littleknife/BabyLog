import type { GrowthRecord } from "@/lib/growthApi";

const GROWTH_CARD = {
  margin: "0 0 18px",

  bg: "rgba(255, 255, 255, 0.88)",
  radius: 30,
  padding: "18px 22px",
  shadow: "0 10px 34px rgba(0,0,0,.05)",

  titleColor: "#0a84ff",
  titleSize: 12,
  titleWeight: 760,

  dateColor: "#8e8e93",
  dateSize: 12,
  dateWeight: 500,

  statGap: 18,

  labelColor: "#8e8e93",
  labelSize: 11,
  labelWeight: 700,

  valueColor: "#111111",
  valueSize: 24,
  valueWeight: 780,

  unitColor: "#8e8e93",
  unitSize: 12,
  unitWeight: 600,

  emptyColor: "#8e8e93",
  emptySize: 13,
};

function formatDate(dateString?: string) {
  if (!dateString) return "暂无记录";

  const date = new Date(`${dateString}T00:00:00`);

  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
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
          color: GROWTH_CARD.labelColor,
          fontSize: GROWTH_CARD.labelSize,
          fontWeight: GROWTH_CARD.labelWeight,
          marginBottom: 6,
        }}
      >
        {label}
      </div>

      {typeof value === "number" ? (
        <div style={{ whiteSpace: "nowrap" }}>
          <span
            style={{
              color: GROWTH_CARD.valueColor,
              fontSize: GROWTH_CARD.valueSize,
              fontWeight: GROWTH_CARD.valueWeight,
              lineHeight: 1,
            }}
          >
            {value}
          </span>

          <span
            style={{
              marginLeft: 3,
              color: GROWTH_CARD.unitColor,
              fontSize: GROWTH_CARD.unitSize,
              fontWeight: GROWTH_CARD.unitWeight,
            }}
          >
            {unit}
          </span>
        </div>
      ) : (
        <div
          style={{
            color: GROWTH_CARD.emptyColor,
            fontSize: GROWTH_CARD.emptySize,
          }}
        >
          —
        </div>
      )}
    </div>
  );
}

export default function GrowthCard({
  latest,
  onClick,
}: {
  latest?: GrowthRecord;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        margin: GROWTH_CARD.margin,
        border: 0,
        borderRadius: GROWTH_CARD.radius,
        padding: GROWTH_CARD.padding,
        background: GROWTH_CARD.bg,
        boxShadow: GROWTH_CARD.shadow,
        textAlign: "left",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 22,
        }}
      >
        <div
          style={{
            color: GROWTH_CARD.titleColor,
            fontSize: GROWTH_CARD.titleSize,
            fontWeight: GROWTH_CARD.titleWeight,
          }}
        >
          生长记录
        </div>

        <div
          style={{
            color: GROWTH_CARD.dateColor,
            fontSize: GROWTH_CARD.dateSize,
            fontWeight: GROWTH_CARD.dateWeight,
          }}
        >
          {formatDate(latest?.date)}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: GROWTH_CARD.statGap,
        }}
      >
        <StatItem label="体重" value={latest?.weightKg} unit="kg" />
        <StatItem label="身高" value={latest?.heightCm} unit="cm" />
        <StatItem label="头围" value={latest?.headCm} unit="cm" />
      </div>
    </button>
  );
}