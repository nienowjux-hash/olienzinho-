// Service worker do Olienzinho: deixa o jogo instalavel e funcionando sem internet (menos os videos).
const C = 'olienzinho-v2';
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(C).then(c => c.addAll(['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-192.png', './icon-maskable-512.png'])).catch(() => { })); });
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => clients.claim())));
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return; const u = new URL(r.url); if (u.origin !== location.origin) return; if (/\.(mp4|webm)$/i.test(u.pathname)) return;
  const key = u.origin + u.pathname;
  e.respondWith(fetch(r).then(res => { if (res && res.ok) { const cp = res.clone(); caches.open(C).then(c => c.put(key, cp)).catch(() => { }); } return res; }).catch(() => caches.match(key).then(m => m || caches.match('./index.html'))));
});
