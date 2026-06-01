import type { SoundEngine, SoundName } from "../core/types.js";
import { getSoundKey, isBuiltInSound } from "../core/soundRegistry.js";

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

    try {
      const Sound = require("react-native-sound");
      Sound.setCategory("Playback");

      return new Promise((resolve, reject) => {
        // For built-in sounds, load from the package's sounds directory
        const s = new Sound(key, Sound.MAIN_BUNDLE, (error: any) => {
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
    } catch {
      // react-native-sound not installed — silently skip
      return;
    }
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
