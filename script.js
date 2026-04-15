// ======================= 1. FOOTER YEAR =======================
document.getElementById('year').textContent = new Date().getFullYear();

// ======================= 2. DARK MODE =======================
const htmlEl = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('louis-eatery-theme') || 'light';
htmlEl.setAttribute('data-theme', savedTheme);
themeToggle.addEventListener('click', () => {
  const next = htmlEl.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  htmlEl.setAttribute('data-theme', next);
  localStorage.setItem('louis-eatery-theme', next);
});

// ======================= 3. MOBILE MENU =======================
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
hamburger.addEventListener('click', () => {
  mobileMenu.style.display = mobileMenu.style.display === 'flex' ? 'none' : 'flex';
});
document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => mobileMenu.style.display = 'none');
});

// ======================= 4. NAVBAR SHADOW =======================
window.addEventListener('scroll', () => {
  const navbar = document.getElementById('navbar');
  navbar.style.boxShadow = window.scrollY > 20 ? '0 4px 24px rgba(0,0,0,0.12)' : 'none';
});

// ======================= 5. SCROLL REVEAL =======================
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ======================= 6. CART STATE =======================
let cart = [];
const DELIVERY_FEE = 500;
const WHATSAPP_NUMBER = '2348107620605';
let isCartDrawerOpen = false;
let isCheckoutOpen = false;

function getCartTotal() {
  return cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
}
function getCartItemCount() {
  return cart.reduce((sum, i) => sum + i.quantity, 0);
}
function decodeHTMLEntities(str) {
  const txt = document.createElement('textarea');
  txt.innerHTML = str;
  return txt.value;
}

