const CACHE_NAME = 'random-quote-pwa-v1';
const SHEET_CACHE_KEY = 'google-sheet-data';
const SHEET_CACHE_TTL = 60 * 60 * 1000; // Cache TTL: 1 hour (in milliseconds)

// Files to cache
const STATIC_ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './styles.css',
    './sw.js'
];

// Cache static assets on install
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate the new service worker and remove old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) =>
            Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            )
        )
    );
    self.clients.claim();
});

// Fetch event handler
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Intercept Google Sheet requests
    if (url.hostname === 'https://docs.google.com/spreadsheets/d/1_HKt_DSxewR-XaneTc88o6v3yyGV23sqKOFXHDCGz6Q/gviz/tq?tqx=out:json') {
        event.respondWith(fetchGoogleSheetWithCache(event.request));
    } else {
        // Handle other requests (static assets)
        event.respondWith(
            caches.match(event.request).then((cachedResponse) => {
                return (
                    cachedResponse ||
                    fetch(event.request).then((response) => {
                        // Optionally cache new responses
                        if (event.request.url.startsWith(self.location.origin)) {
                            return caches.open(CACHE_NAME).then((cache) => {
                                cache.put(event.request, response.clone());
                                return response;
                            });
                        }
                        return response;
                    })
                );
            })
        );
    }
});

// Fetch and cache Google Sheet data
async function fetchGoogleSheetWithCache(request) {
    console.log("using cached data...")
    const cache = await caches.open(CACHE_NAME);
    const cachedData = await cache.match(SHEET_CACHE_KEY);
    const now = Date.now();

    if (cachedData) {
        const { timestamp, data } = await cachedData.json();
        // Use cached data if it's still valid
        if (now - timestamp < SHEET_CACHE_TTL) {
            return new Response(JSON.stringify(data), {
                headers: { 'Content-Type': 'application/json' },
            });
        }
    }

    // Fetch fresh data from Google Sheet
    const response = await fetch(request);
    const data = await response.json();

    // Cache the fresh data with a timestamp
    const cachePayload = new Response(
        JSON.stringify({ timestamp: now, data }),
        {
            headers: { 'Content-Type': 'application/json' },
        }
    );
    cache.put(SHEET_CACHE_KEY, cachePayload);

    return response;
}
