const CACHE_NAME = 'saqaf-mobile-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './logo.png'
];

// تثبيت ملفات التطبيق في الجوال
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// جلب الملفات من الجوال لسرعة الفتح
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // إذا وجد الملف في الجوال يعرضه، وإلا يحمله من الإنترنت
        return response || fetch(event.request);
      })
  );
});