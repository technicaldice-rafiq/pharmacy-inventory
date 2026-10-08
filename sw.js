const CACHE_NAME = "pharmacy-inventory-pro-v4";

const FILES = [
    "./",
    "./index.html",
    "./style.css",
    "./app.js",
    "./medicine-database.js",
    "./manifest.json"
];


// ================================
// INSTALL
// ================================
self.addEventListener("install", event => {

    event.waitUntil(

        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(FILES))
            .then(() => self.skipWaiting())

    );

});


// ================================
// ACTIVATE + REMOVE OLD VERSION
// ================================
self.addEventListener("activate", event => {

    event.waitUntil(

        caches.keys()
            .then(keys => {

                return Promise.all(

                    keys
                        .filter(key => key !== CACHE_NAME)
                        .map(key => caches.delete(key))

                );

            })
            .then(() => self.clients.claim())

    );

});


// ================================
// FETCH
// ONLINE = NEW FILE
// OFFLINE = CACHE
// ================================
self.addEventListener("fetch", event => {

    if (event.request.method !== "GET") {
        return;
    }

    event.respondWith(

        fetch(event.request)

            .then(response => {

                const copy = response.clone();

                caches.open(CACHE_NAME)
                    .then(cache => {

                        cache.put(
                            event.request,
                            copy
                        );

                    });

                return response;

            })

            .catch(() => {

                return caches.match(event.request)
                    .then(cached => {

                        return cached ||
                               caches.match("./index.html");

                    });

            })

    );

});