// Add to cart (supports customCard for variety modal)
function addToCart(id, qty = 1, customCard = null) {
  const card = customCard || document.querySelector(`.menu-card[data-id="${id}"]`);
  if (!card) return;
  const item = {
    id: id,
    name: decodeHTMLEntities(card.dataset.name),
    price: parseInt(card.dataset.price, 10),
    img: card.dataset.img,
    quantity: qty
  };
  const existing = cart.find(i => i.id === id);
  if (existing) existing.quantity += qty;
  else cart.push(item);
  updateCartUI();
  openCartDrawer();
  // Animate price
  const priceEl = card.querySelector('.price');
  if (priceEl) {
    priceEl.classList.remove('animated-price');
    void priceEl.offsetWidth;
    priceEl.classList.add('animated-price');
  }
}
window.addToCart = addToCart;

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  updateCartUI();
}
function updateCartQty(id, qty) {
  if (qty <= 0) removeFromCart(id);
  else {
    const item = cart.find(i => i.id === id);
    if (item) item.quantity = qty;
    updateCartUI();
  }
}
function updateCartUI() {
  const count = getCartItemCount();
  const total = getCartTotal();
  const navCount = document.getElementById('cartCount');
  if (navCount) { navCount.textContent = count; navCount.style.display = count > 0 ? 'flex' : 'none'; }
  const drawerCount = document.getElementById('drawerCount');
  if (drawerCount) drawerCount.textContent = count;
  const subtotalEl = document.getElementById('cartSubtotal');
  const totalEl = document.getElementById('cartTotal');
  if (subtotalEl) subtotalEl.textContent = `₦${total.toLocaleString()}`;
  if (totalEl) totalEl.textContent = `₦${(total + DELIVERY_FEE).toLocaleString()}`;
  const footer = document.getElementById('drawerFooter');
  const empty = document.getElementById('cartEmpty');
  if (footer && empty) {
    footer.style.display = count > 0 ? 'block' : 'none';
    empty.style.display = count > 0 ? 'none' : 'flex';
  }
  const floatBar = document.getElementById('cartFloatBar');
  if (floatBar) {
    if (count > 0 && !isCartDrawerOpen && !isCheckoutOpen) {
      floatBar.style.display = 'flex';
      document.getElementById('floatItemCount').textContent = `${count} item${count !== 1 ? 's' : ''}`;
      document.getElementById('floatTotal').textContent = `₦${total.toLocaleString()}`;
    } else floatBar.style.display = 'none';
  }
  renderCartItems();
}
function renderCartItems() {
  const container = document.getElementById('cartItems');
  if (!container) return;
  if (cart.length === 0) {
    container.innerHTML = `<div id="cartEmpty" class="cart-empty">Your cart is empty</div>`;
    return;
  }
  container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-img"><img src="${item.img}" alt="${item.name}"></div>
      <div class="cart-item-info">
        <p class="cart-item-name">${item.name}</p>
        <p class="cart-item-price">₦${item.price.toLocaleString()}</p>
        <div class="cart-item-qty">
          <button class="qty-mini-btn" onclick="updateCartQty('${item.id}', ${item.quantity - 1})">−</button>
          <span class="qty-mini-val">${item.quantity}</span>
          <button class="qty-mini-btn" onclick="updateCartQty('${item.id}', ${item.quantity + 1})">+</button>
        </div>
      </div>
      <div class="cart-item-right">
        <button class="cart-item-remove" onclick="removeFromCart('${item.id}')">✕</button>
        <span class="cart-item-total">₦${(item.price * item.quantity).toLocaleString()}</span>
      </div>
    </div>
  `).join('');
}

// Cart drawer controls
const cartDrawer = document.getElementById('cartDrawer');
const cartOverlay = document.getElementById('cartOverlay');
const cartClose = document.getElementById('cartClose');
const cartNavBtn = document.getElementById('cartNavBtn');
const cartFloatBtn = document.getElementById('cartFloatBtn');
function openCartDrawer() { isCartDrawerOpen = true; cartDrawer.classList.add('open'); cartOverlay.classList.add('show'); document.body.style.overflow = 'hidden'; updateCartUI(); }
function closeCartDrawer() { isCartDrawerOpen = false; cartDrawer.classList.remove('open'); cartOverlay.classList.remove('show'); document.body.style.overflow = ''; updateCartUI(); }
cartNavBtn.addEventListener('click', openCartDrawer);
cartClose.addEventListener('click', closeCartDrawer);
cartOverlay.addEventListener('click', closeCartDrawer);
if (cartFloatBtn) cartFloatBtn.addEventListener('click', openCartDrawer);
document.getElementById('browseMenuBtn')?.addEventListener('click', () => { closeCartDrawer(); document.getElementById('menu').scrollIntoView({ behavior: 'smooth' }); });
document.getElementById('drawerContinue')?.addEventListener('click', closeCartDrawer);
document.getElementById('proceedCheckoutBtn')?.addEventListener('click', () => { closeCartDrawer(); openCheckoutModal(); });

// Checkout modal
const checkoutModal = document.getElementById('checkoutModal');
const checkoutOverlay = document.getElementById('checkoutOverlay');
const closeCheckout = document.getElementById('closeCheckout');
const cancelCheckout = document.getElementById('cancelCheckout');
function openCheckoutModal() { isCheckoutOpen = true; checkoutModal.classList.add('active'); checkoutOverlay.classList.add('show'); document.body.style.overflow = 'hidden'; updateCartUI(); }
function closeCheckoutModal() { isCheckoutOpen = false; checkoutModal.classList.remove('active'); checkoutOverlay.classList.remove('show'); document.body.style.overflow = ''; updateCartUI(); }
closeCheckout?.addEventListener('click', closeCheckoutModal);
cancelCheckout?.addEventListener('click', closeCheckoutModal);
checkoutOverlay?.addEventListener('click', closeCheckoutModal);
document.getElementById('checkoutForm')?.addEventListener('submit', function(e) {
  e.preventDefault();
  if (cart.length === 0) { alert('Your cart is empty.'); return; }
  const name = document.getElementById('checkoutName').value.trim();
  const phone = document.getElementById('checkoutPhone').value.trim();
  const address = document.getElementById('checkoutAddress').value.trim();
  const note = document.getElementById('checkoutNote').value.trim();
  if (!name || !phone || !address) { alert('Please fill in all required fields.'); return; }
  let orderMsg = `🍛 *LOUIS EATERY ORDER* 🍛\n\n*Customer:* ${name}\n*Phone:* ${phone}\n*Address:* ${address}\n*Note:* ${note || 'None'}\n\n*ITEMS:*\n`;
  cart.forEach(item => { orderMsg += `• ${item.name} x${item.quantity} — ₦${(item.price * item.quantity).toLocaleString()}\n`; });
  const subtotal = getCartTotal();
  orderMsg += `\n*Subtotal:* ₦${subtotal.toLocaleString()}\n*Delivery:* ₦${DELIVERY_FEE.toLocaleString()}\n*TOTAL:* ₦${(subtotal + DELIVERY_FEE).toLocaleString()}\n\n🙏 Thank you for choosing Louis Eatery!`;
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(orderMsg)}`, '_blank');
  document.getElementById('successToast').classList.add('show');
  setTimeout(() => document.getElementById('successToast').classList.remove('show'), 4000);
  cart = [];
  updateCartUI();
  closeCheckoutModal();
});

// Add to cart buttons (stop propagation so card click doesn't interfere)
document.querySelectorAll('.btn-add-cart').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const id = btn.getAttribute('data-add');
    if (id) addToCart(id, 1);
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '✓ Added';
    setTimeout(() => btn.innerHTML = originalHTML, 1200);
  });
});

