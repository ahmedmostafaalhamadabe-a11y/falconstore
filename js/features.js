// ==================== الجرعة اليومية (معطلة نهائياً - تم نقلها إلى index.html) ====================
async function checkDailyDose() {
    // تم تعطيل هذه الدالة نهائياً لأن الهدية اليومية تدار من index.html عبر handleDailyDose()
    // هذا يمنع مضاعفة النجوم والرسائل المزدوجة
    console.log('⏸️ checkDailyDose معطلة نهائياً - استخدم handleDailyDose في index.html');
    return;
}

function closeDailyDose() {
    document.getElementById('dailyDoseModal')?.classList.remove('show');
}

// ==================== تحديث الـ Streak اليومي ====================
function updateDailyStreak(userId) {
    let streak = parseInt(localStorage.getItem(`streak_${userId}`) || '0');
    const lastDate = localStorage.getItem(`streakDate_${userId}`);
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const today = new Date().toDateString();
    
    if (lastDate === yesterday.toDateString()) {
        streak++;
    } else if (lastDate !== today) {
        streak = 1;
    }
    
    localStorage.setItem(`streak_${userId}`, streak);
    localStorage.setItem(`streakDate_${userId}`, today);
    
    const streakEl = document.getElementById('streakDays');
    if (streakEl) streakEl.textContent = streak;
}

// ==================== الحصالة اليومية ====================
async function checkPiggyBank() {
    const user = getCurrentUser();
    if (!user) return;
    
    const lastPiggy = localStorage.getItem(`piggy_${user.uid}`);
    const today = new Date().toDateString();
    
    if (lastPiggy !== today) {
        let piggyTotal = parseInt(localStorage.getItem(`piggyTotal_${user.uid}`) || '0');
        piggyTotal += 1;
        localStorage.setItem(`piggyTotal_${user.uid}`, piggyTotal);
        localStorage.setItem(`piggy_${user.uid}`, today);
        
        let streak = parseInt(localStorage.getItem(`piggyStreak_${user.uid}`) || '0');
        const lastStreakDate = localStorage.getItem(`piggyStreakDate_${user.uid}`);
        
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastStreakDate === yesterday.toDateString()) {
            streak++;
        } else if (lastStreakDate !== today) {
            streak = 1;
        }
        
        localStorage.setItem(`piggyStreak_${user.uid}`, streak);
        localStorage.setItem(`piggyStreakDate_${user.uid}`, today);
        
        if (streak === 7) {
            piggyTotal += 7;
            localStorage.setItem(`piggyTotal_${user.uid}`, piggyTotal);
            localStorage.setItem(`piggyStreak_${user.uid}`, 0);
            
            await db.collection('users').doc(user.uid).update({
                loyaltyPoints: firebase.firestore.FieldValue.increment(piggyTotal)
            });
            
            const piggyTotalEl = document.getElementById('piggyTotal');
            if (piggyTotalEl) piggyTotalEl.textContent = piggyTotal;
            document.getElementById('piggyBankModal')?.classList.add('show');
            
            localStorage.setItem(`piggyTotal_${user.uid}`, 0);
            if (typeof playAchievementSound === 'function') playAchievementSound();
            else new Audio('sounds/achievement.mp3').play().catch(()=>{});
            if (typeof logActivity === 'function') logActivity(`أكمل 7 أيام وحصل على ${piggyTotal} نجمة`, '🐷');
        } else {
            await db.collection('users').doc(user.uid).update({
                loyaltyPoints: firebase.firestore.FieldValue.increment(1)
            });
            
            const piggyTotalEl = document.getElementById('piggyTotal');
            if (piggyTotalEl) piggyTotalEl.textContent = piggyTotal;
            document.getElementById('piggyBankModal')?.classList.add('show');
            if (typeof playClickSound === 'function') playClickSound();
            else new Audio('sounds/click.mp3').play().catch(()=>{});
        }
        
        await updateUI(user);
    }
}

