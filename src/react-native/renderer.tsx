import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  StyleSheet,
  Platform,
  Vibration,
} from "react-native";
import type { Notification, ThemeName, CustomRenderer } from "../core/types.js";
import { subscribe, getNotifications, dismiss, getRenderer } from "../core/manager.js";
import { getConfig } from "../core/config.js";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ─── Theme Styles ──────────────────────────────────────────────
const THEME_CONFIGS: Record<ThemeName, { borderRadius: number; fontFamily: string }> = {
  minimal: { borderRadius: 8, fontFamily: Platform.OS === "ios" ? "System" : "Roboto" },
  soft: { borderRadius: 16, fontFamily: Platform.OS === "ios" ? "System" : "Roboto" },
  sharp: { borderRadius: 0, fontFamily: Platform.OS === "ios" ? "Courier" : "monospace" },
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

// ─── Toast Component ───────────────────────────────────────────
function RNToast({
  notification,
  theme,
  onDismiss,
}: {
  notification: Notification;
  theme: ThemeName;
  onDismiss: () => void;
}) {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const themeConfig = THEME_CONFIGS[theme];
  const colors = TYPE_COLORS[notification.type] || TYPE_COLORS.info;
  const icon = TYPE_ICONS[notification.type] || TYPE_ICONS.info;

  useEffect(() => {
    // Handle vibration
    if (notification.vibration) {
      Vibration.vibrate(200);
    }

    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 10,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleDismiss = useCallback(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => onDismiss());
  }, [onDismiss]);

  return (
    <Animated.View
      style={{
        transform: [{ translateY: slideAnim }],
        opacity: opacityAnim,
        marginHorizontal: 16,
        marginVertical: 4,
        padding: 14,
        backgroundColor: colors.bg,
        borderRadius: themeConfig.borderRadius,
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 10,
        ...Platform.select({
          ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
          android: { elevation: 4 },
        }),
      }}
    >
      {/* Icon */}
      <View
        style={{
          width: 28,
          height: 28,
          borderRadius: 14,
          backgroundColor: colors.accent,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ color: "#fff", fontSize: 14, fontWeight: "bold" }}>{icon}</Text>
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>
        {notification.title ? (
          <Text
            style={{
              fontWeight: "600",
              fontSize: 15,
              color: colors.text,
              fontFamily: themeConfig.fontFamily,
              marginBottom: 2,
            }}
          >
            {notification.title}
          </Text>
        ) : null}
        <Text
          style={{
            fontSize: 13,
            color: colors.text,
            opacity: 0.85,
            fontFamily: themeConfig.fontFamily,
          }}
        >
          {notification.message}
        </Text>
      </View>

      {/* Close */}
      {notification.dismissible && (
        <TouchableOpacity onPress={handleDismiss} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={{ fontSize: 18, color: colors.text, opacity: 0.4 }}>×</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

// ─── Modal Component ───────────────────────────────────────────
function RNModal({
  notification,
  theme,
  onDismiss,
}: {
  notification: Notification;
  theme: ThemeName;
  onDismiss: () => void;
}) {
  const themeConfig = THEME_CONFIGS[theme];
  const colors = TYPE_COLORS[notification.type] || TYPE_COLORS.info;
  const icon = TYPE_ICONS[notification.type] || TYPE_ICONS.info;

  return (
    <Modal transparent animationType="fade" visible>
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "center",
          alignItems: "center",
          padding: 24,
        }}
      >
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: themeConfig.borderRadius,
            padding: 24,
            width: "100%",
            maxWidth: 360,
            alignItems: "center",
          }}
        >
          {/* Icon */}
          <View
            style={{
              width: 52,
              height: 52,
              borderRadius: 26,
              backgroundColor: colors.accent,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 22, fontWeight: "bold" }}>{icon}</Text>
          </View>

          {notification.title ? (
            <Text
              style={{
                fontWeight: "600",
                fontSize: 18,
                color: colors.text,
                textAlign: "center",
                fontFamily: themeConfig.fontFamily,
                marginBottom: 8,
              }}
            >
              {notification.title}
            </Text>
          ) : null}

          <Text
            style={{
              fontSize: 14,
              color: "#555",
              textAlign: "center",
              fontFamily: themeConfig.fontFamily,
              marginBottom: 20,
              lineHeight: 20,
            }}
          >
            {notification.message}
          </Text>

          {/* Actions */}
          <View style={{ flexDirection: "row", gap: 8 }}>
            {notification.actions.length > 0 ? (
              notification.actions.map((action, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => {
                    action.onPress();
                    onDismiss();
                  }}
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    borderRadius: themeConfig.borderRadius,
                    backgroundColor:
                      action.style === "destructive"
                        ? "#ef4444"
                        : action.style === "cancel"
                        ? "transparent"
                        : colors.accent,
                    borderWidth: action.style === "cancel" ? 1 : 0,
                    borderColor: "#ddd",
                  }}
                >
                  <Text
                    style={{
                      color: action.style === "cancel" ? "#555" : "#fff",
                      fontWeight: "500",
                      fontSize: 14,
                      fontFamily: themeConfig.fontFamily,
                    }}
                  >
                    {action.label}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <TouchableOpacity
                onPress={onDismiss}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 28,
                  borderRadius: themeConfig.borderRadius,
                  backgroundColor: colors.accent,
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "500", fontSize: 14, fontFamily: themeConfig.fontFamily }}>
                  OK
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
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

  const isTop = config.position.includes("top") || config.position === "center";

  return (
    <>
      {/* Toast container */}
      {toasts.length > 0 && (
        <View
          style={{
            position: "absolute",
            top: isTop ? Platform.OS === "ios" ? 50 : 30 : undefined,
            bottom: !isTop ? 30 : undefined,
            left: 0,
            right: 0,
            zIndex: 99999,
          }}
          pointerEvents="box-none"
        >
          {toasts.map((n) =>
            customRenderer ? (
              <View key={n.id}>{customRenderer(n, () => dismiss(n.id))}</View>
            ) : (
              <RNToast
                key={n.id}
                notification={n}
                theme={config.theme}
                onDismiss={() => dismiss(n.id)}
              />
            )
          )}
        </View>
      )}

      {/* Modal */}
      {modals.length > 0 &&
        (customRenderer ? (
          customRenderer(modals[0], () => dismiss(modals[0].id))
        ) : (
          <RNModal
            notification={modals[0]}
            theme={config.theme}
            onDismiss={() => dismiss(modals[0].id)}
          />
        ))}
    </>
  );
}
