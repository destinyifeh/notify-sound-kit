# notify-sound-kit 🔔🔊

A cross-platform notification + sound system for **React (Web)**, **React Native (Bare)**, and **Expo**. Provides toast, alert, and modal notifications with built-in sound effects, volume control, and fully customizable themes.

## Features

- **Cross-Platform:** Works on Web, React Native (Bare), and Expo out of the box.
- **Built-in Sound Effects:** Success, error, warning, message, click, and ringtone sounds with zero config.
- **3 Notification Variants:** Toast (auto-dismiss), Alert (medium priority), Modal (full attention).
- **Headless-First:** Use the core engine directly or leverage the included minimal UI.
- **Customizable Themes:** `minimal`, `soft`, `sharp` — or bring your own renderer.
- **Volume Control:** Global and per-notification volume settings.
- **Queue Support:** Optional notification queueing to prevent overlap.
- **Vibration Support:** Trigger device vibration on React Native.
- **TypeScript-First:** Full type safety across the entire API.
- **Tree-Shakeable:** Only import what you need.

## Installation

```bash
npm install notify-sound-kit
```

### Optional Peer Dependencies

For **React Native (Bare)** sound support:
```bash
npm install react-native-sound
```

For **Expo** sound support:
```bash
npx expo install expo-av
```

## Quick Start

### React (Web)

```tsx
import { notify, NotifyRenderer } from "notify-sound-kit/react";

function App() {
  return (
    <div>
      <button
        onClick={() =>
          notify({
            title: "Success!",
            message: "Payment completed successfully",
            type: "success",
            sound: "success",
          })
        }
      >
        Show Notification
      </button>

      {/* Place the renderer once at your app root */}
      <NotifyRenderer />
    </div>
  );
}
```

### React Native (Bare + Expo)

```tsx
import { View, Button } from "react-native";
import { notify, NotifyRenderer } from "notify-sound-kit/react-native";

function App() {
  return (
    <View style={{ flex: 1 }}>
      <Button
        title="Show Notification"
        onPress={() =>
          notify({
            title: "Order Received",
            message: "Your order has been placed!",
            type: "success",
            sound: "message",
            vibration: true,
          })
        }
      />

      {/* Place the renderer once at your app root */}
      <NotifyRenderer />
    </View>
  );
}
```

## API Reference

### `notify(payload)`

Show a notification with optional sound.

```ts
notify({
  title?: string,             // Optional title
  message: string,            // Required message text
  type?: "success" | "error" | "warning" | "info",  // Default: "info"
  variant?: "toast" | "alert" | "modal",             // Default: "toast"
  sound?: "success" | "error" | "warning" | "message" | "click" | "ringtone" | string,
  volume?: number,            // 0 to 1, overrides global volume
  duration?: number,          // Auto-dismiss time in ms (default: 3000)
  position?: "top" | "bottom" | "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right",
  dismissible?: boolean,      // Allow user to dismiss (default: true)
  vibration?: boolean,        // Vibrate device on RN (default: false)
  delay?: number,             // Delay before showing in ms
  actions?: [                 // Action buttons (for modals)
    { label: string, onPress: () => void, style?: "default" | "cancel" | "destructive" }
  ]
});
```

### `dismiss(id)` / `dismissAll()`

```ts
import { dismiss, dismissAll } from "notify-sound-kit/react";

const id = notify({ message: "Hello" });
dismiss(id);     // Dismiss specific notification
dismissAll();    // Clear all notifications
```

### `useNotify()` Hook

```tsx
import { useNotify } from "notify-sound-kit/react";

function MyComponent() {
  const { notifications, notify } = useNotify();

  return (
    <div>
      <p>Active notifications: {notifications.length}</p>
      <button onClick={() => notify({ message: "Hello!", type: "info" })}>
        Notify
      </button>
    </div>
  );
}
```

## Global Configuration

### `setConfig(options)`

```ts
import { setConfig } from "notify-sound-kit/react";

setConfig({
  volume: 0.6,          // Global volume (0 to 1)
  enabled: true,        // Enable/disable all notifications
  duration: 3000,       // Default auto-dismiss duration
  position: "top-right",// Default position
  soundEnabled: true,   // Enable/disable all sounds
  queue: true,          // Queue notifications instead of stacking
  maxVisible: 5,        // Max visible notifications
  theme: "minimal",     // "minimal" | "soft" | "sharp"
});
```

