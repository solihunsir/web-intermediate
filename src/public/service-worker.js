// File: public/service-worker.js

const CACHE_NAME = "story-app-cache-v2"; // Gunakan versi baru untuk cache
const URLS_TO_CACHE = [
  "/", // Halaman utama
  "/index.html", // Halaman utama
  "/assets/icons/icon-192x192.png",
  "/assets/icons/icon-512x512.png",
  "/styles/main.css", // Gaya
  "/scripts/main.js", // Script utama
  "/scripts/app.js", // Script utama aplikasi
  // Daftar file lain yang perlu dicache untuk offline mode
];

// Install Service Worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Cache berhasil dibuat");
      return cache.addAll(URLS_TO_CACHE); // Menyimpan file ke cache
    })
  );
});

// Mengambil cache untuk mode offline
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Jika ada di cache, kembalikan dari cache
        return cachedResponse;
      }

      // Jika tidak ada di cache, ambil dari jaringan
      return fetch(event.request);
    })
  );
});

// Menghapus cache lama saat service worker baru diinstall
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME]; // Cache yang akan dipertahankan
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName); // Menghapus cache lama
          }
        })
      );
    })
  );
});
