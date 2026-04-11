// ========== نظام السلة المتكامل (يدعم منتجات من صفحات مختلفة) ==========

// سلة المشتريات (مصفوفة)
let cart = JSON.parse(localStorage.getItem('falcon_cart')) || [];

// عرض السلة في النافذة المنبثقة
function updateCartModal() {
    const modalBody = document.getElementById('cartModalBody');
    const modalTotal = document.getElementById('cartModalTotal');
    const cartCountSpan = document.getElementById('cartCount');
    
    if (!modalBody) return;
    
    if (cart.length === 0) {
        modalBody.innerHTML = '<div class="empty-cart">🛒 السلة فارغة<br><small>أضف بعض المنتجات</small></div>';
        if (modalTotal) modalTotal.innerText = '0 ج.م';
        if (cartCountSpan) cartCountSpan.innerText = '0';
        return;
    }
    
    let total = 0;
    modalBody.innerHTML = cart.map((item, index) => {
        total += item.price * item.quantity;
        return `
            <div class="cart-modal-item">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">${item.price} ج.م × ${item.quantity}</div>
                </div>
                <div class="cart-item-actions">
                    <button class="cart-qty-btn" onclick="updateCartItemQty(${index}, ${item.quantity - 1})">-</button>
                    <span class="cart-item-qty">${item.quantity}</span>
                    <button class="cart-qty-btn" onclick="updateCartItemQty(${index}, ${item.quantity + 1})">+</button>
                    <button class="cart-remove-btn" onclick="removeCartItem(${index})">🗑️</button>
                </div>
            </div>
        `;
    }).join('');
    
    if (modalTotal) modalTotal.innerText = total + ' ج.م';
    if (cartCountSpan) cartCountSpan.innerText = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    // حفظ السلة في LocalStorage
    localStorage.setItem('falcon_cart', JSON.stringify(cart));
}

// تحديث كمية منتج في السلة
function updateCartItemQty(index, newQty) {
    if (newQty <= 0) {
        cart.splice(index, 1);
    } else {
        cart[index].quantity = newQty;
    }
    updateCartModal();
}

// حذف منتج من السلة
function removeCartItem(index) {
    cart.splice(index, 1);
    updateCartModal();
}

// إضافة منتج للسلة (يدعم منتجات من أي صفحة)
function addToCart(productName, productPrice, productId = null, quantity = 1) {
    // البحث عن المنتج في السلة باستخدام الاسم (لأنه فريد)
    const existingItem = cart.find(item => item.name === productName);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: productId || Date.now() + Math.random(),
            name: productName,
            price: productPrice,
            quantity: quantity
        });
    }
    
    updateCartModal();
    showCartToast('✅ تم إضافة ' + productName);
}

// فتح نافذة السلة
function openCartModal() {
    const modal = document.getElementById('cartModal');
    if (modal) {
        updateCartModal();
        modal.style.display = 'flex';
    }
}

// إغلاق نافذة السلة
function closeCartModal() {
    const modal = document.getElementById('cartModal');
    if (modal) modal.style.display = 'none';
}

// إظهار رسالة منبثقة صغيرة
function showCartToast(message) {
    let toast = document.getElementById('cartToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'cartToast';
        toast.style.cssText = `
            position: fixed;
            bottom: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: #4CAF50;
            color: white;
            padding: 10px 20px;
            border-radius: 50px;
            z-index: 2000;
            font-size: 0.9rem;
            transition: 0.3s;
            opacity: 0;
        `;
        document.body.appendChild(toast);
    }
    
    toast.innerText = message;
    toast.style.opacity = '1';
    setTimeout(() => {
        toast.style.opacity = '0';
    }, 2000);
}

// إتمام الطلب (إرسال للواتساب)
function checkoutCart() {
    if (cart.length === 0) {
        showCartToast('❌ السلة فارغة! أضف منتجات أولاً.');
        return;
    }
    
    let total = 0;
    let msg = '🛒 طلب جديد من Falcon Store\n\n📦 المنتجات:\n';
    cart.forEach(item => {
        msg += `• ${item.name} × ${item.quantity} = ${item.price * item.quantity} ج.م\n`;
        total += item.price * item.quantity;
    });
    msg += `\n💰 الإجمالي: ${total} ج.م\n\n📌 يرجى إرسال سكرين شوت بعد التحويل`;
    
    window.open(`https://wa.me/201121816129?text=${encodeURIComponent(msg)}`, '_blank');
    
    // تفريغ السلة بعد الإرسال (اختياري - علق السطرين دول لو عايز تحتفظ بالسلة)
    // cart = [];
    // updateCartModal();
}