function closePiggyBank() {
    document.getElementById('piggyBankModal')?.classList.remove('show');
}

// ==================== نافذة تسجيل الدخول المطلوبة ====================
function showLoginRequiredModal() {
    showWarningModal('يجب تسجيل الدخول للحصول على الجرعة اليومية والمكافآت.', 'تسجيل الدخول مطلوب');
}

// ==================== نافذة الترحيب للزائر ====================
function showGuestWelcome() {
    const user = getCurrentUser();
    if (user) return;
    
    const dismissed = sessionStorage.getItem('guestWelcomeDismissed');
    if (dismissed) return;
    
    const path = window.location.pathname;
    if (path.includes('login.html') || path.includes('verify.html') || path.includes('complete-profile.html')) return;
    
    setTimeout(() => {
        const user = getCurrentUser();
        if (!user) {
            document.getElementById('guestWelcomeModal')?.classList.add('show');
        }
    }, 1500);
}

function closeGuestWelcome() {
    document.getElementById('guestWelcomeModal')?.classList.remove('show');
    sessionStorage.setItem('guestWelcomeDismissed', 'true');
}

// ==================== شريط النشاط المباشر ====================
function initActivityFeed() {
    const feedContainer = document.getElementById('activityScroll');
    if (!feedContainer) return;
    
    db.collection('activity_log')
        .orderBy('timestamp', 'desc')
        .limit(15)
        .onSnapshot(snapshot => {
            feedContainer.innerHTML = '';
            snapshot.forEach(doc => {
                const data = doc.data();
                const time = data.timestamp ? new Date(data.timestamp.toDate()).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : '';
                feedContainer.innerHTML += `
                    <span class="activity-item">
                        ${data.icon} ${data.message} ${data.city ? 'من ' + data.city : ''} ${time ? '🕒 ' + time : ''}
                    </span>
                `;
            });
        });
}

// ==================== شريط الطلبات المباشر ====================
function initLiveOrdersTicker() {
    const tickerText = document.getElementById('tickerText');
    if (!tickerText) return;
    
    db.collection('orders')
        .where('status', 'in', ['pending', 'confirmed', 'completed'])
        .orderBy('createdAt', 'desc')
        .limit(15)
        .onSnapshot((snapshot) => {
            const orders = [];
            snapshot.forEach(doc => orders.push(doc.data()));
            
            if (orders.length > 0) {
                let index = 0;
                tickerText.textContent = `${orders[0].userEmail?.split('@')[0] || 'عميل'} اشترى ${orders[0].item?.name || ''} ${orders[0].game || ''}`;
                
                setInterval(() => {
                    index = (index + 1) % orders.length;
                    if (orders[index]) {
                        const order = orders[index];
                        tickerText.textContent = `${order.userEmail?.split('@')[0] || 'عميل'} اشترى ${order.item?.name || ''} ${order.game || ''}`;
                    }
                }, 3500);
            } else {
                tickerText.textContent = '🎮 كن أول من يشتري اليوم!';
            }
        });
}

// ==================== نظام الحقائق العشوائية ====================
const gameFacts = [
    "🎮 Free Fire كانت أول لعبة باتل رويال تصل لـ 1 مليار تحميل على جوجل بلاي.",
    "📱 PUBG Mobile حققت إيرادات تجاوزت 9 مليار دولار منذ إطلاقها.",
    "⚽ eFootball كانت تُعرف سابقاً باسم PES (Pro Evolution Soccer).",
    "🔥 شخصية Chrono في Free Fire مستوحاة من Cristiano Ronaldo.",
    "🏆 بطولة Free Fire World Series 2021 شاهدها 5.4 مليون شخص مباشرة.",
    "🦅 شعار Falcon Store مستوحى من سرعة ودقة الصقر.",
    "⭐ كل 1 جنيه تشحنه = 1 نجمة تكافئك.",
    "💎 يمكنك استبدال النجوم بجوائز قيمة في متجر المكافآت."
];

