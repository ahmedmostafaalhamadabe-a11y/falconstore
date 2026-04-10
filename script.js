// ========== الأصوات ==========
function playClickSound() {
    const audio = new Audio('click.mp3');
    audio.volume = 0.4;
    audio.play().catch(e => console.log("الصوت يحتاج أول تفاعل"));
}

function playClick2Sound() {
    const audio = new Audio('click2.mp3');
    audio.volume = 0.4;
    audio.play().catch(e => console.log("الصوت يحتاج أول تفاعل"));
}

function playErrorSound() {
    const audio = new Audio('error.mp3');
    audio.volume = 0.5;
    audio.play().catch(e => console.log("الصوت يحتاج أول تفاعل"));
}

// ========== دالة عرض الأخطاء ==========
function showErrorModal(message) {
    playErrorSound();
    const existingModal = document.querySelector('.custom-error-modal');
    if (existingModal) existingModal.remove();
    
    const modalDiv = document.createElement('div');
    modalDiv.className = 'custom-error-modal';
    modalDiv.innerHTML = `
        <div class="modal-box">
            <i class="fas fa-circle-exclamation"></i>
            <p>${message}</p>
            <button onclick="this.closest('.custom-error-modal').remove()">موافق</button>
        </div>
    `;
    document.body.appendChild(modalDiv);
}

// ========== تشغيل الأصوات على العناصر ==========
document.addEventListener('DOMContentLoaded', () => {
    const clickable = document.querySelectorAll('button, .product-card, .shop-btn, .theme-btn, .cart-icon, .slider-btn');
    clickable.forEach(el => {
        el.addEventListener('click', () => playClickSound());
    });
});

const enableAudio = () => {
    new Audio('click.mp3').play().catch(() => {});
    document.removeEventListener('click', enableAudio);
    document.removeEventListener('touchstart', enableAudio);
};
document.addEventListener('click', enableAudio);
document.addEventListener('touchstart', enableAudio);

// ========== الثيم الداكن ==========
if (localStorage.getItem('theme') === 'dark') document.body.classList.add('dark');
document.getElementById("themeToggle")?.addEventListener("click", () => {
    playClickSound();
    document.body.classList.toggle('dark');
    localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
});

// ========== السلة ==========
let cart = JSON.parse(localStorage.getItem('cart')) || [];
function updateCartCount() {
    const countSpan = document.getElementById("cartCount");
    if (countSpan) countSpan.innerText = cart.length;
}
updateCartCount();

document.getElementById("cartIcon")?.addEventListener("click", () => {
    playClickSound();
    if (cart.length === 0) {
        showErrorModal("🛒 السلة فارغة! أضف منتجات أولاً.");
        return;
    }
    let msg = "🛒 طلب جديد:\n";
    let total = 0;
    cart.forEach(item => {
        msg += `- ${item.name}: ${item.price} ج.م\n`;
        total += item.price;
    });
    msg += `💰 الإجمالي: ${total} ج.م`;
    window.open(`https://wa.me/20121816129?text=${encodeURIComponent(msg)}`, "_blank");
});

// ========== السلايدر (تم إصلاحه) ==========
document.addEventListener('DOMContentLoaded', function() {
    const slider = document.getElementById("slider");
    const slides = document.querySelectorAll(".slide");
    const dotsContainer = document.getElementById("dots");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    let slideIndex = 0;
    let autoInterval;

    if (!slider || slides.length === 0) return;

    function updateSlider() {
        slider.style.transform = `translateX(-${slideIndex * 100}%)`;
        document.querySelectorAll(".dot").forEach((dot, i) => {
            dot.classList.toggle("active", i === slideIndex);
        });
    }

    function nextSlide() {
        slideIndex = (slideIndex + 1) % slides.length;
        updateSlider();
    }

    function prevSlide() {
        slideIndex = (slideIndex - 1 + slides.length) % slides.length;
        updateSlider();
    }

    function startAuto() {
        if (autoInterval) clearInterval(autoInterval);
        autoInterval = setInterval(nextSlide, 5000);
    }

    // إنشاء النقاط
    slides.forEach((_, i) => {
        const dot = document.createElement("div");
        dot.classList.add("dot");
        if (i === 0) dot.classList.add("active");
        dot.addEventListener("click", () => {
            slideIndex = i;
            updateSlider();
            clearInterval(autoInterval);
            startAuto();
        });
        dotsContainer.appendChild(dot);
    });

    updateSlider();
    startAuto();

    if (prevBtn) prevBtn.addEventListener("click", () => {
        playClickSound();
        prevSlide();
        clearInterval(autoInterval);
        startAuto();
    });
    
    if (nextBtn) nextBtn.addEventListener("click", () => {
        playClickSound();
        nextSlide();
        clearInterval(autoInterval);
        startAuto();
    });
    
    slider.addEventListener("mouseenter", () => clearInterval(autoInterval));
    slider.addEventListener("mouseleave", startAuto);
});