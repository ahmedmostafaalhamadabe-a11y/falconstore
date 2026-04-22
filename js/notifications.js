// ==================== نظام التنبيهات الذكية ====================
// يعمل مع جميع الصفحات

// ==================== إعدادات التنبيهات ====================
let notificationPermission = 'default';
let notificationSound = null;
try {
    notificationSound = new Audio('sounds/ting.mp3');
    notificationSound.volume = 0.4;
} catch(e) { console.warn('صوت التنبيه غير متاح'); }

// ==================== طلب إذن الإشعارات ====================
async function requestNotificationPermission() {
    if (!('Notification' in window)) {
        console.log('المتصفح لا يدعم الإشعارات');
        return false;
    }
    
    if (Notification.permission === 'granted') {
        notificationPermission = 'granted';
        return true;
    }
    
    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        notificationPermission = permission;
        return permission === 'granted';
    }
    
    return false;
}

// ==================== إرسال إشعار ====================
function sendNotification(title, options = {}) {
    if (!('Notification' in window)) return;
    
    if (Notification.permission === 'granted') {
        const defaultOptions = {
            icon: 'photos/logo.png',
            badge: 'photos/logo.png',
            silent: false,
            requireInteraction: false,
            ...options
        };
        
        const notification = new Notification(title, defaultOptions);
        
        if (notificationSound) {
            notificationSound.currentTime = 0;
            notificationSound.play().catch(() => {});
        }
        
        notification.onclick = function() {
            window.focus();
            if (options.url) {
                window.location.href = options.url;
            }
            notification.close();
        };
        
        return notification;
    }
}

