"use client";

import { useEffect, useState } from "react";

export type SoundItem = {
  id: string;
  title: string;
  src: string;
};

const WHITE_NOISE_SHEET = {
  zIndex: 90,

  overlayBg: "rgba(244,241,246,.18)",
  overlayBlur: "blur(18px) saturate(120%)",
  overlayPadding: 24,

  // 弹层进入动画
  overlayEnterMs: 130,
  overlayEnterEasing: "ease-out",

  // 胶囊进入动画
  pillEnterMs: 170,
  pillEnterEasing: "cubic-bezier(0.16, 1, 0.3, 1)",
  pillEnterMoveY: 8,

  // 空状态延迟显示，避免刚打开时闪一下“无音频”
  emptyDelayMs: 3000,

  listWidth: "min(calc(100% - 72px), 340px)",
  listGap: 12,

  rowHeight: 54,
  rowRadius: 999,

  rowBg: "rgba(255,255,255,.82)",
  rowActiveBg: "#0a84ff",

  rowShadow: "0 10px 34px rgba(0,0,0,.055)",
  rowActiveShadow: "0 14px 46px rgba(10,132,255,.24)",

  rowColor: "#111111",
  rowActiveColor: "#ffffff",

  rowSize: 17,
  rowWeight: 800,
  rowPadding: "0 22px",

  // 播放中的胶囊蓝色扩散动画
  pulseColor: "rgba(10,132,255,.64)",
  pulseDuration: 2.05,
  pulseScaleX: 1.075,
  pulseScaleY: 1.42,

  emptyColor: "#8e8e93",
  emptySize: 13,
};

