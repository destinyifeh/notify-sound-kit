import type { SoundName } from "./types.js";

// Default built-in sound mappings
// Maps logical names → file names in the sounds/ directory
const defaultSoundMap: Record<SoundName, string> = {
  success: "success.wav",
  error: "error.wav",
  warning: "warning.wav",
  message: "message.wav",
  click: "click.wav",
  ringtone: "ringtone.wav",
};

const customSounds: Record<string, string> = {};

export function getSoundKey(sound: SoundName | string): string {
  if (sound in defaultSoundMap) {
    return defaultSoundMap[sound as SoundName];
  }
  if (sound in customSounds) {
    return customSounds[sound];
  }
  // Treat as a direct path/URL
  return sound;
}

export function isBuiltInSound(sound: string): boolean {
  return sound in defaultSoundMap;
}

export function registerSound(name: string, path: string): void {
  customSounds[name] = path;
}

export function getRegisteredSounds(): Record<string, string> {
  return { ...defaultSoundMap, ...customSounds };
}
