const CACHE = "app-v2"; // mudou versão

self.addEventListener("install", e=>{
    self.skipWaiting();

    e.waitUntil(
        caches.open(CACHE).then(cache=>{
            return cache.addAll([
                "./",
                "./index.html"
            ]);
        })
    );
});

self.addEventListener("activate", e=>{
    e.waitUntil(
        caches.keys().then(keys=>{
            return Promise.all(
                keys.map(k=>{
                    if(k !== CACHE) return caches.delete(k);
                })
            );
        })
    );
});
