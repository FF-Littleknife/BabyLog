export type TimelineFilterKey = "feed" | "poop" | "pee" | "pump";

const FILTER_BAR = {
  paddingX: 26,
  columns: 5,
  gap: 8,

  buttonHeight: 50,
  buttonBg: "var(--surface-soft)",
  buttonActiveBg: "var(--surface-strong)",
  buttonRadius: 999,
  buttonShadow: "var(--shadow-soft)",

  inactiveOpacity: 0.46,
  inactiveColor: "var(--muted)",

  titleSize: 13,
  titleWeight: 760,
  titleLetterSpacing: "-0.03em",

  allColor: "var(--blue)",
  feedColor: "var(--feed-label-color)",
  poopColor: "var(--poop-label-color)",
  peeColor: "var(--pee-label-color)",
  pumpColor: "var(--pump-label-color)",
};

const FILTER_ITEMS: {
  key: "all" | TimelineFilterKey;
  title: string;
  color: string;
}[] = [
  { key: "all", title: "ALL", color: FILTER_BAR.allColor },
  { key: "feed", title: "喂养", color: FILTER_BAR.feedColor },
  { key: "poop", title: "大便", color: FILTER_BAR.poopColor },
  { key: "pee", title: "小便", color: FILTER_BAR.peeColor },
  { key: "pump", title: "泵奶", color: FILTER_BAR.pumpColor },
];

export default function TimelineFilterBar({
  selectedKeys,
  onChange,
}: {
  selectedKeys: TimelineFilterKey[];
  onChange: (keys: TimelineFilterKey[]) => void;
}) {
  const isAll = selectedKeys.length === 0;

  function toggle(key: "all" | TimelineFilterKey) {
    if (key === "all") {
      onChange([]);
      return;
    }

    if (selectedKeys.includes(key)) {
      onChange(selectedKeys.filter((item) => item !== key));
      return;
    }

    onChange([...selectedKeys, key]);
  }

  return (
    <section
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${FILTER_BAR.columns}, minmax(0, 1fr))`,
        gap: FILTER_BAR.gap,
        paddingInline: FILTER_BAR.paddingX,
      }}
    >
      {FILTER_ITEMS.map((item) => {
        const active =
          item.key === "all" ? isAll : selectedKeys.includes(item.key);

        return (
          <button
            key={item.key}
            type="button"
            onClick={() => toggle(item.key)}
            style={{
              height: FILTER_BAR.buttonHeight,
              border: 0,
              borderRadius: FILTER_BAR.buttonRadius,
              background: active
                ? FILTER_BAR.buttonActiveBg
                : FILTER_BAR.buttonBg,
              boxShadow: FILTER_BAR.buttonShadow,
              opacity: active ? 1 : FILTER_BAR.inactiveOpacity,
              color: active ? item.color : FILTER_BAR.inactiveColor,
              fontSize: FILTER_BAR.titleSize,
              fontWeight: FILTER_BAR.titleWeight,
              letterSpacing: FILTER_BAR.titleLetterSpacing,
              WebkitTapHighlightColor: "transparent",
            }}
          >
            {item.title}
          </button>
        );
      })}
    </section>
  );
}