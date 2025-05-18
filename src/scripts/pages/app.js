import routes from "../routes/routes";
import { getActiveRoute } from "../routes/url-parser";
import { getAccessToken, getLogout } from "../utils/auth";
import {
  generateAuthenticatedNavigationListTemplate,
  generateSubscribeButtonTemplate,
  generateUnauthenticatedNavigationListTemplate,
  generateUnsubscribeButtonTemplate,
} from "../template";
import {
  isServiceWorkerAvailable,
  setupSkipToContent,
  transitionHelper,
} from "../utils";
import {
  isCurrentPushSubscriptionAvailable,
  subscribe,
  unsubscribe,
} from "../utils/notification-helper";

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;
  #skipLinkButton = null;

  constructor({ navigationDrawer, drawerButton, content, skipLinkButton }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;
    this.#skipLinkButton = skipLinkButton;

    this.#init();
  }

  #init() {
    setupSkipToContent(this.#skipLinkButton, this.#content);
    this.#setupDrawer();
    this.#registerServiceWorker();
    this.#setupPWAInstallPrompt();
  }

  #registerServiceWorker() {
    if (!isServiceWorkerAvailable()) {
      console.log("Service Worker tidak didukung di browser ini.");
      return;
    }

    window.addEventListener("load", async () => {
      try {
        const registration = await navigator.serviceWorker.register(
          "/service-worker.js",
          {
            scope: "/",
          }
        );

        console.log("Service Worker berhasil didaftarkan:", registration);

        // Handle service worker updates
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          console.log("Service Worker update ditemukan");

          newWorker.addEventListener("statechange", () => {
            switch (newWorker.state) {
              case "installed":
                if (navigator.serviceWorker.controller) {
                  console.log(
                    "Service Worker baru telah diinstall. Refresh halaman untuk menggunakan versi terbaru."
                  );
                  // Optional: Show notification to user about update
                  this.#showUpdateAvailable();
                } else {
                  console.log("Service Worker siap untuk offline mode");
                }
                break;
              case "redundant":
                console.error("Service Worker menjadi redundant");
                break;
            }
          });
        });

        // Check for waiting service worker
        if (registration.waiting) {
          this.#showUpdateAvailable();
        }
      } catch (error) {
        console.error("Pendaftaran Service Worker gagal:", error);
      }
    });
  }

  #showUpdateAvailable() {
    // Optional: Implement UI to notify user about updates
    console.log(
      "Update tersedia, refresh halaman untuk mendapatkan versi terbaru"
    );
  }

  #setupPWAInstallPrompt() {
    let deferredPrompt;

    window.addEventListener("beforeinstallprompt", (event) => {
      // Prevent the mini-infobar from appearing on mobile
      event.preventDefault();

      // Save the event so it can be triggered later
      deferredPrompt = event;

      // Show install button if needed
      this.#showInstallButton(deferredPrompt);
    });

    window.addEventListener("appinstalled", (event) => {
      console.log("PWA berhasil diinstall");
      // Hide install button
      this.#hideInstallButton();
    });
  }

  #showInstallButton(deferredPrompt) {
    // Create install button if it doesn't exist
    let installButton = document.getElementById("pwa-install-button");

    if (!installButton) {
      installButton = document.createElement("button");
      installButton.id = "pwa-install-button";
      installButton.className = "btn install-button";
      installButton.innerHTML = '<i class="fas fa-download"></i> Install App';
      installButton.style.display = "none";

      // Add to navigation
      const navList = document.getElementById("nav-list");
      if (navList) {
        const li = document.createElement("li");
        li.appendChild(installButton);
        navList.insertBefore(li, navList.firstChild);
      }
    }

    installButton.style.display = "block";

    installButton.addEventListener("click", async () => {
      // Hide the button
      installButton.style.display = "none";

      // Show the install prompt
      if (deferredPrompt) {
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to install prompt: ${outcome}`);

        // Clear the deferredPrompt variable
        deferredPrompt = null;
      }
    });
  }

  #hideInstallButton() {
    const installButton = document.getElementById("pwa-install-button");
    if (installButton) {
      installButton.style.display = "none";
    }
  }

  #setupDrawer() {
    this.#drawerButton.addEventListener("click", () => {
      this.#navigationDrawer.classList.toggle("open");
    });

    document.body.addEventListener("click", (event) => {
      if (
        !this.#navigationDrawer.contains(event.target) &&
        !this.#drawerButton.contains(event.target)
      ) {
        this.#navigationDrawer.classList.remove("open");
      }

      this.#navigationDrawer.querySelectorAll("a").forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove("open");
        }
      });
    });
  }

  #setupNavigationList() {
    const isLogin = !!getAccessToken();
    const navList = this.#navigationDrawer.children.namedItem("nav-list");

    if (!isLogin) {
      navList.innerHTML = generateUnauthenticatedNavigationListTemplate();
      return;
    }

    navList.innerHTML = generateAuthenticatedNavigationListTemplate();

    const logoutButton = document.getElementById("logout-button");
    logoutButton.addEventListener("click", (event) => {
      event.preventDefault();

      if (confirm("Apakah anda yakin ingin keluar?")) {
        getLogout();
        location.hash = "/login";
      }
    });
  }

  async #setupPushNotification() {
    const pushNotificationTools = document.getElementById(
      "push-notification-tools"
    );

    if (!pushNotificationTools) {
      console.error("Element push-notification-tools tidak ditemukan.");
      return;
    }

    try {
      const isSubscribed = await isCurrentPushSubscriptionAvailable();

      if (isSubscribed) {
        pushNotificationTools.innerHTML = generateUnsubscribeButtonTemplate();
        const unsubscribeButton = document.getElementById("unsubscribe-button");

        if (unsubscribeButton) {
          unsubscribeButton.addEventListener("click", async () => {
            await unsubscribe();
            await this.#setupPushNotification();
          });
        }
        return;
      }

      pushNotificationTools.innerHTML = generateSubscribeButtonTemplate();
      const subscribeButton = document.getElementById("subscribe-button");

      if (subscribeButton) {
        subscribeButton.addEventListener("click", async () => {
          await subscribe();
          await this.#setupPushNotification();
        });
      }
    } catch (error) {
      console.error("Error saat setup push notification:", error);
    }
  }

  async renderPage() {
    const url = getActiveRoute();
    const route = routes[url] || routes["*"];

    if (!route) {
      console.error(`No route handler found for ${url}`);
      return;
    }

    const page = route();

    const transition = transitionHelper({
      updateDOM: async () => {
        this.#content.innerHTML = await page.render();
        await page.afterRender();
      },
    });

    transition.ready.catch(console.error);
    transition.updateCallbackDone.then(() => {
      scrollTo({ top: 0, behavior: "instant" });
      this.#setupNavigationList();

      if (isServiceWorkerAvailable()) {
        this.#setupPushNotification();
      }
    });
  }
}

export default App;
