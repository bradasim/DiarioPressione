// Service Worker per Diario Pressione Arteriosa PWA
const CACHE_NAME = 'diario-pressione-v1';

// Risorse locali essenziali da pre-caricare all'installazione
const PRECACHE_ASSETS = [
    './',
    './index.html',
    './pdf-report.js',
    './manifest.json',
    './icon-192.png',
    './icon-512.png',
    './icon-maskable-512.png',
    './icon.svg'
];

// 1. Installazione: memorizza nella cache i file base dell'applicazione
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[SW] Pre-caching dei file core');
            return cache.addAll(PRECACHE_ASSETS);
        }).then(() => self.skipWaiting())
    );
});

// 2. Attivazione: elimina le vecchie versioni della cache
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        console.log('[SW] Rimozione vecchia cache:', key);
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// 3. Intercettazione richieste (Fetch): strategia Cache-First con Network Fallback e Runtime Caching
self.addEventListener('fetch', (event) => {
    const req = event.request;

    // Gestisci solo richieste GET
    if (req.method !== 'GET') {
        return;
    }

    // Salta schemi non gestibili (es. estensioni del browser)
    if (!req.url.startsWith('http://') && !req.url.startsWith('https://')) {
        return;
    }

    event.respondWith(
        caches.match(req).then((cachedResponse) => {
            if (cachedResponse) {
                // Trovato nella cache: restituisci subito per massima velocità anche offline
                // Opzionale: per le pagine locali aggiorna in background (Stale-While-Revalidate)
                if (req.url.includes(self.location.origin)) {
                    fetch(req).then((networkResponse) => {
                        if (networkResponse && networkResponse.status === 200) {
                            caches.open(CACHE_NAME).then((cache) => cache.put(req, networkResponse));
                        }
                    }).catch(() => {
                        // Offline, continua con la copia in cache
                    });
                }
                return cachedResponse;
            }

            // Non presente in cache: richiedi via rete
            return fetch(req).then((networkResponse) => {
                // Se la risposta è valida (o opaca da CDN esterne), salvala in cache per il futuro offline
                if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(req, responseClone);
                    });
                }
                return networkResponse;
            }).catch(() => {
                // Se siamo offline e la richiesta era una navigazione di pagina HTML, restituisci index.html
                if (req.mode === 'navigate') {
                    return caches.match('./index.html');
                }
            });
        })
    );
});
