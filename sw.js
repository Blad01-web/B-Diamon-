// ============ B DIAMOND - SERVICE WORKER ============

const CACHE_NAME = 'bdiamond-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/style.css',
    '/data.js',
    '/app.js',
    '/supabase-config.js',
    '/propagation.js',
    '/securite.js',
    '/animations.js',
    '/hashtags.js',
    '/boost.js',
    '/features.js',
    '/retrait.js',
    '/paiement.js',
    '/partage.js',
    '/manifest.json',
    '/profil.html',
    '/creation.html',
    '/stories.html',
    '/decouverte.html',
    '/notifications.html',
    '/messages.html',
    '/verification.html',
    '/retrait.html',
    '/boost.html',
    '/hashtag.html',
    '/founder.html',
    '/securite.html',
    '/invite.html',
    '/classement.html',
    '/defis.html',
    '/recompenses.html',
    '/user.html'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => {
                return self.skipWaiting();
            })
    );
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            return self.clients.claim();
        })
    );
});

// Interception des requêtes (mode hors ligne)
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                
                return fetch(event.request)
                    .then((response) => {
                        // Mettre en cache les nouvelles ressources
                        if (event.request.method === 'GET' && response.status === 200) {
                            const responseClone = response.clone();
                            caches.open(CACHE_NAME).then((cache) => {
                                cache.put(event.request, responseClone);
                            });
                        }
                        return response;
                    })
                    .catch(() => {
                        // Retourner la page d'accueil en cas d'erreur
                        if (event.request.mode === 'navigate') {
                            return caches.match('/index.html');
                        }
                        return new Response('', { status: 404 });
                    });
            })
    );
});

// Notifications Push
self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : {};
    const title = data.title || 'B Diamond 💎';
    const options = {
        body: data.body || 'Nouvelle notification !',
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23FFD700"/><text x="50" y="65" font-size="50" text-anchor="middle">💎</text></svg>',
        badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23FFD700"/><text x="50" y="65" font-size="50" text-anchor="middle">💎</text></svg>',
        vibrate: [200, 100, 200],
        tag: data.tag || 'bdiamond'
    };
    
    event.waitUntil(self.registration.showNotification(title, options));
});

// Clic sur une notification
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    event.waitUntil(
        clients.openWindow('/index.html')
    );
});