"use client";

export type SoundItem = {
  id: string;
  title: string;
  src: string;
  fallbackSrc?: string;
};

const WHITE_NOISE_SHEET = {
  zIndex: 90,

  overlayBg: "var(--surface-overlay)",
  overlayBlur: "blur(18px) saturate(120%)",
  overlayPadding: 24,

  listWidth: "min(calc(100% - 72px), 340px)",
  listGap: 12,

  rowHeight: 54,
  rowRadius: 999,

  rowBg: "var(--surface)",
  rowActiveBg: "var(--blue)",

  rowShadow: "var(--shadow-soft)",
  rowActiveShadow: "0 14px 46px rgba(10,132,255,.24)",

  rowColor: "var(--text)",
  rowActiveColor: "var(--white)",

  rowSize: 17,
  rowWeight: 800,
  rowPadding: "0 22px",

  // 播放中的胶囊蓝色扩散动画
  pulseColor: "rgba(10, 132, 255, 0.72)",
  pulseDuration: 2.05,
  pulseScaleX: 1.12,
  pulseScaleY: 1.5,

  emptyColor: "var(--muted)",
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
      }}
    >
      <style jsx>{`
        @keyframes soundPillPulse {
          0% {
            transform: scale(1, 1);
            opacity: 0.82;
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
        {loading ? (
          <EmptyPill text="正在读取声音…" />
        ) : sounds.length ? (
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
        ) : (
          <EmptyPill text="暂无可用声音" />
        )}
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
          boxShadow: "0 0 30px rgba(10, 132, 255, 0.34)",
          filter: "blur(0.5px)",
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
          boxShadow: "0 0 30px rgba(10, 132, 255, 0.34)",
          filter: "blur(0.5px)",
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
      }}
    >
      {text}
    </div>
  );
}