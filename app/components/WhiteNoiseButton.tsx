"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import WhiteNoiseSheet, {
  WHITE_NOISE_SHEET_EXIT_MS,
} from "@/app/components/WhiteNoiseSheet";
import type { SoundItem } from "@/app/components/WhiteNoiseSheet";
import { useWhiteNoisePlayer } from "@/app/components/useWhiteNoisePlayer";

type WhiteNoiseButtonProps = {
  size: number;
};

const WHITE_NOISE_BUTTON_CONFIG = {
  bg: "var(--bottom-pill-bg, var(--surface-soft, rgba(255, 255, 255, 0.74)))",
  activeBg: "#0a84ff",

  border:
    "1px solid var(--bottom-pill-border, var(--surface, rgba(255, 255, 255, 0.82)))",

  blur: "blur(34px) saturate(180%)",
  color: "var(--text, #1c1c1e)",
  shadow:
    "var(--bottom-pill-shadow, var(--shadow-float, 0 14px 34px rgba(0, 0, 0, 0.14)))",
  activeShadow: "0 18px 54px rgba(10, 132, 255, 0.34)",

  activeScale: 0.93,

  iconSize: 38,
  iconWhiteFilter: "brightness(0) invert(1)",

  pulseColor: "rgba(100, 190, 255, 0.52)",
  pulseShadow: "0 0 34px rgba(10, 132, 255, 0.28)",
  pulseDuration: 2.05,
  pulseScale: 1.9,
  pulseInset: -6,
  pulseDelayRatio: 0.5,

  fallbackSounds: [
    {
      id: "1-吹风机.m4a",
      title: "吹风机",
      src: "/white-noise/1-%E5%90%B9%E9%A3%8E%E6%9C%BA.m4a",
      fallbackSrc: "/white-noise/1-%E5%90%B9%E9%A3%8E%E6%9C%BA.m4a",
    },
    {
      id: "2-嘘声.m4a",
      title: "嘘声",
      src: "/white-noise/2-%E5%98%98%E5%A3%B0.m4a",
      fallbackSrc: "/white-noise/2-%E5%98%98%E5%A3%B0.m4a",
    },
    {
      id: "3-数鸭子.m4a",
      title: "数鸭子",
      src: "/white-noise/3-%E6%95%B0%E9%B8%AD%E5%AD%90.m4a",
      fallbackSrc: "/white-noise/3-%E6%95%B0%E9%B8%AD%E5%AD%90.m4a",
    },
  ] satisfies SoundItem[],
};

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}

