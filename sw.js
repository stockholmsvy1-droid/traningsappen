// Service worker för Träningsappen.
// Cache-first: appen fungerar helt utan nät i gymmet.
// Numret ska alltid matcha APP_VERSION i script.js — höj båda samtidigt,
// annars fortsätter telefonen visa den gamla versionen.
const CACHE_VERSION = "traningsappen-v1.2";

const FILER = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./bilder/abdominal.jpeg",
  "./bilder/balans-bosuboll.jpeg",
  "./bilder/biceps-curl.jpeg",
  "./bilder/hip-abduction.jpeg",
  "./bilder/leg-extension.jpeg",
  "./bilder/pectoral-fly.jpeg",
  "./bilder/pulldown.jpeg",
  "./bilder/row.jpeg",
  "./bilder/seated-leg-curl.jpeg",
  "./bilder/shoulder-press.jpeg",
  "./bilder/situps-bank.jpeg",
  "./bilder/triceps-extension.jpeg"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => cache.addAll(FILER))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(nycklar => Promise.all(
        nycklar.filter(n => n !== CACHE_VERSION).map(n => caches.delete(n))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then(traff => {
      if (traff) return traff;
      return fetch(event.request).then(svar => {
        if (svar && svar.ok && svar.type === "basic") {
          const kopia = svar.clone();
          caches.open(CACHE_VERSION).then(cache => cache.put(event.request, kopia));
        }
        return svar;
      }).catch(() => traff);
    })
  );
});
