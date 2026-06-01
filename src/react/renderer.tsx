import React, { useEffect, useState, useCallback } from "react";
import type { Notification, ThemeName, CustomRenderer } from "../core/types.js";
import { subscribe, getNotifications, dismiss, getRenderer } from "../core/manager.js";
import { getConfig } from "../core/config.js";

// ─── Theme Styles ──────────────────────────────────────────────
const THEME_STYLES: Record<ThemeName, Record<string, string>> = {
  minimal: {
    borderRadius: "8px",
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    border: "1px solid rgba(0,0,0,0.06)",
  },
  soft: {
    borderRadius: "16px",
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
    border: "none",
  },
  sharp: {
    borderRadius: "0",
    fontFamily: "'JetBrains Mono', 'Courier New', monospace",
    boxShadow: "4px 4px 0 rgba(0,0,0,0.15)",
    border: "2px solid currentColor",
  },
};

const TYPE_COLORS: Record<string, { bg: string; text: string; accent: string }> = {
  success: { bg: "#f0fdf4", text: "#166534", accent: "#22c55e" },
  error: { bg: "#fef2f2", text: "#991b1b", accent: "#ef4444" },
  warning: { bg: "#fffbeb", text: "#92400e", accent: "#f59e0b" },
  info: { bg: "#eff6ff", text: "#1e40af", accent: "#3b82f6" },
};

const TYPE_ICONS: Record<string, string> = {
  success: "✓",
  error: "✕",
  warning: "⚠",
  info: "ℹ",
};

// ─── Position Mapping ──────────────────────────────────────────
function getPositionStyles(position: string): React.CSSProperties {
  const base: React.CSSProperties = {
    position: "fixed",
    zIndex: 99999,
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    pointerEvents: "none",
    maxWidth: "400px",
    width: "100%",
  };

  switch (position) {
    case "top":
      return { ...base, top: 16, left: "50%", transform: "translateX(-50%)" };
    case "top-left":
      return { ...base, top: 16, left: 16 };
    case "top-right":
      return { ...base, top: 16, right: 16 };
    case "bottom":
      return { ...base, bottom: 16, left: "50%", transform: "translateX(-50%)" };
    case "bottom-left":
      return { ...base, bottom: 16, left: 16 };
    case "bottom-right":
      return { ...base, bottom: 16, right: 16 };
    case "center":
      return { ...base, top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
    default:
      return { ...base, top: 16, right: 16 };
  }
}

// ─── Toast Component ───────────────────────────────────────────
function Toast({
  notification,
  theme,
  onDismiss,
}: {
  notification: Notification;
  theme: ThemeName;
  onDismiss: () => void;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const themeStyle = THEME_STYLES[theme];
  const colors = TYPE_COLORS[notification.type] || TYPE_COLORS.info;
  const icon = TYPE_ICONS[notification.type] || TYPE_ICONS.info;

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    setTimeout(onDismiss, 200);
  }, [onDismiss]);

  return React.createElement(
    "div",
    {
      style: {
        padding: "12px 16px",
        backgroundColor: colors.bg,
        color: colors.text,
        borderRadius: themeStyle.borderRadius,
        fontFamily: themeStyle.fontFamily,
        boxShadow: themeStyle.boxShadow,
        border: themeStyle.border,
        display: "flex",
        alignItems: "flex-start",
        gap: "10px",
        pointerEvents: "auto" as const,
        transition: "all 0.2s ease",
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(-8px)",
        cursor: notification.dismissible ? "pointer" : "default",
      },
      onClick: notification.dismissible ? handleDismiss : undefined,
      role: "alert",
    },
    // Icon
    React.createElement(
      "span",
      {
        style: {
          width: 24,
          height: 24,
          borderRadius: "50%",
          backgroundColor: colors.accent,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "12px",
          fontWeight: "bold",
          flexShrink: 0,
        },
      },
      icon
    ),
    // Content
    React.createElement(
      "div",
      { style: { flex: 1 } },
      notification.title &&
        React.createElement(
          "div",
          { style: { fontWeight: 600, fontSize: "14px", marginBottom: "2px" } },
          notification.title
        ),
      React.createElement(
        "div",
        { style: { fontSize: "13px", opacity: 0.9 } },
        notification.message
      )
    ),
    // Close button
    notification.dismissible &&
      React.createElement(
        "button",
        {
          onClick: (e: any) => {
            e.stopPropagation();
            handleDismiss();
          },
          style: {
            background: "none",
            border: "none",
            color: colors.text,
            cursor: "pointer",
            fontSize: "16px",
            padding: "0 2px",
            opacity: 0.5,
            lineHeight: 1,
          },
          "aria-label": "Dismiss",
        },
        "×"
      )
  );
}

