const C = "propinas-v1";
const FILES = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "apple-touch-icon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(C).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== C).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET") return;
  if (r.mode === "navigate") {
    // Con internet: versión más reciente. Sin internet: la guardada.
    e.respondWith(
      fetch(r)
        .then(res => { const cp = res.clone(); caches.open(C).then(c => c.put("index.html", cp)); return res; })
        .catch(() => caches.match("index.html"))
    );
    return;
  }
  e.respondWith(caches.match(r).then(x => x || fetch(r)));
});
