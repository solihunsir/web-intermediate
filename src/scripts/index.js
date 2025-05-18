import "../styles/styles.css";
import "leaflet/dist/leaflet.css";

import App from "./pages/app";
import Camera from "./utils/camera";
import { isServiceWorkerAvailable } from "./utils";

// Fungsi utilitas untuk konversi Base64 ke UInt8Array (untuk Web Push)
export function convertBase64ToUint8Array(base64String) {
  // Hapus padding jika ada
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

// Function to show loading indicator
function showAppLoading() {
  const loadingElement = document.getElementById("app-loading");
  if (loadingElement) {
    loadingElement.style.display = "block";
  }
}

// Function to hide loading indicator
function hideAppLoading() {
  const loadingElement = document.getElementById("app-loading");
  if (loadingElement) {
    loadingElement.style.display = "none";
  }
}

// Handle app installation
function handleAppInstallation() {
  // Check if the app is running in standalone mode (installed as PWA)
  if (window.matchMedia("(display-mode: standalone)").matches) {
    document.body.classList.add("pwa-installed");
    console.log("App is running as installed PWA");
  }

  // Listen for app installation
  window.addEventListener("appinstalled", () => {
    console.log("PWA was installed successfully");
    // You can track this event for analytics
  });
}

// Handle service worker updates
async function handleServiceWorkerUpdates() {
  if (!isServiceWorkerAvailable()) return;

  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration) return;

  // Check for updates periodically
  setInterval(() => {
    registration.update();
  }, 60000); // Check every minute

  // Handle service worker messages
  navigator.serviceWorker.addEventListener("message", (event) => {
    console.log("Message from service worker:", event.data);

    if (event.data && event.data.type === "SKIP_WAITING") {
      // Reload the page when new service worker takes control
      window.location.reload();
    }
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    showAppLoading();

    // Initialize PWA features
    handleAppInstallation();
    await handleServiceWorkerUpdates();

    // Initialize the main app
    const app = new App({
      content: document.getElementById("main-content"),
      drawerButton: document.getElementById("drawer-button"),
      navigationDrawer: document.getElementById("navigation-drawer"),
      skipLinkButton: document.getElementById("skip-link"),
    });

    await app.renderPage();
    hideAppLoading();

    // Handle hash changes
    window.addEventListener("hashchange", async () => {
      showAppLoading();
      await app.renderPage();
      Camera.stopAllStreams();
      hideAppLoading();
    });

    // Handle online/offline events
    window.addEventListener("online", () => {
      console.log("App is online");
      document.body.classList.remove("offline");
      document.body.classList.add("online");
    });

    window.addEventListener("offline", () => {
      console.log("App is offline");
      document.body.classList.remove("online");
      document.body.classList.add("offline");
    });

    // Set initial online/offline state
    if (navigator.onLine) {
      document.body.classList.add("online");
    } else {
      document.body.classList.add("offline");
    }
  } catch (error) {
    console.error("Error initializing app:", error);
    hideAppLoading();

    // Show error message to user
    const mainContent = document.getElementById("main-content");
    if (mainContent) {
      mainContent.innerHTML = `
        <div class="error-container">
          <h2>Terjadi Kesalahan</h2>
          <p>Maaf, aplikasi tidak dapat dimuat dengan benar.</p>
          <button onclick="window.location.reload()" class="btn">Muat Ulang</button>
        </div>
      `;
    }
  }
});
