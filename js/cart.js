// ==================== نظام السلة ====================
let cart = JSON.parse(localStorage.getItem('falcon_cart')) || [];

// ==================== تحديث نافذة السلة ====================
function updateCartModal() {
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
                <div>
                    <strong>${escapeHtml(item.name)}</strong><br>
                    <span style="font-size: 0.8rem; color: var(--text-muted);">${item.game || ''}</span><br>
                    ${item.price} ج.م × ${item.quantity}
                </div>
                <div class="cart-item-actions">
                    <button class="cart-qty-btn" onclick="updateQty(${i}, ${item.quantity - 1})">-</button>
                    <span>${item.quantity}</span>
                    <button class="cart-qty-btn" onclick="updateQty(${i}, ${item.quantity + 1})">+</button>
                    <button class="cart-remove-btn" onclick="removeItem(${i})">🗑️</button>
                </div>
            </div>
        `;
    }).join('');
    
    if (totalSpan) totalSpan.innerText = total + ' ج.م';
    if (countSpan) countSpan.innerText = cart.reduce((s, i) => s + i.quantity, 0);
    
    localStorage.setItem('falcon_cart', JSON.stringify(cart));
}

// ==================== تحديث الكمية ====================
function updateQty(index, newQty) {
    if (newQty <= 0) {
        cart.splice(index, 1);
    } else {
        cart[index].quantity = newQty;
    }
    updateCartModal();
    if (typeof playClickSound === 'function') playClickSound(); else new Audio('sounds/click.mp3').play().catch(()=>{});
    if (typeof triggerHapticFeedback === 'function') triggerHapticFeedback('light');
}

// ==================== حذف منتج ====================
function removeItem(index) {
    cart.splice(index, 1);
    updateCartModal();
    if (typeof playClickSound === 'function') playClickSound(); else new Audio('sounds/click.mp3').play().catch(()=>{});
    if (typeof triggerHapticFeedback === 'function') triggerHapticFeedback('light');
}

// ==================== إضافة منتج للسلة ====================
function addToCart(product) {
    const existing = cart.find(i => i.name === product.name && i.game === product.game && i.playerId === product.playerId);
    
    if (existing) {
        existing.quantity += product.quantity || 1;
    } else {
        cart.push({
            ...product,
            quantity: product.quantity || 1
        });
    }
    
    updateCartModal();
    showAddToCartToast(product.name);
    
    // تأثير الفقاعة (Bubble Pop)
    if (typeof createBubbleEffect === 'function') {
        const x = window.innerWidth / 2;
        const y = window.innerHeight / 2;
        createBubbleEffect(x, y);
    }
    
    if (typeof playClick2Sound === 'function') playClick2Sound(); else new Audio('sounds/click2.mp3').play().catch(()=>{});
    if (typeof triggerHapticFeedback === 'function') triggerHapticFeedback('success');
}

// ==================== إشعار الإضافة ====================
function showAddToCartToast(productName) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        bottom: 120px;
        left: 50%;
        transform: translateX(-50%);
        background: #4CAF50;
        color: white;
        padding: 12px 24px;
        border-radius: 9999px;
        z-index: 10000;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: slideUp 0.3s ease;
    `;
    toast.innerHTML = `✅ تم إضافة ${productName} إلى السلة`;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideDown 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

// ==================== فتح السلة ====================
function openCart() {
    const modal = document.getElementById('cartModal');
    if (modal) {
        updateCartModal();
        modal.style.display = 'flex';
    }
    if (typeof playClickSound === 'function') playClickSound(); else new Audio('sounds/click.mp3').play().catch(()=>{});
}

// ==================== إغلاق السلة ====================
function closeCart() {
    const modal = document.getElementById('cartModal');
    if (modal) modal.style.display = 'none';
}

// ==================== مسح السلة ====================
function clearCart() {
    if (typeof showConfirmModal === 'function') {
        showConfirmModal('هل أنت متأكد من مسح السلة؟', 
            () => {
                cart = [];
                updateCartModal();
                localStorage.removeItem('falcon_cart');
                if (typeof showSuccessModal === 'function') showSuccessModal('✅ تم مسح السلة');
                else alert('✅ تم مسح السلة');
            },
            () => {}
        );
    } else {
        if (confirm('هل أنت متأكد من مسح السلة؟')) {
            cart = [];
            updateCartModal();
            localStorage.removeItem('falcon_cart');
            alert('✅ تم مسح السلة');
        }
    }
}

// ==================== مسح السلة عند تسجيل الخروج ====================
function clearCartOnLogout() {
    cart = [];
    localStorage.removeItem('falcon_cart');
    updateCartModal();
}

// ==================== إضافة أنماط السلة ====================
function addCartStyles() {
    if (document.getElementById('cart-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'cart-styles';
    style.textContent = `
        .cart-modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            z-index: 1000;
            justify-content: center;
            align-items: center;
        }
        .cart-modal-content {
            background: var(--bg-surface);
            max-width: 500px;
            width: 90%;
            border-radius: var(--radius-xl);
            overflow: hidden;
            box-shadow: var(--shadow-lg);
        }
        .cart-modal-header {
            background: var(--primary);
            color: white;
            padding: 1rem 1.5rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .cart-modal-header h3 {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        .close-modal {
            background: none;
            border: none;
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
        }
        .cart-modal-body {
            padding: 1rem;
            max-height: 400px;
            overflow-y: auto;
        }
        .cart-modal-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.8rem;
            border-bottom: 1px solid var(--border-light);
        }
        .cart-item-actions {
            display: flex;
            gap: 0.5rem;
            align-items: center;
        }
        .cart-qty-btn {
            background: var(--primary);
            color: white;
            border: none;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            cursor: pointer;
            font-weight: bold;
        }
        .cart-remove-btn {
            background: none;
            border: none;
            font-size: 1.2rem;
            cursor: pointer;
            color: var(--danger);
        }
        .cart-modal-footer {
            padding: 1rem 1.5rem;
            border-top: 1px solid var(--border-light);
            text-align: center;
        }
        .cart-total {
            font-size: 1.2rem;
            font-weight: bold;
            color: var(--primary);
            margin-bottom: 1rem;
        }
        .checkout-cart-btn {
            background: var(--primary);
            color: white;
            border: none;
            padding: 12px;
            width: 100%;
            border-radius: var(--radius-full);
            cursor: pointer;
            font-weight: bold;
            font-family: 'Cairo', sans-serif;
        }
        .clear-cart-btn {
            background: transparent;
            color: var(--text-muted);
            border: 1px solid var(--border-light);
            padding: 8px 16px;
            border-radius: var(--radius-full);
            cursor: pointer;
            margin-top: 0.5rem;
            font-size: 0.8rem;
        }
        .empty-cart {
            text-align: center;
            padding: 2rem;
            color: var(--text-muted);
        }
        @keyframes slideUp {
            from { opacity: 0; transform: translateX(-50%) translateY(20px); }
            to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes slideDown {
            from { opacity: 1; transform: translateX(-50%) translateY(0); }
            to { opacity: 0; transform: translateX(-50%) translateY(20px); }
        }
    `;
    document.head.appendChild(style);
}

// ==================== إنشاء نافذة السلة ====================
function createCartModal() {
    if (document.getElementById('cartModal')) return;
    
    const modal = document.createElement('div');
    modal.className = 'cart-modal';
    modal.id = 'cartModal';
    modal.innerHTML = `
        <div class="cart-modal-content">
            <div class="cart-modal-header">
                <h3><i class="fas fa-shopping-cart"></i> سلة المشتريات</h3>
                <button class="close-modal" onclick="closeCart()">&times;</button>
            </div>
            <div class="cart-modal-body" id="cartModalBody"></div>
            <div class="cart-modal-footer">
                <div class="cart-total" id="cartModalTotal">0 ج.م</div>
                <button class="checkout-cart-btn" onclick="proceedToCheckoutFromCart()">💳 متابعة الدفع</button>
                <button class="clear-cart-btn" onclick="clearCart()">🗑️ مسح السلة</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeCart();
    });
}

// ==================== متابعة الدفع من السلة ====================
function proceedToCheckoutFromCart() {
    if (cart.length === 0) {
        if (typeof showErrorModal === 'function') showErrorModal('🛒 السلة فارغة!');
        else alert('🛒 السلة فارغة!');
        return;
    }
    
    sessionStorage.setItem('cartOrder', JSON.stringify(cart));
    window.location.href = 'checkout.html';
    if (typeof playClick2Sound === 'function') playClick2Sound(); else new Audio('sounds/click2.mp3').play().catch(()=>{});
}

// ==================== إضافة منتج إلى السلة من أي مكان ====================
function addToCartFromProduct(game, itemName, price, quantity = 1) {
    const product = {
        name: itemName,
        game: game,
        price: price,
        quantity: quantity,
        gameKey: game.toLowerCase().replace(/ /g, '')
    };
    addToCart(product);
}

// ==================== تهيئة السلة ====================
function initCart() {
    addCartStyles();
    createCartModal();
    
    const cartIcon = document.getElementById('cartIcon');
    if (cartIcon) {
        cartIcon.addEventListener('click', openCart);
        cartIcon.style.display = 'flex';
    }
    
    updateCartModal();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// تصدير الدوال للنطاق العام
window.clearCartOnLogout = clearCartOnLogout;
window.addToCart = addToCart;
window.addToCartFromProduct = addToCartFromProduct;
window.openCart = openCart;
window.closeCart = closeCart;
window.clearCart = clearCart;
window.updateQty = updateQty;
window.removeItem = removeItem;
window.proceedToCheckoutFromCart = proceedToCheckoutFromCart;
window.initCart = initCart;

// ==================== تهيئة عند تحميل الصفحة ====================
document.addEventListener('DOMContentLoaded', initCart);

console.log('✅ Cart.js loaded successfully');