// ==================== تنبيهات داخلية (Toast) ====================
function showToast(message, type = 'info', duration = 3000) {
    const existingToast = document.querySelector('.falcon-toast');
    if (existingToast) existingToast.remove();
    
    const toast = document.createElement('div');
    toast.className = `falcon-toast falcon-toast-${type}`;
    
    let icon = '🔔';
    let bgColor = 'var(--info)';
    
    switch (type) {
        case 'success':
            icon = '✅';
            bgColor = 'var(--success)';
            if (typeof playTingSound === 'function') playTingSound();
            else if (notificationSound) notificationSound.play().catch(()=>{});
            break;
        case 'error':
            icon = '❌';
            bgColor = 'var(--danger)';
            if (typeof playErrorSound === 'function') playErrorSound();
            else new Audio('sounds/error.mp3').play().catch(()=>{});
            break;
        case 'warning':
            icon = '⚠️';
            bgColor = 'var(--warning)';
            break;
        case 'discount':
            icon = '🏷️';
            bgColor = 'var(--primary)';
            if (typeof playTingSound === 'function') playTingSound();
            else if (notificationSound) notificationSound.play().catch(()=>{});
            break;
        case 'order':
            icon = '🛒';
            bgColor = 'var(--primary)';
            if (typeof playTingSound === 'function') playTingSound();
            else if (notificationSound) notificationSound.play().catch(()=>{});
            break;
        default:
            icon = 'ℹ️';
            bgColor = 'var(--info)';
    }
    
    toast.style.cssText = `
        position: fixed;
        bottom: 120px;
        left: 50%;
        transform: translateX(-50%);
        background: ${bgColor};
        color: white;
        padding: 14px 24px;
        border-radius: var(--radius-full);
        box-shadow: var(--shadow-lg);
        z-index: 10000;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: toastSlideUp 0.3s ease;
        direction: rtl;
        max-width: 90%;
    `;
    
    toast.innerHTML = `<span>${icon}</span><span>${escapeHtml(message)}</span>`;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'toastSlideDown 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==================== إضافة أنماط Toast ====================
function addToastStyles() {
    if (document.getElementById('toast-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
        @keyframes toastSlideUp {
            from { opacity: 0; transform: translateX(-50%) translateY(30px); }
            to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes toastSlideDown {
            from { opacity: 1; transform: translateX(-50%) translateY(0); }
            to { opacity: 0; transform: translateX(-50%) translateY(30px); }
        }
    `;
    document.head.appendChild(style);
}

// ==================== تنبيهات الخصومات ====================
let discountCheckInterval = null;

function startDiscountAlerts() {
    if (discountCheckInterval) clearInterval(discountCheckInterval);
    
    discountCheckInterval = setInterval(async () => {
        const user = getCurrentUser();
        if (!user) return;
        
        try {
            const discountsSnapshot = await db.collection('users').doc(user.uid)
                .collection('discounts')
                .where('used', '==', false)
                .where('expiresAt', '>', new Date())
                .limit(1)
                .get();
            
            discountsSnapshot.forEach(doc => {
                const discount = doc.data();
                const daysLeft = Math.ceil((discount.expiresAt.toDate() - new Date()) / (1000 * 60 * 60 * 24));
                
                if (daysLeft <= 2) {
                    showToast(
                        `⏰ كود الخصم ${discount.code} سينتهي خلال ${daysLeft} يوم! استخدمه الآن.`,
                        'discount',
                        5000
                    );
                }
            });
            
        } catch (error) {
            console.error('خطأ في التحقق من الخصومات:', error);
        }
    }, 3600000);
}

// ==================== تنبيه الطلبات للمشرف ====================
function notifyAdminNewOrder(order) {
    sendNotification('🚀 طلب جديد في Falcon Store!', {
        body: `${order.game} - ${order.item?.name || ''} - ${order.totalPrice} ج.م`,
        requireInteraction: true,
        url: 'admin.html'
    });
    
    showToast(
        `طلب جديد: ${order.game} - ${order.totalPrice} ج.م`,
        'order',
        8000
    );
    
    if (typeof playNewOrderSound === 'function') {
        playNewOrderSound();
    } else {
        new Audio('sounds/new_order.mp3').play().catch(()=>{});
    }
}

// ==================== تنبيهات الحالة للعميل ====================
function notifyCustomerOrderUpdate(orderId, status, message) {
    const notifications = JSON.parse(localStorage.getItem('orderNotifications') || '[]');
    
    if (notifications.includes(`${orderId}_${status}`)) return;
    
    switch (status) {
        case 'confirmed':
            showToast('✅ تم تأكيد استلام المبلغ. جاري تجهيز طلبك.', 'success');
            sendNotification('تم تأكيد طلبك', {
                body: 'تم استلام المبلغ وجاري تجهيز طلبك للشحن.',
                url: 'payment-pending.html'
            });
            break;
            
        case 'completed':
            showToast('🎉 تم شحن طلبك بنجاح!', 'success');
            sendNotification('🎉 تم شحن طلبك!', {
                body: 'الحمد لله، تم شحن طلبك بنجاح. شكراً لثقتك بنا!',
                requireInteraction: true,
                url: 'payment-pending.html'
            });
            break;
            
        case 'delayed':
            showToast('⏳ نعتذر عن التأخير. تمت إضافة 5 نجوم لحسابك.', 'warning');
            sendNotification('نعتذر عن التأخير', {
                body: 'طلبك يأخذ وقتاً أطول من المعتاد. تمت إضافة 5 نجوم كتعويض.',
                url: 'payment-pending.html'
            });
            break;
    }
    
    notifications.push(`${orderId}_${status}`);
    localStorage.setItem('orderNotifications', JSON.stringify(notifications));
}

// ==================== تنبيهات المناسبات ====================
function checkSpecialOccasions() {
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;
    
    if (month === 3 || month === 4) {
        showToast('🌙 رمضان كريم! خصم 10% على جميع الطلبات', 'discount', 5000);
    }
    
    if (month === 11 && day >= 20 && day <= 30) {
        showToast('🛍️ عروض الجمعة البيضاء! خصم 15% على كل شيء', 'discount', 5000);
    }
    
    checkUserBirthday();
}

// ==================== التحقق من عيد ميلاد المستخدم ====================
async function checkUserBirthday() {
    const user = getCurrentUser();
    if (!user) return;
    
    try {
        const userDoc = await db.collection('users').doc(user.uid).get();
        const data = userDoc.data() || {};
        
        if (!data.birthdate) return;
        
        const birthdate = new Date(data.birthdate);
        const today = new Date();
        
        if (birthdate.getDate() === today.getDate() && 
            birthdate.getMonth() === today.getMonth()) {
            
            const lastBirthdayGift = localStorage.getItem(`birthday_gift_${user.uid}`);
            const thisYear = today.getFullYear().toString();
            
            if (lastBirthdayGift !== thisYear) {
                await db.collection('users').doc(user.uid).update({
                    loyaltyPoints: firebase.firestore.FieldValue.increment(50)
                });
                
                localStorage.setItem(`birthday_gift_${user.uid}`, thisYear);
                
                showToast('🎂 عيد ميلاد سعيد! تمت إضافة 50 نجمة إلى حسابك', 'success', 8000);
                sendNotification('🎂 عيد ميلاد سعيد!', {
                    body: 'كل عام وأنت بخير! تمت إضافة 50 نجمة كهدية من Falcon Store.',
                    url: 'rewards.html'
                });
                
                if (typeof playRewardSound === 'function') playRewardSound();
                else new Audio('sounds/reward.mp3').play().catch(()=>{});
            }
        }
        
    } catch (error) {
        console.error('خطأ في التحقق من عيد الميلاد:', error);
    }
}

// ==================== تنبيهات ذكية للعروض ====================
function showSmartOffer(game, discount) {
    const user = getCurrentUser();
    if (!user) return;
    
    db.collection('users').doc(user.uid).collection('user_orders')
        .where('game', '==', game)
        .limit(1)
        .get()
        .then(snapshot => {
            if (!snapshot.empty) {
                showToast(
                    `🎮 عرض خاص لك: خصم ${discount}% على ${game} لأنك من عملائنا المميزين!`,
                    'discount',
                    8000
                );
            }
        });
}

// ==================== إشعارات الطلبات الجديدة للمشرف (صوت الصقر) ====================
function playFalconScreech() {
    if (typeof playFalconScreechSound === 'function') {
        playFalconScreechSound();
    } else {
        new Audio('sounds/falcon-screech.mp3').play().catch(()=>{});
    }
}

// ==================== إشعار فوري للعميل عند تغيير حالة الطلب ====================
async function notifyOrderStatusChange(orderId, oldStatus, newStatus) {
    if (oldStatus === newStatus) return;
    
    const orderDoc = await db.collection('orders').doc(orderId).get();
    const order = orderDoc.data();
    if (!order) return;
    
    const user = getCurrentUser();
    if (!user || user.uid !== order.userId) return;
    
    switch (newStatus) {
        case 'confirmed':
            showToast(`✅ تم تأكيد طلبك #${orderId} - جاري التجهيز للشحن`, 'success');
            sendNotification('تم تأكيد طلبك', {
                body: `طلبك #${orderId} تم تأكيده وجاري التجهيز للشحن.`,
                url: 'payment-pending.html'
            });
            if (typeof playConfirmedSound === 'function') playConfirmedSound();
            break;
            
        case 'completed':
            showToast(`🎉 تم شحن طلبك #${orderId} بنجاح! شكراً لثقتك بنا`, 'success');
            sendNotification('تم شحن طلبك 🎉', {
                body: `طلبك #${orderId} تم شحنه بنجاح. تقييمك يهمنا!`,
                url: 'payment-pending.html'
            });
            if (typeof playShippingCompleteSound === 'function') playShippingCompleteSound();
            break;
            
        case 'pending':
            showToast(`⏳ طلبك #${orderId} قيد المراجعة`, 'info');
            break;
    }
}

// ==================== إشعارات داخل التطبيق (In-App) ====================
function showInAppNotification(title, message, type = 'info', duration = 5000) {
    const existing = document.querySelector('.in-app-notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = 'in-app-notification';
    
    let icon = '🔔';
    let bgColor = 'var(--info)';
    
    switch (type) {
        case 'success': icon = '✅'; bgColor = 'var(--success)'; break;
        case 'error': icon = '❌'; bgColor = 'var(--danger)'; break;
        case 'warning': icon = '⚠️'; bgColor = 'var(--warning)'; break;
        default: icon = 'ℹ️'; bgColor = 'var(--info)';
    }
    
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: ${bgColor};
        color: white;
        padding: 16px 20px;
        border-radius: 16px;
        z-index: 10001;
        max-width: 350px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        animation: slideInRight 0.3s ease;
        cursor: pointer;
        direction: rtl;
    `;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 1.5rem;">${icon}</span>
            <div>
                <div style="font-weight: bold; margin-bottom: 4px;">${title}</div>
                <div style="font-size: 0.85rem; opacity: 0.9;">${message}</div>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'fadeOutRight 0.3s ease forwards';
        setTimeout(() => notification.remove(), 300);
    }, duration);
    
    // إضافة أنماط الحركة
    if (!document.querySelector('#notification-animation-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-animation-styles';
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes fadeOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

// ==================== تهيئة نظام التنبيهات ====================
function initNotifications() {
    addToastStyles();
    requestNotificationPermission();
    startDiscountAlerts();
    checkSpecialOccasions();
    
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(console.error);
    }
    
    console.log('✅ نظام التنبيهات جاهز');
}

// ==================== تصدير الدوال للاستخدام العام ====================
window.showToast = showToast;
window.sendNotification = sendNotification;
window.notifyAdminNewOrder = notifyAdminNewOrder;
window.notifyCustomerOrderUpdate = notifyCustomerOrderUpdate;
window.showSmartOffer = showSmartOffer;
window.showInAppNotification = showInAppNotification;
window.notifyOrderStatusChange = notifyOrderStatusChange;
window.playFalconScreech = playFalconScreech;

// ==================== تهيئة تلقائية ====================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNotifications);
} else {
    initNotifications();
}

console.log('✅ Notifications.js loaded successfully');
