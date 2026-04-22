// ==================== Falcon Store - Service Worker ====================
const CACHE_NAME = 'falcon-store-v5';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/login.html',
    '/signup.html',
    '/product.html',
    '/checkout.html',
    '/payment-pending.html',
    '/profile.html',
    '/orders.html',
    '/rewards.html',
    '/about.html',
    '/giftcards.html',
    '/agents.html',
    '/security.html',
    '/favorites.html',
    '/my-invoices.html',
    '/public-feed.html',
    '/wheel.html',
    '/css/main.css',
    '/js/firebase-config.js',
    '/js/features.js',
    '/js/main.js',
    '/js/cart.js',
    '/js/notifications.js',
    '/js/comments.js',
    '/photos/logo.png',
    '/photos/logo-192.png',
    '/photos/logo-512.png'
];

// الأصوات الأساسية للتخزين المؤقت
const SOUND_ASSETS = [
    '/sounds/click.mp3',
    '/sounds/click2.mp3',
    '/sounds/error.mp3',
    '/sounds/ting.mp3',
    '/sounds/success.mp3',
    '/sounds/Welcome.mp3',
    '/sounds/new_order.mp3',
    '/sounds/reward.mp3',
    '/sounds/achievement.mp3',
    '/sounds/message.mp3',
    '/sounds/payment.mp3',
    '/sounds/confirmed.mp3',
    '/sounds/shipping_complete.mp3'
];

// ==================== التثبيت ====================
self.addEventListener('install', (event) => {
    console.log('🦅 Falcon Store Service Worker: تثبيت...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('📦 تخزين الملفات الأساسية...');
                return cache.addAll([...STATIC_ASSETS, ...SOUND_ASSETS]);
            })
            .then(() => {
                console.log('✅ تم التثبيت بنجاح');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('❌ خطأ في التثبيت:', error);
            })
    );
});

// ==================== التفعيل ====================
self.addEventListener('activate', (event) => {
    console.log('🔄 Falcon Store Service Worker: تفعيل...');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ حذف الكاش القديم:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('✅ تم التفعيل');
            return self.clients.claim();
        })
    );
});

// ==================== جلب الملفات (Offline First) ====================
self.addEventListener('fetch', (event) => {
    // تجاهل طلبات Firebase و Google APIs (لا تخزن في الكاش)
    if (event.request.url.includes('firestore') ||
        event.request.url.includes('googleapis') ||
        event.request.url.includes('gstatic') ||
        event.request.url.includes('firebasestorage') ||
        event.request.url.includes('sniffmail') ||
        event.request.url.includes('ipapi') ||
        event.request.url.includes('emailjs')) {
        return;
    }
    
    // استراتيجية: Cache First ثم Network
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                // إرجاع الملف من الكاش إذا كان موجوداً
                if (cachedResponse) {
                    return cachedResponse;
                }
                
                // جلب الملف من الشبكة
                return fetch(event.request).then((response) => {
                    // تخزين الملف في الكاش للاستخدام المستقبلي (فقط للملفات الثابتة)
                    if (response && response.status === 200 && 
                        (event.request.url.includes('.css') ||
                         event.request.url.includes('.js') ||
                         event.request.url.includes('.html') ||
                         event.request.url.includes('.mp3') ||
                         event.request.url.includes('.png') ||
                         event.request.url.includes('.jpg'))) {
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseClone);
                        });
                    }
                    return response;
                });
            })
            .catch(() => {
                // في حالة عدم الاتصال، إرجاع صفحة offline (إذا كانت موجودة)
                if (event.request.mode === 'navigate') {
                    return caches.match('/index.html');
                }
                // للملفات الصوتية، محاولة إرجاع نسخة مخزنة
                if (event.request.url.includes('.mp3')) {
                    return caches.match('/sounds/click.mp3');
                }
                return new Response('غير متصل بالإنترنت', {
                    status: 503,
                    statusText: 'Service Unavailable'
                });
            })
    );
});

