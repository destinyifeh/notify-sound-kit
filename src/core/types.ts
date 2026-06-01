// ─── Notification Types ────────────────────────────────────────
export type NotificationType = "success" | "error" | "warning" | "info";
export type NotificationVariant = "toast" | "alert" | "modal";
export type NotificationPosition =
  | "top"
  | "bottom"
  | "center"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

export type SoundName =
  | "success"
  | "error"
  | "warning"
  | "message"
  | "click"
  | "ringtone";

export type ThemeName = "minimal" | "soft" | "sharp";

// ─── Notification Payload ──────────────────────────────────────
export interface NotifyPayload {
  title?: string;
  message: string;
  type?: NotificationType;
  variant?: NotificationVariant;
  sound?: SoundName | string;
  volume?: number;
  duration?: number;
  position?: NotificationPosition;
  dismissible?: boolean;
  vibration?: boolean;
  delay?: number;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  onPress: () => void;
  style?: "default" | "cancel" | "destructive";
}

// ─── Internal Notification Object ──────────────────────────────
export interface Notification extends Required<Omit<NotifyPayload, "delay" | "actions">> {
  id: string;
  createdAt: number;
  actions: NotificationAction[];
}

// ─── Config ────────────────────────────────────────────────────
export interface NotifyConfig {
  volume: number;
  enabled: boolean;
  duration: number;
  position: NotificationPosition;
  soundEnabled: boolean;
  queue: boolean;
  maxVisible: number;
  theme: ThemeName;
}

// ─── Sound Engine Interface ────────────────────────────────────
export interface SoundEngine {
  play(sound: SoundName | string, volume?: number): Promise<void>;
  stop(): void;
  setVolume(volume: number): void;
  preload?(sounds: string[]): Promise<void>;
}

// ─── Renderer Interface ────────────────────────────────────────
export type CustomRenderer = (notification: Notification, dismiss: () => void) => any;

// ─── Event System ──────────────────────────────────────────────
export type NotifyEventType =
  | "show"
  | "dismiss"
  | "dismiss-all"
  | "config-change";

export interface NotifyEvent {
  type: NotifyEventType;
  notification?: Notification;
  config?: Partial<NotifyConfig>;
}

export type NotifyEventListener = (event: NotifyEvent) => void;
