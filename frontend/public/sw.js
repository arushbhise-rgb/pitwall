const CACHE = 'pitwall-v1'
const STATIC = ['/', '/replay', '/standings', '/h2h', '/calendar', '/drivers']

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(STATIC))
  )
})

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return
  if (e.request.url.includes('railway.app')) return // never cache API
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  )
})