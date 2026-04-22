// ========== إعدادات Firebase ==========
const firebaseConfig = {
    apiKey: "AIzaSyDCnsGh-iJfmOXIHdN5_-b5KEJQPZJSInU",
    authDomain: "falcon-store-1ab4e.firebaseapp.com",
    projectId: "falcon-store-1ab4e",
    storageBucket: "falcon-store-1ab4e.firebasestorage.app",
    messagingSenderId: "650854731670",
    appId: "1:650854731670:web:fc25b7897dd530e244d7b7"
};

// تهيئة Firebase
firebase.initializeApp(firebaseConfig);

// خدمات Firebase
const auth = firebase.auth();
const db = firebase.firestore();

// ==================== نظام الأصوات ====================
function playClickSound() {
    try {
        const audio = new Audio('sounds/click.mp3');
        audio.volume = 0.4;
        audio.play().catch(() => {});
    } catch(e) {}
}

function playClick2Sound() {
    try {
        const audio = new Audio('sounds/click2.mp3');
        audio.volume = 0.4;
        audio.play().catch(() => {});
    } catch(e) {}
}

function playTingSound() {
    try {
        const audio = new Audio('sounds/ting.mp3');
        audio.volume = 0.4;
        audio.play().catch(() => {});
    } catch(e) {}
}

function playErrorSound() {
    try {
        const audio = new Audio('sounds/error.mp3');
        audio.volume = 0.4;
        audio.play().catch(() => {});
    } catch(e) {}
}

function playWelcomeSound() {
    try {
        const audio = new Audio('sounds/Welcome.mp3');
        audio.volume = 0.5;
        audio.play().catch(() => {});
    } catch(e) {}
}

function playRegistrationSound() {
    try {
        const audio = new Audio('sounds/Registration.mp3');
        audio.volume = 0.5;
        audio.play().catch(() => {});
    } catch(e) {}
}

function playLoggedOutSound() {
    try {
        const audio = new Audio('sounds/Logged_out.mp3');
        audio.volume = 0.5;
        audio.play().catch(() => {});
    } catch(e) {}
}

function playAccountCreatedSound() {
    try {
        const audio = new Audio('sounds/Account_created_successfully.mp3');
        audio.volume = 0.5;
        audio.play().catch(() => {});
    } catch(e) {}
}

function playRewardSound() {
    try {
        const audio = new Audio('sounds/reward.mp3');
        audio.volume = 0.5;
        audio.play().catch(() => {});
    } catch(e) {}
}

function playAchievementSound() {
    try {
        const audio = new Audio('sounds/achievement.mp3');
        audio.volume = 0.5;
        audio.play().catch(() => {});
    } catch(e) {}
}

function playMessageSound() {
    try {
        const audio = new Audio('sounds/message.mp3');
        audio.volume = 0.5;
        audio.play().catch(() => {});
    } catch(e) {}
}

function playNewOrderSound() {
    try {
        const audio = new Audio('sounds/new_order.mp3');
        audio.volume = 0.7;
        audio.play().catch(() => {});
    } catch(e) {}
}

function playFalconScreechSound() {
    try {
        const audio = new Audio('sounds/falcon-screech.mp3');
        audio.volume = 0.6;
        audio.play().catch(() => {});
    } catch(e) {}
}

// ==================== النوافذ المنبثقة الاحترافية ====================

window.showSuccessModal = function(message, title = 'نجاح') {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);backdrop-filter:blur(5px);z-index:100000;display:flex;align-items:center;justify-content:center;';
    overlay.innerHTML = `
        <div style="background:var(--bg-surface);max-width:400px;width:90%;border-radius:28px;padding:2rem;text-align:center;border:1px solid var(--border-light);">
            <div style="font-size:3.5rem;margin-bottom:1rem;">✅</div>
            <h3 style="color:var(--text-primary);margin-bottom:0.75rem;">${title}</h3>
            <p style="color:var(--text-secondary);margin-bottom:1.5rem;line-height:1.6;">${message}</p>
            <button class="btn btn-primary" style="padding:0.6rem 1.2rem;border-radius:60px;border:none;font-weight:600;cursor:pointer;background:var(--primary);color:white;" onclick="this.closest('.modal-overlay').remove()">حسناً</button>
        </div>
    `;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
    playTingSound();
};

