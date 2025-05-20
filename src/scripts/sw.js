import { precacheAndRoute } from 'workbox-precaching';
import CONFIG from "./config";
import {registerRoute} from "workbox-routing";
import {CacheFirst, NetworkFirst, StaleWhileRevalidate} from "workbox-strategies";

precacheAndRoute(self.__WB_MANIFEST);

registerRoute(
    ({ url }) => {
        return url.origin === 'https://cdnjs.cloudflare.com' || url.origin.includes('fontawesome');
    },
    new CacheFirst({
        cacheName: 'fontawesome',
    }),
);
registerRoute(
    ({ request, url }) => {
        const baseUrl = new URL(CONFIG.BASE_URL);
        return baseUrl.origin === url.origin && request.destination !== 'image';
    },
    new NetworkFirst({
        cacheName: 'story-api',
    }),
);
registerRoute(
    ({ request, url }) => {
        const baseUrl = new URL(CONFIG.BASE_URL);
        return baseUrl.origin === url.origin && request.destination === 'image';
    },
    new StaleWhileRevalidate({
        cacheName: 'story-api-image',
    }),
);
registerRoute(
    ({ url }) => {
        return url.origin.includes('maptiler');
    },
    new CacheFirst({
        cacheName: 'maptiler-api',
    }),
);

self.addEventListener('push', (event) => {
    console.log('Service worker pushing...');

    async function chainPromise() {
        const data = await event.data.json();

        await self.registration.showNotification(data.title, {
            body: data.options.body,
        });
    }

    event.waitUntil(chainPromise());
})