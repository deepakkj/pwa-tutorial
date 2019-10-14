console.log('>>> this is a service worker file');
const staticCacheName = 'site-static-v1';
const dynamicCacheName = 'site-dynamic-v1';
const DYNAMIC_CACHE_SIZE_LIMIT = 15;
const cacheAssests = [
  '/',
  '/index.html',
  '/js/app.js',
  '/js/ui.js',
  '/js/materialize.min.js',
  '/css/materialize.min.css',
  '/css/styles.css',
  '/img/dish.png',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  'https://fonts.gstatic.com/s/materialicons/v48/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2',
  '/pages/fallback.html'
];

const limitCacheSize = (name, size) => {
  caches.open(name).then(cache => {
    cache.keys().then(keys => {
      if(keys.length > size){
        cache.delete(keys[0]).then(limitCacheSize(name, size));
      }
    });
  });
};

//install service worker
self.addEventListener('install', event => {
  console.log('>>> service worker has been installed', event);
  event.waitUntil(
    caches.open(staticCacheName).then(cache => {
      console.log('>>> caching shell  assests');
      cache.addAll(cacheAssests);
    })
  );
});

// activate listener event of service worker
self.addEventListener('activate', event => {
  console.log('>>> service worker has been activated ', event);
  event.waitUntil(
    caches.keys().then(keys => {
      console.log('cache keys', keys);
      const filteredCache = keys.filter(key => (key !== staticCacheName && key !== dynamicCacheName));
      return Promise.all(filteredCache.map(cache => caches.delete(cache)));
    })
  );
});

// fetch event listener
self.addEventListener('fetch', event => {
  console.log('>>> fetch event listener', event.request.url)
  if(event.request.url.indexOf('firestore.googleapis.com') === -1 && event.request.url.indexOf('www.google-analytics.com') === -1 && event.request.url.indexOf('www.googletagmanager.com') === -1) {
    event.respondWith(
      caches.match(event.request).then(cacheResp => {
        return cacheResp || fetch(event.request).then(fetchResp => {
          return caches.open(dynamicCacheName).then(cache => {
            const key = event.request.url;
            const value = fetchResp.clone();
            cache.put(key, value);
            limitCacheSize(dynamicCacheName, DYNAMIC_CACHE_SIZE_LIMIT);
            return fetchResp;
          })
        });
      }).catch(() => {
        if(event.request.url.indexOf('.html') > -1) {
          return caches.match('/pages/fallback.html').then(cacheResp => {
            return cacheResp;
          }); 
        }
      })
    );
  }
});