function getRandomFact() {
    return gameFacts[Math.floor(Math.random() * gameFacts.length)];
}

function displayRandomFact() {
    const factEl = document.getElementById('randomFact');
    if (factEl) factEl.textContent = getRandomFact();
}

function startFactRotation() {
    displayRandomFact();
    setInterval(displayRandomFact, 8000);
}

// ==================== الشات الحقيقي ====================
let chatUnsubscribe = null;
let currentChatId = null;

function initRealChat() {
    const user = getCurrentUser();
    if (!user) return;
    
    currentChatId = `chat_${user.uid}`;
    
    const chatBody = document.getElementById('chatBody');
    if (!chatBody) return;
    
    chatUnsubscribe = db.collection('chats').doc(currentChatId)
        .collection('messages')
        .orderBy('timestamp', 'asc')
        .onSnapshot((snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    const msg = change.doc.data();
                    displayChatMessage(msg);
                    if (typeof playMessageSound === 'function') playMessageSound();
                    else new Audio('sounds/message.mp3').play().catch(()=>{});
                }
            });
            if (chatBody) chatBody.scrollTop = chatBody.scrollHeight;
        });
}

async function sendRealMessage(text) {
    const user = getCurrentUser();
    if (!user || !text.trim() || !currentChatId) return;
    
    try {
        await db.collection('chats').doc(currentChatId)
            .collection('messages')
            .add({
                text: text.trim(),
                sender: 'customer',
                senderName: user.displayName || user.email?.split('@')[0],
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                read: false
            });
            
        await db.collection('notifications').add({
            type: 'chat',
            userId: user.uid,
            message: text.substring(0, 50),
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            read: false
        });
        
    } catch (error) {
        console.error('خطأ في إرسال الرسالة:', error);
    }
}

function displayChatMessage(msg) {
    const chatBody = document.getElementById('chatBody');
    if (!chatBody) return;
    
    const time = msg.timestamp ? new Date(msg.timestamp.toDate()).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : 'الآن';
    
    const div = document.createElement('div');
    div.className = `chat-message ${msg.sender}`;
    div.innerHTML = `
        <div class="chat-bubble">${escapeHtml(msg.text)}</div>
        <div class="chat-time">${time}</div>
    `;
    chatBody.appendChild(div);
}

function toggleChat() {
    const modal = document.getElementById('chatModal');
    if (modal) {
        modal.classList.toggle('show');
        if (modal.classList.contains('show')) {
            initRealChat();
        }
        if (typeof playClickSound === 'function') playClickSound();
        else new Audio('sounds/click.mp3').play().catch(()=>{});
    }
}

// ==================== نظام الإنجازات ====================
const achievementsList = [
    { id: 'first_order', name: 'أول طلب', icon: '🛒', message: 'أتممت أول طلب لك!', stars: 10 },
    { id: 'ten_orders', name: 'عميل مميز', icon: '⭐', message: 'أتممت 10 طلبات!', stars: 50 },
    { id: 'stars_100', name: 'جامع النجوم', icon: '🌟', message: 'جمعت 100 نجمة!', stars: 20 },
    { id: 'stars_500', name: 'نجم لامع', icon: '✨', message: 'جمعت 500 نجمة!', stars: 100 },
    { id: 'profile_complete', name: 'مكتمل', icon: '📝', message: 'أكملت ملفك الشخصي!', stars: 20 },
    { id: 'daily_streak_7', name: 'منتظم', icon: '🔥', message: 'دخلت الموقع 7 أيام متتالية!', stars: 30 },
    { id: 'referral_5', name: 'سفير فالكون', icon: '👥', message: 'سجل 5 أشخاص عبر كودك!', stars: 100 },
    { id: 'vip_month', name: 'سوبر فالكون', icon: '👑', message: 'وصلت إلى مستوى VIP!', stars: 200 }
];

