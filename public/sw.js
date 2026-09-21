/* لوحه‌ساز — runtime cache so the app keeps working after first load */
const VERSION = "lohe-saz-offline-v1";
const PRECACHE = [
  "/",
  "/offline.html",
  "/favicon.svg",
  "/manifest.webmanifest",
  "/icon-192.png",
  "/icon-512.png",
  "/icon-maskable-512.png",
  "/samples/gozaresh-avaliye.xls",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(VERSION)
      .then((cache) =>
        Promise.all(
          PRECACHE.map((url) =>
            cache.add(url).catch(() => {
              /* asset may not exist yet during first deploy */
            }),
          ),
        ),
      )
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== VERSION).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

function cachePut(request, response) {
  if (!response || !response.ok) return response;
  const copy = response.clone();
  caches.open(VERSION).then((cache) => cache.put(request, copy));
  return response;
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.protocol !== "http:" && url.protocol !== "https:") return;

  if (url.hostname === "grok.com") {
    event.respondWith(fetch(request).catch(() => new Response("", { status: 204 })));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => cachePut("/", response))
        .catch(async () => {
          const cache = await caches.open(VERSION);
          return (
            (await cache.match("/")) ||
            (await cache.match("/offline.html")) ||
            new Response("آفلاین", { status: 503, headers: { "content-type": "text/plain; charset=utf-8" } })
          );
        }),
    );
    return;
  }

  const sameOrigin = url.origin === self.location.origin;
  const fontHost = url.hostname.includes("gstatic.com") || url.hostname.includes("googleapis.com");
  if (!sameOrigin && !fontHost) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => cachePut(request, response))
        .catch(() => cached);
      return cached || network;
    }),
  );
});
