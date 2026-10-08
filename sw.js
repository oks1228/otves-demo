/*
 * «Отвес» без интернета. Страница — сначала из сети (всегда свежая версия), при отсутствии сети
 * или если сеть не ответила за 4 секунды — из кэша. Иконки и манифест — из кэша.
 * Данные объектов в кэше не лежат: они в хранилище браузера (localStorage) и от сети не зависят.
 */
const CACHE = "otves-v1";
const SHELL = ["./", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png"];
const TIMEOUT_MS = 4000;

self.addEventListener("install", (ev) => {
  ev.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (ev) => {
  ev.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

function fromNetwork(req) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("timeout")), TIMEOUT_MS);
    fetch(req).then((res) => { clearTimeout(t); resolve(res); }, (e) => { clearTimeout(t); reject(e); });
  });
}

self.addEventListener("fetch", (ev) => {
  const req = ev.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;

  if (req.mode === "navigate") {
    ev.respondWith(
      fromNetwork(req)
        .then((res) => {
          if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put("./", copy)); }
          return res;
        })
        .catch(() => caches.match("./").then((r) => r || caches.match(req)).then((r) => r || Response.error())),
    );
    return;
  }
  ev.respondWith(caches.match(req).then((r) => r || fetch(req)));
});
