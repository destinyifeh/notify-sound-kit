import type { NotifyPayload } from "../core/types.js";
import { show, dismiss, dismissAll, setSoundEngine } from "../core/manager.js";
import { setConfig, setTheme, getConfig, resetConfig } from "../core/config.js";
import { registerSound } from "../core/soundRegistry.js";
import { requireOptional } from "../core/env.js";

function loadBareSoundEngine() {
  const mod = requireOptional("./sound.bare.js", () => require("./sound.bare.js"));
  if (mod && typeof mod === "object" && "bareSoundEngine" in mod) {
    return (mod as { bareSoundEngine: any }).bareSoundEngine;
  }
  return null;
}

function loadExpoSoundEngine() {
  const mod = requireOptional("./sound.expo.js", () => require("./sound.expo.js"));
  if (mod && typeof mod === "object" && "expoSoundEngine" in mod) {
    return (mod as { expoSoundEngine: any }).expoSoundEngine;
  }
  return null;
}

export function autoDetectSoundEngine(): void {
  const expoModule = requireOptional("expo-av", () => require("expo-av"));
  if (expoModule) {
    const expoEngine = loadExpoSoundEngine();
    if (expoEngine) {
      setSoundEngine(expoEngine);
      return;
    }
  }

  const bareModule = requireOptional("react-native-sound", () => require("react-native-sound"));
  if (bareModule) {
    const bareEngine = loadBareSoundEngine();
    if (bareEngine) {
      setSoundEngine(bareEngine);
      return;
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
