self.addEventListener("install", event => {
    // The promise that skipWaiting() returns can be safely ignored.
    self.skipWaiting();

    event.waitUntil(
        caches.open("precache-v2").then(cache => {
            // Caching path does not have to be preceded with `public/` because starting the path with `/`
            // will start off the path from wherever Express delivered the HTML route
            const filesToCache = [
                "/",
                "/index.html",
                "/css/styles.css",
                "/icons/icon-72x72.png",
                "/icons/icon-96x96.png",
                "/icons/icon-128x128.png",
                "/icons/icon-144x144.png",
                "/icons/icon-152x152.png",
                "/icons/icon-192x192.png",
                "/icons/icon-384x384.png",
                "/icons/icon-512x512.png",
                // "/js/index.js",
                // "/js/idb.js",
                "/css/vendors/font-awesome-v4.7.0.min.css",
                "/css/fonts/fontawesome-webfont.ttf",
                "/js/vendors/chart.v2.8.0.min.js",
                "/manifest.json", // just to stop errors
                // "/sw.js" // just to stop errors
            ];

            cache.addAll(filesToCache);
        })
    );
});

self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});