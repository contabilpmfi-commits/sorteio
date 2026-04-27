const CACHE = "consorcio-app-v1";

self.addEventListener("install", e => {
    e.waitUntil(
        caches.open(CACHE).then(cache => {
            return cache.addAll([
                "./",
                "./index.html",
                "./css/style.css",
                "./js/app.js",
                "./img/Logo.png"
            ]);
        })
    );
});

self.addEventListener("fetch", e => {
    e.respondWith(
        caches.match(e.request).then(res => res || fetch(e.request))
    );
});