### `setTheme(theme)`

```ts
import { setTheme } from "notify-sound-kit/react";

setTheme("minimal"); // Clean, modern look
setTheme("soft");    // Rounded, gentle appearance
setTheme("sharp");   // Bold, monospace aesthetic
```

## Custom Renderer

Override the default UI completely:

```tsx
import { setRenderer } from "notify-sound-kit/react";

setRenderer((notification, dismiss) => (
  <div className="my-custom-toast" onClick={dismiss}>
    <strong>{notification.title}</strong>
    <p>{notification.message}</p>
  </div>
));
```

## Custom Sounds

Register your own sound files:

```ts
import { registerSound, notify } from "notify-sound-kit/react";

// Register a custom sound
registerSound("payment", "/sounds/payment-chime.mp3");

// Use it
notify({
  message: "Payment received!",
  sound: "payment",
});
```

## Built-in Sound Names

| Sound       | Description                    |
|-------------|--------------------------------|
| `success`   | Bright confirmation tone       |
| `error`     | Low alert buzz                 |
| `warning`   | Mid-range attention tone       |
| `message`   | Light notification ping        |
| `click`     | Quick tap feedback             |
| `ringtone`  | Longer notification ring       |

## Volume Control

You can control the volume both globally and on a per-notification basis. Volume values range from `0` (mute) to `1` (maximum).

### 1. Global Volume
Applies to all future notifications. The default is `0.7`.
```ts
import { setConfig } from "notify-sound-kit/react";

// Set global volume
setConfig({ volume: 0.3 });

// Or disable sound entirely
setConfig({ soundEnabled: false });
```

### 2. Per-Notification Volume
Overrides the global volume for a specific notification.
```ts
notify({
  message: "Very loud alert!",
  sound: "error",
  volume: 1.0, // Plays at max volume, ignoring global config
});
```

## Notification Variants

### Toast (Default)

Small, non-blocking notification that auto-dismisses. Perfect for success messages and quick feedback.

```ts
notify({
  message: "Changes saved successfully!",
  type: "success",
  variant: "toast",  // This is the default — you can omit it
  sound: "success",
  duration: 3000,
});
```

### Alert

Medium-priority notification. Same slide-in UI as toast but intended for more important messages with a longer display time.

```ts
notify({
  title: "Session Expiring",
  message: "Your session will expire in 5 minutes. Save your work.",
  type: "warning",
  variant: "alert",
  sound: "warning",
  duration: 8000,  // Stays visible longer
});
```

### Modal

Full-screen overlay that blocks interaction. Requires the user to press an action button to dismiss. Ideal for confirmations and destructive actions.

```ts
notify({
  title: "Delete Account?",
  message: "This action cannot be undone. All your data will be permanently deleted.",
  type: "error",
  variant: "modal",
  sound: "error",
  actions: [
    { label: "Cancel", onPress: () => {}, style: "cancel" },
    { label: "Delete", onPress: () => deleteAccount(), style: "destructive" },
  ],
});
```

> **Note:** Modals do not auto-dismiss. They stay visible until the user interacts with an action button. If no `actions` are provided, a default "OK" button is rendered.

## Platform Support

| Feature                  | React (Web) | React Native (Bare) | Expo |
|--------------------------|:-----------:|:-------------------:|:----:|
| Toast notifications      | ✅          | ✅                  | ✅   |
| Alert notifications      | ✅          | ✅                  | ✅   |
| Modal notifications      | ✅          | ✅                  | ✅   |
| Built-in sounds          | ✅ (Web Audio API) | ✅ (react-native-sound) | ✅ (expo-av) |
| Custom sound files       | ✅          | ✅                  | ✅   |
| Volume control           | ✅          | ✅                  | ✅   |
| Vibration                | ❌          | ✅                  | ✅   |
| Custom renderer          | ✅          | ✅                  | ✅   |
| Theme system             | ✅          | ✅                  | ✅   |

## License

MIT © Destiny Ifehor