export default function WhiteNoiseButton({ size }: WhiteNoiseButtonProps) {
  const [open, setOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [sounds, setSounds] = useState<SoundItem[]>([]);
  const [loading, setLoading] = useState(false);

  const { playing, activeSoundId, toggleSound, sync } = useWhiteNoisePlayer();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    sync();
  }, [sync]);

  useEffect(() => {
    if (!open) return;

    sync();

    const controller = new AbortController();

    async function loadSounds() {
      setLoading(true);

      try {
        const response = await fetch("/white-noise.json", {
          signal: controller.signal,
          cache: "no-store",
        });

        const data = (await response.json()) as { sounds?: SoundItem[] };
        const nextSounds = Array.isArray(data.sounds) ? data.sounds : [];

        if (!controller.signal.aborted) {
          setSounds(
            nextSounds.length
              ? nextSounds
              : WHITE_NOISE_BUTTON_CONFIG.fallbackSounds
          );
        }
      } catch (error) {
        if (!isAbortError(error)) {
          setSounds(WHITE_NOISE_BUTTON_CONFIG.fallbackSounds);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadSounds();

    return () => {
      controller.abort();
    };
  }, [open, sync]);

  function openSheet() {
    sync();
    setLeaving(false);
    setOpen(true);
  }

  function closeSheet() {
    sync();

    if (!open || leaving) return;

    setLeaving(true);

    window.setTimeout(() => {
      setOpen(false);
      setLeaving(false);
    }, WHITE_NOISE_SHEET_EXIT_MS);
  }

  return (
    <>
      <style jsx global>{`
        @keyframes whiteNoiseFabPulse {
          0% {
            transform: scale(1);
            opacity: 0;
          }

          10% {
            transform: scale(1.06);
            opacity: 0.82;
          }

          72% {
            transform: scale(${WHITE_NOISE_BUTTON_CONFIG.pulseScale});
            opacity: 0;
          }

          100% {
            transform: scale(${WHITE_NOISE_BUTTON_CONFIG.pulseScale});
            opacity: 0;
          }
        }
      `}</style>

      <div
        style={{
          width: size,
          height: size,
          position: "relative",
          flexShrink: 0,
        }}
      >
        {playing && <WhiteNoisePulse />}

        <button
          type="button"
          aria-label="打开白噪音"
          onClick={openSheet}
          style={
            {
              width: size,
              height: size,
              background: playing
                ? WHITE_NOISE_BUTTON_CONFIG.activeBg
                : WHITE_NOISE_BUTTON_CONFIG.bg,
              backdropFilter: WHITE_NOISE_BUTTON_CONFIG.blur,
              WebkitBackdropFilter: WHITE_NOISE_BUTTON_CONFIG.blur,
              color: WHITE_NOISE_BUTTON_CONFIG.color,
              boxShadow: playing
                ? WHITE_NOISE_BUTTON_CONFIG.activeShadow
                : WHITE_NOISE_BUTTON_CONFIG.shadow,

              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
              border: playing ? 0 : WHITE_NOISE_BUTTON_CONFIG.border,
              borderRadius: 999,
              position: "relative",
              overflow: "visible",
              zIndex: 2,
              isolation: "isolate",
              pointerEvents: "auto",
              cursor: "pointer",
              WebkitTapHighlightColor: "transparent",
              transition:
                "background .18s ease, border-color .18s ease, box-shadow .18s ease, transform .18s ease",
              "--nurse-active-scale": WHITE_NOISE_BUTTON_CONFIG.activeScale,
            } as CSSProperties
          }
        >
          <img
            src="/whitenoise.svg"
            alt=""
            style={{
              width: WHITE_NOISE_BUTTON_CONFIG.iconSize,
              height: WHITE_NOISE_BUTTON_CONFIG.iconSize,
              objectFit: "contain",
              display: "block",
              position: "relative",
              zIndex: 2,
              filter: playing
                ? WHITE_NOISE_BUTTON_CONFIG.iconWhiteFilter
                : undefined,
            }}
          />
        </button>
      </div>

      {mounted &&
        open &&
        createPortal(
          <WhiteNoiseSheet
            sounds={sounds}
            loading={loading}
            playing={playing}
            activeSoundId={activeSoundId}
            leaving={leaving}
            onToggleSound={toggleSound}
            onClose={closeSheet}
          />,
          document.body
        )}
    </>
  );
}

function WhiteNoisePulse() {
  return (
    <>
      <span
        aria-hidden
        style={{
          position: "absolute",
          inset: WHITE_NOISE_BUTTON_CONFIG.pulseInset,
          borderRadius: 999,
          background: WHITE_NOISE_BUTTON_CONFIG.pulseColor,
          boxShadow: WHITE_NOISE_BUTTON_CONFIG.pulseShadow,
          animation: `whiteNoiseFabPulse ${WHITE_NOISE_BUTTON_CONFIG.pulseDuration}s ease-out infinite`,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <span
        aria-hidden
        style={{
          position: "absolute",
          inset: WHITE_NOISE_BUTTON_CONFIG.pulseInset,
          borderRadius: 999,
          background: WHITE_NOISE_BUTTON_CONFIG.pulseColor,
          boxShadow: WHITE_NOISE_BUTTON_CONFIG.pulseShadow,
          animation: `whiteNoiseFabPulse ${WHITE_NOISE_BUTTON_CONFIG.pulseDuration}s ease-out infinite`,
          animationDelay: `${
            WHITE_NOISE_BUTTON_CONFIG.pulseDuration *
            WHITE_NOISE_BUTTON_CONFIG.pulseDelayRatio
          }s`,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
    </>
  );
}