window.showErrorModal = function(message, title = 'خطأ') {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);backdrop-filter:blur(5px);z-index:100000;display:flex;align-items:center;justify-content:center;';
    overlay.innerHTML = `
        <div style="background:var(--bg-surface);max-width:400px;width:90%;border-radius:28px;padding:2rem;text-align:center;border:1px solid var(--border-light);">
            <div style="font-size:3.5rem;margin-bottom:1rem;">❌</div>
            <h3 style="color:var(--text-primary);margin-bottom:0.75rem;">${title}</h3>
            <p style="color:var(--text-secondary);margin-bottom:1.5rem;line-height:1.6;">${message}</p>
            <button class="btn btn-primary" style="padding:0.6rem 1.2rem;border-radius:60px;border:none;font-weight:600;cursor:pointer;background:var(--primary);color:white;" onclick="this.closest('.modal-overlay').remove()">حسناً</button>
        </div>
    `;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
    playErrorSound();
};

window.showInfoModal = function(message, title = 'معلومة') {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);backdrop-filter:blur(5px);z-index:100000;display:flex;align-items:center;justify-content:center;';
    overlay.innerHTML = `
        <div style="background:var(--bg-surface);max-width:400px;width:90%;border-radius:28px;padding:2rem;text-align:center;border:1px solid var(--border-light);">
            <div style="font-size:3.5rem;margin-bottom:1rem;">ℹ️</div>
            <h3 style="color:var(--text-primary);margin-bottom:0.75rem;">${title}</h3>
            <p style="color:var(--text-secondary);margin-bottom:1.5rem;line-height:1.6;">${message}</p>
            <button class="btn btn-primary" style="padding:0.6rem 1.2rem;border-radius:60px;border:none;font-weight:600;cursor:pointer;background:var(--primary);color:white;" onclick="this.closest('.modal-overlay').remove()">حسناً</button>
        </div>
    `;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
    playTingSound();
};

window.showWarningModal = function(message, title = 'تنبيه') {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);backdrop-filter:blur(5px);z-index:100000;display:flex;align-items:center;justify-content:center;';
    overlay.innerHTML = `
        <div style="background:var(--bg-surface);max-width:400px;width:90%;border-radius:28px;padding:2rem;text-align:center;border:1px solid var(--border-light);">
            <div style="font-size:3.5rem;margin-bottom:1rem;">⚠️</div>
            <h3 style="color:var(--text-primary);margin-bottom:0.75rem;">${title}</h3>
            <p style="color:var(--text-secondary);margin-bottom:1.5rem;line-height:1.6;">${message}</p>
            <button class="btn btn-primary" style="padding:0.6rem 1.2rem;border-radius:60px;border:none;font-weight:600;cursor:pointer;background:var(--primary);color:white;" onclick="this.closest('.modal-overlay').remove()">حسناً</button>
        </div>
    `;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
    playErrorSound();
};

