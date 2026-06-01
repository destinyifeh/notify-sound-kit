import type { SoundEngine, SoundName } from "../core/types.js";
import { getSoundKey, isBuiltInSound } from "../core/soundRegistry.js";

// Expo sound engine using expo-av
// Users must install expo-av as a peer dependency

let globalVolume = 0.7;
let currentSound: any = null;

export const expoSoundEngine: SoundEngine = {
  async play(sound: SoundName | string, volume?: number): Promise<void> {
    const vol = volume ?? globalVolume;
    const key = getSoundKey(sound);

    // Stop any currently playing sound
    this.stop();

    try {
      const { Audio } = require("expo-av");
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
      });

      // Load the sound file
      const source =
        key.startsWith("http") || key.startsWith("file")
          ? { uri: key }
          : { uri: key };

      const { sound: playbackObject } = await Audio.Sound.createAsync(source, {
        shouldPlay: true,
        volume: vol,
      });

      currentSound = playbackObject;

      playbackObject.setOnPlaybackStatusUpdate((status: any) => {
        if (status.didJustFinish) {
          playbackObject.unloadAsync().catch(() => {});
          currentSound = null;
        }
      });
    } catch {
      // expo-av not installed or sound failed — silently skip
      return;
    }
  },

  stop(): void {
    if (currentSound) {
      currentSound.stopAsync().catch(() => {});
      currentSound.unloadAsync().catch(() => {});
      currentSound = null;
    }
  },

  setVolume(volume: number): void {
    globalVolume = Math.max(0, Math.min(1, volume));
    if (currentSound) {
      currentSound.setVolumeAsync(globalVolume).catch(() => {});
    }
  },

  async preload(sounds: string[]): Promise<void> {
    // Preloading strategy: no-op for now
    // Could be extended to cache Audio.Sound objects
  },
};
