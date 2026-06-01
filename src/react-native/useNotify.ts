import { useState, useEffect, useCallback } from "react";
import type { Notification, NotifyPayload } from "../core/types.js";
import { subscribe, getNotifications } from "../core/manager.js";
import { notify } from "./notify.js";

export function useNotify() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    setNotifications(getNotifications());

    const unsubscribe = subscribe(() => {
      setNotifications(getNotifications());
    });

    return unsubscribe;
  }, []);

  const send = useCallback((payload: NotifyPayload) => {
    return notify(payload);
  }, []);

  return { notifications, notify: send };
}
