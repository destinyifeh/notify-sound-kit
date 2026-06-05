import type { NotifyPayload } from "../core/types.js";
import { show, dismiss, dismissAll, setSoundEngine } from "../core/manager.js";
import { setConfig, setTheme, getConfig, resetConfig } from "../core/config.js";
import { registerSound } from "../core/soundRegistry.js";

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
