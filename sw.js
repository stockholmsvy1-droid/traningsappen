// Service worker för Träningsappen.
//
// Två strategier, av olika skäl:
//
// * Appens egna filer (HTML, CSS, JS, manifest) hämtas NÄTVERK FÖRST med en
//   kort timeout. Det gör att en ny version slår igenom direkt när telefonen
//   har nät, i stället för att bli inlåst bakom en gammal cache. Utan nät
//   (eller vid dålig täckning i gymmet) faller den tillbaka på cachen efter
//   NAT_TIMEOUT_MS, så appen startar ändå.
// * Bilder och ikoner hämtas CACHE FÖRST. De ändras aldrig, och de är tunga.
//
// CACHE_VERSION ska alltid matcha APP_VERSION i script.js — höj båda samtidigt.
const CACHE_VERSION = "traningsappen-v1.8";
const NAT_TIMEOUT_MS = 3000;

// Filer som alltid ska hämtas färska när nät finns.
const APPFILER = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.json"
];

// Filer som gott kan komma ur cachen direkt.
const TILLGANGAR = [
  "./icon-192.png",
  "./icon-512.png",
  "./icon-180.png",
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
    caches.open(CACHE_VERSION).then(cache =>
      // Appfilerna måste in — utan dem fungerar inget offline.
      cache.addAll(APPFILER).then(() =>
        // Bilderna läggs till var för sig. En enskild bild som saknas eller
        // inte går att hämta ska INTE sänka hela installationen; då skulle
        // appen tyst bli utan offline-läge och utan uppdateringar.
        Promise.all(TILLGANGAR.map(fil =>
          cache.add(fil).catch(() => undefined)
        ))
      )
    ).then(() => self.skipWaiting())
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

// Hämta från nätet, men ge upp efter NAT_TIMEOUT_MS och ta cachen i stället.
function natForst(request) {
  const cachat = caches.match(request);

  const franNatet = fetch(request).then(svar => {
    if (svar && svar.ok && svar.type === "basic") {
      const kopia = svar.clone();
      caches.open(CACHE_VERSION).then(cache => cache.put(request, kopia));
    }
    return svar;
  });

  const timeout = new Promise(resolve => {
    setTimeout(() => resolve(cachat.then(t => t || franNatet)), NAT_TIMEOUT_MS);
  });

  return Promise.race([franNatet, timeout])
    .catch(() => cachat.then(t => t || Promise.reject(new Error("offline"))));
}

function cacheForst(request) {
  return caches.match(request).then(traff => {
    if (traff) return traff;
    return fetch(request).then(svar => {
      if (svar && svar.ok && svar.type === "basic") {
        const kopia = svar.clone();
        caches.open(CACHE_VERSION).then(cache => cache.put(request, kopia));
      }
      return svar;
    });
  });
}

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  const arAppfil =
    request.mode === "navigate" ||
    request.destination === "document" ||
    request.destination === "script" ||
    request.destination === "style" ||
    url.pathname.endsWith("/manifest.json");

  event.respondWith(arAppfil ? natForst(request) : cacheForst(request));
});
