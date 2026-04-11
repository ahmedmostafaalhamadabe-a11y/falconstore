// ========== إعدادات Firebase ==========
const firebaseConfig = {
    apiKey: "AIzaSyDCnsGh-iJfm0XIHdN5_-b5KEJQpZJSInU",
    authDomain: "falcon-store-1ab4e.firebaseapp.com",
    projectId: "falcon-store-1ab4e",
    storageBucket: "falcon-store-1ab4e.firebasestorage.app",
    messagingSenderId: "650854731670",
    appId: "1:650854731670:web:fc25b7897dd53be244d7b7",
    measurementId: "G-GMGM7LMF4E"
};

// تهيئة Firebase
firebase.initializeApp(firebaseConfig);

// خدمات Firebase
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// ========== دوال تسجيل الدخول ==========
function loginWithEmail(email, password) {
    return auth.signInWithEmailAndPassword(email, password);
}

function signUpWithEmail(email, password) {
    return auth.createUserWithEmailAndPassword(email, password);
}

function loginWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    return auth.signInWithPopup(provider);
}

function loginWithFacebook() {
    const provider = new firebase.auth.FacebookAuthProvider();
    return auth.signInWithPopup(provider);
}

function logout() {
    return auth.signOut();
}

function getCurrentUser() {
    return auth.currentUser;
}

// ========== إدارة الـ ID الثابت لكل لعبة ==========
async function saveGameID(gameName, gameId) {
    const user = auth.currentUser;
    if (!user) throw new Error("يجب تسجيل الدخول أولاً");
    
    await db.collection('users').doc(user.uid).set({
        [`gameIds.${gameName}`]: gameId
    }, { merge: true });
}

async function getGameID(gameName) {
    const user = auth.currentUser;
    if (!user) return null;
    
    const doc = await db.collection('users').doc(user.uid).get();
    if (doc.exists && doc.data().gameIds) {
        return doc.data().gameIds[gameName];
    }
    return null;
}

// ========== القائمة السوداء (لحظر IDs مخالفة) ==========
async function isGameIDBlocked(gameName, gameId) {
    const doc = await db.collection('blacklist').doc(gameName).get();
    if (doc.exists && doc.data().ids) {
        return doc.data().ids.includes(gameId);
    }
    return false;
}

async function addToBlacklist(gameName, gameId, reason) {
    const user = auth.currentUser;
    if (user.email !== 'admin@falconstore.com') {
        throw new Error("غير مصرح بهذه العملية");
    }
    
    const docRef = db.collection('blacklist').doc(gameName);
    const doc = await docRef.get();
    if (doc.exists) {
        await docRef.update({
            ids: firebase.firestore.FieldValue.arrayUnion(gameId),
            reasons: firebase.firestore.FieldValue.arrayUnion(reason)
        });
    } else {
        await docRef.set({
            ids: [gameId],
            reasons: [reason]
        });
    }
}

// ========== الطلبات ونقاط الولاء ==========
async function saveOrder(gameName, amount, price, paymentMethod, status = 'pending') {
    const user = auth.currentUser;
    if (!user) throw new Error("يجب تسجيل الدخول أولاً");
    
    const gameId = await getGameID(gameName);
    await db.collection('users').doc(user.uid).collection('orders').add({
        gameName,
        gameId,
        amount,
        price,
        paymentMethod,
        status,
        points: Math.floor(price / 10),
        date: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    await db.collection('users').doc(user.uid).update({
        loyaltyPoints: firebase.firestore.FieldValue.increment(Math.floor(price / 10))
    });
}

async function getOrders() {
    const user = auth.currentUser;
    if (!user) return [];
    
    const snapshot = await db.collection('users').doc(user.uid).collection('orders')
        .orderBy('date', 'desc')
        .get();
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function getLoyaltyPoints() {
    const user = auth.currentUser;
    if (!user) return 0;
    
    const doc = await db.collection('users').doc(user.uid).get();
    if (doc.exists && doc.data().loyaltyPoints) {
        return doc.data().loyaltyPoints;
    }
    return 0;
}

// ========== إشعارات ==========
function sendNotification(message, type = 'info') {
    let toast = document.getElementById('notificationToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'notificationToast';
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'error' ? '#f44336' : '#4CAF50'};
            color: white;
            padding: 12px 24px;
            border-radius: 50px;
            z-index: 10000;
            font-size: 0.9rem;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            transition: 0.3s;
            opacity: 0;
        `;
        document.body.appendChild(toast);
    }
    
    toast.innerText = message;
    toast.style.opacity = '1';
    setTimeout(() => {
        toast.style.opacity = '0';
    }, 3000);
}

// ========== مراقبة حالة تسجيل الدخول ==========
function onAuthStateChanged(callback) {
    auth.onAuthStateChanged(callback);
}