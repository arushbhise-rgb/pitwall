const CACHE_NAME = 'pitwall-v2'
const STATIC_CACHE = 'pitwall-static-v2'

// Core app shell to cache for offline
const APP_SHELL = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/favicon.svg',
]

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME && key !== STATIC_CACHE)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url)

  // Skip non-GET requests
  if (e.request.method !== 'GET') return

  // Skip API calls and external requests — always go to network
  if (url.pathname.startsWith('/race') ||
      url.pathname.startsWith('/qualifying') ||
      url.pathname.startsWith('/standings') ||
      url.pathname.startsWith('/h2h') ||
      url.pathname.startsWith('/calendar') ||
      url.pathname.startsWith('/drivers') ||
      url.pathname.startsWith('/ai') ||
      url.origin !== location.origin) {
    return
  }

  // For app shell and static assets: network first, fallback to cache
  e.respondWith(
    fetch(e.request)
      .then(response => {
        // Cache successful responses
        if (response.ok) {
          const clone = response.clone()
          caches.open(STATIC_CACHE).then(cache => {
            cache.put(e.request, clone)
          })
        }
        return response
      })
      .catch(() => {
        // Offline — serve from cache
        return caches.match(e.request).then(cached => {
          if (cached) return cached
          // For navigation requests, try index.html first, then offline page
          if (e.request.mode === 'navigate') {
            return caches.match('/index.html')
              .then(r => r || caches.match('/offline.html'))
          }
          return new Response('Offline', { status: 503 })
        })
      })
  )
})