export default function WhiteNoiseSheet({
  sounds,
  loading,
  playing,
  activeSoundId,
  onToggleSound,
  onClose,
}: {
  sounds: SoundItem[];
  loading: boolean;
  playing: boolean;
  activeSoundId: string | null;
  onToggleSound: (sound: SoundItem) => void;
  onClose: () => void;
}) {
  const [allowEmptyText, setAllowEmptyText] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setAllowEmptyText(true);
    }, WHITE_NOISE_SHEET.emptyDelayMs);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  const shouldShowEmptyText = !loading && sounds.length === 0 && allowEmptyText;

  return (
    <div
      className="white-noise-sheet"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: WHITE_NOISE_SHEET.zIndex,
        background: WHITE_NOISE_SHEET.overlayBg,
        backdropFilter: WHITE_NOISE_SHEET.overlayBlur,
        WebkitBackdropFilter: WHITE_NOISE_SHEET.overlayBlur,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: WHITE_NOISE_SHEET.overlayPadding,
        boxSizing: "border-box",
        animation: `whiteNoiseOverlayIn ${WHITE_NOISE_SHEET.overlayEnterMs}ms ${WHITE_NOISE_SHEET.overlayEnterEasing} both`,
      }}
    >
      <style jsx>{`
        @keyframes whiteNoiseOverlayIn {
          from {
            opacity: 0;
            backdrop-filter: blur(0px) saturate(100%);
            -webkit-backdrop-filter: blur(0px) saturate(100%);
          }

          to {
            opacity: 1;
            backdrop-filter: ${WHITE_NOISE_SHEET.overlayBlur};
            -webkit-backdrop-filter: ${WHITE_NOISE_SHEET.overlayBlur};
          }
        }

        @keyframes whiteNoisePillIn {
          from {
            opacity: 0;
            transform: translate3d(0, ${WHITE_NOISE_SHEET.pillEnterMoveY}px, 0)
              scale(0.985);
          }

          to {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
        }

        @keyframes soundPillPulse {
          0% {
            transform: scale(1, 1);
            opacity: 0.62;
          }

          68% {
            transform: scale(
              ${WHITE_NOISE_SHEET.pulseScaleX},
              ${WHITE_NOISE_SHEET.pulseScaleY}
            );
            opacity: 0;
          }

          100% {
            transform: scale(
              ${WHITE_NOISE_SHEET.pulseScaleX},
              ${WHITE_NOISE_SHEET.pulseScaleY}
            );
            opacity: 0;
          }
        }
      `}</style>

      <div
        onClick={(event) => event.stopPropagation()}
        style={{
          width: WHITE_NOISE_SHEET.listWidth,
          display: "grid",
          gap: WHITE_NOISE_SHEET.listGap,
        }}
      >
        {sounds.length ? (
          sounds.map((sound) => {
            const active = activeSoundId === sound.id && playing;

            return (
              <button
                key={sound.id}
                type="button"
                aria-label={active ? `暂停${sound.title}` : `播放${sound.title}`}
                onClick={() => onToggleSound(sound)}
                style={{
                  height: WHITE_NOISE_SHEET.rowHeight,
                  width: "100%",
                  minWidth: 0,
                  border: 0,
                  borderRadius: WHITE_NOISE_SHEET.rowRadius,
                  padding: WHITE_NOISE_SHEET.rowPadding,
                  background: active
                    ? WHITE_NOISE_SHEET.rowActiveBg
                    : WHITE_NOISE_SHEET.rowBg,
                  boxShadow: active
                    ? WHITE_NOISE_SHEET.rowActiveShadow
                    : WHITE_NOISE_SHEET.rowShadow,
                  color: active
                    ? WHITE_NOISE_SHEET.rowActiveColor
                    : WHITE_NOISE_SHEET.rowColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  overflow: "visible",
                  WebkitTapHighlightColor: "transparent",
                  transition:
                    "background .18s ease, color .18s ease, box-shadow .18s ease, transform .12s ease",
                  animation: `whiteNoisePillIn ${WHITE_NOISE_SHEET.pillEnterMs}ms ${WHITE_NOISE_SHEET.pillEnterEasing} both`,
                  animationDelay: "0ms",
                  willChange: "transform, opacity",
                }}
              >
                {active && <SoundPillPulse />}

                <span
                  style={{
                    minWidth: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    fontSize: WHITE_NOISE_SHEET.rowSize,
                    fontWeight: WHITE_NOISE_SHEET.rowWeight,
                    lineHeight: 1,
                    position: "relative",
                    zIndex: 2,
                  }}
                >
                  {sound.title}
                </span>
              </button>
            );
          })
        ) : shouldShowEmptyText ? (
          <EmptyPill text="public/sounds 里还没有音频" />
        ) : null}
      </div>
    </div>
  );
}

function SoundPillPulse() {
  return (
    <>
      <span
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: WHITE_NOISE_SHEET.rowRadius,
          background: WHITE_NOISE_SHEET.pulseColor,
          animation: `soundPillPulse ${WHITE_NOISE_SHEET.pulseDuration}s ease-out infinite`,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <span
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: WHITE_NOISE_SHEET.rowRadius,
          background: WHITE_NOISE_SHEET.pulseColor,
          animation: `soundPillPulse ${WHITE_NOISE_SHEET.pulseDuration}s ease-out infinite`,
          animationDelay: `${WHITE_NOISE_SHEET.pulseDuration / 2}s`,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
    </>
  );
}

function EmptyPill({ text }: { text: string }) {
  return (
    <div
      style={{
        height: WHITE_NOISE_SHEET.rowHeight,
        borderRadius: WHITE_NOISE_SHEET.rowRadius,
        background: WHITE_NOISE_SHEET.rowBg,
        boxShadow: WHITE_NOISE_SHEET.rowShadow,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: WHITE_NOISE_SHEET.emptyColor,
        fontSize: WHITE_NOISE_SHEET.emptySize,
        animation: `whiteNoisePillIn ${WHITE_NOISE_SHEET.pillEnterMs}ms ${WHITE_NOISE_SHEET.pillEnterEasing} both`,
        animationDelay: "0ms",
        willChange: "transform, opacity",
      }}
    >
      {text}
    </div>
  );
}