/**
 * Offline Helper utilities for managing offline functionality
 */

export class OfflineHelper {
  constructor() {
    this.isOnline = navigator.onLine;
    this.setupEventListeners();
    this.initOfflineIndicator();
  }

  /**
   * Setup online/offline event listeners
   */
  setupEventListeners() {
    window.addEventListener("online", () => {
      this.isOnline = true;
      document.body.classList.remove("offline");
      document.body.classList.add("online");
      this.showOnlineStatus();
      console.log("App is online");
    });

    window.addEventListener("offline", () => {
      this.isOnline = false;
      document.body.classList.remove("online");
      document.body.classList.add("offline");
      this.showOfflineStatus();
      console.log("App is offline");
    });
  }

  /**
   * Initialize offline indicator in the UI
   */
  initOfflineIndicator() {
    // Set initial state
    if (this.isOnline) {
      document.body.classList.add("online");
    } else {
      document.body.classList.add("offline");
      this.showOfflineStatus();
    }
  }

  /**
   * Show offline status message
   */
  showOfflineStatus() {
    this.removeStatusMessage();

    const statusElement = document.createElement("div");
    statusElement.id = "offline-status";
    statusElement.className = "offline-status";
    statusElement.innerHTML = `
      <div class="offline-message">
        <i class="fas fa-wifi" style="text-decoration: line-through;"></i>
        <span>Tidak ada koneksi internet. Beberapa fitur mungkin tidak tersedia.</span>
      </div>
    `;

    document.body.appendChild(statusElement);
  }

  /**
   * Show online status message (brief)
   */
  showOnlineStatus() {
    this.removeStatusMessage();

    const statusElement = document.createElement("div");
    statusElement.id = "online-status";
    statusElement.className = "online-status";
    statusElement.innerHTML = `
      <div class="online-message">
        <i class="fas fa-wifi"></i>
        <span>Koneksi internet tersedia</span>
      </div>
    `;

    document.body.appendChild(statusElement);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      this.removeStatusMessage();
    }, 3000);
  }

  /**
   * Remove status message
   */
  removeStatusMessage() {
    const offlineStatus = document.getElementById("offline-status");
    const onlineStatus = document.getElementById("online-status");

    if (offlineStatus) {
      offlineStatus.remove();
    }

    if (onlineStatus) {
      onlineStatus.remove();
    }
  }

  /**
   * Check if currently online
   */
  static isOnline() {
    return navigator.onLine;
  }

  /**
   * Retry failed requests when back online
   */
  static async retryWhenOnline(requestFunction, maxRetries = 3) {
    if (navigator.onLine) {
      return await requestFunction();
    }

    return new Promise((resolve, reject) => {
      let retries = 0;
      const checkConnection = async () => {
        if (navigator.onLine && retries < maxRetries) {
          try {
            const result = await requestFunction();
            resolve(result);
          } catch (error) {
            retries++;
            if (retries >= maxRetries) {
              reject(error);
            } else {
              setTimeout(checkConnection, 1000);
            }
          }
        } else if (retries >= maxRetries) {
          reject(new Error("Max retries exceeded"));
        } else {
          setTimeout(checkConnection, 1000);
        }
      };

      // Listen for online event
      const onlineHandler = () => {
        checkConnection();
        window.removeEventListener("online", onlineHandler);
      };

      window.addEventListener("online", onlineHandler);

      // Also check immediately
      checkConnection();
    });
  }
}

// Export singleton instance
export const offlineHelper = new OfflineHelper();
