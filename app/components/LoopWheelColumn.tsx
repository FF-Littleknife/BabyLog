import { useEffect, useMemo, useRef } from "react";

export type LoopWheelColumnConfig = {
  wheelHeight: number;
  wheelItemHeight: number;
  wheelRadius: number;
  wheelBg: string;
  wheelMaskBg: string;
  wheelMaskBorder: string;
  wheelTextColor: string;
  wheelActiveColor: string;
  wheelTextSize: number;
  wheelActiveSize: number;
  wheelTextWeight: number;
  wheelActiveWeight: number;

  wheelLoopCycles?: number;
  wheelRecenterDelay?: number;
};

const WHEEL_MASK = {
  insetX: 6,
  radiusReduce: 4,
};

const SCROLL = {
  snapDelay: 90,
  recenterDelay: 260,
};

function pad2(v: number) {
  return String(v).padStart(2, "0");
}

function positiveModulo(value: number, divisor: number) {
  return ((value % divisor) + divisor) % divisor;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export default function LoopWheelColumn({
  value,
  max,
  onChange,
  config,
  formatLabel,
}: {
  value: number;
  max: number;
  onChange: (value: number) => void;
  config: LoopWheelColumnConfig;
  formatLabel?: (value: number) => string;
}) {
  const wheelRef = useRef<HTMLDivElement | null>(null);
  const scrollTimerRef = useRef<number | null>(null);
  const recenterTimerRef = useRef<number | null>(null);
  const latestValueRef = useRef(value);
  const settingScrollRef = useRef(false);

  const itemCount = max + 1;
  const loopCycles = config.wheelLoopCycles ?? 21;
  const middleCycle = Math.floor(loopCycles / 2);
  const middleStart = middleCycle * itemCount;

  const values = useMemo(
    () =>
      Array.from({ length: itemCount * loopCycles }, (_, index) => {
        return {
          index,
          value: positiveModulo(index, itemCount),
        };
      }),
    [itemCount, loopCycles]
  );

  function getValueFromScrollTop(scrollTop: number) {
    const index = Math.round(scrollTop / config.wheelItemHeight);
    return positiveModulo(index, itemCount);
  }

  function getMiddleScrollTopForValue(nextValue: number) {
    return (middleStart + nextValue) * config.wheelItemHeight;
  }

  function getNearestIndex(scrollTop: number) {
    return clamp(
      Math.round(scrollTop / config.wheelItemHeight),
      0,
      values.length - 1
    );
  }

  function scrollToIndex(index: number, behavior: ScrollBehavior = "smooth") {
    const wheel = wheelRef.current;
    if (!wheel) return;

    settingScrollRef.current = true;

    wheel.scrollTo({
      top: index * config.wheelItemHeight,
      behavior,
    });

    window.setTimeout(() => {
      settingScrollRef.current = false;
    }, behavior === "auto" ? 0 : 180);
  }

  function recenterIfNeeded() {
    const wheel = wheelRef.current;
    if (!wheel) return;

    const rawIndex = wheel.scrollTop / config.wheelItemHeight;

    const tooCloseToTop = rawIndex < itemCount * 3;
    const tooCloseToBottom = rawIndex > itemCount * (loopCycles - 3);

    if (!tooCloseToTop && !tooCloseToBottom) return;

    const nearestValue = getValueFromScrollTop(wheel.scrollTop);
    const nextTop = getMiddleScrollTopForValue(nearestValue);

    settingScrollRef.current = true;
    wheel.scrollTop = nextTop;

    window.setTimeout(() => {
      settingScrollRef.current = false;
    }, 0);
  }

  function handleScroll() {
    const wheel = wheelRef.current;
    if (!wheel) return;

    const nextValue = getValueFromScrollTop(wheel.scrollTop);

    if (nextValue !== latestValueRef.current) {
      latestValueRef.current = nextValue;
      onChange(nextValue);
    }

    if (scrollTimerRef.current) {
      window.clearTimeout(scrollTimerRef.current);
    }

    if (recenterTimerRef.current) {
      window.clearTimeout(recenterTimerRef.current);
    }

    scrollTimerRef.current = window.setTimeout(() => {
      if (settingScrollRef.current) return;

      const nearestIndex = getNearestIndex(wheel.scrollTop);
      scrollToIndex(nearestIndex, "smooth");
    }, SCROLL.snapDelay);

    recenterTimerRef.current = window.setTimeout(() => {
      if (settingScrollRef.current) return;
      recenterIfNeeded();
    }, SCROLL.recenterDelay);
  }

  useEffect(() => {
    latestValueRef.current = value;
  }, [value]);

  useEffect(() => {
    const wheel = wheelRef.current;
    if (!wheel) return;

    settingScrollRef.current = true;
    wheel.scrollTop = getMiddleScrollTopForValue(value);

    window.setTimeout(() => {
      settingScrollRef.current = false;
    }, 0);

    return () => {
      if (scrollTimerRef.current) {
        window.clearTimeout(scrollTimerRef.current);
      }

      if (recenterTimerRef.current) {
        window.clearTimeout(recenterTimerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [max]);

  useEffect(() => {
    const wheel = wheelRef.current;
    if (!wheel) return;
    if (settingScrollRef.current) return;

    const currentValue = getValueFromScrollTop(wheel.scrollTop);
    if (currentValue === value) return;

    settingScrollRef.current = true;
    wheel.scrollTop = getMiddleScrollTopForValue(value);
    latestValueRef.current = value;

    window.setTimeout(() => {
      settingScrollRef.current = false;
    }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div
      className="ios-wheel"
      style={{
        position: "relative",
        height: config.wheelHeight,
        borderRadius: config.wheelRadius,
        background: config.wheelBg,
        overflow: "hidden",
        overscrollBehavior: "contain",
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
    >
      <style jsx>{`
        .ios-wheel-scroll {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .ios-wheel-scroll::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }
      `}</style>

      <div
        className="ios-wheel-mask"
        style={{
          position: "absolute",
          top: config.wheelItemHeight,
          left: WHEEL_MASK.insetX,
          right: WHEEL_MASK.insetX,
          height: config.wheelItemHeight,
          background: config.wheelMaskBg,
          border: config.wheelMaskBorder,
          borderRadius: Math.max(
            0,
            config.wheelRadius - WHEEL_MASK.radiusReduce
          ),
          boxSizing: "border-box",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      <div
        ref={wheelRef}
        className="ios-wheel-scroll"
        onScroll={handleScroll}
        style={{
          position: "relative",
          zIndex: 2,
          height: config.wheelHeight,
          overflowY: "auto",
          overflowX: "hidden",
          WebkitOverflowScrolling: "touch",
          scrollSnapType: "y mandatory",
          overscrollBehavior: "contain",
          touchAction: "pan-y",
        }}
      >
        <div
          style={{
            height: config.wheelItemHeight,
            flexShrink: 0,
          }}
        />

        {values.map((item) => {
          const active = item.value === value;
          const label = formatLabel ? formatLabel(item.value) : pad2(item.value);

          return (
            <button
              type="button"
              key={item.index}
              onClick={() => {
                latestValueRef.current = item.value;
                onChange(item.value);
                scrollToIndex(item.index, "smooth");
              }}
              style={{
                height: config.wheelItemHeight,
                width: "100%",

                display: "flex",
                alignItems: "center",
                justifyContent: "center",

                padding: 0,
                margin: 0,
                border: 0,
                background: "transparent",

                color: active ? config.wheelActiveColor : config.wheelTextColor,

                // 先彻底锁死字号/字重，避免再出现基线差。
                fontSize: config.wheelActiveSize,
                fontWeight: config.wheelActiveWeight,

                lineHeight: 1,
                fontVariantNumeric: "tabular-nums",

                scrollSnapAlign: "center",

                appearance: "none",
                WebkitAppearance: "none",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              {label}
            </button>
          );
        })}

        <div
          style={{
            height: config.wheelItemHeight,
            flexShrink: 0,
          }}
        />
      </div>
    </div>
  );
}