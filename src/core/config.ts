import type { NotifyConfig, ThemeName } from "./types.js";

const DEFAULT_CONFIG: NotifyConfig = {
  volume: 0.7,
  enabled: true,
  duration: 3000,
  position: "top-right",
  soundEnabled: true,
  queue: false,
  maxVisible: 5,
  theme: "minimal",
};

let currentConfig: NotifyConfig = { ...DEFAULT_CONFIG };

export function getConfig(): NotifyConfig {
  return { ...currentConfig };
}

export function setConfig(partial: Partial<NotifyConfig>): void {
  currentConfig = { ...currentConfig, ...partial };
}

export function setTheme(theme: ThemeName): void {
  currentConfig.theme = theme;
}

export function resetConfig(): void {
  currentConfig = { ...DEFAULT_CONFIG };
}
