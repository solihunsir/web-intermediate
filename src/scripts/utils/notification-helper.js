import { convertBase64ToUint8Array } from "./index";
import CONFIG from "../config";
import {
  subscribePushNotification,
  unsubscribePushNotification,
} from "../data/api";
import Swal from "sweetalert2";

export function isNotificationAvailable() {
  return "Notification" in window;
}

export function isNotificationGranted() {
  return Notification.permission === "granted";
}

export async function requestNotificationPermission() {
  if (!isNotificationAvailable()) {
    console.error("Notification API unsupported.");
    return false;
  }

  if (isNotificationGranted()) {
    return true;
  }

  const status = await Notification.requestPermission();

  if (status === "denied") {
    await Swal.fire({
      icon: "error",
      title: "Notifikasi ditolak.",
      confirmButtonText: "Okee",
    });
    return false;
  }

  if (status === "default") {
    await Swal.fire({
      icon: "error",
      title: "Notifikasi ditutup atau ditolak.",
      confirmButtonText: "Oke",
    });
    return false;
  }

  return true;
}

export async function getPushSubscription() {
  if (!("serviceWorker" in navigator)) {
    console.error("Service tidak tersedia.");
    return null;
  }
  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration) {
    console.error("Service Worker tidak terdaftar.");
    return null;
  }

  if (!registration.pushManager) {
    console.error("PushManager tidak tersedia.");
    return null;
  }

  return await registration.pushManager.getSubscription();
}

export async function isCurrentPushSubscriptionAvailable() {
  return !!(await getPushSubscription());
}

export function generateSubscribeOptions() {
  return {
    userVisibleOnly: true,
    applicationServerKey: convertBase64ToUint8Array(CONFIG.VAPID_PUBLIC_KEY),
  };
}

export async function subscribe() {
  if (!(await requestNotificationPermission())) {
    return;
  }

  if (await isCurrentPushSubscriptionAvailable()) {
    await Swal.fire({
      icon: "info",
      title: "Sudah berlangganan.",
      confirmButtonText: "Okee",
    });
    return;
  }

  console.log("Mulai berlangganan.");

  const failureSubscribeMessage = "Langganan gagal diaktifkan.";
  const successSubscribeMessage = "Langganan berhasil diaktifkan.";

  let pushSubscription;

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    pushSubscription = await registration.pushManager.subscribe(
      generateSubscribeOptions()
    );

    const { endpoint, keys } = pushSubscription.toJSON();
    console.log({ endpoint, keys });
    const response = await subscribePushNotification({ endpoint, keys });

    if (!response.ok) {
      console.error("subscribe response:", response);
      await Swal.fire({
        icon: "error",
        title: failureSubscribeMessage,
        confirmButtonText: "Oke",
      });

      await pushSubscription.unsubscribe();

      return;
    }

    await Swal.fire({
      icon: "success",
      title: successSubscribeMessage,
      confirmButtonText: "Oke",
    });
  } catch (error) {
    console.error("subscribe error:", error);
    await Swal.fire({
      icon: "error",
      title: failureSubscribeMessage,
      confirmButtonText: "Oke",
    });
    await pushSubscription.unsubscribe();
  }
}

export async function unsubscribe() {
  const failureUnsubscribeMessage = "Langganan gagal dinonaktifkan.";
  const successUnsubscribeMessage = "Langganan berhasil dinonaktifkan.";
  try {
    const pushSubscription = await getPushSubscription();
    if (!pushSubscription) {
      await Swal.fire({
        icon: "info",
        title:
          "Tidak bisa memutus langganan karena belum berlangganan dari sebelumnya.",
        confirmButtonText: "Oke",
      });
      return;
    }
    const { endpoint, keys } = pushSubscription.toJSON();
    const response = await unsubscribePushNotification({ endpoint });
    if (!response.ok) {
      await Swal.fire({
        icon: "error",
        title: unsubscribePushNotification(),
        confirmButtonText: "Oke",
      });
      console.error("unsubscribe: response:", response);
      return;
    }
    const unsubscribed = await pushSubscription.unsubscribe();
    if (!unsubscribed) {
      await Swal.fire({
        icon: "error",
        title: failureUnsubscribeMessage,
        confirmButtonText: "Oke",
      });
      await subscribePushNotification({ endpoint, keys });
      return;
    }

    await Swal.fire({
      icon: "success",
      title: successUnsubscribeMessage,
      confirmButtonText: "Oke",
    });
  } catch (error) {
    await Swal.fire({
      icon: "error",
      title: failureUnsubscribeMessage,
      confirmButtonText: "Oke",
    });
    console.error("unsubscribe: error:", error);
  }
}
