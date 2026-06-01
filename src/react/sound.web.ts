import type { SoundEngine, SoundName } from "../core/types.js";
import { getSoundKey, isBuiltInSound } from "../core/soundRegistry.js";
import { EMBEDDED_SOUNDS } from "./sounds.embedded.js";

let currentAudio: HTMLAudioElement | null = null;
let globalVolume = 0.7;

export const webSoundEngine: SoundEngine = {
  async play(sound: SoundName | string, volume?: number): Promise<void> {
    const vol = volume ?? globalVolume;
    const key = getSoundKey(sound);

    // Stop any currently playing audio
    this.stop();

    // Resolve the audio source:
    // 1. Built-in sound → use embedded base64 WAV
    // 2. Custom registered sound or direct URL → use as-is
    let src: string;
    if (key in EMBEDDED_SOUNDS) {
      src = EMBEDDED_SOUNDS[key];
    } else {
      // Custom sound path or URL (e.g. "/sounds/payment.mp3" or "https://...")
      src = key;
    }

    return new Promise((resolve, reject) => {
      const audio = new Audio(src);
      audio.volume = vol;
      currentAudio = audio;

      audio.onended = () => {
        currentAudio = null;
        resolve();
      };
      audio.onerror = () => {
        currentAudio = null;
        // Silently resolve instead of rejecting — sound is optional
        resolve();
      };
      audio.play().catch(() => {
        // Browser may block autoplay — silently resolve
        currentAudio = null;
        resolve();
      });
    });
  },

  stop(): void {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    }
  },

  setVolume(volume: number): void {
    globalVolume = Math.max(0, Math.min(1, volume));
  },
};
