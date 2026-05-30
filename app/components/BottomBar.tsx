"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import WhiteNoiseSheet from "@/app/components/WhiteNoiseSheet";
import type { SoundItem } from "@/app/components/WhiteNoiseSheet";

type ViewType = "home" | "timeline";

type BottomBarProps = {
  view: ViewType;
  onChange: (v: ViewType) => void;
  onNurse: () => void;
  nursing: boolean;
  nursingRunning?: boolean;
  nursingSeconds?: number;
  showNurse?: boolean;
};

const BOTTOM_BAR_CONFIG = {
  maxWidth: 430, // 底部栏最大宽度 px；控制整体不超过手机视觉宽
  paddingX: 26, // 底部栏左右内边距 px
  bottom: 0, // 底部栏距离屏幕底部的距离 px；会叠加 safe-area
  zIndex: 40, // 底部栏层级；越大越盖在页面上方

  pillGap: 4, // “记录 / 时间线”两个 tab 之间的间距 px
  pillPadding: 5, // 分段胶囊外壳内部留白 px
  pillBg: "rgba(255, 255, 255, 0.42)", // 分段胶囊外壳背景色；最后一位是透明度
  pillBlur: "blur(34px) saturate(180%)", // 分段胶囊毛玻璃效果
  pillRadius: 999, // 分段胶囊圆角；999 表示完全圆角
  pillBorder: "1px solid rgba(255,255,255,.82)", // 分段胶囊描边
  pillShadow: "0 18px 60px rgba(0,0,0,.14)", // 分段胶囊阴影

  tabPadding: "12px 18px", // 单个 tab 内边距；上下 12px，左右 18px
  tabRadius: 999, // 单个 tab 圆角
  tabColor: "rgba(0,0,0,.58)", // 未选中 tab 文字颜色
  tabActiveColor: "#0a84ff", // 选中 tab 文字颜色
  tabActiveBg: "rgba(255,255,255,.92)", // 选中 tab 背景色
  tabSize: 16, // tab 文字字号 px
  tabWeight: 720, // tab 文字字重；越大越粗

  fabGap: 10, // 白噪音按钮和哺乳按钮之间的距离 px

  nurseSize: 68, // 右侧圆形功能按钮尺寸 px；白噪音和哺乳共用
  nurseBg: "rgba(255,255,255,.46)", // 圆形功能按钮背景色
  nurseBlur: "blur(34px) saturate(180%)", // 圆形功能按钮毛玻璃效果
  nurseColor: "#111111", // 圆形功能按钮内部默认颜色
  nurseShadow: "0 18px 60px rgba(0,0,0,.16)", // 圆形功能按钮阴影
  nurseActiveScale: 0.93, // 按钮按下时缩放比例；越小按压感越明显

  nurseIconSize: 48, // 哺乳按钮月亮图标尺寸 px
  nurseStopSize: 24, // 旧版停止方块尺寸 px；保留备用
  nurseStopColor: "#111111", // 旧版停止方块颜色；保留备用

  // 哺乳计时中底部按钮数字
  nurseTimerColor: "#ff2d87", // 运行中计时数字颜色；粉色
  nurseTimerPausedColor: "#111111", // 暂停但未结束时计时数字颜色
  nurseTimerSize: 15, // 哺乳计时数字字号 px
  nurseTimerWeight: 820, // 哺乳计时数字字重

  whiteNoiseIconSize: 38, // 白噪音图标尺寸 px

  // 播放中白噪音按钮的扩散动画
  noisePulseColor: "rgba(255,255,255,.72)", // 白噪音扩散动画颜色；降低透明度会更柔
  noisePulseDuration: 2.05, // 每一圈扩散动画持续时间，单位秒；越大越慢
  noisePulseScale: 1.72, // 扩散动画最大放大比例；越大扩散范围越大
  noisePulseInset: -2, // 扩散圈距离按钮边缘 px；负数会让动画从按钮外侧开始
  noisePulseDelayRatio: 0.5, // 第二层动画延迟比例；0.5 = 两层均匀错开
};

const TABS: { view: ViewType; label: string }[] = [
  { view: "home", label: "记录" },
  { view: "timeline", label: "时间线" },
];

const LOCAL_FALLBACK_SOUNDS: SoundItem[] = [
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
];