async function checkAndAwardAchievements(userId) {
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data() || {};
    const earnedAchievements = userData.achievements || [];
    
    const totalOrders = userData.totalOrders || 0;
    const loyaltyPoints = userData.loyaltyPoints || 0;
    const referralCount = userData.referralCount || 0;
    
    for (const ach of achievementsList) {
        if (earnedAchievements.includes(ach.id)) continue;
        
        let shouldAward = false;
        if (ach.id === 'first_order' && totalOrders >= 1) shouldAward = true;
        else if (ach.id === 'ten_orders' && totalOrders >= 10) shouldAward = true;
        else if (ach.id === 'stars_100' && loyaltyPoints >= 100) shouldAward = true;
        else if (ach.id === 'stars_500' && loyaltyPoints >= 500) shouldAward = true;
        else if (ach.id === 'profile_complete' && userData.profileCompleted) shouldAward = true;
        else if (ach.id === 'referral_5' && referralCount >= 5) shouldAward = true;
        
        if (shouldAward) {
            await db.collection('users').doc(userId).update({
                achievements: firebase.firestore.FieldValue.arrayUnion(ach.id),
                loyaltyPoints: firebase.firestore.FieldValue.increment(ach.stars)
            });
            
            const achievementModal = document.getElementById('achievementModal');
            const achievementIcon = document.getElementById('achievementIcon');
            const achievementMessage = document.getElementById('achievementMessage');
            if (achievementModal && achievementIcon && achievementMessage) {
                achievementIcon.textContent = ach.icon;
                achievementMessage.textContent = ach.message;
                achievementModal.classList.add('show');
                if (typeof playAchievementSound === 'function') playAchievementSound();
                else new Audio('sounds/achievement.mp3').play().catch(()=>{});
            }
        }
    }
}

function closeAchievement() {
    document.getElementById('achievementModal')?.classList.remove('show');
}

// ==================== نظام النوافذ المنبثقة الاحترافية ====================
function showModal(title, message, type = 'info', onConfirm = null, onCancel = null) {
    let icon = '🔔';
    let iconColor = 'var(--info)';
    let sound = null;
    
    switch (type) {
        case 'success': icon = '✅'; iconColor = 'var(--success)'; sound = 'ting'; break;
        case 'error': icon = '❌'; iconColor = 'var(--danger)'; sound = 'error'; break;
        case 'warning': icon = '⚠️'; iconColor = 'var(--warning)'; sound = 'error'; break;
        case 'info': icon = 'ℹ️'; iconColor = 'var(--info)'; sound = 'ting'; break;
        case 'confirm': icon = '❓'; iconColor = 'var(--warning)'; sound = null; break;
    }
    
    if (sound === 'ting') { if (typeof playTingSound === 'function') playTingSound(); else new Audio('sounds/ting.mp3').play().catch(()=>{}); }
    else if (sound === 'error') { if (typeof playErrorSound === 'function') playErrorSound(); else new Audio('sounds/error.mp3').play().catch(()=>{}); }
    
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.display = 'flex';
    overlay.style.zIndex = '10000';
    
    let buttonsHtml = '';
    if (type === 'confirm') {
        buttonsHtml = `<div class="modal-actions"><button class="btn btn-primary" id="modalConfirmYes">نعم</button><button class="btn btn-outline" id="modalConfirmNo">لا</button></div>`;
    } else {
        buttonsHtml = `<div class="modal-actions"><button class="btn btn-primary" id="modalOkBtn">حسناً</button></div>`;
    }
    
    overlay.innerHTML = `<div class="modal-card" style="max-width: 400px;"><div class="modal-icon" style="color: ${iconColor};">${icon}</div><h3>${escapeHtml(title)}</h3><p>${escapeHtml(message)}</p>${buttonsHtml}</div>`;
    document.body.appendChild(overlay);
    
    const closeModal = () => overlay.remove();
    
    if (type === 'confirm') {
        document.getElementById('modalConfirmYes').addEventListener('click', () => { closeModal(); if (onConfirm) onConfirm(); if (typeof playTingSound === 'function') playTingSound(); else new Audio('sounds/ting.mp3').play().catch(()=>{}); });
        document.getElementById('modalConfirmNo').addEventListener('click', () => { closeModal(); if (onCancel) onCancel(); if (typeof playClickSound === 'function') playClickSound(); else new Audio('sounds/click.mp3').play().catch(()=>{}); });
    } else {
        document.getElementById('modalOkBtn').addEventListener('click', closeModal);
    }
    
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
}

