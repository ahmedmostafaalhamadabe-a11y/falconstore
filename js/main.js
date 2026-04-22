// ==================== الأصوات الأساسية ====================
function playClickSound() {
    try { new Audio('sounds/click.mp3').play().catch(()=>{}); } catch(e) {}
}
function playTingSound() {
    try { new Audio('sounds/ting.mp3').play().catch(()=>{}); } catch(e) {}
}
function playErrorSound() {
    try { new Audio('sounds/error.mp3').play().catch(()=>{}); } catch(e) {}
}
function playWelcomeSound() {
    try { new Audio('sounds/Welcome.mp3').play().catch(()=>{}); } catch(e) {}
}
function playMessageSound() {
    try { new Audio('sounds/message.mp3').play().catch(()=>{}); } catch(e) {}
}
function playGetStarsSound() {
    try { new Audio('sounds/Get_the_stars.mp3').play().catch(()=>{}); } catch(e) {}
}
function playLoggedOutSound() {
    try { new Audio('sounds/Logged_out.mp3').play().catch(()=>{}); } catch(e) {}
}

// ==================== النوافذ المنبثقة ====================
window.showSuccessModal = function(message, title = 'نجاح') {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
        <div class="modal-card">
            <div class="modal-icon">✅</div>
            <h3>${title}</h3>
            <p>${message}</p>
            <button class="btn btn-primary" onclick="this.closest('.modal-overlay').remove()">حسناً</button>
        </div>
    `;
    document.body.appendChild(overlay);
    overlay.classList.add('show');
    playTingSound();
    setTimeout(() => overlay.remove(), 3000);
};

window.showErrorModal = function(message, title = 'خطأ') {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
        <div class="modal-card">
            <div class="modal-icon">❌</div>
            <h3>${title}</h3>
            <p>${message}</p>
            <button class="btn btn-primary" onclick="this.closest('.modal-overlay').remove()">حسناً</button>
        </div>
    `;
    document.body.appendChild(overlay);
    overlay.classList.add('show');
    playErrorSound();
    setTimeout(() => overlay.remove(), 3000);
};

