import { describe, it, expect, beforeEach } from "vitest";
import {
  show,
  dismiss,
  dismissAll,
  subscribe,
  getNotifications,
  setSoundEngine,
  setRenderer,
  getRenderer,
} from "../src/core/manager.js";
import { getConfig, setConfig, setTheme, resetConfig } from "../src/core/config.js";
import {
  getSoundKey,
  isBuiltInSound,
  registerSound,
  getRegisteredSounds,
} from "../src/core/soundRegistry.js";
import type { SoundEngine, Notification, NotifyEvent } from "../src/core/types.js";

// ─── Setup ─────────────────────────────────────────────────────
beforeEach(() => {
  dismissAll();
  resetConfig();
  setRenderer(null);
});

// ─── Config Tests ──────────────────────────────────────────────
describe("Config", () => {
  it("should return default config values", () => {
    const config = getConfig();
    expect(config.volume).toBe(0.7);
    expect(config.enabled).toBe(true);
    expect(config.duration).toBe(3000);
    expect(config.position).toBe("top-right");
    expect(config.soundEnabled).toBe(true);
    expect(config.queue).toBe(false);
    expect(config.maxVisible).toBe(5);
    expect(config.theme).toBe("minimal");
  });

  it("should update config with setConfig", () => {
    setConfig({ volume: 0.3, duration: 5000 });
    const config = getConfig();
    expect(config.volume).toBe(0.3);
    expect(config.duration).toBe(5000);
    // Other values unchanged
    expect(config.enabled).toBe(true);
  });

  it("should set theme", () => {
    setTheme("sharp");
    expect(getConfig().theme).toBe("sharp");
  });

  it("should reset config to defaults", () => {
    setConfig({ volume: 0.1, theme: "soft" });
    resetConfig();
    const config = getConfig();
    expect(config.volume).toBe(0.7);
    expect(config.theme).toBe("minimal");
  });
});

// ─── Sound Registry Tests ──────────────────────────────────────
describe("Sound Registry", () => {
  it("should return built-in sound file names", () => {
    expect(getSoundKey("success")).toBe("success.wav");
    expect(getSoundKey("error")).toBe("error.wav");
    expect(getSoundKey("warning")).toBe("warning.wav");
    expect(getSoundKey("message")).toBe("message.wav");
    expect(getSoundKey("click")).toBe("click.wav");
    expect(getSoundKey("ringtone")).toBe("ringtone.wav");
  });

  it("should detect built-in sounds", () => {
    expect(isBuiltInSound("success")).toBe(true);
    expect(isBuiltInSound("error")).toBe(true);
    expect(isBuiltInSound("custom-sound")).toBe(false);
  });

  it("should register and resolve custom sounds", () => {
    registerSound("payment", "/sounds/payment.mp3");
    expect(getSoundKey("payment")).toBe("/sounds/payment.mp3");
  });

  it("should pass through unknown sounds as direct paths", () => {
    expect(getSoundKey("https://example.com/ding.mp3")).toBe("https://example.com/ding.mp3");
  });

  it("should list all registered sounds", () => {
    const sounds = getRegisteredSounds();
    expect(sounds).toHaveProperty("success");
    expect(sounds).toHaveProperty("error");
  });
});

// ─── Notification Manager Tests ────────────────────────────────
describe("Notification Manager", () => {
  it("should show a notification and return an ID", () => {
    const id = show({ message: "Hello" });
    expect(id).toBeTruthy();
    expect(typeof id).toBe("string");
    expect(id.startsWith("notify-")).toBe(true);
  });

  it("should add notification to the list", () => {
    show({ message: "Test notification" });
    const notifications = getNotifications();
    expect(notifications.length).toBe(1);
    expect(notifications[0].message).toBe("Test notification");
  });

  it("should apply default values", () => {
    show({ message: "Defaults test" });
    const n = getNotifications()[0];
    expect(n.type).toBe("info");
    expect(n.variant).toBe("toast");
    expect(n.dismissible).toBe(true);
    expect(n.vibration).toBe(false);
    expect(n.position).toBe("top-right");
  });

  it("should respect custom payload values", () => {
    show({
      title: "Alert!",
      message: "Something happened",
      type: "error",
      variant: "modal",
      sound: "error",
      volume: 0.5,
      duration: 5000,
      position: "center",
      dismissible: false,
      vibration: true,
    });

    const n = getNotifications()[0];
    expect(n.title).toBe("Alert!");
    expect(n.type).toBe("error");
    expect(n.variant).toBe("modal");
    expect(n.sound).toBe("error");
    expect(n.volume).toBe(0.5);
    expect(n.duration).toBe(5000);
    expect(n.position).toBe("center");
    expect(n.dismissible).toBe(false);
    expect(n.vibration).toBe(true);
  });

  it("should dismiss a specific notification", () => {
    const id = show({ message: "Dismiss me" });
    expect(getNotifications().length).toBe(1);

    dismiss(id);
    expect(getNotifications().length).toBe(0);
  });

  it("should dismiss all notifications", () => {
    show({ message: "One" });
    show({ message: "Two" });
    show({ message: "Three" });
    expect(getNotifications().length).toBe(3);

    dismissAll();
    expect(getNotifications().length).toBe(0);
  });

  it("should not show notifications when disabled", () => {
    setConfig({ enabled: false });
    const id = show({ message: "Should not appear" });
    expect(id).toBe("");
    expect(getNotifications().length).toBe(0);
  });

  it("should cap at maxVisible when queue is off", () => {
    setConfig({ maxVisible: 2 });
    show({ message: "1" });
    show({ message: "2" });
    show({ message: "3" }); // Should push out #1

    const notifications = getNotifications();
    expect(notifications.length).toBe(2);
    expect(notifications[0].message).toBe("2");
    expect(notifications[1].message).toBe("3");
  });

  it("should not cap when queue is on", () => {
    setConfig({ queue: true, maxVisible: 2 });
    show({ message: "1" });
    show({ message: "2" });
    show({ message: "3" });

    expect(getNotifications().length).toBe(3);
  });
});