// ========== VARIETY MODAL (click on cuisine) ==========
const varietyModal = document.getElementById('varietyModal');
const varietyOverlay = document.getElementById('varietyOverlay');
const closeVarietyModal = document.getElementById('closeVarietyModal');
const varietyTitle = document.getElementById('varietyTitle');
const varietyList = document.getElementById('varietyList');

function openVarietyModal(dishName, varietiesArray) {
  varietyTitle.innerText = `${dishName} Varieties`;
  varietyList.innerHTML = varietiesArray.map(v => {
    const [name, priceStr] = v.split(' - ₦');
    const price = parseInt(priceStr);
    return `<div class="variety-item" data-variety-name="${name.trim()}" data-variety-price="${price}">
              <span class="variety-name">${name.trim()}</span>
              <span class="variety-price">₦${price.toLocaleString()}</span>
            </div>`;
  }).join('');
  varietyModal.classList.add('active');
  varietyOverlay.classList.add('show');
  document.body.style.overflow = 'hidden';
  
  document.querySelectorAll('.variety-item').forEach(item => {
    item.addEventListener('click', () => {
      const varietyName = item.dataset.varietyName;
      const varietyPrice = parseInt(item.dataset.varietyPrice);
      const fakeCard = document.createElement('div');
      fakeCard.dataset.name = varietyName;
      fakeCard.dataset.price = varietyPrice;
      fakeCard.dataset.img = 'https://placehold.co/400x300/d44f00/fff8f2?text=Variety';
      fakeCard.dataset.id = `variety_${Date.now()}`;
      addToCart(fakeCard.dataset.id, 1, fakeCard);
      closeVarietyModalFunc();
    });
  });
}

function closeVarietyModalFunc() {
  varietyModal.classList.remove('active');
  varietyOverlay.classList.remove('show');
  document.body.style.overflow = '';
}

closeVarietyModal?.addEventListener('click', closeVarietyModalFunc);
varietyOverlay?.addEventListener('click', closeVarietyModalFunc);

// Attach click on menu cards to open variety modal
document.querySelectorAll('.menu-card').forEach(card => {
  card.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-add-cart')) return;
    const varieties = card.dataset.varieties;
    if (varieties) {
      openVarietyModal(card.dataset.name, JSON.parse(varieties));
    }
  });
});

// ========== SEND MESSAGE VIA WHATSAPP FORM ==========
const msgForm = document.getElementById('whatsappMessageForm');
if (msgForm) {
  msgForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('msgName').value.trim();
    const phone = document.getElementById('msgPhone').value.trim();
    const details = document.getElementById('msgDetails').value.trim();
    if (!name || !phone || !details) {
      alert('Please fill all fields.');
      return;
    }
    const waMsg = `🍛 *LOUIS EATERY MESSAGE* 🍛\n\n*From:* ${name}\n*Phone:* ${phone}\n*Message:* ${details}`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waMsg)}`, '_blank');
    msgForm.reset();
    const toast = document.getElementById('successToast');
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  });
}

// ========== INIT SWIPER FOR REVIEWS ==========
if (typeof Swiper !== 'undefined') {
  new Swiper('.reviews-swiper', {
    loop: true,
    autoplay: { delay: 4000 },
    pagination: { el: '.swiper-pagination', clickable: true },
    slidesPerView: 1,
    spaceBetween: 20,
    breakpoints: { 768: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }
  });
}

// ========== CATEGORY FILTER & SEARCH ==========
const menuSearch = document.getElementById('menuSearch');
const searchClear = document.getElementById('searchClear');
const categoryBtns = document.querySelectorAll('.category-btn');
let currentCategory = 'all';
let currentSearch = '';
function filterMenu() {
  document.querySelectorAll('.menu-card').forEach(card => {
    const cat = card.dataset.category;
    const name = card.querySelector('.menu-card-content h3')?.innerText.toLowerCase() || '';
    const matchCat = currentCategory === 'all' || cat === currentCategory;
    const matchSearch = name.includes(currentSearch.toLowerCase());
    card.style.display = matchCat && matchSearch ? 'block' : 'none';
  });
}
menuSearch?.addEventListener('input', (e) => {
  currentSearch = e.target.value;
  searchClear.style.display = currentSearch ? 'flex' : 'none';
  filterMenu();
});
searchClear?.addEventListener('click', () => {
  menuSearch.value = '';
  currentSearch = '';
  searchClear.style.display = 'none';
  filterMenu();
});
categoryBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    categoryBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentCategory = btn.dataset.category;
    filterMenu();
  });
});

// Initial UI update
updateCartUI();