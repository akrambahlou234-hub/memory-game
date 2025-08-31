const CACHE_NAME = 'memory-game-v1.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json'
];

// تثبيت Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('تم فتح Cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// تفعيل Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('حذف Cache القديم:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// اعتراض الطلبات
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // إرجاع الملف من Cache إذا كان موجوداً
        if (response) {
          return response;
        }
        
        // إذا لم يكن موجوداً في Cache، احمله من الشبكة
        return fetch(event.request).then(response => {
          // تحقق من أن الاستجابة صحيحة
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // نسخ الاستجابة
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        });
      })
      .catch(() => {
        // إذا فشل الاتصال بالشبكة، حاول إرجاع صفحة offline
        if (event.request.destination === 'document') {
          return caches.match('/index.html');
        }
      })
  );
});

// معالجة الرسائل من التطبيق الرئيسي
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
