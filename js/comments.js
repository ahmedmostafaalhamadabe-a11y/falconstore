// ==================== نظام التعليقات والآراء مع خاصية "عرض المزيد" ====================

let currentCommentsPage = null;
let lastDoc = null;
let isLoading = false;
let hasMore = true;
let allPosts = [];

const COMMENTS_PER_PAGE = 5;

// تهيئة نظام التعليقات لصفحة معينة
function initComments(pageName) {
    currentCommentsPage = pageName;
    resetCommentsState();
    loadComments();
    setupCommentForm();
}

// إعادة تعيين الحالة
function resetCommentsState() {
    lastDoc = null;
    isLoading = false;
    hasMore = true;
    allPosts = [];
    const container = document.getElementById('commentsContainer');
    if (container) container.innerHTML = '';
}

// تحميل التعليقات من Firebase
async function loadComments() {
    const container = document.getElementById('commentsContainer');
    if (!container || !currentCommentsPage) return;
    
    if (allPosts.length === 0) {
        container.innerHTML = '<div class="comments-loading"><i class="fas fa-spinner fa-spin"></i> جاري تحميل التعليقات...</div>';
    }
    
    try {
        let query = db.collection('comments')
            .doc(currentCommentsPage)
            .collection('posts')
            .orderBy('createdAt', 'desc')
            .limit(COMMENTS_PER_PAGE);
        
        if (lastDoc) {
            query = query.startAfter(lastDoc);
        }
        
        const snapshot = await query.get();
        
        if (snapshot.empty && allPosts.length === 0) {
            container.innerHTML = '<div class="no-comments">✨ لا توجد تعليقات بعد. كن أول من يشارك رأيه!</div>';
            hasMore = false;
            return;
        }
        
        const newPosts = [];
        snapshot.forEach(doc => {
            newPosts.push({ id: doc.id, data: doc.data() });
        });
        
        allPosts = [...allPosts, ...newPosts];
        lastDoc = snapshot.docs[snapshot.docs.length - 1];
        hasMore = snapshot.docs.length === COMMENTS_PER_PAGE;
        
        renderComments();
        
    } catch (error) {
        console.error('خطأ في تحميل التعليقات:', error);
        container.innerHTML = '<div class="no-comments">💬 كن أول من يشارك رأيه!</div>';
    }
}

// عرض التعليقات مع زر "عرض المزيد"
function renderComments() {
    const container = document.getElementById('commentsContainer');
    if (!container) return;
    
    if (allPosts.length === 0) {
        container.innerHTML = '<div class="no-comments">✨ لا توجد تعليقات بعد. كن أول من يشارك رأيه!</div>';
        return;
    }
    
    let html = '';
    allPosts.forEach(post => {
        html += createCommentElementHTML(post.id, post.data);
    });
    
    if (hasMore) {
        html += `
            <div class="load-more-container" style="text-align: center; margin-top: 1.5rem;">
                <button class="btn btn-outline load-more-btn" onclick="loadMoreComments()">
                    <i class="fas fa-arrow-down"></i> عرض المزيد من التعليقات
                </button>
            </div>
        `;
    }
    
    container.innerHTML = html;
    
    allPosts.forEach(post => {
        loadRepliesIntoElement(post.id);
    });
}

// إنشاء HTML للتعليق
function createCommentElementHTML(postId, post) {
    const date = post.createdAt?.toDate().toLocaleString('ar-EG') || 'الآن';
    const isAdmin = post.userEmail === 'falconstoresupport@gmail.com';
    
    return `
        <div class="comment-card" id="comment-${postId}">
            <div class="comment-header">
                <div class="comment-user">
                    <i class="fas ${isAdmin ? 'fa-crown' : 'fa-user-circle'} comment-avatar" style="color:${isAdmin ? '#FFD700' : 'var(--primary)'}"></i>
                    <div>
                        <span class="comment-name">${escapeHtml(post.userName)}</span>
                        ${isAdmin ? '<span class="admin-badge-comment"><i class="fas fa-star"></i> صاحب المتجر</span>' : ''}
                        <span class="comment-date">${date}</span>
                    </div>
                </div>
                ${post.isResolved ? '<span class="resolved-badge"><i class="fas fa-check-circle"></i> تم الحل</span>' : ''}
            </div>
            <div class="comment-text">${escapeHtml(post.text)}</div>
            <div class="comment-actions">
                <button class="comment-reply-btn" onclick="toggleReplyForm('${postId}')"><i class="fas fa-reply"></i> رد</button>
                ${!isAdmin && !post.isResolved ? `<button class="comment-resolve-btn" onclick="markAsResolved('${postId}')"><i class="fas fa-check"></i> تم الحل</button>` : ''}
            </div>
            <div id="reply-form-${postId}" class="reply-form" style="display:none;">
                <textarea id="reply-text-${postId}" rows="2" placeholder="اكتب ردك هنا..."></textarea>
                <button class="btn btn-primary btn-sm" onclick="submitReply('${postId}')">إرسال الرد</button>
            </div>
            <div id="replies-${postId}" class="replies-container"></div>
        </div>
    `;
}

