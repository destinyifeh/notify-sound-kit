import type { SoundEngine, SoundName } from "../core/types.js";
import { getSoundKey, isBuiltInSound } from "../core/soundRegistry.js";
import { requireOptional } from "../core/env.js";

// React Native bare sound engine using react-native-sound
// Users must install react-native-sound as a peer dependency

let globalVolume = 0.7;
let currentSound: any = null;

export const bareSoundEngine: SoundEngine = {
  async play(sound: SoundName | string, volume?: number): Promise<void> {
    const vol = volume ?? globalVolume;
    const key = getSoundKey(sound);

    // Stop any currently playing sound
    this.stop();

    const SoundModule = requireOptional("react-native-sound", () => require("react-native-sound"));
    if (!SoundModule) {
      return;
    }

    const SoundClass = typeof SoundModule === "object" && SoundModule !== null && "default" in SoundModule ? SoundModule.default : SoundModule;
    if (typeof SoundClass?.setCategory === "function") {
      SoundClass.setCategory("Playback");
    }

    return new Promise((resolve, reject) => {
      // For built-in sounds, load from the package's sounds directory
      const s = new SoundClass(key, SoundClass.MAIN_BUNDLE, (error: any) => {
        if (error) {
          // Silently fail — sound is optional
          resolve();
          return;
        }
        currentSound = s;
        s.setVolume(vol);
        s.play((success: boolean) => {
          currentSound = null;
          s.release();
          resolve();
        });
      });
    });
  },

  stop(): void {
    if (currentSound) {
      currentSound.stop();
      currentSound.release();
      currentSound = null;
    }
  },

  setVolume(volume: number): void {
    globalVolume = Math.max(0, Math.min(1, volume));
  },
};
