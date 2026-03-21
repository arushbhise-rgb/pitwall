const CACHE = 'pitwall-v1'

self.addEventListener('install', e => {
  self.skipWaiting()
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => caches.delete(key)))
    )
  )
})

self.addEventListener('fetch', e => {
  // Never intercept — just pass through
  // Prevents MIME type errors on JS/CSS assets
  return
})