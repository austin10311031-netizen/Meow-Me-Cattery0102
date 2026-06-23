const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const cart = [];
const currentPage = document.documentElement.dataset.page || "home";
const shopPassword = "mmc2021";
const shopAccessKey = "meowme-shop-access";

const cartCountNodes = document.querySelectorAll("[data-cart-count]");
const cartCountLabel = document.querySelector("[data-cart-count-label]");
const cartItemsNode = document.querySelector("[data-cart-items]");
const cartTotalNode = document.querySelector("[data-cart-total]");
const checkoutButton = document.querySelector("[data-checkout]");
const paymentModal = document.querySelector("[data-payment-modal]");
const paymentItemsNode = document.querySelector("[data-payment-items]");
const paymentTotalNode = document.querySelector("[data-payment-total]");
const orderCodeNode = document.querySelector("[data-order-code]");
const whatsappOrderLink = document.querySelector("[data-whatsapp-order]");
const emailOrderLink = document.querySelector("[data-email-order]");
const shopLockNode = document.querySelector("[data-shop-lock]");
const shopPrivateNode = document.querySelector("[data-shop-private]");
const shopPasswordForm = document.querySelector("[data-shop-password-form]");
const shopPasswordInput = document.querySelector("[data-shop-password-input]");
const shopPasswordError = document.querySelector("[data-shop-password-error]");

const shopProducts = [
  {
    type: "汪喵星球",
    name: "汪喵 - 腸胃益生菌",
    detail: "一盒30包 · 建議看門口，貓貓肚痾時用",
    cartName: "汪喵 - 腸胃益生菌 一盒30包",
    price: 169,
    image: "assets/products/dogcatstar-probiotics.jpg",
    alt: "汪喵腸胃益生菌一盒30包",
  },
  {
    type: "汪喵星球",
    name: "汪喵 - 提升免疫力粉",
    detail: "適合幼/老貓/體質虛弱，健康貓日常營養補充",
    cartName: "汪喵 - 提升免疫力粉",
    price: 210,
    image: "assets/products/dogcatstar-immune.png",
    alt: "汪喵提升免疫力粉",
  },
  {
    type: "汪喵星球",
    name: "汪喵 - 牛磺酸（重要營養）",
    detail: "自身無法產生，需要補充；視網膜、腦部、心臟與神經系統保健",
    cartName: "汪喵 - 牛磺酸（重要營養）",
    price: 78,
    image: "assets/products/dogcatstar-taurine.jpg",
    alt: "汪喵牛磺酸重要營養",
  },
  {
    type: "貓罐頭",
    name: "貓罐頭 - 綜合口味",
    detail: "一箱24罐",
    cartName: "貓罐頭 - 綜合口味 一箱24罐",
    price: 318,
    image: "assets/products/dogcatstar-catsoup.jpg",
    alt: "貓罐頭綜合口味一箱24罐",
  },
  {
    type: "Brabanconne",
    name: "Brabanconne 幼貓雞肉味",
    detail: "2.5kg",
    cartName: "Brabanconne 幼貓雞肉味 2.5kg",
    price: 220,
    image: "assets/products/brabanconne-kitten.png",
    alt: "Brabanconne幼貓雞肉味2.5kg",
  },
];

const formatPrice = (value) => `$${value.toLocaleString("en-US")}`;

const getCartTotal = () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
const getCartCount = () => cart.reduce((sum, item) => sum + item.quantity, 0);

function getShopAccess() {
  try {
    return sessionStorage.getItem(shopAccessKey) === "true";
  } catch {
    return false;
  }
}

function setShopAccess() {
  try {
    sessionStorage.setItem(shopAccessKey, "true");
  } catch {
    // Browsing still works even when sessionStorage is unavailable.
  }
}

function showProtectedShop() {
  if (shopPrivateNode) {
    shopPrivateNode.hidden = false;
  }

  if (shopLockNode) {
    shopLockNode.hidden = true;
  }
}

function showShopPasswordGate() {
  if (shopPrivateNode) {
    shopPrivateNode.hidden = true;
  }

  if (shopLockNode) {
    shopLockNode.hidden = false;
  }
}

function initShopPasswordGate() {
  if (currentPage !== "shop" || !shopLockNode || !shopPrivateNode) return;

  if (getShopAccess()) {
    showProtectedShop();
  } else {
    showShopPasswordGate();
    shopPasswordInput?.focus();
  }

  shopPasswordForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const password = shopPasswordInput?.value.trim();

    if (password === shopPassword) {
      setShopAccess();
      showProtectedShop();
      shopPasswordForm.reset();
      if (shopPasswordError) {
        shopPasswordError.hidden = true;
      }
      document.querySelector("#shop")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    if (shopPasswordError) {
      shopPasswordError.hidden = false;
    }
    shopPasswordInput?.select();
  });
}

function injectProductStyles() {
  if (document.querySelector("#product-image-style")) return;
  const style = document.createElement("style");
  style.id = "product-image-style";
  style.textContent = `
    .product-card { min-height: 0; padding: 18px; }
    .product-image {
      display: grid;
      place-items: center;
      aspect-ratio: 1;
      overflow: hidden;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: #fffaf8;
    }
    .product-image img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      padding: 12px;
    }
  `;
  document.head.append(style);
}