// ========== إضافة أنماط CSS للسلة ==========
function addCartStyles() {
    if (document.getElementById('cart-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'cart-styles';
    style.textContent = `
        .cart-icon {
            position: fixed;
            bottom: 25px;
            right: 25px;
            background: #D32F2F;
            width: 55px;
            height: 55px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 99;
            box-shadow: 0 0 15px rgba(211, 47, 47, 0.5);
            transition: 0.3s;
        }
        .cart-icon:hover {
            transform: scale(1.05);
        }
        .cart-count {
            position: absolute;
            top: -5px;
            right: -5px;
            background: #FF9800;
            color: white;
            border-radius: 50%;
            width: 22px;
            height: 22px;
            font-size: 0.7rem;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
        }
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
            background: #FFFFFF;
            max-width: 500px;
            width: 90%;
            max-height: 80%;
            border-radius: 1.5rem;
            overflow: hidden;
            animation: fadeInUp 0.3s ease;
        }
        body.dark .cart-modal-content {
            background: #2D0000;
        }
        .cart-modal-header {
            background: #D32F2F;
            color: white;
            padding: 1rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .cart-modal-header h3 {
            margin: 0;
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
            border-bottom: 1px solid #EF9A9A;
            flex-wrap: wrap;
            gap: 0.5rem;
        }
        body.dark .cart-modal-item {
            border-bottom-color: #B71C1C;
        }
        .cart-item-name {
            font-weight: 600;
            color: #B71C1C;
        }
        body.dark .cart-item-name {
            color: #FF8A80;
        }
        .cart-item-price {
            font-size: 0.8rem;
            color: #757575;
        }
        body.dark .cart-item-price {
            color: #BDBDBD;
        }
        .cart-item-actions {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        .cart-qty-btn {
            background: #D32F2F;
            color: white;
            border: none;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 1rem;
        }
        .cart-remove-btn {
            background: none;
            border: none;
            font-size: 1.2rem;
            cursor: pointer;
            color: #f44336;
        }
        .cart-modal-footer {
            padding: 1rem;
            border-top: 1px solid #EF9A9A;
            text-align: center;
        }
        body.dark .cart-modal-footer {
            border-top-color: #B71C1C;
        }
        .cart-total {
            font-size: 1.2rem;
            font-weight: bold;
            margin-bottom: 1rem;
            color: #B71C1C;
        }
        body.dark .cart-total {
            color: #FF8A80;
        }
        .checkout-cart-btn {
            background: #D32F2F;
            color: white;
            border: none;
            padding: 12px;
            width: 100%;
            border-radius: 50px;
            font-size: 1rem;
            font-weight: bold;
            cursor: pointer;
        }
        .empty-cart {
            text-align: center;
            padding: 2rem;
            color: #757575;
        }
        body.dark .empty-cart {
            color: #BDBDBD;
        }
        .add-to-cart-btn {
            background: #4CAF50;
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 60px;
            font-size: 1rem;
            font-weight: bold;
            cursor: pointer;
            width: 100%;
            margin-top: 0.5rem;
            transition: 0.3s;
        }
        .add-to-cart-btn:hover {
            background: #45a049;
            transform: scale(1.02);
        }
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
}

// ========== إضافة أيقونة السلة ونافذتها في الصفحة ==========
function initCartUI() {
    addCartStyles();
    
    if (!document.getElementById('cartIcon')) {
        const cartIcon = document.createElement('div');
        cartIcon.className = 'cart-icon';
        cartIcon.id = 'cartIcon';
        cartIcon.innerHTML = '<i class="fas fa-shopping-cart"></i><span class="cart-count" id="cartCount">0</span>';
        document.body.appendChild(cartIcon);
        cartIcon.addEventListener('click', openCartModal);
    }
    
    if (!document.getElementById('cartModal')) {
        const modal = document.createElement('div');
        modal.className = 'cart-modal';
        modal.id = 'cartModal';
        modal.innerHTML = `
            <div class="cart-modal-content">
                <div class="cart-modal-header">
                    <h3><i class="fas fa-shopping-cart"></i> سلة المشتريات</h3>
                    <button class="close-modal" onclick="closeCartModal()">&times;</button>
                </div>
                <div class="cart-modal-body" id="cartModalBody">
                    <div class="empty-cart">🛒 السلة فارغة</div>
                </div>
                <div class="cart-modal-footer">
                    <div class="cart-total" id="cartModalTotal">0 ج.م</div>
                    <button class="checkout-cart-btn" onclick="checkoutCart()">💳 إتمام الطلب</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    updateCartModal();
}

// تشغيل السلة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    initCartUI();
});