// تحميل الردود
async function loadRepliesIntoElement(postId) {
    const container = document.getElementById(`replies-${postId}`);
    if (!container) return;
    
    try {
        const snapshot = await db.collection('comments')
            .doc(currentCommentsPage)
            .collection('posts')
            .doc(postId)
            .collection('replies')
            .orderBy('createdAt', 'asc')
            .get();
        
        if (snapshot.empty) {
            container.innerHTML = '';
            return;
        }
        
        let repliesHtml = '<div class="replies-title"><i class="fas fa-comments"></i> الردود</div>';
        snapshot.forEach(doc => {
            const reply = doc.data();
            const replyDate = reply.createdAt?.toDate().toLocaleString('ar-EG') || 'الآن';
            const isAdminReply = reply.adminName === 'أحمد صاحب متجر Falcon Store';
            
            repliesHtml += `
                <div class="reply-card">
                    <div class="reply-header">
                        <i class="fas ${isAdminReply ? 'fa-crown' : 'fa-user'}"></i>
                        <span class="reply-name">${escapeHtml(reply.adminName || reply.userName || 'عميل')}</span>
                        <span class="reply-date">${replyDate}</span>
                    </div>
                    <div class="reply-text">${escapeHtml(reply.text)}</div>
                </div>
            `;
        });
        container.innerHTML = repliesHtml;
    } catch (error) {
        console.error('خطأ في تحميل الردود:', error);
        container.innerHTML = '';
    }
}

// تحميل المزيد من التعليقات
async function loadMoreComments() {
    if (isLoading || !hasMore) return;
    isLoading = true;
    
    const loadMoreBtn = document.querySelector('.load-more-btn');
    if (loadMoreBtn) {
        loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التحميل...';
        loadMoreBtn.disabled = true;
    }
    
    await loadComments();
    isLoading = false;
}

