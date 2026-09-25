/* لوحه‌ساز — cache relative to this worker's scope (GitHub Pages /docs included) */
const VERSION = "lohe-saz-offline-v3";

function scoped(path) {
  return new URL(path, self.registration.scope).href;
}

const PRECACHE = [
  "./",
  "./index.html",
  "./offline.html",
  "./favicon.svg",
  "./manifest.webmanifest",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png",
  "./samples/gozaresh-avaliye.xls",
].map(scoped);

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(VERSION);
      await Promise.all(PRECACHE.map((url) => cache.add(url).catch(() => undefined)));
      try {
        const indexUrl = scoped("./");
        const res = await fetch(indexUrl, { cache: "reload" });
        if (res.ok) {
          await cache.put(indexUrl, res.clone());
          const html = await res.text();
          const refs = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map((m) => m[1]);
          await Promise.all(
            refs
              .filter((href) => href && !href.startsWith("data:") && !href.startsWith("mailto:"))
              .map((href) => cache.add(new URL(href, indexUrl)).catch(() => undefined)),
          );
        }
      } catch {
        /* first load may be offline */
      }
      await self.skipWaiting();
    })(),
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
  if (request.method !== "GET") return response;
  const copy = response.clone();
  caches.open(VERSION).then((cache) => cache.put(request, copy));
  return response;
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.protocol !== "http:" && url.protocol !== "https:") return;

  if (url.hostname === "grok.com" || url.hostname.endsWith(".grok.com") || url.hostname.endsWith(".grok.me")) {
    event.respondWith(fetch(request).catch(() => new Response("", { status: 204 })));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          cachePut(scoped("./"), response.clone());
          return cachePut(request, response);
        })
        .catch(async () => {
          const cache = await caches.open(VERSION);
          return (
            (await cache.match(request)) ||
            (await cache.match(scoped("./"))) ||
            (await cache.match(scoped("./index.html"))) ||
            (await cache.match(scoped("./offline.html"))) ||
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
