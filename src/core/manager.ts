import type {
  Notification,
  NotifyPayload,
  NotifyEvent,
  NotifyEventListener,
  NotifyEventType,
  SoundEngine,
  CustomRenderer,
} from "./types.js";
import { getConfig } from "./config.js";

// ─── ID Generator ──────────────────────────────────────────────
let idCounter = 0;
function generateId(): string {
  return `notify-${Date.now()}-${++idCounter}`;
}

// ─── State ─────────────────────────────────────────────────────
let notifications: Notification[] = [];
let soundEngine: SoundEngine | null = null;
let customRenderer: CustomRenderer | null = null;
const listeners: Set<NotifyEventListener> = new Set();

// ─── Event System ──────────────────────────────────────────────
export function subscribe(listener: NotifyEventListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emit(event: NotifyEvent): void {
  listeners.forEach((fn) => fn(event));
}

// ─── Sound Engine ──────────────────────────────────────────────
export function setSoundEngine(engine: SoundEngine): void {
  soundEngine = engine;
}

export function getSoundEngine(): SoundEngine | null {
  return soundEngine;
}

// ─── Custom Renderer ──────────────────────────────────────────
export function setRenderer(renderer: CustomRenderer | null): void {
  customRenderer = renderer;
}

export function getRenderer(): CustomRenderer | null {
  return customRenderer;
}

// ─── Notifications State ───────────────────────────────────────
export function getNotifications(): Notification[] {
  return [...notifications];
}

// ─── Show Notification ─────────────────────────────────────────
export function show(payload: NotifyPayload): string {
  const config = getConfig();

  if (!config.enabled) return "";

  const notification: Notification = {
    id: generateId(),
    title: payload.title ?? "",
    message: payload.message,
    type: payload.type ?? "info",
    variant: payload.variant ?? "toast",
    sound: payload.sound ?? "",
    volume: payload.volume ?? config.volume,
    duration: payload.duration ?? config.duration,
    position: payload.position ?? config.position,
    dismissible: payload.dismissible ?? true,
    vibration: payload.vibration ?? false,
    createdAt: Date.now(),
    actions: payload.actions ?? [],
  };

  // Handle queue vs replace behavior
  if (config.queue) {
    notifications.push(notification);
  } else {
    // Cap at maxVisible
    if (notifications.length >= config.maxVisible) {
      notifications.shift();
    }
    notifications.push(notification);
  }

  // Play sound
  if (config.soundEnabled && notification.sound && soundEngine) {
    soundEngine.play(notification.sound, notification.volume).catch(() => {
      // Silently fail on sound errors
    });
  }

  // Emit event
  emit({ type: "show", notification });

  // Auto-dismiss for toasts and alerts
  if (notification.variant !== "modal" && notification.duration > 0) {
    setTimeout(() => {
      dismiss(notification.id);
    }, notification.duration);
  }

  return notification.id;
}

// ─── Dismiss ───────────────────────────────────────────────────
export function dismiss(id: string): void {
  const notification = notifications.find((n) => n.id === id);
  if (!notification) return;

  notifications = notifications.filter((n) => n.id !== id);
  emit({ type: "dismiss", notification });
}

export function dismissAll(): void {
  notifications = [];
  emit({ type: "dismiss-all" });
}
