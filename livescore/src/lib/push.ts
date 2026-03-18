function getVapidKey(): string {
  return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    console.warn("[Push] Service Worker not supported");
    return null;
  }
  try {
    const registration = await navigator.serviceWorker.register("/sw.js");
    await navigator.serviceWorker.ready;
    return registration;
  } catch (err) {
    console.error("[Push] SW registration failed:", err);
    return null;
  }
}

export async function subscribeToPush(
  registration: ServiceWorkerRegistration
): Promise<PushSubscription | null> {
  if (!("PushManager" in window)) return null;

  const vapidKey = getVapidKey();
  if (!vapidKey) {
    console.warn("[Push] VAPID public key not configured");
    return null;
  }

  try {
    const existing = await registration.pushManager.getSubscription();
    if (existing) return existing;

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey).buffer as ArrayBuffer,
    });
    return subscription;
  } catch (err) {
    console.error("[Push] Subscribe failed:", err);
    return null;
  }
}

export async function sendSubscriptionToServer(
  subscription: PushSubscription,
  userId?: string,
  locale?: string
): Promise<boolean> {
  try {
    const keys = subscription.toJSON().keys || {};
    const res = await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        endpoint: subscription.endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        userId,
        locale,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function syncFollowToServer(
  endpoint: string,
  fixtureId: number,
  type: "reminder" | "goal_alert",
  action: "add" | "remove"
): Promise<boolean> {
  try {
    const res = await fetch("/api/push/follow", {
      method: action === "add" ? "POST" : "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endpoint, fixtureId, type }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
