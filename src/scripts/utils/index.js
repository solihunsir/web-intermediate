// src/scripts/utils/index.js

// Fungsi isServiceWorkerAvailable
export function isServiceWorkerAvailable() {
  return "serviceWorker" in navigator;
}

// Fungsi setupSkipToContent
export function setupSkipToContent(skipLinkButton, mainContent) {
  skipLinkButton.addEventListener("click", (event) => {
    event.preventDefault();
    mainContent.focus();
  });
}

// Fungsi transitionHelper
export function transitionHelper({ updateDOM }) {
  const ready = Promise.resolve();

  const updateCallbackDone = ready.then(() => {
    return updateDOM();
  });

  return {
    ready,
    updateCallbackDone,
  };
}

// Fungsi showFormattedDate
export function showFormattedDate(date, locale = "id-ID") {
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  return new Date(date).toLocaleDateString(locale, options);
}

// PWA related utilities
export function isPWAMode() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

export function isMobile() {
  return window.innerWidth <= 768;
}

export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function throttle(func, limit) {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Fungsi convertBase64ToBlob
export function convertBase64ToBlob(base64Data, mimeType) {
  const byteCharacters = atob(base64Data.split(",")[1]);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
    const slice = byteCharacters.slice(offset, offset + 1024);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: mimeType });
}

// src/scripts/utils/index.js

// Fungsi convertBase64ToUint8Array untuk mengonversi base64 menjadi Uint8Array
export function convertBase64ToUint8Array(base64Data) {
  const byteCharacters = atob(base64Data.split(",")[1]);
  const byteNumbers = new Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  return new Uint8Array(byteNumbers);
}
