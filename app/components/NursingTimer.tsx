"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

type Side = "left" | "right";

type StoredNursingTimerState = {
  activeSide: Side;
  running: boolean;
  leftMs: number;
  rightMs: number;
  startedAt: number | null;
  updatedAt: number;
};

const STORAGE_KEY = "baby-log-nursing-timer-state";

const NURSING_TIMER_CONFIG = {
  label: "哺乳计时",
  sub: "点击左侧或右侧开始独立计时",

  backdropBg: "rgba(244, 241, 246, 0.56)",
  backdropBlur: "blur(26px)",

  panelMaxWidth: 430,
  panelOuterGap: 18,
  panelRadius: 34,
  panelBg: "rgba(255, 255, 255, 0.9)",
  panelPadding: 22,
  panelShadow: "0 -24px 80px rgba(0,0,0,.16)",

  labelColor: "#ff3b30",
  labelSize: 15,
  labelWeight: 760,
  labelLetterSpacing: "0.04em",

  subColor: "#8e8e93",
  subSize: 13,
  subMarginTop: 6,

  closeSize: 44,
  closeBg: "rgba(0,0,0,.08)",
  closeColor: "#0a84ff",
  closeLineWidth: 22,
  closeLineHeight: 3,

  timeMargin: "34px 0 28px",
  timeColor: "#111111",
  timeSize: 76,
  timeWeight: 800,
  timeLetterSpacing: "-0.055em",

  sideSwitchBg: "rgba(0, 0, 0, 0.045)",
  sideSwitchRadius: 999,
  sideSwitchPadding: 5,
  sideActiveBg: "#0a84ff",
  sideInactiveColor: "#8e8e93",
  sideActiveColor: "#ffffff",

  sideStatBg: "rgba(0, 0, 0, 0.045)",
  sideStatActiveBg: "rgba(10, 132, 255, 0.14)",
  sideStatRadius: 18,
  sideStatPadding: 14,
  sideStatTitleColor: "#8e8e93",
  sideStatValueColor: "#111111",

  startText: "开始",
  pauseText: "暂停",

  actionGap: 10,

  finishText: "结束并记录",
  finishBg: "#0a84ff",
  finishColor: "#ffffff",

  cancelText: "取消记录",
  cancelBg: "rgba(0, 0, 0, 0.045)",
  cancelColor: "#8e8e93",

  summaryColor: "#8e8e93",

  buttonRadius: 22,
  buttonPadding: 17,
  buttonWeight: 760,

  minRecordSeconds: 10,

  sheetEnterMs: 420,
  sheetExitMs: 280,
  sheetEasing: "cubic-bezier(0.16, 1, 0.3, 1)",
  sheetExitEasing: "cubic-bezier(0.32, 0, 0.67, 0)",

  buttonTransition:
    "background .2s ease, color .2s ease, box-shadow .2s ease, transform .12s ease, opacity .2s ease",
  switchTransition:
    "background .22s ease, color .22s ease, transform .12s ease",
  cardTransition:
    "background .22s ease, box-shadow .22s ease, transform .12s ease",
  tapScale: 0.97,
  tapFastScale: 0.94,
};

function formatDuration(seconds: number) {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;

  return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function secondsToMinutes(seconds: number) {
  if (seconds <= 0) return 0;
  return Math.max(1, Math.round(seconds / 60));
}

function msToSeconds(ms: number) {
  return Math.max(0, Math.floor(ms / 1000));
}

function readStoredState(): StoredNursingTimerState | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as StoredNursingTimerState;

    if (parsed.activeSide !== "left" && parsed.activeSide !== "right") {
      return null;
    }

    return {
      activeSide: parsed.activeSide,
      running: Boolean(parsed.running),
      leftMs: Number.isFinite(parsed.leftMs) ? Math.max(0, parsed.leftMs) : 0,
      rightMs: Number.isFinite(parsed.rightMs) ? Math.max(0, parsed.rightMs) : 0,
      startedAt:
        typeof parsed.startedAt === "number" && Number.isFinite(parsed.startedAt)
          ? parsed.startedAt
          : null,
      updatedAt:
        typeof parsed.updatedAt === "number" && Number.isFinite(parsed.updatedAt)
          ? parsed.updatedAt
          : Date.now(),
    };
  } catch {
    return null;
  }
}