// ─── Modal Overlay ─────────────────────────────────────────────
function ModalOverlay({
  notification,
  theme,
  onDismiss,
}: {
  notification: Notification;
  theme: ThemeName;
  onDismiss: () => void;
}) {
  const themeStyle = THEME_STYLES[theme];
  const colors = TYPE_COLORS[notification.type] || TYPE_COLORS.info;
  const icon = TYPE_ICONS[notification.type] || TYPE_ICONS.info;

  return React.createElement(
    "div",
    {
      style: {
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100000,
        pointerEvents: "auto" as const,
      },
    },
    React.createElement(
      "div",
      {
        style: {
          backgroundColor: "#fff",
          borderRadius: themeStyle.borderRadius,
          fontFamily: themeStyle.fontFamily,
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          padding: "24px",
          maxWidth: "420px",
          width: "90%",
          textAlign: "center" as const,
        },
      },
      // Icon
      React.createElement(
        "div",
        {
          style: {
            width: 48,
            height: 48,
            borderRadius: "50%",
            backgroundColor: colors.accent,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
            fontWeight: "bold",
            margin: "0 auto 16px",
          },
        },
        icon
      ),
      notification.title &&
        React.createElement(
          "h3",
          { style: { margin: "0 0 8px", color: colors.text, fontSize: "18px" } },
          notification.title
        ),
      React.createElement(
        "p",
        { style: { margin: "0 0 20px", color: "#555", fontSize: "14px" } },
        notification.message
      ),
      // Actions or default dismiss
      React.createElement(
        "div",
        { style: { display: "flex", gap: "8px", justifyContent: "center" } },
        notification.actions.length > 0
          ? notification.actions.map((action, i) =>
              React.createElement(
                "button",
                {
                  key: i,
                  onClick: () => {
                    action.onPress();
                    onDismiss();
                  },
                  style: {
                    padding: "8px 20px",
                    borderRadius: themeStyle.borderRadius,
                    border: action.style === "cancel" ? "1px solid #ddd" : "none",
                    backgroundColor:
                      action.style === "destructive"
                        ? "#ef4444"
                        : action.style === "cancel"
                        ? "transparent"
                        : colors.accent,
                    color: action.style === "cancel" ? "#555" : "#fff",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: 500,
                    fontFamily: themeStyle.fontFamily,
                  },
                },
                action.label
              )
            )
          : React.createElement(
              "button",
              {
                onClick: onDismiss,
                style: {
                  padding: "8px 24px",
                  borderRadius: themeStyle.borderRadius,
                  border: "none",
                  backgroundColor: colors.accent,
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 500,
                  fontFamily: themeStyle.fontFamily,
                },
              },
              "OK"
            )
      )
    )
  );
}

// ─── Main Renderer ─────────────────────────────────────────────
export function NotifyRenderer() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const config = getConfig();
  const customRenderer = getRenderer();

  useEffect(() => {
    setNotifications(getNotifications());
    const unsubscribe = subscribe(() => {
      setNotifications(getNotifications());
    });
    return unsubscribe;
  }, []);

  if (notifications.length === 0) return null;

  const toasts = notifications.filter((n) => n.variant === "toast" || n.variant === "alert");
  const modals = notifications.filter((n) => n.variant === "modal");

  return React.createElement(
    React.Fragment,
    null,
    // Toast container
    toasts.length > 0 &&
      React.createElement(
        "div",
        { style: getPositionStyles(config.position) },
        toasts.map((n) =>
          customRenderer
            ? React.createElement("div", { key: n.id, style: { pointerEvents: "auto" } }, customRenderer(n, () => dismiss(n.id)))
            : React.createElement(Toast, {
                key: n.id,
                notification: n,
                theme: config.theme,
                onDismiss: () => dismiss(n.id),
              })
        )
      ),
    // Modal overlay (only show the first one)
    modals.length > 0 &&
      (customRenderer
        ? customRenderer(modals[0], () => dismiss(modals[0].id))
        : React.createElement(ModalOverlay, {
            notification: modals[0],
            theme: config.theme,
            onDismiss: () => dismiss(modals[0].id),
          }))
  );
}
