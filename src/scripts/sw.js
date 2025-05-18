import { precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import {
  CacheFirst,
  NetworkFirst,
  StaleWhileRevalidate,
} from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";
import { CacheableResponsePlugin } from "workbox-cacheable-response";
import CONFIG from "./config";

// Precache all assets defined by webpack
precacheAndRoute(self.__WB_MANIFEST);

// Cache FontAwesome from CDN
registerRoute(
  ({ url }) =>
    url.origin === "https://cdnjs.cloudflare.com" ||
    url.origin.includes("fontawesome"),
  new CacheFirst({
    cacheName: "fontawesome-cache",
    plugins: [
      new ExpirationPlugin({
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        maxEntries: 60,
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// Cache API responses except images
registerRoute(
  ({ request, url }) => {
    const baseUrl = new URL(CONFIG.BASE_URL);
    return baseUrl.origin === url.origin && request.destination !== "image";
  },
  new NetworkFirst({
    cacheName: "story-api-cache",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 24 * 60 * 60, // 1 day
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// Cache API images
registerRoute(
  ({ request, url }) => {
    const baseUrl = new URL(CONFIG.BASE_URL);
    return baseUrl.origin === url.origin && request.destination === "image";
  },
  new StaleWhileRevalidate({
    cacheName: "story-api-image-cache",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// Cache MapTiler API
registerRoute(
  ({ url }) => url.origin.includes("maptiler"),
  new CacheFirst({
    cacheName: "maptiler-api-cache",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// Cache other static assets
registerRoute(
  ({ request }) =>
    request.destination === "style" ||
    request.destination === "script" ||
    request.destination === "font" ||
    request.destination === "manifest",
  new StaleWhileRevalidate({
    cacheName: "static-resources",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 24 * 60 * 60, // 1 day
      }),
    ],
  })
);

// Handle push notifications
self.addEventListener("push", (event) => {
  console.log("Service Worker: Received push event");

  let notificationData = {
    title: "New Story Update",
    options: {
      body: "Someone just posted a new story!",
      icon: "/assets/icons/icon-192x192.png",
      badge: "/assets/icons/icon-72x72.png",
      actions: [
        {
          action: "open",
          title: "Open Story App",
        },
        {
          action: "close",
          title: "Close",
        },
      ],
    },
  };

  try {
    if (event.data) {
      const data = JSON.parse(event.data.text());
      notificationData = {
        title: data.title || notificationData.title,
        options: {
          ...notificationData.options,
          body: data.body || notificationData.options.body,
          icon: data.icon || notificationData.options.icon,
          data: data,
        },
      };
    }
  } catch (error) {
    console.error("Error parsing push data:", error);
  }

  event.waitUntil(
    self.registration.showNotification(
      notificationData.title,
      notificationData.options
    )
  );
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  console.log("Notification click received.");

  event.notification.close();

  let urlToOpen = "/";

  // Handle action clicks
  if (event.action === "close") {
    return;
  }

  if (event.action === "open" || !event.action) {
    if (event.notification.data && event.notification.data.url) {
      urlToOpen = event.notification.data.url;
    }
  }

  event.waitUntil(
    clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((windowClients) => {
        // Check if there is already a window/tab open with the target URL
        const hadWindowToFocus = windowClients.some((windowClient) => {
          // Focus if already open
          if (windowClient.url.includes(urlToOpen)) {
            windowClient.focus();
            return true;
          }
          return false;
        });

        // If no window/tab is already open, then open one
        if (!hadWindowToFocus) {
          return clients.openWindow(
            new URL(urlToOpen, self.location.origin).href
          );
        }
      })
  );
});

// Handle background sync (optional for offline functionality)
self.addEventListener("sync", (event) => {
  console.log("Background sync event received");
  if (event.tag === "sync-stories") {
    event.waitUntil(syncStories());
  }
});

async function syncStories() {
  // Implement background sync logic here if needed
  console.log("Syncing stories in background...");
}