function showSuccessModal(message, title = 'نجاح') { showModal(title, message, 'success'); }
function showErrorModal(message, title = 'خطأ') { showModal(title, message, 'error'); }
function showWarningModal(message, title = 'تنبيه') { showModal(title, message, 'warning'); }
function showInfoModal(message, title = 'معلومة') { showModal(title, message, 'info'); }
function showConfirmModal(message, onConfirm, onCancel, title = 'تأكيد') { showModal(title, message, 'confirm', onConfirm, onCancel); }

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==================== دوال الصوت (ربط مع النظام الرئيسي) ====================
function playClickSound() { if (typeof window.playClickSound === 'function') window.playClickSound(); else new Audio('sounds/click.mp3').play().catch(()=>{}); }
function playClick2Sound() { if (typeof window.playClick2Sound === 'function') window.playClick2Sound(); else new Audio('sounds/click2.mp3').play().catch(()=>{}); }
function playErrorSound() { if (typeof window.playErrorSound === 'function') window.playErrorSound(); else new Audio('sounds/error.mp3').play().catch(()=>{}); }
function playTingSound() { if (typeof window.playTingSound === 'function') window.playTingSound(); else new Audio('sounds/ting.mp3').play().catch(()=>{}); }
function playSuccessSound() { if (typeof window.playSuccessSound === 'function') window.playSuccessSound(); else new Audio('sounds/success.mp3').play().catch(()=>{}); }
function playWelcomeSound() { if (typeof window.playWelcomeSound === 'function') window.playWelcomeSound(); else new Audio('sounds/Welcome.mp3').play().catch(()=>{}); }
function playRewardSound() { if (typeof window.playRewardSound === 'function') window.playRewardSound(); else new Audio('sounds/reward.mp3').play().catch(()=>{}); }
function playAchievementSound() { if (typeof window.playAchievementSound === 'function') window.playAchievementSound(); else new Audio('sounds/achievement.mp3').play().catch(()=>{}); }
function playMessageSound() { if (typeof window.playMessageSound === 'function') window.playMessageSound(); else new Audio('sounds/message.mp3').play().catch(()=>{}); }
function playPaymentSound() { if (typeof window.playPaymentSound === 'function') window.playPaymentSound(); else new Audio('sounds/payment.mp3').play().catch(()=>{}); }
function playConfirmedSound() { if (typeof window.playConfirmedSound === 'function') window.playConfirmedSound(); else new Audio('sounds/confirmed.mp3').play().catch(()=>{}); }

// ==================== تهيئة الميزات ====================
function initAllFeatures() {
    initActivityFeed();
    initLiveOrdersTicker();
    startFactRotation();
    
    const chatFloat = document.getElementById('chatFloat');
    if (chatFloat) chatFloat.addEventListener('click', toggleChat);
    
    const chatClose = document.querySelector('.chat-close');
    if (chatClose) chatClose.addEventListener('click', toggleChat);
    
    const chatSend = document.querySelector('.chat-send');
    const chatInput = document.getElementById('chatInput');
    
    if (chatSend && chatInput) {
        chatSend.addEventListener('click', () => { if (chatInput.value.trim()) { sendRealMessage(chatInput.value.trim()); chatInput.value = ''; } });
        chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (chatInput.value.trim()) { sendRealMessage(chatInput.value.trim()); chatInput.value = ''; } } });
    }
}

console.log('✅ Features loaded successfully - Falcon Store');