window.showInfoModal = function(message, title = 'معلومة') {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
        <div class="modal-card">
            <div class="modal-icon">ℹ️</div>
            <h3>${title}</h3>
            <p>${message}</p>
            <button class="btn btn-primary" onclick="this.closest('.modal-overlay').remove()">حسناً</button>
        </div>
    `;
    document.body.appendChild(overlay);
    overlay.classList.add('show');
    playTingSound();
    setTimeout(() => overlay.remove(), 3000);
};

// ==================== تحديث واجهة المستخدم (الأساسية) ====================
async function updateUserUI(user) {
    const authBtns = document.getElementById('authButtons');
    const userInfo = document.getElementById('userInfo');
    const logoutBtn = document.getElementById('logoutBtn');
    const dailyReward = document.getElementById('dailyReward');
    
    if (!authBtns || !userInfo) return;
    
    if (user) {
        // مستخدم مسجل دخول
        authBtns.style.display = 'none';
        userInfo.style.display = 'flex';
        if (logoutBtn) logoutBtn.style.display = 'flex';
        if (dailyReward) dailyReward.classList.add('show');
        
        try {
            const doc = await db.collection('users').doc(user.uid).get();
            const data = doc.data() || {};
            
            const stars = data.loyaltyPoints || 0;
            const userName = data.displayName || user.email?.split('@')[0] || 'مستخدم';
            
            const userNameSpan = document.getElementById('userName');
            if (userNameSpan) userNameSpan.textContent = userName;
            
            const starsSpan = document.getElementById('starsCount');
            if (starsSpan) starsSpan.textContent = stars;
            
            let level = 'برونزي';
            if (stars >= 1000) level = 'ذهبي 🟡';
            else if (stars >= 100) level = 'فضي ⚪';
            const levelSpan = document.getElementById('userLevel');
            if (levelSpan) levelSpan.textContent = level;
            
            if (user.photoURL) {
                const avatar = document.getElementById('userAvatar');
                if (avatar) avatar.innerHTML = `<img src="${user.photoURL}">`;
                const menuAvatar = document.getElementById('menuAvatar');
                if (menuAvatar) menuAvatar.innerHTML = `<img src="${user.photoURL}">`;
            }
            
            const menuName = document.getElementById('menuName');
            if (menuName) menuName.textContent = userName;
            
        } catch(e) {
            console.warn(e);
        }
    } else {
        // مستخدم غير مسجل دخول
        authBtns.style.display = 'flex';
        userInfo.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (dailyReward) dailyReward.classList.remove('show');
    }
}

// ==================== مراقبة تسجيل الدخول ====================
if (typeof firebase !== 'undefined' && firebase.auth) {
    firebase.auth().onAuthStateChanged(function(user) {
        updateUserUI(user);
    });
    
    setTimeout(() => {
        const user = firebase.auth().currentUser;
        if (user) updateUserUI(user);
    }, 500);
}

// ==================== تسجيل الخروج ====================
async function handleLogout() {
    if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
        await firebase.auth().signOut();
        playLoggedOutSound();
        window.location.reload();
    }
}

// ==================== الهدية اليومية ====================
async function handleDailyDose() {
    const user = firebase.auth().currentUser;
    if (!user) {
        showErrorModal('يجب تسجيل الدخول أولاً', 'تسجيل الدخول مطلوب');
        return;
    }
    const last = localStorage.getItem(`dailyDose_${user.uid}`);
    const today = new Date().toDateString();
    if (last === today) {
        showErrorModal('لقد حصلت على هديتك اليومية بالفعل!', 'تم الاستلام');
        return;
    }
    const stars = Math.floor(Math.random() * 10) + 1;
    try {
        await db.collection('users').doc(user.uid).update({
            loyaltyPoints: firebase.firestore.FieldValue.increment(stars)
        });
        localStorage.setItem(`dailyDose_${user.uid}`, today);
        showSuccessModal(`🎁 حصلت على ${stars} نجوم!`, 'الهدية اليومية');
        playGetStarsSound();
        const starsSpan = document.getElementById('starsCount');
        if (starsSpan) starsSpan.textContent = (parseInt(starsSpan.textContent)||0) + stars;
        document.getElementById('dailyReward')?.classList.add('claimed');
    } catch(e) {
        showErrorModal('حدث خطأ، حاول مرة أخرى', 'خطأ');
    }
}

// ==================== السلايدر (نسخة محسنة) ====================
function initSlider() {
    let slides = document.querySelectorAll('.slider-slide');
    let prevBtn = document.getElementById('sliderPrevBtn');
    let nextBtn = document.getElementById('sliderNextBtn');
    let dotsContainer = document.getElementById('sliderDots');
    let currentIndex = 0;
    let total = slides.length;
    let autoInterval;

    function createDots() {
        if (!dotsContainer) return;
        dotsContainer.innerHTML = '';
        for (let i = 0; i < total; i++) {
            let dot = document.createElement('span');
            dot.classList.add('slider-dot');
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', (function(idx) {
                return function() { goToSlide(idx); };
            })(i));
            dotsContainer.appendChild(dot);
        }
    }

    function updateDots() {
        let dots = document.querySelectorAll('.slider-dot');
        for (let i = 0; i < dots.length; i++) {
            dots[i].classList.toggle('active', i === currentIndex);
        }
    }

    function goToSlide(index) {
        if (index < 0) index = total - 1;
        if (index >= total) index = 0;
        
        slides.forEach(slide => slide.classList.remove('active'));
        slides[index].classList.add('active');
        currentIndex = index;
        updateDots();
        
        // إعادة تعيين المؤقت التلقائي
        resetAutoInterval();
    }

    function nextSlide() {
        let newIndex = (currentIndex + 1) % total;
        goToSlide(newIndex);
        if (typeof playClickSound === 'function') playClickSound();
    }

    function prevSlide() {
        let newIndex = (currentIndex - 1 + total) % total;
        goToSlide(newIndex);
        if (typeof playClickSound === 'function') playClickSound();
    }

    function resetAutoInterval() {
        if (autoInterval) clearInterval(autoInterval);
        autoInterval = setInterval(nextSlide, 5000);
    }

    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);

    createDots();
    resetAutoInterval();
    console.log('✅ السلايدر يعمل، عدد الشرائح:', total);
}

// ==================== القائمة الجانبية ====================
function initMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const sideMenu = document.getElementById('sideMenu');
    const menuOverlay = document.getElementById('menuOverlay');
    const closeMenuBtn = document.getElementById('closeMenuBtn');
    const logoutMenuBtn = document.getElementById('logoutMenuBtn');
    
    if (menuToggle) {
        menuToggle.onclick = () => {
            sideMenu.classList.add('open');
            menuOverlay.classList.add('show');
            playClickSound();
        };
    }
    if (closeMenuBtn) {
        closeMenuBtn.onclick = () => {
            sideMenu.classList.remove('open');
            menuOverlay.classList.remove('show');
        };
    }
    if (menuOverlay) {
        menuOverlay.onclick = () => {
            sideMenu.classList.remove('open');
            menuOverlay.classList.remove('show');
        };
    }
    if (logoutMenuBtn) {
        logoutMenuBtn.onclick = (e) => {
            e.preventDefault();
            handleLogout();
        };
    }
}

// ==================== الثيم ====================
function initTheme() {
    const saved = localStorage.getItem('theme');
    const themeToggle = document.getElementById('themeToggle');
    const icon = themeToggle?.querySelector('i');
    
    if (saved === 'light') {
        document.body.classList.remove('dark');
        document.body.classList.add('light');
        if (icon) { icon.classList.remove('fa-sun'); icon.classList.add('fa-moon'); }
    } else {
        document.body.classList.add('dark');
        document.body.classList.remove('light');
        if (icon) { icon.classList.remove('fa-moon'); icon.classList.add('fa-sun'); }
    }
    
    if (themeToggle) {
        themeToggle.onclick = () => {
            document.body.classList.toggle('dark');
            document.body.classList.toggle('light');
            const isDark = document.body.classList.contains('dark');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            if (icon) {
                if (isDark) { icon.classList.remove('fa-moon'); icon.classList.add('fa-sun'); }
                else { icon.classList.remove('fa-sun'); icon.classList.add('fa-moon'); }
            }
            playClickSound();
        };
    }
}

// ==================== زر الصلاة ====================
let prayerAudio = null;
let isPraying = false;

function initPrayer() {
    if (!prayerAudio) {
        prayerAudio = new Audio('sounds/prayer.mp3');
        prayerAudio.volume = 0.5;
        prayerAudio.loop = false;
        prayerAudio.onended = () => {
            const icon = document.querySelector('#prayerBtn i');
            if (icon) {
                icon.classList.remove('fa-pause');
                icon.classList.add('fa-play');
            }
            document.getElementById('prayerBtn')?.classList.remove('playing');
            isPraying = false;
        };
    }
}

function togglePrayer() {
    initPrayer();
    const btn = document.getElementById('prayerBtn');
    const icon = btn?.querySelector('i');
    
    if (isPraying) {
        prayerAudio.pause();
        if (icon) {
            icon.classList.remove('fa-pause');
            icon.classList.add('fa-play');
        }
        btn?.classList.remove('playing');
        isPraying = false;
    } else {
        prayerAudio.play().catch(() => {});
        if (icon) {
            icon.classList.remove('fa-play');
            icon.classList.add('fa-pause');
        }
        btn?.classList.add('playing');
        isPraying = true;
    }
}

// ==================== السلة ====================
let cart = JSON.parse(localStorage.getItem('falcon_cart') || '[]');

function updateCartUI() {
    const body = document.getElementById('cartModalBody');
    const totalSpan = document.getElementById('cartModalTotal');
    const countSpan = document.getElementById('cartCount');
    
    if (!body) return;
    
    if (cart.length === 0) {
        body.innerHTML = '<div class="empty-cart">🛒 السلة فارغة</div>';
        if (totalSpan) totalSpan.innerText = '0 ج.م';
        if (countSpan) countSpan.innerText = '0';
        return;
    }
    
    let total = 0;
    body.innerHTML = cart.map((item, i) => {
        total += item.price * item.quantity;
        return `
            <div class="cart-modal-item">
                <div><strong>${item.name}</strong><br>${item.price} ج.م × ${item.quantity}</div>
                <button class="btn btn-danger btn-sm" onclick="removeFromCart(${i})">🗑️</button>
            </div>
        `;
    }).join('');
    
    if (totalSpan) totalSpan.innerText = total + ' ج.م';
    if (countSpan) countSpan.innerText = cart.reduce((s, i) => s + i.quantity, 0);
    localStorage.setItem('falcon_cart', JSON.stringify(cart));
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartUI();
    playClickSound();
}

function openCart() {
    updateCartUI();
    document.getElementById('cartModal').style.display = 'flex';
    playClickSound();
}

function closeCart() {
    document.getElementById('cartModal').style.display = 'none';
}

function addToCart(product) {
    const existing = cart.find(i => i.name === product.name);
    if (existing) {
        existing.quantity += product.quantity || 1;
    } else {
        cart.push({ ...product, quantity: product.quantity || 1 });
    }
    updateCartUI();
    showSuccessModal(`✅ تم إضافة ${product.name} إلى السلة`, 'تم الإضافة');
    playClickSound();
}

// ==================== الشات ====================
let chatRoom = null;
let chatListener = null;

function toggleChat() {
    const user = firebase.auth().currentUser;
    if (!user) {
        showErrorModal('❌ يجب تسجيل الدخول أولاً للدردشة مع خدمة العملاء', 'تسجيل الدخول مطلوب');
        return;
    }
    
    const window = document.getElementById('chatWindow');
    if (window.style.display === 'flex') {
        window.style.display = 'none';
    } else {
        window.style.display = 'flex';
        initChat();
        playClickSound();
    }
}

async function initChat() {
    const user = firebase.auth().currentUser;
    if (!user) return;
    
    chatRoom = `chat_${user.uid}`;
    
    if (chatListener) chatListener();
    chatListener = db.collection('chats').doc(chatRoom).collection('messages')
        .orderBy('timestamp', 'asc')
        .onSnapshot(snapshot => {
            const container = document.getElementById('chatMessages');
            if (!container) return;
            container.innerHTML = '';
            snapshot.forEach(doc => {
                const msg = doc.data();
                const time = msg.timestamp?.toDate().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) || 'الآن';
                const messageDiv = document.createElement('div');
                messageDiv.className = `chat-message ${msg.sender}`;
                messageDiv.innerHTML = `
                    <div class="chat-bubble">${escapeHtml(msg.text)}</div>
                    <div class="chat-time">${time}</div>
                `;
                container.appendChild(messageDiv);
                if (msg.sender === 'admin') playMessageSound();
            });
            container.scrollTop = container.scrollHeight;
        });
}

async function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    if (!text) return;
    
    const user = firebase.auth().currentUser;
    if (!user) return;
    
    if (!chatRoom) await initChat();
    
    try {
        await db.collection('chats').doc(chatRoom).collection('messages').add({
            text: text,
            sender: 'customer',
            senderName: user.displayName || user.email?.split('@')[0],
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        input.value = '';
        playTingSound();
    } catch(e) { console.error(e); }
}

function escapeHtml(text) {
    return text.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// ==================== عداد الشحنات ====================
async function initSuccessCounter() {
    const el = document.getElementById('successOrdersCount');
    if (!el || typeof db === 'undefined') return;
    try {
        const snap = await db.collection('orders').where('status', '==', 'completed').get();
        el.textContent = snap.size;
        db.collection('orders').where('status', '==', 'completed').onSnapshot(s => {
            el.textContent = s.size;
        });
    } catch(e) { el.textContent = '0'; }
}

// ==================== شريط الشحنات المباشرة ====================
function initLiveShippingBar() {
    const textEl = document.getElementById('liveShippingText');
    if (!textEl || typeof db === 'undefined') return;
    db.collection('orders').where('status', 'in', ['completed', 'confirmed']).orderBy('createdAt', 'desc').limit(5).onSnapshot(snapshot => {
        const orders = [];
        snapshot.forEach(doc => {
            const order = doc.data();
            if (order.createdAt) {
                const name = order.userEmail?.split('@')[0] || 'عميل';
                orders.push(`${name} شحن ${order.item?.name || ''}`);
            }
        });
        if (orders.length > 0) {
            let index = 0;
            textEl.innerHTML = `🦅 ${orders[0]}`;
            setInterval(() => {
                index = (index + 1) % orders.length;
                textEl.innerHTML = `🦅 ${orders[index]}`;
            }, 5000);
        } else {
            textEl.innerHTML = '🛡️ كن أول من يشحن اليوم!';
        }
    });
}

// ==================== ربط الأزرار الأساسية ====================
function bindBasicButtons() {
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const dailyReward = document.getElementById('dailyReward');
    const cartIcon = document.getElementById('cartIcon');
    const chatFloat = document.getElementById('chatFloat');
    const prayerBtn = document.getElementById('prayerBtn');
    const guaranteeBtn = document.getElementById('guaranteeBtn');
    const checkoutCartBtn = document.getElementById('checkoutCartBtn');
    
    if (loginBtn) loginBtn.onclick = () => window.location.href = 'login.html';
    if (signupBtn) signupBtn.onclick = () => window.location.href = 'signup.html';
    if (logoutBtn) logoutBtn.onclick = handleLogout;
    if (dailyReward) dailyReward.onclick = handleDailyDose;
    if (cartIcon) cartIcon.onclick = openCart;
    if (chatFloat) chatFloat.onclick = toggleChat;
    if (prayerBtn) prayerBtn.onclick = togglePrayer;
    if (guaranteeBtn) guaranteeBtn.onclick = () => showInfoModal('🛡️ نضمن لك استرداد كامل المبلغ في حال فشل الشحن.', 'ضمان Falcon');
    if (checkoutCartBtn) checkoutCartBtn.onclick = () => {
        if (cart.length === 0) {
            showErrorModal('🛒 السلة فارغة!', 'خطأ');
            return;
        }
        sessionStorage.setItem('cartOrder', JSON.stringify(cart));
        window.location.href = 'checkout.html';
        playClickSound();
    };
}

// ==================== تهيئة الصفحة ====================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 تم تحميل الصفحة - بدء التهيئة');
    
    initSlider();
    initMenu();
    initTheme();
    initSuccessCounter();
    initLiveShippingBar();
    updateCartUI();
    bindBasicButtons();
    
    console.log('✅ تم تهيئة جميع الميزات بنجاح');
});

// ==================== ربط الدوال العامة ====================
window.removeFromCart = removeFromCart;
window.closeCart = closeCart;
window.toggleChat = toggleChat;
window.sendChatMessage = sendChatMessage;
window.addToCart = addToCart;
window.handleLogout = handleLogout;