// ==================== الإشعارات الفورية (Push Notifications) ====================
self.addEventListener('push', (event) => {
    console.log('📨 إشعار وارد');
    
    let data = {
        title: '🦅 Falcon Store',
        body: 'لديك إشعار جديد',
        icon: '/photos/logo.png',
        badge: '/photos/logo-192.png',
        image: '/photos/offer1.jpg',
        vibrate: [200, 100, 200],
        data: {
            url: '/'
        },
        actions: [
            { action: 'open', title: 'فتح' },
            { action: 'close', title: 'إغلاق' }
        ],
        requireInteraction: false,
        silent: false,
        sound: '/sounds/ting.mp3'
    };
    
    if (event.data) {
        try {
            const payload = event.data.json();
            data = {
                ...data,
                title: payload.notification?.title || payload.data?.title || data.title,
                body: payload.notification?.body || payload.data?.body || data.body,
                icon: payload.notification?.icon || data.icon,
                badge: payload.notification?.badge || data.badge,
                image: payload.notification?.image || data.image,
                data: {
                    url: payload.data?.url || '/',
                    orderId: payload.data?.orderId || null,
                    type: payload.data?.type || 'general'
                },
                requireInteraction: payload.data?.requireInteraction || false,
                actions: payload.data?.actions || data.actions,
                sound: payload.data?.sound || data.sound
            };
        } catch (e) {
            // إذا كان الإشعار نصياً وليس JSON
            data.body = event.data.text();
        }
    }
    
    const options = {
        body: data.body,
        icon: data.icon,
        badge: data.badge,
        image: data.image,
        vibrate: data.vibrate,
        data: data.data,
        actions: data.actions,
        requireInteraction: data.requireInteraction,
        silent: data.silent,
        dir: 'rtl',
        lang: 'ar',
        tag: data.data.orderId || 'falcon-notification'
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// ==================== النقر على الإشعار ====================
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    const urlToOpen = event.notification.data?.url || '/';
    const action = event.action;
    
    if (action === 'close') {
        return;
    }
    
    // تشغيل صوت عند النقر
    if (action === 'open') {
        event.waitUntil(
            fetch('/sounds/click.mp3').catch(() => {})
        );
    }
    
    event.waitUntil(
        clients.matchAll({ 
            type: 'window', 
            includeUncontrolled: true 
        }).then((clientList) => {
            // البحث عن نافذة مفتوحة بالفعل
            for (const client of clientList) {
                if (client.url.includes(urlToOpen) && 'focus' in client) {
                    return client.focus();
                }
            }
            // فتح نافذة جديدة
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});

// ==================== إغلاق الإشعار تلقائياً ====================
self.addEventListener('notificationclose', (event) => {
    console.log('🔔 تم إغلاق الإشعار');
});

// ==================== مزامنة الخلفية (Background Sync) ====================
self.addEventListener('sync', (event) => {
    console.log('🔄 مزامنة في الخلفية:', event.tag);
    
    if (event.tag === 'sync-orders') {
        event.waitUntil(syncPendingOrders());
    } else if (event.tag === 'sync-cart') {
        event.waitUntil(syncCart());
    }
});

// مزامنة الطلبات المعلقة
async function syncPendingOrders() {
    try {
        const cache = await caches.open(CACHE_NAME);
        const pendingOrders = await cache.match('pending-orders');
        
        if (pendingOrders) {
            const orders = await pendingOrders.json();
            console.log('📦 مزامنة الطلبات المعلقة:', orders.length);
            
            // إرسال الطلبات إلى الخادم
            for (const order of orders) {
                try {
                    const response = await fetch('/api/orders', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(order)
                    });
                    
                    if (response.ok) {
                        console.log('✅ تمت مزامنة الطلب:', order.orderId);
                    }
                } catch (error) {
                    console.error('❌ فشلت مزامنة الطلب:', error);
                }
            }
            
            // حذف الطلبات بعد المزامنة
            await cache.delete('pending-orders');
        }
    } catch (error) {
        console.error('❌ خطأ في مزامنة الطلبات:', error);
    }
}

// مزامنة السلة
async function syncCart() {
    try {
        const cache = await caches.open(CACHE_NAME);
        const cartData = await cache.match('cart-data');
        
        if (cartData) {
            const cart = await cartData.json();
            console.log('🛒 مزامنة السلة:', cart.length, 'منتجات');
            
            // يمكن إرسال السلة إلى الخادم هنا
        }
    } catch (error) {
        console.error('❌ خطأ في مزامنة السلة:', error);
    }
}

// ==================== رسالة من الصفحة الرئيسية ====================
self.addEventListener('message', (event) => {
    console.log('📨 رسالة من الصفحة:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'REQUEST_NOTIFICATION_PERMISSION') {
        // الرد على الصفحة بأن الإشعارات مدعومة
        event.source.postMessage({
            type: 'NOTIFICATION_SUPPORTED',
            supported: true
        });
    }
    
    if (event.data && event.data.type === 'SAVE_PENDING_ORDER') {
        // حفظ طلب معلق في الكاش
        event.waitUntil(
            caches.open(CACHE_NAME).then(async (cache) => {
                const pendingResponse = await cache.match('pending-orders');
                let pendingOrders = [];
                
                if (pendingResponse) {
                    pendingOrders = await pendingResponse.json();
                }
                
                pendingOrders.push(event.data.order);
                
                return cache.put(
                    'pending-orders',
                    new Response(JSON.stringify(pendingOrders))
                );
            })
        );
    }
});

// ==================== تحديث الكاش تلقائياً ====================
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'update-cache') {
        event.waitUntil(updateCache());
    }
});

async function updateCache() {
    try {
        const cache = await caches.open(CACHE_NAME);
        
        for (const asset of STATIC_ASSETS) {
            try {
                const response = await fetch(asset);
                if (response && response.status === 200) {
                    await cache.put(asset, response);
                    console.log('🔄 تم تحديث:', asset);
                }
            } catch (error) {
                console.warn('⚠️ فشل تحديث:', asset);
            }
        }
        
        for (const sound of SOUND_ASSETS) {
            try {
                const response = await fetch(sound);
                if (response && response.status === 200) {
                    await cache.put(sound, response);
                    console.log('🔊 تم تحديث الصوت:', sound);
                }
            } catch (error) {
                console.warn('⚠️ فشل تحديث الصوت:', sound);
            }
        }
        
        console.log('✅ تم تحديث الكاش');
    } catch (error) {
        console.error('❌ خطأ في تحديث الكاش:', error);
    }
}

console.log('🦅 Falcon Store Service Worker جاهز - الإصدار 5');