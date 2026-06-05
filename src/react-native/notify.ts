import type { NotifyPayload } from "../core/types.js";
import { show, dismiss, dismissAll, setSoundEngine } from "../core/manager.js";
import { setConfig, setTheme, getConfig, resetConfig } from "../core/config.js";
import { registerSound } from "../core/soundRegistry.js";
import { tryRequire } from "../core/env.js";

function loadBareSoundEngine() {
  return tryRequire<{ bareSoundEngine: any }>("./sound.bare.js")?.bareSoundEngine ?? null;
}

function loadExpoSoundEngine() {
  return tryRequire<{ expoSoundEngine: any }>("./sound.expo.js")?.expoSoundEngine ?? null;
}

export function autoDetectSoundEngine(): void {
  const expoModule = tryRequire("expo-av");
  if (expoModule) {
    const expoEngine = loadExpoSoundEngine();
    if (expoEngine) {
      setSoundEngine(expoEngine);
      return;
    }
  }

  const bareModule = tryRequire("react-native-sound");
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
