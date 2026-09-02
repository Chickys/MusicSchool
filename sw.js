// ═══════════════════════════════════════════════════════════════
// 🔔 MusicSchool Service Worker — Notifications + Mode hors-ligne réel
// Ce fichier doit être à la racine du projet (même niveau que index.html)
// ═══════════════════════════════════════════════════════════════

// 🔧 FIX (hors-ligne) : avant, ce service worker ne précachait RIEN —
// il se contentait d'essayer le réseau et de retomber sur le cache
// SEULEMENT si une requête avait déjà été vue une fois. Concrètement,
// un élève ouvrant l'app pour la toute première fois sans réseau (ou
// avec une connexion trop lente/instable) tombait sur une page blanche,
// puisque rien n'avait jamais été mis en cache au préalable. On
// précache maintenant activement la "coquille" de l'app (HTML, CSS, JS,
// données des cours, icônes) dès l'installation du service worker, pour
// qu'elle démarre même hors-ligne dès la 2e ouverture.
const CACHE_NAME = 'musicschool-v3';

const PRECACHE_URLS = [
    '/',
    '/index.html',
    '/style.css',
    '/data.js',
    '/script.js',
    '/manifest.json',
    '/bg-pattern-dark.svg',
    '/bg-pattern-light.svg',
    '/icon-192.png',
    '/icon-512.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(PRECACHE_URLS))
            .catch(err => console.warn('Précache partiel (normal si une icône manque) :', err))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

// Message depuis l'app → afficher une notification
self.addEventListener('message', (event) => {
    if (!event.data) return;

    if (event.data.type === 'SHOW_NOTIF') {
        const { title, body, icon, tag, url } = event.data;
        event.waitUntil(
            self.registration.showNotification(title, {
                body,
                icon: icon || '/icon-192.png',
                tag: tag || 'ms-notif',
                vibrate: [200, 100, 200],
                requireInteraction: false,
                data: { url: url || '/' }
            })
        );
    }

    if (event.data.type === 'SCHEDULE_NOTIF') {
        const { delayMs, title, body, tag } = event.data;
        setTimeout(() => {
            self.registration.showNotification(title, {
                body, icon: '/icon-192.png',
                tag: tag || 'ms-scheduled',
                vibrate: [200, 100, 200],
                data: { url: '/' }
            });
        }, delayMs);
    }
});

// Clic sur une notification → ouvrir l'app
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const url = (event.notification.data && event.notification.data.url) || '/';
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
            for (const c of list) {
                if (c.url.includes(self.location.origin) && 'focus' in c) return c.focus();
            }
            if (clients.openWindow) return clients.openWindow(url);
        })
    );
});

// 🔧 FIX (hors-ligne) : stratégie différenciée selon le type de fichier.
// - Fichiers de la coquille (HTML/CSS/JS/data/icônes) : cache d'abord,
//   réseau en secours ET en arrière-plan pour garder le cache à jour
//   (stale-while-revalidate) — l'app démarre instantanément, même hors-ligne.
// - Tout le reste (ex: appels API, données dynamiques) : réseau d'abord,
//   cache uniquement si le réseau échoue — on ne veut jamais servir de
//   données périmées pour ce qui doit rester à jour.
self.addEventListener('fetch', (event) => {
    if (!event.request.url.startsWith(self.location.origin)) return;
    if (event.request.method !== 'GET') return;

    const isShellAsset = PRECACHE_URLS.some(path =>
        event.request.url.endsWith(path) || (path === '/' && event.request.url.endsWith('/'))
    );

    if (isShellAsset) {
        event.respondWith(
            caches.match(event.request).then(cached => {
                const networkFetch = fetch(event.request).then(response => {
                    if (response && response.ok) {
                        caches.open(CACHE_NAME).then(cache => cache.put(event.request, response.clone()));
                    }
                    return response;
                }).catch(() => cached);
                return cached || networkFetch;
            })
        );
    } else {
        event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
    }
});
