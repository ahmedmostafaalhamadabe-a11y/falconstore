// ==================== نظام الشحنات المباشرة والإشعارات ==================
// هذا ملف منفصل أو يمكن دمجه مع notifications.js

let allTodayOrders = [];
let allYesterdayOrders = [];
let tickerInterval = null;
let tickerIndex = 0;
let shippingListener = null;

// أيقونات الألعاب
const gameIcons = {
    'freefire': '💎',
    'pubg': '💰',
    'cod': '⚡',
    'efootball': '⚽',
    'fifa': '⚽',
    'giftcard': '🎁'
};

// أسماء الألعاب بالعربية
const gameNames = {
    'freefire': 'Free Fire',
    'pubg': 'PUBG Mobile',
    'cod': 'Call of Duty',
    'efootball': 'eFootball',
    'fifa': 'FIFA Mobile'
};

// ==================== إظهار إشعار لحظي عند شحن جديد ====================
function showShippingNotification(order) {
    if (!order || order.status !== 'completed') return;
    
    const userName = order.userEmail?.split('@')[0] || 'عميل';
    const gameIcon = gameIcons[order.gameKey] || '🎮';
    const gameName = gameNames[order.gameKey] || order.game || 'لعبة';
    const itemName = order.item?.name || '';
    const country = order.userCountry || getUserCountry() || 'مصر';
    const time = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    
    // إزالة الإشعارات القديمة
    const oldNotifications = document.querySelectorAll('.shipping-toast');
    oldNotifications.forEach(n => n.remove());
    
    // إنشاء عنصر الإشعار
    const notification = document.createElement('div');
    notification.className = 'shipping-toast';
    notification.innerHTML = `
        <div class="shipping-toast-icon">🦅</div>
        <div class="shipping-toast-content">
            <div class="shipping-toast-title">🚀 شحن جديد!</div>
            <div class="shipping-toast-text">
                <strong>${userName}</strong> من ${country} شحن 
                <strong>${itemName}</strong> ${gameIcon} ${gameName}
            </div>
            <div class="shipping-toast-time">🕒 ${time}</div>
        </div>
        <button class="shipping-toast-close" onclick="this.parentElement.remove()">✕</button>
    `;
    
    document.body.appendChild(notification);
    
    // تشغيل صوت الإشعار
    if (typeof playTingSound === 'function') playTingSound();
    else new Audio('sounds/ting.mp3').play().catch(()=>{});
    
    // إخفاء الإشعار بعد 5 ثواني
    setTimeout(() => {
        if (notification && notification.parentElement) {
            notification.style.animation = 'slideOutRight 0.3s ease forwards';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// ==================== تحديث الشريط المتحرك ====================
function updateLiveTicker() {
    const tickerElement = document.getElementById('liveShippingText');
    if (!tickerElement) return;
    
    if (allTodayOrders.length === 0 && allYesterdayOrders.length === 0) {
        tickerElement.innerHTML = '🛡️ لا توجد شحنات اليوم. كن أول من يشحن!';
        return;
    }
    
    // إنشاء قائمة بجميع الرسائل
    const messages = [];
    
    // شحنات اليوم
    allTodayOrders.forEach((order, index) => {
        const userName = order.userEmail?.split('@')[0] || 'عميل';
        const gameIcon = gameIcons[order.gameKey] || '🎮';
        const gameName = gameNames[order.gameKey] || order.game || 'لعبة';
        const itemName = order.item?.name || '';
        const country = order.userCountry || getUserCountry() || 'مصر';
        const time = order.createdAt ? new Date(order.createdAt.toDate()).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : '';
        
        messages.push({
            text: `🦅 آخر شخص شحن اليوم: ${userName} من ${country} شحن ${itemName} ${gameIcon} ${gameName} الساعة ${time}`,
            priority: 'today'
        });
    });
    
    // شحنات الأمس (آخر 5 فقط)
    if (allYesterdayOrders.length > 0) {
        messages.push({
            text: `━━━ 📅 شحنات الأمس ━━━`,
            priority: 'separator'
        });
        allYesterdayOrders.slice(0, 5).forEach(order => {
            const userName = order.userEmail?.split('@')[0] || 'عميل';
            const gameIcon = gameIcons[order.gameKey] || '🎮';
            const gameName = gameNames[order.gameKey] || order.game || 'لعبة';
            const itemName = order.item?.name || '';
            const country = order.userCountry || 'مصر';
            
            messages.push({
                text: `🕊️ ${userName} من ${country} شحن ${itemName} ${gameIcon} ${gameName} (أمس)`,
                priority: 'yesterday'
            });
        });
    }
    
    // تشغيل الشريط المتحرك
    let msgIndex = 0;
    
    function showNextMessage() {
        if (messages.length === 0) return;
        if (msgIndex >= messages.length) msgIndex = 0;
        
        const msg = messages[msgIndex];
        tickerElement.innerHTML = msg.text;
        
        // تأثير وامض للشحنات الجديدة
        if (msg.priority === 'today') {
            tickerElement.style.animation = 'none';
            setTimeout(() => {
                tickerElement.style.animation = 'tickerPulse 0.5s ease';
            }, 10);
        }
        
        msgIndex++;
    }
    
    if (tickerInterval) clearInterval(tickerInterval);
    showNextMessage();
    tickerInterval = setInterval(showNextMessage, 4000);
}

// ==================== جلب الشحنات من Firebase ====================
async function loadShippingData() {
    if (typeof db === 'undefined') {
        console.warn('⚠️ Firebase غير متاح');
        return;
    }
    
    try {
        // جلب شحنات اليوم
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todaySnapshot = await db.collection('orders')
            .where('status', '==', 'completed')
            .where('createdAt', '>=', today)
            .orderBy('createdAt', 'desc')
            .limit(30)
            .get();
        
        allTodayOrders = [];
        todaySnapshot.forEach(doc => {
            allTodayOrders.push({ id: doc.id, ...doc.data() });
        });
        
        // جلب شحنات الأمس
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        
        const endOfYesterday = new Date();
        endOfYesterday.setDate(endOfYesterday.getDate() - 1);
        endOfYesterday.setHours(23, 59, 59, 999);
        
        const yesterdaySnapshot = await db.collection('orders')
            .where('status', '==', 'completed')
            .where('createdAt', '>=', yesterday)
            .where('createdAt', '<=', endOfYesterday)
            .orderBy('createdAt', 'desc')
            .limit(10)
            .get();
        
        allYesterdayOrders = [];
        yesterdaySnapshot.forEach(doc => {
            allYesterdayOrders.push({ id: doc.id, ...doc.data() });
        });
        
        // تحديث الشريط
        updateLiveTicker();
        
        // الاستماع للشحنات الجديدة في الوقت الفعلي
        listenForNewShipping();
        
    } catch (error) {
        console.error('خطأ في تحميل بيانات الشحن:', error);
        const tickerElement = document.getElementById('liveShippingText');
        if (tickerElement) tickerElement.innerHTML = '🛡️ جاري تحميل الشحنات...';
    }
}

// ==================== الاستماع للشحنات الجديدة ====================
function listenForNewShipping() {
    if (shippingListener) shippingListener();
    
    if (typeof db === 'undefined') return;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    shippingListener = db.collection('orders')
        .where('status', '==', 'completed')
        .where('createdAt', '>=', today)
        .orderBy('createdAt', 'desc')
        .onSnapshot(snapshot => {
            snapshot.docChanges().forEach(change => {
                if (change.type === 'added') {
                    const newOrder = change.doc.data();
                    newOrder.id = change.doc.id;
                    
                    // إضافة إلى القائمة
                    allTodayOrders.unshift(newOrder);
                    
                    // عرض إشعار لحظي
                    showShippingNotification(newOrder);
                    
                    // تحديث الشريط المتحرك
                    updateLiveTicker();
                }
            });
        }, error => {
            console.error('خطأ في الاستماع للشحنات:', error);
        });
}

// ==================== الحصول على دولة المستخدم ====================
function getUserCountry() {
    // محاولة الحصول من localStorage
    const savedCountry = localStorage.getItem('userCountry');
    if (savedCountry) return savedCountry;
    
    // محاولة جلب من API
    fetch('https://ipapi.co/json/')
        .then(response => response.json())
        .then(data => {
            const country = data.country_name;
            localStorage.setItem('userCountry', country);
        })
        .catch(() => {});
    
    return 'مصر';
}

// ==================== إضافة أنماط الإشعارات ====================
function addShippingNotificationStyles() {
    if (document.getElementById('shipping-notification-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'shipping-notification-styles';
    style.textContent = `
        /* إشعار الشحن الجديد */
        .shipping-toast {
            position: fixed;
            top: 80px;
            right: 20px;
            background: linear-gradient(135deg, #1a1a2e, #16213e);
            border-right: 4px solid var(--primary, #D32F2F);
            border-radius: 16px;
            padding: 12px 16px;
            display: flex;
            align-items: center;
            gap: 12px;
            z-index: 10000;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            animation: slideInRight 0.3s ease forwards;
            max-width: 350px;
            width: calc(100% - 40px);
            direction: rtl;
        }
        .shipping-toast-icon {
            width: 45px;
            height: 45px;
            background: var(--primary, #D32F2F);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
        }
        .shipping-toast-content {
            flex: 1;
        }
        .shipping-toast-title {
            font-weight: bold;
            color: var(--primary, #D32F2F);
            font-size: 0.85rem;
            margin-bottom: 4px;
        }
        .shipping-toast-text {
            font-size: 0.8rem;
            color: var(--text-primary, #FFFFFF);
            line-height: 1.4;
        }
        .shipping-toast-text strong {
            color: var(--secondary, #FFD966);
        }
        .shipping-toast-time {
            font-size: 0.65rem;
            color: var(--text-muted, #808080);
            margin-top: 4px;
        }
        .shipping-toast-close {
            background: none;
            border: none;
            color: var(--text-muted, #808080);
            cursor: pointer;
            font-size: 1rem;
            padding: 5px;
        }
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        @keyframes tickerPulse {
            0% { opacity: 0.6; }
            50% { opacity: 1; background: rgba(211,47,47,0.1); border-radius: 30px; }
            100% { opacity: 0.6; }
        }
        
        /* تحسين شريط الشحنات */
        .live-shipping-bar {
            background: var(--bg-surface, #1E1E1E);
            padding: 10px 16px;
            margin: 8px 16px;
            border-radius: 60px;
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            border: 1px solid var(--border-light, #333333);
            overflow: hidden;
        }
        .live-shipping-bar span {
            display: inline-block;
            animation: tickerScroll 0.5s ease;
            white-space: nowrap;
            overflow-x: auto;
            scrollbar-width: none;
        }
        .live-shipping-bar span::-webkit-scrollbar {
            display: none;
        }
        @keyframes tickerScroll {
            from { transform: translateX(20px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @media (max-width: 550px) {
            .shipping-toast { top: 70px; right: 10px; left: 10px; width: auto; max-width: none; }
            .shipping-toast-text { font-size: 0.75rem; }
            .live-shipping-bar span { font-size: 0.7rem; white-space: normal; }
        }
        
        @media (min-width: 1200px) {
            .shipping-toast { top: 100px; right: 30px; max-width: 400px; }
        }
    `;
    document.head.appendChild(style);
}

// ==================== التهيئة ====================
function initShippingSystem() {
    addShippingNotificationStyles();
    loadShippingData();
}

// تصدير الدوال
window.initShippingSystem = initShippingSystem;
window.showShippingNotification = showShippingNotification;

console.log('✅ نظام الشحنات المباشرة جاهز');
