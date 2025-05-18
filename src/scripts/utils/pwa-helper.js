/**
 * PWA Helper utilities for managing PWA features
 */

export class PWAHelper {
  constructor() {
    this.deferredPrompt = null;
    this.isInstalled = false;
    this.setupInstallPrompt();
    this.checkInstallation();
  }

  /**
   * Check if app is installed as PWA
   */
  checkInstallation() {
    // Check if running in standalone mode
    this.isInstalled =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;

    if (this.isInstalled) {
      document.body.classList.add("pwa-installed");
    }
  }

  /**
   * Setup install prompt handling
   */
  setupInstallPrompt() {
    window.addEventListener("beforeinstallprompt", (event) => {
      console.log("PWA install prompt ready");
      event.preventDefault();
      this.deferredPrompt = event;
      this.showInstallButton();
    });

    window.addEventListener("appinstalled", () => {
      console.log("PWA installed successfully");
      this.isInstalled = true;
      this.hideInstallButton();
      this.deferredPrompt = null;
      document.body.classList.add("pwa-installed");
    });
  }

  /**
   * Show install button in the UI
   */
  showInstallButton() {
    // Find navigation list
    const navList = document.getElementById("nav-list");
    if (!navList) return;

    // Check if button already exists
    if (document.getElementById("pwa-install-button")) return;

    // Create install button
    const listItem = document.createElement("li");
    listItem.innerHTML = `
      <button id="pwa-install-button" class="btn install-button">
        <i class="fas fa-download"></i> Install App
      </button>
    `;

    // Insert at the beginning of navigation
    navList.insertBefore(listItem, navList.firstChild);

    // Add click handler
    const installButton = document.getElementById("pwa-install-button");
    installButton.addEventListener("click", () => this.installApp());
  }

  /**
   * Hide install button
   */
  hideInstallButton() {
    const installButton = document.getElementById("pwa-install-button");
    if (installButton && installButton.parentElement) {
      installButton.parentElement.remove();
    }
  }

  /**
   * Trigger app installation
   */
  async installApp() {
    if (!this.deferredPrompt) {
      console.log("Install prompt not available");
      return;
    }

    // Hide install button immediately
    this.hideInstallButton();

    // Show install prompt
    this.deferredPrompt.prompt();

    // Wait for user response
    const { outcome } = await this.deferredPrompt.userChoice;
    console.log(`Install prompt response: ${outcome}`);

    // Clear the deferred prompt
    this.deferredPrompt = null;

    // If user dismissed, show button again after delay
    if (outcome === "dismissed") {
      setTimeout(() => {
        if (!this.isInstalled) {
          this.showInstallButton();
        }
      }, 10000); // Show again after 10 seconds
    }
  }

  /**
   * Check if PWA features are supported
   */
  static isPWASupported() {
    return "serviceWorker" in navigator && "PushManager" in window;
  }

  /**
   * Get PWA install criteria status
   */
  static async getInstallCriteria() {
    const criteria = {
      serviceWorker: "serviceWorker" in navigator,
      manifest: document.querySelector('link[rel="manifest"]') !== null,
      https:
        location.protocol === "https:" || location.hostname === "localhost",
      standalone: window.matchMedia("(display-mode: standalone)").matches,
    };

    // Check if service worker is registered
    if (criteria.serviceWorker) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        criteria.serviceWorkerActive = !!registration;
      } catch (error) {
        criteria.serviceWorkerActive = false;
      }
    }

    return criteria;
  }
}

// Export singleton instance
export const pwaHelper = new PWAHelper();