// ─── Event System Tests ────────────────────────────────────────
describe("Event System", () => {
  it("should emit 'show' event when notification is added", () => {
    const events: NotifyEvent[] = [];
    const unsubscribe = subscribe((event) => events.push(event));

    show({ message: "Event test" });

    expect(events.length).toBe(1);
    expect(events[0].type).toBe("show");
    expect(events[0].notification?.message).toBe("Event test");

    unsubscribe();
  });

  it("should emit 'dismiss' event when notification is removed", () => {
    const events: NotifyEvent[] = [];
    const unsubscribe = subscribe((event) => events.push(event));

    const id = show({ message: "Dismiss event test" });
    dismiss(id);

    expect(events.length).toBe(2);
    expect(events[1].type).toBe("dismiss");
    expect(events[1].notification?.id).toBe(id);

    unsubscribe();
  });

  it("should emit 'dismiss-all' event", () => {
    const events: NotifyEvent[] = [];
    const unsubscribe = subscribe((event) => events.push(event));

    show({ message: "A" });
    show({ message: "B" });
    dismissAll();

    const dismissAllEvent = events.find((e) => e.type === "dismiss-all");
    expect(dismissAllEvent).toBeDefined();

    unsubscribe();
  });

  it("should unsubscribe correctly", () => {
    let callCount = 0;
    const unsubscribe = subscribe(() => callCount++);

    show({ message: "Before unsub" });
    expect(callCount).toBe(1);

    unsubscribe();

    show({ message: "After unsub" });
    expect(callCount).toBe(1); // Should not increase
  });
});

// ─── Sound Engine Integration Tests ────────────────────────────
describe("Sound Engine", () => {
  it("should call play on the sound engine when showing a notification with sound", () => {
    let playedSound = "";
    let playedVolume = 0;

    const mockEngine: SoundEngine = {
      play: async (sound, volume) => {
        playedSound = sound;
        playedVolume = volume ?? 0;
      },
      stop: () => {},
      setVolume: () => {},
    };

    setSoundEngine(mockEngine);
    show({ message: "Sound test", sound: "success", volume: 0.8 });

    expect(playedSound).toBe("success");
    expect(playedVolume).toBe(0.8);
  });

  it("should not play sound when soundEnabled is false", () => {
    let soundPlayed = false;

    const mockEngine: SoundEngine = {
      play: async () => { soundPlayed = true; },
      stop: () => {},
      setVolume: () => {},
    };

    setSoundEngine(mockEngine);
    setConfig({ soundEnabled: false });
    show({ message: "No sound", sound: "success" });

    expect(soundPlayed).toBe(false);
  });

  it("should not play sound when no sound is specified", () => {
    let soundPlayed = false;

    const mockEngine: SoundEngine = {
      play: async () => { soundPlayed = true; },
      stop: () => {},
      setVolume: () => {},
    };

    setSoundEngine(mockEngine);
    show({ message: "No sound specified" });

    expect(soundPlayed).toBe(false);
  });
});

// ─── Custom Renderer Tests ─────────────────────────────────────
describe("Custom Renderer", () => {
  it("should store and retrieve a custom renderer", () => {
    expect(getRenderer()).toBeNull();

    const myRenderer = (notification: Notification) => `Custom: ${notification.message}`;
    setRenderer(myRenderer);

    expect(getRenderer()).toBe(myRenderer);
  });

  it("should allow clearing the custom renderer", () => {
    setRenderer((n) => n.message);
    setRenderer(null);
    expect(getRenderer()).toBeNull();
  });
});

// ─── Notification Actions Tests ────────────────────────────────
describe("Notification Actions", () => {
  it("should store actions on a notification", () => {
    let actionCalled = false;

    show({
      message: "Delete?",
      variant: "modal",
      actions: [
        { label: "Cancel", onPress: () => {}, style: "cancel" },
        { label: "Delete", onPress: () => { actionCalled = true; }, style: "destructive" },
      ],
    });

    const n = getNotifications()[0];
    expect(n.actions.length).toBe(2);
    expect(n.actions[0].label).toBe("Cancel");
    expect(n.actions[1].label).toBe("Delete");
    expect(n.actions[1].style).toBe("destructive");

    // Simulate pressing the action
    n.actions[1].onPress();
    expect(actionCalled).toBe(true);
  });
});
