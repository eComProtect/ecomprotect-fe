import { useState, useCallback, useEffect } from "react";
import { axios, url as apiBase } from "@/configs/axios.config";
import { getServiceWorkerRegistration, registerServiceWorker } from "@/utils/serviceWorker";

export type PushPermissionState = "default" | "granted" | "denied" | "unsupported";

function getInitialPermission(): PushPermissionState {
  if (typeof window === "undefined" || !("Notification" in window))
    return "unsupported";
  return Notification.permission as PushPermissionState;
}

export function usePushNotification() {
  const [permission, setPermission] = useState<PushPermissionState>(getInitialPermission);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkPermission = useCallback(() => {
    const p = getInitialPermission();
    setPermission(p);
    return p;
  }, []);

  // Check permission on mount
  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  const subscribe = useCallback(async (shop?: string): Promise<boolean> => {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      setPermission("unsupported");
      setError("Push notifications are not supported in this browser.");
      return false;
    }

    setIsSubscribing(true);
    setError(null);

    try {
      // Try to get existing registration first
      let reg = getServiceWorkerRegistration();

      // If no existing registration, try to get from navigator
      if (!reg) {
        const existingRegistrations = await navigator.serviceWorker.getRegistrations();
        if (existingRegistrations.length > 0) {
          reg = existingRegistrations[0];
        } else {
          // Register new service worker if none exists
          reg = await registerServiceWorker();
          if (!reg) {
            throw new Error("Failed to register service worker");
          }
        }
      }

      // Ensure service worker is ready
      await navigator.serviceWorker.ready;

      let perm = Notification.permission;
      if (perm === "default") {
        perm = await Notification.requestPermission();
      }
      setPermission(perm as PushPermissionState);

      if (perm !== "granted") {
        setError(perm === "denied" ? "Permission denied." : "Permission dismissed.");
        return false;
      }

      const keyRes = await fetch(`${apiBase}/notifications/vapid-public-key`, {
        credentials: "include",
      });
      if (!keyRes.ok) {
        const data = await keyRes.json().catch(() => ({}));
        throw new Error(data.message || "Could not get push key");
      }
      const { vapidPublicKey } = await keyRes.json();
      if (!vapidPublicKey) throw new Error("Missing VAPID public key");

      // Check if already subscribed
      const existingSubscription = await reg.pushManager.getSubscription();
      if (existingSubscription) {
        console.log("Already subscribed to push notifications");
        setPermission("granted");
        return true;
      }

      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
      });

      const subJson = subscription.toJSON();
      if (!subJson.endpoint || !subJson.keys?.p256dh || !subJson.keys?.auth) {
        throw new Error("Invalid subscription data received");
      }

      const response = await axios.post("/notifications/push-subscription", {
        endpoint: subJson.endpoint,
        keys: {
          p256dh: subJson.keys.p256dh,
          auth: subJson.keys.auth,
        },
        // Only meaningful (and needed) from the standalone /enable-notifications
        // tab, which has no session of its own — the dashboard's own call
        // already has one, so this is just ignored there.
        ...(shop ? { shop } : {}),
      });

      if (response.status !== 201 && response.status !== 200) {
        throw new Error("Failed to save push subscription on server");
      }

      setPermission("granted");
      setError(null);
      console.log("Push notification subscription successful");
      return true;
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to enable push notifications.";
      console.error("Push notification subscription error:", e);
      setError(message);
      setPermission(getInitialPermission());
      return false;
    } finally {
      setIsSubscribing(false);
    }
  }, []);

  return {
    permission,
    checkPermission,
    subscribe,
    isSubscribing,
    error,
    isSupported:
      typeof window !== "undefined" &&
      "Notification" in window &&
      "serviceWorker" in navigator,
  };
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const output = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    output[i] = rawData.charCodeAt(i);
  }
  return output;
}
