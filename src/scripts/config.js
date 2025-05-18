const CONFIG = {
  BASE_URL: "https://story-api.dicoding.dev/v1",
  VAPID_PUBLIC_KEY:
    "BIRgmwC9GhzAFcUlyg4gm2QVd6Qm809Xk01Ku9h3N2w_4_IwtFXTRoAEyWDc2PS7z0dqYVF_nZz27-_X2E0-rjU",

  // CACHE
  CACHE_NAME: "StoryApp-V1",

  // PWA Configuration
  PWA: {
    // Minimum requirements for PWA installability
    MIN_VIEWPORT_SIZE: 320,
    ICON_SIZES: [72, 96, 128, 144, 152, 192, 384, 512],
    ORIENTATION: "portrait-primary",
    DISPLAY_MODE: "standalone",

    // Background sync
    SYNC_TAG: "story-sync",

    // Notification settings
    NOTIFICATION_DEFAULTS: {
      icon: "/assets/icons/icon-192x192.png",
      badge: "/assets/icons/icon-72x72.png",
      vibrate: [200, 100, 200],
      requireInteraction: false,
    },
  },

  // API Timeout settings
  API_TIMEOUT: 10000, // 10 seconds

  // Offline settings
  OFFLINE: {
    MAX_CACHE_AGE: 7 * 24 * 60 * 60 * 1000, // 7 days
    MAX_CACHED_ITEMS: 100,
  },
};

export default CONFIG;