window.showConfirmModal = function(message, onConfirm, onCancel, title = 'تأكيد') {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);backdrop-filter:blur(5px);z-index:100000;display:flex;align-items:center;justify-content:center;';
    overlay.innerHTML = `
        <div style="background:var(--bg-surface);max-width:400px;width:90%;border-radius:28px;padding:2rem;text-align:center;border:1px solid var(--border-light);">
            <div style="font-size:3.5rem;margin-bottom:1rem;">❓</div>
            <h3 style="color:var(--text-primary);margin-bottom:0.75rem;">${title}</h3>
            <p style="color:var(--text-secondary);margin-bottom:1.5rem;line-height:1.6;">${message}</p>
            <div style="display:flex;gap:0.75rem;margin-top:1rem;justify-content:center;">
                <button class="btn btn-primary" id="confirmYes" style="padding:0.6rem 1.2rem;border-radius:60px;border:none;font-weight:600;cursor:pointer;background:var(--primary);color:white;">نعم</button>
                <button class="btn btn-outline" id="confirmNo" style="padding:0.6rem 1.2rem;border-radius:60px;border:none;font-weight:600;cursor:pointer;background:transparent;color:var(--text-primary);border:1.5px solid var(--border-light);">إلغاء</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
    
    document.getElementById('confirmYes').onclick = () => {
        overlay.remove();
        if (onConfirm) onConfirm();
        playTingSound();
    };
    document.getElementById('confirmNo').onclick = () => {
        overlay.remove();
        if (onCancel) onCancel();
        playClickSound();
    };
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); if (onCancel) onCancel(); });
};

// ==================== إرسال OTP عبر البريد الإلكتروني ====================
async function sendEmailOTP(email, otp) {
    console.log('📧 محاولة إرسال إيميل إلى:', email, 'رمز:', otp);
    
    if (typeof emailjs === 'undefined') {
        await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    emailjs.init({ publicKey: 'fmTMEOE7EIH7Y37zY' });
    
    const templateParams = { 
        to_email: email, 
        otp: otp,
        subject: 'رمز التحقق - Falcon Store',
        message: `مرحباً،\n\nرمز التحقق الخاص بك هو: ${otp}\n\nهذا الرمز صالح لمدة 5 دقائق.\n\nشكراً لاستخدامك Falcon Store 🦅`
    };

    try {
        const response = await emailjs.send('service_vr3dktx', 'template_04j7q08', templateParams);
        console.log('✅ Email sent successfully!', response.status);
        if (typeof showSuccessModal === 'function') {
            showSuccessModal('✅ تم إرسال رمز التحقق إلى بريدك الإلكتروني', 'تم الإرسال');
        }
        return true;
    } catch (error) {
        console.error('❌ Failed to send email:', error);
        let errorMessage = 'فشل إرسال الرمز';
        if (error.text) errorMessage += ': ' + error.text;
        else if (error.message) errorMessage += ': ' + error.message;
        
        if (typeof showErrorModal === 'function') {
            showErrorModal('❌ ' + errorMessage);
        } else {
            alert('❌ ' + errorMessage);
        }
        return false;
    }
}

// ==================== دوال المصادقة ====================

async function loginWithEmail(email, password) {
    try {
        const result = await auth.signInWithEmailAndPassword(email, password);
        const user = result.user;
        
        if (!user.emailVerified) {
            await auth.signOut();
            throw new Error('email-not-verified');
        }
        
        const hour = new Date().getHours();
        const greeting = hour < 12 ? 'صباح الخير' : (hour < 18 ? 'مساء الخير' : 'مساء الخير');
        
        setTimeout(() => {
            showSuccessModal(`${greeting} ${user.displayName || user.email?.split('@')[0]}! أهلاً بك في Falcon Store 🦅`, 'تم تسجيل الدخول');
        }, 500);
        
        playWelcomeSound();
        return result;
    } catch(error) {
        let errorMessage = 'حدث خطأ في تسجيل الدخول';
        if (error.code === 'auth/wrong-password') errorMessage = '❌ كلمة السر غير صحيحة';
        else if (error.code === 'auth/user-not-found') errorMessage = '❌ لا يوجد حساب بهذا البريد';
        else if (error.code === 'auth/too-many-requests') errorMessage = '❌ طلبات كثيرة. حاول لاحقاً';
        else if (error.code === 'auth/invalid-email') errorMessage = '❌ البريد الإلكتروني غير صالح';
        else if (error.message === 'email-not-verified') errorMessage = '❌ يرجى تأكيد بريدك الإلكتروني أولاً. تم إرسال رابط التأكيد إلى بريدك.';
        else errorMessage = '❌ ' + error.message;
        
        showErrorModal(errorMessage, 'فشل تسجيل الدخول');
        playErrorSound();
        throw error;
    }
}

async function loginWithGoogle() {
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        const result = await auth.signInWithPopup(provider);
        const user = result.user;
        
        setTimeout(() => {
            showSuccessModal(`مرحباً ${user.displayName || user.email?.split('@')[0]}! أهلاً بك في Falcon Store 🦅`, 'تم تسجيل الدخول بـ Google');
        }, 500);
        
        playWelcomeSound();
        return result;
    } catch(error) {
        let errorMessage = 'فشل تسجيل الدخول بـ Google';
        if (error.code === 'auth/popup-closed-by-user') errorMessage = '❌ تم إغلاق النافذة المنبثقة';
        else errorMessage = '❌ ' + error.message;
        
        showErrorModal(errorMessage, 'فشل تسجيل الدخول');
        playErrorSound();
        throw error;
    }
}

async function loginWithFacebook() {
    try {
        const provider = new firebase.auth.FacebookAuthProvider();
        const result = await auth.signInWithPopup(provider);
        const user = result.user;
        
        setTimeout(() => {
            showSuccessModal(`مرحباً ${user.displayName || user.email?.split('@')[0]}! أهلاً بك في Falcon Store 🦅`, 'تم تسجيل الدخول بـ Facebook');
        }, 500);
        
        playWelcomeSound();
        return result;
    } catch(error) {
        let errorMessage = 'فشل تسجيل الدخول بـ Facebook';
        if (error.code === 'auth/popup-closed-by-user') errorMessage = '❌ تم إغلاق النافذة المنبثقة';
        else if (error.code === 'auth/account-exists-with-different-credential') errorMessage = '❌ يوجد حساب بنفس البريد بطريقة مختلفة';
        else errorMessage = '❌ ' + error.message;
        
        showErrorModal(errorMessage, 'فشل تسجيل الدخول');
        playErrorSound();
        throw error;
    }
}

async function signUpWithEmail(email, password) {
    try {
        const result = await auth.createUserWithEmailAndPassword(email, password);
        const user = result.user;
        
        await user.sendEmailVerification();
        
        showSuccessModal(`✅ تم إنشاء حسابك بنجاح! تم إرسال رابط التحقق إلى بريدك الإلكتروني. يرجى تأكيد بريدك قبل تسجيل الدخول.`, 'تهانينا!');
        playRegistrationSound();
        return result;
    } catch(error) {
        let errorMessage = 'حدث خطأ في إنشاء الحساب';
        if (error.code === 'auth/email-already-in-use') errorMessage = '❌ هذا البريد الإلكتروني مسجل مسبقاً';
        else if (error.code === 'auth/weak-password') errorMessage = '❌ كلمة السر ضعيفة (6 أحرف على الأقل)';
        else if (error.code === 'auth/invalid-email') errorMessage = '❌ البريد الإلكتروني غير صالح';
        else errorMessage = '❌ ' + error.message;
        
        showErrorModal(errorMessage, 'فشل إنشاء الحساب');
        playErrorSound();
        throw error;
    }
}

async function logout() {
    try {
        const user = auth.currentUser;
        const userName = user?.displayName || user?.email?.split('@')[0] || 'المستخدم';
        await auth.signOut();
        
        setTimeout(() => {
            showSuccessModal(`تم تسجيل خروجك بنجاح ${userName}، نراك قريباً 👋`, 'تم تسجيل الخروج');
        }, 300);
        
        playLoggedOutSound();
        return true;
    } catch(error) {
        showErrorModal('حدث خطأ أثناء تسجيل الخروج', 'خطأ');
        playErrorSound();
        throw error;
    }
}

function getCurrentUser() {
    return auth.currentUser;
}

function onAuthStateChanged(callback) {
    return auth.onAuthStateChanged(callback);
}

async function sendPasswordResetEmail(email) {
    try {
        await auth.sendPasswordResetEmail(email);
        showSuccessModal(`✅ تم إرسال رابط إعادة تعيين كلمة السر إلى ${email}. تحقق من بريدك الإلكتروني.`, 'تم الإرسال');
        playTingSound();
        return true;
    } catch(error) {
        let errorMessage = 'حدث خطأ';
        if (error.code === 'auth/user-not-found') errorMessage = '❌ لا يوجد حساب بهذا البريد';
        else errorMessage = '❌ ' + error.message;
        
        showErrorModal(errorMessage, 'فشل الإرسال');
        playErrorSound();
        throw error;
    }
}

// ==================== دوال مساعدة ====================

async function generateAccountNumber() {
    const usersSnapshot = await db.collection('users').get();
    const count = usersSnapshot.size;
    return (count + 1).toString().padStart(5, '0');
}

async function logActivity(message, icon = '🟢', city = '') {
    try {
        await db.collection('activity_log').add({
            message, icon, city,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch(e) { console.error(e); }
}

// ==================== ربط الدوال العامة ====================
window.playClickSound = playClickSound;
window.playClick2Sound = playClick2Sound;
window.playTingSound = playTingSound;
window.playErrorSound = playErrorSound;
window.playWelcomeSound = playWelcomeSound;
window.playRegistrationSound = playRegistrationSound;
window.playLoggedOutSound = playLoggedOutSound;
window.playAccountCreatedSound = playAccountCreatedSound;
window.playRewardSound = playRewardSound;
window.playAchievementSound = playAchievementSound;
window.playMessageSound = playMessageSound;
window.playNewOrderSound = playNewOrderSound;
window.playFalconScreechSound = playFalconScreechSound;

window.showSuccessModal = showSuccessModal;
window.showErrorModal = showErrorModal;
window.showInfoModal = showInfoModal;
window.showWarningModal = showWarningModal;
window.showConfirmModal = showConfirmModal;

window.sendEmailOTP = sendEmailOTP;
window.loginWithEmail = loginWithEmail;
window.loginWithGoogle = loginWithGoogle;
window.loginWithFacebook = loginWithFacebook;
window.signUpWithEmail = signUpWithEmail;
window.logout = logout;
window.getCurrentUser = getCurrentUser;
window.onAuthStateChanged = onAuthStateChanged;
window.sendPasswordResetEmail = sendPasswordResetEmail;
window.generateAccountNumber = generateAccountNumber;
window.logActivity = logActivity;

console.log('✅ Firebase Config loaded - Falcon Store (نسخة نهائية مع sendEmailOTP)');
