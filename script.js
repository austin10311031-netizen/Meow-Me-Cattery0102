const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const cart = [];
const currentPage = document.documentElement.dataset.page || "home";

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

const formatPrice = (value) => `$${value.toLocaleString("en-US")}`;

const getCartTotal = () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
const getCartCount = () => cart.reduce((sum, item) => sum + item.quantity, 0);

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
    "",
    "客人姓名：",
    "聯絡電話：",
    "備註：",
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

renderCart();
