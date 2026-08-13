const CACHE_NAME = 'saqaf-mobile-v2'; // تم تغيير الإصدار لفرض التحديث
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './logo.png'
];

// 1. تثبيت وحفظ الملفات الأساسية
self.addEventListener('install', event => {
  self.skipWaiting(); // فرض تفعيل الـ Service Worker الجديد فوراً
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// 2. حرق وإزالة النسخ القديمة من الكاش عند تحديث الإصدار
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('إزالة الكاش القديم:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. استراتيجية جلب الملفات المحدثة من السيرفر أولاً ثم الحفظ
self.addEventListener('fetch', event => {
  // تجاهل الطلبات الخاصة بـ Firebase لأنها تعمل بالـ Realtime
  if (event.request.url.includes('firebase') || event.request.url.includes('googleapis')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // إذا نجح جلب الملف المحدث من السيرفر، حدّث الكاش المحلي
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // في حال عدم وجود إنترنت، اعرض الملف المحفوظ من ذاكرة الجوال
        return caches.match(event.request);
      })
  );
});