// إرسال رد
async function submitReply(postId) {
    const user = getCurrentUser();
    const textarea = document.getElementById(`reply-text-${postId}`);
    const text = textarea.value.trim();
    
    if (!text) {
        if (typeof showErrorModal === 'function') showErrorModal('❌ اكتب ردك أولاً');
        else alert('❌ اكتب ردك أولاً');
        return;
    }
    
    if (!user) {
        if (typeof showErrorModal === 'function') showErrorModal('❌ يرجى تسجيل الدخول للرد على التعليقات');
        else alert('❌ يرجى تسجيل الدخول للرد على التعليقات');
        return;
    }
    
    try {
        const replyData = {
            text: text,
            userId: user.uid,
            userName: user.displayName || user.email?.split('@')[0] || 'مستخدم',
            userEmail: user.email,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        if (user.uid === 'tvipwJt6kIYwTNGenxKrLhBKmRh2' || user.email === 'falconstoresupport@gmail.com') {
            replyData.adminName = 'أحمد صاحب متجر Falcon Store';
        }
        
        await db.collection('comments')
            .doc(currentCommentsPage)
            .collection('posts')
            .doc(postId)
            .collection('replies')
            .add(replyData);
        
        textarea.value = '';
        toggleReplyForm(postId);
        loadRepliesIntoElement(postId);
        
        if (typeof playTingSound === 'function') playTingSound();
        else new Audio('sounds/ting.mp3').play().catch(()=>{});
        
    } catch (error) {
        console.error('خطأ في إرسال الرد:', error);
        if (typeof showErrorModal === 'function') showErrorModal('❌ حدث خطأ في إرسال الرد');
        else alert('❌ حدث خطأ في إرسال الرد');
    }
}

// إرسال تعليق جديد
async function submitComment() {
    const user = getCurrentUser();
    const textarea = document.getElementById('commentInput');
    const text = textarea.value.trim();
    
    if (!text) {
        if (typeof showErrorModal === 'function') showErrorModal('❌ اكتب تعليقك أولاً');
        else alert('❌ اكتب تعليقك أولاً');
        return;
    }
    
    let userName = 'زائر';
    let userEmail = 'guest@unknown.com';
    let userId = null;
    
    if (user) {
        userName = user.displayName || user.email?.split('@')[0] || 'مستخدم';
        userEmail = user.email;
        userId = user.uid;
    } else {
        const guestName = prompt('أدخل اسمك (سيظهر مع تعليقك):', 'زائر');
        if (guestName && guestName.trim()) userName = guestName.trim().substring(0, 30);
    }
    
    try {
        await db.collection('comments')
            .doc(currentCommentsPage)
            .collection('posts')
            .add({
                text: text,
                userName: userName,
                userEmail: userEmail,
                userId: userId,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                isResolved: false
            });
        
        textarea.value = '';
        resetCommentsState();
        loadComments();
        
        if (typeof playTingSound === 'function') playTingSound();
        else new Audio('sounds/ting.mp3').play().catch(()=>{});
        
        if (typeof showSuccessModal === 'function') {
            showSuccessModal('✅ تم نشر تعليقك بنجاح!');
        } else {
            const toast = document.createElement('div');
            toast.style.cssText = `position:fixed;bottom:120px;left:50%;transform:translateX(-50%);background:var(--success);color:white;padding:12px 24px;border-radius:60px;z-index:10000;`;
            toast.textContent = '✅ تم نشر تعليقك بنجاح!';
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
        }
        
    } catch (error) {
        console.error('خطأ في إرسال التعليق:', error);
        if (typeof showErrorModal === 'function') {
            showErrorModal('❌ حدث خطأ في إرسال التعليق: ' + error.message);
        } else {
            alert('❌ حدث خطأ في إرسال التعليق: ' + error.message);
        }
    }
}

// وضع علامة "تم الحل"
async function markAsResolved(postId) {
    const user = getCurrentUser();
    if (!user) {
        if (typeof showErrorModal === 'function') showErrorModal('❌ يرجى تسجيل الدخول');
        return;
    }
    
    try {
        await db.collection('comments')
            .doc(currentCommentsPage)
            .collection('posts')
            .doc(postId)
            .update({
                isResolved: true,
                resolvedAt: firebase.firestore.FieldValue.serverTimestamp(),
                resolvedBy: user.uid
            });
        
        const commentCard = document.getElementById(`comment-${postId}`);
        if (commentCard) {
            const resolvedBadge = document.createElement('span');
            resolvedBadge.className = 'resolved-badge';
            resolvedBadge.innerHTML = '<i class="fas fa-check-circle"></i> تم الحل';
            commentCard.querySelector('.comment-header').appendChild(resolvedBadge);
            
            const resolveBtn = commentCard.querySelector('.comment-resolve-btn');
            if (resolveBtn) resolveBtn.remove();
        }
        
        if (typeof playTingSound === 'function') playTingSound();
        else new Audio('sounds/ting.mp3').play().catch(()=>{});
        
    } catch (error) {
        console.error('خطأ:', error);
    }
}

function toggleReplyForm(postId) {
    const form = document.getElementById(`reply-form-${postId}`);
    if (form) {
        form.style.display = form.style.display === 'none' ? 'block' : 'none';
    }
}

function setupCommentForm() {
    const container = document.getElementById('commentsSection');
    if (!container) return;
    
    if (container.querySelector('.comment-form')) return;
    
    const formHtml = `
        <div class="comment-form">
            <h4><i class="fas fa-pen"></i> شارك رأيك أو مشكلتك</h4>
            <textarea id="commentInput" rows="3" placeholder="اكتب تعليقك أو مشكلتك هنا... سيقوم فريق الدعم بالرد عليك خلال 24 ساعة"></textarea>
            <button class="btn btn-primary" onclick="submitComment()"><i class="fas fa-paper-plane"></i> إرسال</button>
        </div>
        <div class="comments-list" id="commentsContainer"></div>
    `;
    
    container.innerHTML = formHtml;
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ربط الدوال بالنطاق العام
window.initComments = initComments;
window.submitComment = submitComment;
window.submitReply = submitReply;
window.toggleReplyForm = toggleReplyForm;
window.markAsResolved = markAsResolved;
window.loadMoreComments = loadMoreComments;

console.log('✅ Comments.js loaded successfully');
