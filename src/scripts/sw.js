import { precacheAndRoute } from "workbox-precaching";
import CONFIG from "./config";
import { registerRoute } from "workbox-routing";
import {
  CacheFirst,
  NetworkFirst,
  StaleWhileRevalidate,
} from "workbox-strategies";

// Precache assets that are listed in the manifest
precacheAndRoute(self.__WB_MANIFEST);

// Cache rules for various resources
registerRoute(
  ({ url }) => {
    return (
      url.origin === "https://cdnjs.cloudflare.com" ||
      url.origin.includes("fontawesome")
    );
  },
  new CacheFirst({
    cacheName: "fontawesome",
  })
);

registerRoute(
  ({ request, url }) => {
    const baseUrl = new URL(CONFIG.BASE_URL);
    return baseUrl.origin === url.origin && request.destination !== "image";
  },
  new NetworkFirst({
    cacheName: "story-api",
  })
);

registerRoute(
  ({ request, url }) => {
    const baseUrl = new URL(CONFIG.BASE_URL);
    return baseUrl.origin === url.origin && request.destination === "image";
  },
  new StaleWhileRevalidate({
    cacheName: "story-api-image",
  })
);

registerRoute(
  ({ url }) => {
    return url.origin.includes("maptiler");
  },
  new CacheFirst({
    cacheName: "maptiler-api",
  })
);

// Push Notification Event Listener
self.addEventListener("push", (event) => {
  console.log("Service worker pushing...");

  async function handlePushNotification() {
    const data = await event.data.json();

    // Show notification
    const notificationOptions = {
      body: data.options.body,
      icon: data.options.icon || "/default-icon.png", // Default icon if not provided
      badge: data.options.badge || "/default-badge.png", // Default badge if not provided
    };

    await self.registration.showNotification(data.title, notificationOptions);
  }

  event.waitUntil(handlePushNotification());
});

// Notification Click Event Listener
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  // Define where to navigate when notification is clicked
  const urlToOpen = event.notification.data.url || "https://default-url.com"; // Use a default URL if not set
  event.waitUntil(clients.openWindow(urlToOpen));
});