function clearStoredState() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export default function NursingTimer({
  onCancel,
  onMinimize,
  onFinish,
}: {
  onCancel: () => void;
  onMinimize: () => void;
  onFinish: (result: {
    durationMin: number;
    leftMin: number;
    rightMin: number;
  }) => void;
}) {
  const initialState = useMemo(() => readStoredState(), []);

  const [activeSide, setActiveSide] = useState<Side>(
    initialState?.activeSide ?? "left"
  );
  const [running, setRunning] = useState(initialState?.running ?? false);
  const [leftMs, setLeftMs] = useState(initialState?.leftMs ?? 0);
  const [rightMs, setRightMs] = useState(initialState?.rightMs ?? 0);
  const [startedAt, setStartedAt] = useState<number | null>(
    initialState?.running ? initialState.startedAt ?? Date.now() : null
  );
  const [nowTick, setNowTick] = useState(Date.now());
  const [closing, setClosing] = useState(false);

  const closeTimerRef = useRef<number | null>(null);

  const latestStateRef = useRef({
    activeSide: initialState?.activeSide ?? "left",
    running: initialState?.running ?? false,
    leftMs: initialState?.leftMs ?? 0,
    rightMs: initialState?.rightMs ?? 0,
    startedAt: initialState?.running
      ? initialState.startedAt ?? Date.now()
      : null,
  });

  const liveLeftMs =
    running && activeSide === "left" && startedAt
      ? leftMs + Math.max(0, nowTick - startedAt)
      : leftMs;

  const liveRightMs =
    running && activeSide === "right" && startedAt
      ? rightMs + Math.max(0, nowTick - startedAt)
      : rightMs;

  const leftSeconds = msToSeconds(liveLeftMs);
  const rightSeconds = msToSeconds(liveRightMs);
  const currentSeconds = activeSide === "left" ? leftSeconds : rightSeconds;

  useEffect(() => {
    latestStateRef.current = {
      activeSide,
      running,
      leftMs,
      rightMs,
      startedAt,
    };
  }, [activeSide, running, leftMs, rightMs, startedAt]);

  useEffect(() => {
    const payload: StoredNursingTimerState = {
      activeSide,
      running,
      leftMs,
      rightMs,
      startedAt,
      updatedAt: Date.now(),
    };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [activeSide, running, leftMs, rightMs, startedAt]);

  useEffect(() => {
    const scrollY = window.scrollY;

    function preventTouchMove(event: TouchEvent) {
      event.preventDefault();
    }

    document.addEventListener("touchmove", preventTouchMove, {
      passive: false,
    });

    document.documentElement.style.overflow = "hidden";

    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";

    return () => {
      document.removeEventListener("touchmove", preventTouchMove);

      document.documentElement.style.overflow = "";

      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";

      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
      }

      window.scrollTo(0, scrollY);
    };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNowTick(Date.now());
    }, 500);

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        setNowTick(Date.now());
      }
    }

    function handleFocus() {
      setNowTick(Date.now());
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  function commitRunningTime() {
    const state = latestStateRef.current;

    if (!state.running || !state.startedAt) {
      return {
        leftMs: state.leftMs,
        rightMs: state.rightMs,
      };
    }

    const extraMs = Math.max(0, Date.now() - state.startedAt);

    const nextLeftMs =
      state.activeSide === "left" ? state.leftMs + extraMs : state.leftMs;

    const nextRightMs =
      state.activeSide === "right" ? state.rightMs + extraMs : state.rightMs;

    setLeftMs(nextLeftMs);
    setRightMs(nextRightMs);
    setStartedAt(null);
    setNowTick(Date.now());

    return {
      leftMs: nextLeftMs,
      rightMs: nextRightMs,
    };
  }

  function requestClose() {
    if (closing) return;

    setClosing(true);

    closeTimerRef.current = window.setTimeout(() => {
      onMinimize();
    }, NURSING_TIMER_CONFIG.sheetExitMs);
  }

  function cancel() {
    if (closing) return;

    clearStoredState();
    setClosing(true);

    closeTimerRef.current = window.setTimeout(() => {
      onCancel();
    }, NURSING_TIMER_CONFIG.sheetExitMs);
  }

  function chooseSide(side: Side) {
    const committed = commitRunningTime();

    setActiveSide(side);
    setLeftMs(committed.leftMs);
    setRightMs(committed.rightMs);
    setRunning(false);
    setStartedAt(null);
    setNowTick(Date.now());
  }

  function toggleRunning() {
    if (running) {
      commitRunningTime();
      setRunning(false);
      setStartedAt(null);
      setNowTick(Date.now());
      return;
    }

    setRunning(true);
    setStartedAt(Date.now());
    setNowTick(Date.now());
  }

  function finish() {
    const committed = commitRunningTime();

    const rawLeftSeconds = msToSeconds(committed.leftMs);
    const rawRightSeconds = msToSeconds(committed.rightMs);

    const finalLeftSeconds =
      rawLeftSeconds >= NURSING_TIMER_CONFIG.minRecordSeconds
        ? rawLeftSeconds
        : 0;

    const finalRightSeconds =
      rawRightSeconds >= NURSING_TIMER_CONFIG.minRecordSeconds
        ? rawRightSeconds
        : 0;

    const leftMin = secondsToMinutes(finalLeftSeconds);
    const rightMin = secondsToMinutes(finalRightSeconds);
    const durationMin = leftMin + rightMin;

    clearStoredState();

    onFinish({
      leftMin,
      rightMin,
      durationMin,
    });
  }

  function sideButton(side: Side, label: string) {
    const active = activeSide === side;

    return (
      <button
        type="button"
        className="nursing-tap-button"
        onClick={() => chooseSide(side)}
        style={{
          border: 0,
          borderRadius: NURSING_TIMER_CONFIG.sideSwitchRadius,
          padding: "12px 0",
          background: active
            ? NURSING_TIMER_CONFIG.sideActiveBg
            : "transparent",
          color: active
            ? NURSING_TIMER_CONFIG.sideActiveColor
            : NURSING_TIMER_CONFIG.sideInactiveColor,
          fontWeight: 760,
          transition: NURSING_TIMER_CONFIG.switchTransition,
          WebkitTapHighlightColor: "transparent",
        }}
      >
        {label}
      </button>
    );
  }

  function sideStat(side: Side, label: string, seconds: number) {
    const active = activeSide === side;
    const activeAndRunning = active && running;

    return (
      <button
        type="button"
        className="nursing-tap-button"
        onClick={() => chooseSide(side)}
        style={{
          textAlign: "left",
          border: 0,
          background: activeAndRunning
            ? NURSING_TIMER_CONFIG.sideStatActiveBg
            : NURSING_TIMER_CONFIG.sideStatBg,
          borderRadius: NURSING_TIMER_CONFIG.sideStatRadius,
          padding: NURSING_TIMER_CONFIG.sideStatPadding,
          transition: NURSING_TIMER_CONFIG.cardTransition,
          WebkitTapHighlightColor: "transparent",
        }}
      >
        <div
          style={{
            color: NURSING_TIMER_CONFIG.sideStatTitleColor,
            fontSize: 12,
            transition: "color .18s ease",
          }}
        >
          {label}
          {activeAndRunning ? " · 计时中" : ""}
        </div>

        <div
          style={{
            color: NURSING_TIMER_CONFIG.sideStatValueColor,
            fontSize: 22,
            fontWeight: 780,
            marginTop: 4,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {formatDuration(seconds)}
        </div>
      </button>
    );
  }

  const closeButtonStyle: CSSProperties = {
    width: NURSING_TIMER_CONFIG.closeSize,
    height: NURSING_TIMER_CONFIG.closeSize,
    minWidth: NURSING_TIMER_CONFIG.closeSize,
    border: 0,
    borderRadius: 999,
    background: NURSING_TIMER_CONFIG.closeBg,
    color: NURSING_TIMER_CONFIG.closeColor,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
    cursor: "pointer",
    transition: NURSING_TIMER_CONFIG.buttonTransition,
    WebkitTapHighlightColor: "transparent",
  };

  return (
    <div
      className="nursing-backdrop"
      onClick={requestClose}
      style={{
        alignItems: "flex-end",
        justifyContent: "center",
        background: NURSING_TIMER_CONFIG.backdropBg,
        backdropFilter: NURSING_TIMER_CONFIG.backdropBlur,
        WebkitBackdropFilter: NURSING_TIMER_CONFIG.backdropBlur,
      }}
    >
      <style jsx>{`
        @keyframes nursingSheetSlideUp {
          from {
            transform: translate3d(0, calc(100% + 40px), 0);
          }

          to {
            transform: translate3d(0, 0, 0);
          }
        }

        @keyframes nursingSheetSlideDown {
          from {
            transform: translate3d(0, 0, 0);
          }

          to {
            transform: translate3d(0, calc(100% + 40px), 0);
          }
        }

        .nursing-tap-button:active {
          transform: scale(${NURSING_TIMER_CONFIG.tapScale});
        }

        .nursing-fast-tap-button:active {
          transform: scale(${NURSING_TIMER_CONFIG.tapFastScale});
        }
      `}</style>

      <div
        className="nursing-panel"
        onClick={(event) => event.stopPropagation()}
        style={{
          width: `min(calc(100% - ${
            NURSING_TIMER_CONFIG.panelOuterGap * 2
          }px), ${NURSING_TIMER_CONFIG.panelMaxWidth}px)`,

          borderRadius: NURSING_TIMER_CONFIG.panelRadius,
          background: NURSING_TIMER_CONFIG.panelBg,
          padding: NURSING_TIMER_CONFIG.panelPadding,
          marginBottom: `calc(${NURSING_TIMER_CONFIG.panelOuterGap}px + env(safe-area-inset-bottom))`,
          boxShadow: NURSING_TIMER_CONFIG.panelShadow,

          animation: closing
            ? `nursingSheetSlideDown ${NURSING_TIMER_CONFIG.sheetExitMs}ms ${NURSING_TIMER_CONFIG.sheetExitEasing} both`
            : `nursingSheetSlideUp ${NURSING_TIMER_CONFIG.sheetEnterMs}ms ${NURSING_TIMER_CONFIG.sheetEasing} both`,
          willChange: "transform",
        }}
      >
        <div className="nursing-top">
          <div>
            <div
              style={{
                color: NURSING_TIMER_CONFIG.labelColor,
                fontSize: NURSING_TIMER_CONFIG.labelSize,
                fontWeight: NURSING_TIMER_CONFIG.labelWeight,
                letterSpacing: NURSING_TIMER_CONFIG.labelLetterSpacing,
              }}
            >
              {NURSING_TIMER_CONFIG.label}
            </div>

            <div
              style={{
                color: NURSING_TIMER_CONFIG.subColor,
                fontSize: NURSING_TIMER_CONFIG.subSize,
                marginTop: NURSING_TIMER_CONFIG.subMarginTop,
              }}
            >
              {NURSING_TIMER_CONFIG.sub}
            </div>
          </div>

          <button
            type="button"
            className="nursing-close nursing-fast-tap-button"
            onClick={requestClose}
            aria-label="关闭"
            style={closeButtonStyle}
          >
            <span
              aria-hidden
              style={{
                position: "relative",
                width: 20,
                height: 20,
                display: "block",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  width: NURSING_TIMER_CONFIG.closeLineWidth,
                  height: NURSING_TIMER_CONFIG.closeLineHeight,
                  borderRadius: 999,
                  background: NURSING_TIMER_CONFIG.closeColor,
                  transform: "translate(-50%, -50%) rotate(45deg)",
                  transformOrigin: "center",
                }}
              />

              <span
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  width: NURSING_TIMER_CONFIG.closeLineWidth,
                  height: NURSING_TIMER_CONFIG.closeLineHeight,
                  borderRadius: 999,
                  background: NURSING_TIMER_CONFIG.closeColor,
                  transform: "translate(-50%, -50%) rotate(-45deg)",
                  transformOrigin: "center",
                }}
              />
            </span>
          </button>
        </div>

        <div
          className="nursing-time"
          style={{
            margin: NURSING_TIMER_CONFIG.timeMargin,
            color: NURSING_TIMER_CONFIG.timeColor,
            fontSize: NURSING_TIMER_CONFIG.timeSize,
            fontWeight: NURSING_TIMER_CONFIG.timeWeight,
            letterSpacing: NURSING_TIMER_CONFIG.timeLetterSpacing,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {formatDuration(currentSeconds)}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 6,
            padding: NURSING_TIMER_CONFIG.sideSwitchPadding,
            background: NURSING_TIMER_CONFIG.sideSwitchBg,
            borderRadius: NURSING_TIMER_CONFIG.sideSwitchRadius,
            marginBottom: 12,
          }}
        >
          {sideButton("left", "左侧")}
          {sideButton("right", "右侧")}
        </div>

        <button
          type="button"
          className="nursing-tap-button"
          onClick={toggleRunning}
          style={{
            width: "100%",
            border: 0,
            borderRadius: NURSING_TIMER_CONFIG.buttonRadius,
            padding: 14,
            marginBottom: 12,
            background: running
              ? "rgba(0, 0, 0, 0.045)"
              : NURSING_TIMER_CONFIG.finishBg,
            color: running ? "#111111" : "#ffffff",
            fontWeight: 760,
            transition: NURSING_TIMER_CONFIG.buttonTransition,
            WebkitTapHighlightColor: "transparent",
          }}
        >
          {running
            ? NURSING_TIMER_CONFIG.pauseText
            : NURSING_TIMER_CONFIG.startText}
        </button>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            marginBottom: 18,
          }}
        >
          {sideStat("left", "左侧累计", leftSeconds)}
          {sideStat("right", "右侧累计", rightSeconds)}
        </div>

        <div
          style={{
            color: NURSING_TIMER_CONFIG.summaryColor,
            fontSize: 13,
            textAlign: "center",
            marginBottom: 16,
          }}
        >
          结束后记录：左侧 {secondsToMinutes(leftSeconds)} 分钟，右侧{" "}
          {secondsToMinutes(rightSeconds)} 分钟，共{" "}
          {secondsToMinutes(leftSeconds) + secondsToMinutes(rightSeconds)} 分钟
        </div>

        <div
          className="nursing-actions"
          style={{ gap: NURSING_TIMER_CONFIG.actionGap }}
        >
          <button
            className="nursing-finish nursing-tap-button"
            onClick={finish}
            style={{
              background: NURSING_TIMER_CONFIG.finishBg,
              color: NURSING_TIMER_CONFIG.finishColor,
              borderRadius: NURSING_TIMER_CONFIG.buttonRadius,
              padding: NURSING_TIMER_CONFIG.buttonPadding,
              fontWeight: NURSING_TIMER_CONFIG.buttonWeight,
              transition: NURSING_TIMER_CONFIG.buttonTransition,
              WebkitTapHighlightColor: "transparent",
            }}
          >
            {NURSING_TIMER_CONFIG.finishText}
          </button>

          <button
            className="nursing-cancel nursing-tap-button"
            onClick={cancel}
            style={{
              background: NURSING_TIMER_CONFIG.cancelBg,
              color: NURSING_TIMER_CONFIG.cancelColor,
              borderRadius: NURSING_TIMER_CONFIG.buttonRadius,
              padding: NURSING_TIMER_CONFIG.buttonPadding,
              fontWeight: NURSING_TIMER_CONFIG.buttonWeight,
              transition: NURSING_TIMER_CONFIG.buttonTransition,
              WebkitTapHighlightColor: "transparent",
            }}
          >
            {NURSING_TIMER_CONFIG.cancelText}
          </button>
        </div>
      </div>
    </div>
  );
}