// 放在组件外面，避免 BottomBar 因为其他弹窗重载/卸载时把音频一起弄停。
// 只有用户明确点“当前正在播放的音频胶囊”时，才会暂停。
let sharedAudio: HTMLAudioElement | null = null;
let sharedActiveSoundId: string | null = null;
let sharedPlaying = false;

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}

function formatNursingButtonTime(seconds: number) {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const remainSeconds = safeSeconds % 60;

  if (minutes >= 100) {
    return `${minutes}m`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(remainSeconds).padStart(
    2,
    "0"
  )}`;
}

function playAudioSource(audio: HTMLAudioElement, src: string) {
  return new Promise<void>((resolve, reject) => {
    let settled = false;

    function cleanup() {
      audio.removeEventListener("playing", handlePlaying);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("stalled", handleStalled);
      window.clearTimeout(timeoutId);
    }

    function resolveOnce() {
      if (settled) return;
      settled = true;
      cleanup();
      resolve();
    }

    function rejectOnce() {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new Error("Audio playback failed"));
    }

    function handlePlaying() {
      resolveOnce();
    }

    function handleError() {
      rejectOnce();
    }

    function handleStalled() {
      rejectOnce();
    }

    const timeoutId = window.setTimeout(() => {
      rejectOnce();
    }, 5200);

    audio.addEventListener("playing", handlePlaying);
    audio.addEventListener("error", handleError);
    audio.addEventListener("stalled", handleStalled);

    if (audio.src !== new URL(src, window.location.href).href) {
      audio.pause();
      audio.src = src;
      audio.currentTime = 0;
    }

    audio.loop = true;
    audio.preload = "auto";

    const playResult = audio.play();

    if (playResult) {
      playResult.then(resolveOnce).catch(rejectOnce);
    }
  });
}

export default function BottomBar({
  view,
  onChange,
  onNurse,
  nursing,
  nursingRunning = false,
  nursingSeconds = 0,
  showNurse = true,
}: BottomBarProps) {
  const audioRef = useRef<HTMLAudioElement | null>(sharedAudio);

  const [whiteNoiseOpen, setWhiteNoiseOpen] = useState(false);
  const [sounds, setSounds] = useState<SoundItem[]>([]);
  const [loadingSounds, setLoadingSounds] = useState(false);
  const [activeSoundId, setActiveSoundId] = useState<string | null>(
    sharedActiveSoundId
  );
  const [playing, setPlaying] = useState(sharedPlaying);

  useEffect(() => {
    audioRef.current = sharedAudio;
    setActiveSoundId(sharedActiveSoundId);
    setPlaying(sharedPlaying);
  }, []);

  useEffect(() => {
    if (!whiteNoiseOpen) return;

    const controller = new AbortController();

    async function loadSounds() {
      setLoadingSounds(true);

      try {
        const response = await fetch("/white-noise.json", {
          signal: controller.signal,
          cache: "no-store",
        });

        const data = (await response.json()) as { sounds?: SoundItem[] };

        if (!controller.signal.aborted) {
          const nextSounds = Array.isArray(data.sounds) ? data.sounds : [];

          setSounds(nextSounds.length ? nextSounds : LOCAL_FALLBACK_SOUNDS);
        }
      } catch (error) {
        if (!isAbortError(error)) {
          setSounds(LOCAL_FALLBACK_SOUNDS);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingSounds(false);
        }
      }
    }

    loadSounds();

    return () => {
      controller.abort();
    };
  }, [whiteNoiseOpen]);

  function syncAudioState(nextPlaying: boolean, nextActiveSoundId: string | null) {
    sharedPlaying = nextPlaying;
    sharedActiveSoundId = nextActiveSoundId;

    setPlaying(nextPlaying);
    setActiveSoundId(nextActiveSoundId);
  }

  async function playSound(sound: SoundItem) {
    let audio = sharedAudio;

    if (!audio) {
      audio = new Audio();
      audio.loop = true;
      audio.preload = "auto";
      sharedAudio = audio;
      audioRef.current = audio;
    }

    try {
      await playAudioSource(audio, sound.src);
      syncAudioState(true, sound.id);
      return;
    } catch {
      if (!sound.fallbackSrc) {
        syncAudioState(false, sound.id);
        return;
      }
    }

    try {
      await playAudioSource(audio, sound.fallbackSrc);
      syncAudioState(true, sound.id);
    } catch {
      syncAudioState(false, sound.id);
    }
  }

  function pauseWhiteNoise() {
    if (sharedAudio) {
      sharedAudio.pause();
    }

    syncAudioState(false, sharedActiveSoundId);
  }

  function toggleSound(sound: SoundItem) {
    const isCurrentSound = activeSoundId === sound.id;

    if (isCurrentSound && playing) {
      pauseWhiteNoise();
      return;
    }

    playSound(sound);
  }

  function handleWhiteNoiseButtonClick() {
    setWhiteNoiseOpen(true);
  }

  function closeWhiteNoisePanel() {
    setWhiteNoiseOpen(false);
  }

  function WhiteNoisePulse() {
    if (!playing) return null;

    return (
      <>
        <span
          aria-hidden
          style={{
            position: "absolute",
            inset: BOTTOM_BAR_CONFIG.noisePulseInset,
            borderRadius: 999,
            background: BOTTOM_BAR_CONFIG.noisePulseColor,
            animation: `whiteNoisePulse ${BOTTOM_BAR_CONFIG.noisePulseDuration}s ease-out infinite`,
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        <span
          aria-hidden
          style={{
            position: "absolute",
            inset: BOTTOM_BAR_CONFIG.noisePulseInset,
            borderRadius: 999,
            background: BOTTOM_BAR_CONFIG.noisePulseColor,
            animation: `whiteNoisePulse ${BOTTOM_BAR_CONFIG.noisePulseDuration}s ease-out infinite`,
            animationDelay: `${
              BOTTOM_BAR_CONFIG.noisePulseDuration *
              BOTTOM_BAR_CONFIG.noisePulseDelayRatio
            }s`,
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
      </>
    );
  }

  function renderFabButton({
    className,
    onClick,
    children,
    ariaLabel,
  }: {
    className: string;
    onClick: () => void;
    children: React.ReactNode;
    ariaLabel: string;
  }) {
    const isWhiteNoiseButton = className.includes("white-noise-fab");

    return (
      <button
        type="button"
        aria-label={ariaLabel}
        className={className}
        onClick={onClick}
        style={
          {
            width: BOTTOM_BAR_CONFIG.nurseSize,
            height: BOTTOM_BAR_CONFIG.nurseSize,
            background: BOTTOM_BAR_CONFIG.nurseBg,
            backdropFilter: BOTTOM_BAR_CONFIG.nurseBlur,
            WebkitBackdropFilter: BOTTOM_BAR_CONFIG.nurseBlur,
            color: BOTTOM_BAR_CONFIG.nurseColor,
            boxShadow: BOTTOM_BAR_CONFIG.nurseShadow,
            "--nurse-active-scale": BOTTOM_BAR_CONFIG.nurseActiveScale,

            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
            border: 0,
            borderRadius: 999,
            position: "relative",
            overflow: "visible",
            zIndex: isWhiteNoiseButton && playing ? 4 : 1,
            WebkitTapHighlightColor: "transparent",
          } as CSSProperties
        }
      >
        {children}
      </button>
    );
  }

  return (
    <>
      <style jsx>{`
        @keyframes whiteNoisePulse {
          0% {
            transform: scale(1);
            opacity: 0;
          }

          12% {
            transform: scale(1.04);
            opacity: 0.62;
          }

          72% {
            transform: scale(${BOTTOM_BAR_CONFIG.noisePulseScale});
            opacity: 0;
          }

          100% {
            transform: scale(${BOTTOM_BAR_CONFIG.noisePulseScale});
            opacity: 0;
          }
        }
      `}</style>

      <div
        className="bottom-bar"
        style={
          {
            width: `min(100%, ${BOTTOM_BAR_CONFIG.maxWidth}px)`,
            paddingInline: BOTTOM_BAR_CONFIG.paddingX,
            bottom: `calc(${BOTTOM_BAR_CONFIG.bottom}px + env(safe-area-inset-bottom))`,
            zIndex: BOTTOM_BAR_CONFIG.zIndex,
          } as CSSProperties
        }
      >
        <div
          className="bottom-pill"
          style={{
            gap: BOTTOM_BAR_CONFIG.pillGap,
            padding: BOTTOM_BAR_CONFIG.pillPadding,
            background: BOTTOM_BAR_CONFIG.pillBg,
            backdropFilter: BOTTOM_BAR_CONFIG.pillBlur,
            WebkitBackdropFilter: BOTTOM_BAR_CONFIG.pillBlur,
            borderRadius: BOTTOM_BAR_CONFIG.pillRadius,
            border: BOTTOM_BAR_CONFIG.pillBorder,
            boxShadow: BOTTOM_BAR_CONFIG.pillShadow,
          }}
        >
          {TABS.map((item) => {
            const active = view === item.view;

            return (
              <button
                key={item.view}
                type="button"
                onClick={() => onChange(item.view)}
                style={{
                  padding: BOTTOM_BAR_CONFIG.tabPadding,
                  borderRadius: BOTTOM_BAR_CONFIG.tabRadius,
                  color: active
                    ? BOTTOM_BAR_CONFIG.tabActiveColor
                    : BOTTOM_BAR_CONFIG.tabColor,
                  background: active
                    ? BOTTOM_BAR_CONFIG.tabActiveBg
                    : "transparent",
                  fontSize: BOTTOM_BAR_CONFIG.tabSize,
                  fontWeight: BOTTOM_BAR_CONFIG.tabWeight,
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {showNurse ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: BOTTOM_BAR_CONFIG.fabGap,
              flexShrink: 0,
              position: "relative",
            }}
          >
            {renderFabButton({
              ariaLabel: "打开白噪音",
              className: `nurse-fab white-noise-fab ${
                playing ? "playing" : ""
              }`,
              onClick: handleWhiteNoiseButtonClick,
              children: (
                <>
                  <WhiteNoisePulse />

                  <img
                    src="/whitenoise.svg"
                    alt=""
                    style={{
                      width: BOTTOM_BAR_CONFIG.whiteNoiseIconSize,
                      height: BOTTOM_BAR_CONFIG.whiteNoiseIconSize,
                      objectFit: "contain",
                      display: "block",
                      position: "relative",
                      zIndex: 2,
                    }}
                  />
                </>
              ),
            })}

            {renderFabButton({
              ariaLabel: nursing ? "打开哺乳计时" : "哺乳",
              className: `nurse-fab nursing-fab ${nursing ? "running" : ""}`,
              onClick: onNurse,
              children: nursing ? (
                <span
                  style={{
                    color: nursingRunning
                      ? BOTTOM_BAR_CONFIG.nurseTimerColor
                      : BOTTOM_BAR_CONFIG.nurseTimerPausedColor,
                    fontSize: BOTTOM_BAR_CONFIG.nurseTimerSize,
                    fontWeight: BOTTOM_BAR_CONFIG.nurseTimerWeight,
                    lineHeight: 1,
                    fontVariantNumeric: "tabular-nums",
                    letterSpacing: "-0.04em",
                    position: "relative",
                    zIndex: 2,
                  }}
                >
                  {formatNursingButtonTime(nursingSeconds)}
                </span>
              ) : (
                <img
                  src="/moon.svg"
                  alt=""
                  style={{
                    width: BOTTOM_BAR_CONFIG.nurseIconSize,
                    height: BOTTOM_BAR_CONFIG.nurseIconSize,
                    objectFit: "contain",
                    display: "block",
                    position: "relative",
                    zIndex: 2,
                  }}
                />
              ),
            })}
          </div>
        ) : (
          <div
            aria-hidden
            style={{
              width:
                BOTTOM_BAR_CONFIG.nurseSize * 2 + BOTTOM_BAR_CONFIG.fabGap,
              height: BOTTOM_BAR_CONFIG.nurseSize,
              flexShrink: 0,
              pointerEvents: "none",
              opacity: 0,
            }}
          />
        )}
      </div>

      {whiteNoiseOpen && (
        <WhiteNoiseSheet
          sounds={sounds}
          loading={loadingSounds}
          playing={playing}
          activeSoundId={activeSoundId}
          onToggleSound={toggleSound}
          onClose={closeWhiteNoisePanel}
        />
      )}
    </>
  );
}