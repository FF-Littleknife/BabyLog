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
  nurseColor: "#111111", // 圆形功能按钮内部文字/图形颜色
  nurseShadow: "0 18px 60px rgba(0,0,0,.16)", // 圆形功能按钮阴影
  nurseActiveScale: 0.93, // 按钮按下时缩放比例；越小按压感越明显

  nurseIconSize: 48, // 哺乳按钮月亮图标尺寸 px
  nurseStopSize: 24, // 哺乳计时中停止方块尺寸 px
  nurseStopColor: "#111111", // 哺乳计时中停止方块颜色

  whiteNoiseIconSize: 38, // 白噪音图标尺寸 px

  // 播放中白噪音按钮的扩散动画
  noisePulseColor: "rgba(255,255,255,.86)", // 扩散动画颜色；最后一位 .86 是透明度
  noisePulseDuration: 1.55, // 每一圈扩散动画持续时间，单位秒；越大越慢
  noisePulseScale: 1.82, // 扩散动画最大放大比例；越大扩散范围越大
};

const TABS: { view: ViewType; label: string }[] = [
  { view: "home", label: "记录" },
  { view: "timeline", label: "时间线" },
];

// 放在组件外面，避免 BottomBar 因为其他弹窗重载/卸载时把音频一起弄停。
// 只有用户明确点“当前正在播放的音频胶囊”时，才会暂停。
let sharedAudio: HTMLAudioElement | null = null;
let sharedActiveSoundId: string | null = null;
let sharedPlaying = false;

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}

export default function BottomBar({
  view,
  onChange,
  onNurse,
  nursing,
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
        const response = await fetch("/api/sounds", {
          signal: controller.signal,
          cache: "no-store",
        });

        const data = (await response.json()) as { sounds?: SoundItem[] };

        if (!controller.signal.aborted) {
          setSounds(Array.isArray(data.sounds) ? data.sounds : []);
        }
      } catch (error) {
        if (!isAbortError(error)) {
          setSounds([]);
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

    if (audio.src !== new URL(sound.src, window.location.href).href) {
      audio.pause();
      audio.src = sound.src;
      audio.currentTime = 0;
    }

    audio.loop = true;

    try {
      await audio.play();
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
            inset: -2,
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
            inset: -2,
            borderRadius: 999,
            background: BOTTOM_BAR_CONFIG.noisePulseColor,
            animation: `whiteNoisePulse ${BOTTOM_BAR_CONFIG.noisePulseDuration}s ease-out infinite`,
            animationDelay: `${BOTTOM_BAR_CONFIG.noisePulseDuration / 2}s`,
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
            transform: scale(0.86);
            opacity: 0.76;
          }

          62% {
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
              ariaLabel: nursing ? "停止哺乳计时" : "哺乳",
              className: `nurse-fab ${nursing ? "running" : ""}`,
              onClick: onNurse,
              children: nursing ? (
                <span
                  style={{
                    fontSize: BOTTOM_BAR_CONFIG.nurseStopSize,
                    color: BOTTOM_BAR_CONFIG.nurseStopColor,
                    lineHeight: 1,
                    position: "relative",
                    zIndex: 2,
                  }}
                >
                  ■
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