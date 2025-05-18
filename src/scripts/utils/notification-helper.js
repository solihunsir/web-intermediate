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
    console.error("Notification API tidak didukung di browser ini.");
    await Swal.fire({
      icon: "error",
      title: "Browser Anda tidak mendukung notifikasi.",
      confirmButtonText: "Oke",
    });
    return false;
  }

  if (isNotificationGranted()) {
    return true;
  }

  try {
    const status = await Notification.requestPermission();

    if (status === "denied") {
      await Swal.fire({
        icon: "error",
        title: "Notifikasi ditolak.",
        text: "Mohon izinkan notifikasi di pengaturan browser Anda.",
        confirmButtonText: "Oke",
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
  } catch (error) {
    console.error("Error saat meminta izin notifikasi:", error);
    await Swal.fire({
      icon: "error",
      title: "Terjadi kesalahan saat meminta izin notifikasi.",
      confirmButtonText: "Oke",
    });
    return false;
  }
}

export async function getPushSubscription() {
  if (!("serviceWorker" in navigator)) {
    console.error("Service Worker tidak tersedia.");
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    if (!registration) {
      console.error("Service Worker tidak terdaftar.");
      return null;
    }

    if (!registration.pushManager) {
      console.error("PushManager tidak tersedia.");
      return null;
    }

    return await registration.pushManager.getSubscription();
  } catch (error) {
    console.error("Error saat mendapatkan subscription:", error);
    return null;
  }
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
      confirmButtonText: "Oke",
    });
    return;
  }

  console.log("Mulai berlangganan.");

  const failureSubscribeMessage = "Langganan gagal diaktifkan.";
  const successSubscribeMessage = "Langganan berhasil diaktifkan.";

  let pushSubscription;

  try {
    // Pastikan Service Worker siap
    const registration = await navigator.serviceWorker.ready;

    pushSubscription = await registration.pushManager.subscribe(
      generateSubscribeOptions()
    );

    const { endpoint, keys } = pushSubscription.toJSON();
    console.log("Subscription info:", { endpoint, keys });

    const response = await subscribePushNotification({ endpoint, keys });

    if (!response.ok) {
      console.error("subscribe response:", response);
      await Swal.fire({
        icon: "error",
        title: failureSubscribeMessage,
        text: "Terjadi kesalahan saat berkomunikasi dengan server.",
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
      text: error.message,
      confirmButtonText: "Oke",
    });

    if (pushSubscription) {
      await pushSubscription.unsubscribe();
    }
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
        title: failureUnsubscribeMessage,
        text: "Terjadi kesalahan saat berkomunikasi dengan server.",
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
      text: error.message,
      confirmButtonText: "Oke",
    });
    console.error("unsubscribe: error:", error);
  }
}
