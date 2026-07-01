const CACHE = "guariglia-scorecard-v34-pa-sync-r6";
const CORE_ASSETS = [
  "/styles.css?v=34-pa-sync-r6",
  "/app.js?v=34-pa-sync-r6",
  "/baseball-data.js?v=34",
  "/template_data.js",
  "/pdf_background_data.js?v=34",
  "/vendor/jszip.min.js",
  "/assets/guariglia-crest.gif",
  "/assets/icon-192.png",
  "/assets/icon-512.png",
  "/assets/Scorecard_20260615_blank_template.xlsx",
  "/assets/Scorecard_20260615_App_Colors_Classic_Blank.xlsx",
  "/assets/classic-scorecard-background.jpg?v=34-pa-sync-r6",
  "/manifest.webmanifest"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.pathname.startsWith("/api/")) return;

  // Navigation is network-first so a newly deployed version is not hidden by an older cached index page.
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put("/index.html", copy));
          return response;
        })
        .catch(() => caches.match("/index.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      const copy = response.clone();
      caches.open(CACHE).then(cache => cache.put(event.request, copy));
      return response;
    }))
  );
});