function renderShopProducts() {
  const productGrid = document.querySelector(".product-grid");
  if (!productGrid) return;

  injectProductStyles();
  productGrid.innerHTML = shopProducts
    .map(
      (product) => `
        <article class="product-card">
          <div class="product-image">
            <img src="${product.image}" alt="${product.alt}" loading="lazy" />
          </div>
          <span class="product-type">${product.type}</span>
          <h3>${product.name}</h3>
          <p>${product.detail}</p>
          <strong>${formatPrice(product.price)}</strong>
          <button type="button" class="button product-button" data-add-product data-name="${product.cartName}" data-price="${product.price}">
            <svg><use href="#icon-plus" /></svg>
            加入購物車
          </button>
        </article>
      `,
    )
    .join("");
}

function createOrderCode() {
  const now = new Date();
  const datePart = now
    .toISOString()
    .slice(0, 10)
    .replaceAll("-", "");
  const timePart = String(now.getHours()).padStart(2, "0") + String(now.getMinutes()).padStart(2, "0");
  return `MM${datePart}${timePart}`;
}

function buildOrderMessage(orderCode) {
  const lines = cart.map(
    (item, index) => `${index + 1}. ${item.name} x ${item.quantity} - ${formatPrice(item.price * item.quantity)}`,
  );

  return [
    "Meow Me Cattery 商品訂單",
    `訂單編號：${orderCode}`,
    "",
    "訂單內容：",
    ...lines,
    "",
    `合計：${formatPrice(getCartTotal())}`,
    "付款方式：PayMe / AlipayHK / FPS 102184900",
    "",
    "客人姓名：",
    "聯絡電話：",
    "地址：",
    "",
    "我已付款，付款截圖如下。",
  ].join("\n");
}

function renderCart() {
  const count = getCartCount();
  const total = getCartTotal();

  cartCountNodes.forEach((node) => {
    node.textContent = String(count);
  });

  if (cartCountLabel) {
    cartCountLabel.textContent = `${count} 件`;
  }

  if (cartTotalNode) {
    cartTotalNode.textContent = formatPrice(total);
  }

  if (checkoutButton) {
    checkoutButton.disabled = count === 0;
  }

  if (!cartItemsNode) return;

  if (count === 0) {
    cartItemsNode.innerHTML = '<p class="cart-empty">尚未選購項目</p>';
    return;
  }

  cartItemsNode.innerHTML = cart
    .map(
      (item, index) => `
        <div class="cart-line">
          <div class="cart-line-title">
            <strong>${item.name}</strong>
            <span>${formatPrice(item.price)} x ${item.quantity}</span>
          </div>
          <button type="button" data-remove-item="${index}" aria-label="移除 ${item.name}">
            <svg><use href="#icon-x" /></svg>
          </button>
        </div>
      `,
    )
    .join("");
}

function renderPaymentSummary() {
  if (!paymentItemsNode || !paymentTotalNode) return;
  const orderCode = createOrderCode();

  paymentItemsNode.innerHTML = cart
    .map(
      (item) => `
        <div class="cart-line">
          <div class="cart-line-title">
            <strong>${item.name}</strong>
            <span>${formatPrice(item.price)} x ${item.quantity}</span>
          </div>
          <strong>${formatPrice(item.price * item.quantity)}</strong>
        </div>
      `,
    )
    .join("");

  paymentTotalNode.textContent = formatPrice(getCartTotal());

  if (orderCodeNode) {
    orderCodeNode.textContent = orderCode;
  }

  const orderMessage = buildOrderMessage(orderCode);

  if (whatsappOrderLink) {
    whatsappOrderLink.href = `https://wa.me/85261575928?text=${encodeURIComponent(orderMessage)}`;
  }

  if (emailOrderLink) {
    const subject = `Meow Me Cattery 商品訂單 ${orderCode}`;
    emailOrderLink.href = `mailto:meowme.cattery@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(orderMessage)}`;
  }
}

function openPaymentModal() {
  if (!paymentModal || getCartCount() === 0) return;
  renderPaymentSummary();
  paymentModal.classList.add("is-open");
  paymentModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}

function closePaymentModal() {
  if (!paymentModal) return;
  paymentModal.classList.remove("is-open");
  paymentModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    document.body.classList.toggle("menu-open", isOpen);
  });

  siteNav.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      siteNav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("menu-open");
    }
  });
}

document.addEventListener("click", (event) => {
  const addButton = event.target.closest("[data-add-product]");
  if (addButton) {
    const name = addButton.dataset.name;
    const price = Number(addButton.dataset.price);
    const existingItem = cart.find((item) => item.name === name);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ name, price, quantity: 1 });
    }

    renderCart();
    document.querySelector("#shop")?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  const removeButton = event.target.closest("[data-remove-item]");
  if (removeButton) {
    const index = Number(removeButton.dataset.removeItem);
    cart.splice(index, 1);
    renderCart();
    return;
  }

  if (event.target.closest("[data-open-cart]")) {
    if (currentPage !== "shop") {
      window.location.href = "index.html?page=shop";
      return;
    }

    document.querySelector("#shop")?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  if (event.target.closest("[data-checkout]")) {
    openPaymentModal();
    return;
  }

  if (event.target.closest("[data-close-payment]") || event.target === paymentModal) {
    closePaymentModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closePaymentModal();
  }
});

renderShopProducts();
initShopPasswordGate();
renderCart();
