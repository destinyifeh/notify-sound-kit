import type { NotifyPayload } from "../core/types.js";
import { show, dismiss, dismissAll, setSoundEngine } from "../core/manager.js";
import { setConfig, setTheme, getConfig, resetConfig } from "../core/config.js";
import { registerSound } from "../core/soundRegistry.js";

// Auto-detect: Expo or Bare RN
function autoDetectSoundEngine() {
  try {
    require("expo-av");
    const { expoSoundEngine } = require("./sound.expo.js");
    setSoundEngine(expoSoundEngine);
  } catch {
    try {
      require("react-native-sound");
      const { bareSoundEngine } = require("./sound.bare.js");
      setSoundEngine(bareSoundEngine);
    } catch {
      // No sound library available — sound will be silently skipped
    }
  }
}

autoDetectSoundEngine();

export function notify(payload: NotifyPayload): string {
  const { delay, ...rest } = payload;

  if (delay && delay > 0) {
    let notificationId = "";
    setTimeout(() => {
      notificationId = show(rest);
    }, delay);
    return notificationId;
  }

  return show(rest);
}

export { dismiss, dismissAll, setConfig, setTheme, getConfig, resetConfig, registerSound };
export { setSoundEngine } from "../core/manager.js";
export { bareSoundEngine } from "./sound.bare.js";
export { expoSoundEngine } from "./sound.expo.js";
