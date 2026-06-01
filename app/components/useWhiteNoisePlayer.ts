"use client";

import { useCallback, useEffect, useState } from "react";
import type { SoundItem } from "@/app/components/WhiteNoiseSheet";

type PlayerSnapshot = {
  playing: boolean;
  activeSoundId: string | null;
};

type WhiteNoiseStore = {
  audio: HTMLAudioElement | null;
  activeSoundId: string | null;
  playing: boolean;
  playToken: number;
  listeners: Set<() => void>;
};

declare global {
  interface Window {
    __babyLogWhiteNoiseStore?: WhiteNoiseStore;
  }
}

const INITIAL_SNAPSHOT: PlayerSnapshot = {
  playing: false,
  activeSoundId: null,
};

function canUseWindow() {
  return typeof window !== "undefined";
}

function getStore(): WhiteNoiseStore {
  if (!canUseWindow()) {
    return {
      audio: null,
      activeSoundId: null,
      playing: false,
      playToken: 0,
      listeners: new Set(),
    };
  }

  if (!window.__babyLogWhiteNoiseStore) {
    window.__babyLogWhiteNoiseStore = {
      audio: null,
      activeSoundId: null,
      playing: false,
      playToken: 0,
      listeners: new Set(),
    };
  }

  return window.__babyLogWhiteNoiseStore;
}

function emitStoreChange() {
  const store = getStore();

  store.listeners.forEach((listener) => {
    listener();
  });
}

function setStoreState(next: Partial<PlayerSnapshot>) {
  const store = getStore();

  const nextPlaying =
    typeof next.playing === "boolean" ? next.playing : store.playing;

  const nextActiveSoundId =
    "activeSoundId" in next ? next.activeSoundId ?? null : store.activeSoundId;

  const changed =
    store.playing !== nextPlaying || store.activeSoundId !== nextActiveSoundId;

  if (!changed) return;

  store.playing = nextPlaying;
  store.activeSoundId = nextActiveSoundId;

  emitStoreChange();
}

function getSnapshot(): PlayerSnapshot {
  if (!canUseWindow()) return INITIAL_SNAPSHOT;

  const store = getStore();

  return {
    playing: store.playing,
    activeSoundId: store.activeSoundId,
  };
}

function ensureAudio() {
  const store = getStore();

  if (store.audio) return store.audio;

  const audio = new Audio();
  audio.loop = true;
  audio.preload = "auto";

  audio.addEventListener("playing", () => {
    const currentStore = getStore();

    if (!currentStore.activeSoundId) return;

    setStoreState({
      playing: true,
      activeSoundId: currentStore.activeSoundId,
    });
  });

  audio.addEventListener("pause", () => {
    const currentStore = getStore();

    /**
     * 这里不主动 set playing:false。
     * 停止/切换时我们已经在点击逻辑里立即更新 UI。
     * 如果在这里根据 pause 事件回写，很容易切换时把新状态误杀。
     */
    if (!currentStore.playing) {
      setStoreState({
        playing: false,
        activeSoundId: currentStore.activeSoundId,
      });
    }
  });

  audio.addEventListener("ended", () => {
    setStoreState({
      playing: false,
    });
  });

  audio.addEventListener("error", () => {
    setStoreState({
      playing: false,
    });
  });

  store.audio = audio;

  return audio;
}

function setAudioSource(audio: HTMLAudioElement, src: string) {
  const absoluteSrc = new URL(src, window.location.href).href;

  if (audio.src === absoluteSrc) {
    audio.currentTime = 0;
    return;
  }

  audio.src = src;
  audio.currentTime = 0;
}

async function playAudioWithSource(audio: HTMLAudioElement, src: string) {
  setAudioSource(audio, src);
  audio.loop = true;
  audio.preload = "auto";

  await audio.play();
}

function isActuallyPlaying(audio: HTMLAudioElement | null) {
  if (!audio) return false;
  return !audio.paused && !audio.ended;
}

function syncFromAudio() {
  if (!canUseWindow()) return;

  const store = getStore();

  setStoreState({
    playing: isActuallyPlaying(store.audio),
    activeSoundId: store.activeSoundId,
  });
}

export function useWhiteNoisePlayer() {
  const [snapshot, setSnapshot] = useState<PlayerSnapshot>(() => getSnapshot());

  useEffect(() => {
    const store = getStore();

    function handleChange() {
      const nextSnapshot = getSnapshot();

      setSnapshot((prev) => {
        if (
          prev.playing === nextSnapshot.playing &&
          prev.activeSoundId === nextSnapshot.activeSoundId
        ) {
          return prev;
        }

        return nextSnapshot;
      });
    }

    store.listeners.add(handleChange);
    handleChange();

    function handleVisible() {
      if (document.visibilityState === "visible") {
        syncFromAudio();
      }
    }

    function handleFocus() {
      syncFromAudio();
    }

    function handlePageShow() {
      syncFromAudio();
    }

    document.addEventListener("visibilitychange", handleVisible);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("pageshow", handlePageShow);

    return () => {
      store.listeners.delete(handleChange);
      document.removeEventListener("visibilitychange", handleVisible);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, []);

  const playSound = useCallback(async (sound: SoundItem) => {
    const store = getStore();
    const audio = ensureAudio();

    const token = store.playToken + 1;
    store.playToken = token;

    /**
     * 关键：先立即更新 UI。
     * 这样点另一个声音时，按钮会马上切到新的播放中状态。
     */
    setStoreState({
      playing: true,
      activeSoundId: sound.id,
    });

    try {
      audio.pause();

      try {
        await playAudioWithSource(audio, sound.src);
      } catch (error) {
        if (!sound.fallbackSrc) throw error;

        await playAudioWithSource(audio, sound.fallbackSrc);
      }

      if (getStore().playToken !== token) return;

      setStoreState({
        playing: true,
        activeSoundId: sound.id,
      });
    } catch (error) {
      console.error("white noise play failed:", error);

      if (getStore().playToken === token) {
        setStoreState({
          playing: false,
          activeSoundId: sound.id,
        });
      }
    }
  }, []);

  const pause = useCallback(() => {
    const store = getStore();

    store.playToken += 1;

    /**
     * 关键：停止也立刻更新 UI。
     */
    setStoreState({
      playing: false,
      activeSoundId: store.activeSoundId,
    });

    if (store.audio) {
      store.audio.pause();
    }
  }, []);

  const toggleSound = useCallback(
    (sound: SoundItem) => {
      const store = getStore();
      const isCurrentSound = store.activeSoundId === sound.id;

      if (isCurrentSound && store.playing) {
        pause();
        return;
      }

      playSound(sound);
    },
    [pause, playSound]
  );

  const sync = useCallback(() => {
    syncFromAudio();
  }, []);

  return {
    playing: snapshot.playing,
    activeSoundId: snapshot.activeSoundId,
    playSound,
    pause,
    toggleSound,
    sync,
  };
}