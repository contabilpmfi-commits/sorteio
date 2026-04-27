const CACHE = "app-v1";

self.addEventListener("install", e=>{
    e.waitUntil(
        caches.open(CACHE).then(cache=>{
            return cache.addAll([
                "./",
                "./index.html"
            ]);
        })
    );
});
