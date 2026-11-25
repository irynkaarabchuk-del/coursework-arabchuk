let currentProduct = null;
let searchForm = document.querySelector(".search-box");
let searchButton = document.querySelector(".search-btn");
let headerSearchInput = document.getElementById("headerSearch");

if (searchForm && searchButton && headerSearchInput) {
  searchButton.addEventListener("click", function (event) {
    let isMobile = window.innerWidth < 768;
    let isOpen = searchForm.classList.contains("is-open");

    if (isMobile && !isOpen) {
      event.preventDefault();
      searchForm.classList.add("is-open");
      headerSearchInput.focus();
    }
  });

  document.addEventListener("click", function (event) {
    if (!searchForm.contains(event.target)) {
      searchForm.classList.remove("is-open");
    }
  });
}

const iconBlock = document.getElementById("iconBlock");
const iconOpen = document.getElementById("iconOpen");
const iconClose = document.getElementById("iconClose");
const mainMenu = document.getElementById("mainMenu");

if (iconBlock) {
  iconBlock.addEventListener("click", () => {
    iconOpen.classList.toggle("d-none");
    iconClose.classList.toggle("d-none");
    mainMenu.classList.toggle("menu-open");
  });
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  { threshold: 0, rootMargin: "0px 0px -50px 0px" },
);

document
  .querySelectorAll(
    ".about, .products-section, .testimonial, .offer, .about-us, .galery, .blog, .newsletter, footer",
  )
  .forEach((el) => {
    el.classList.add("animate");
    observer.observe(el);
  });

let reviews = [
  {
    name: "Sara Taylor",
    role: "Покупець",
    img: "assets/images/girl.webp",
    text: "Замовляю в Organick вже пів року. Овочі завжди свіжі, доставка швидка, а смак як з бабусиного городу. Дуже рекомендую!",
  },
  {
    name: "Олена Коваль",
    role: "Постійна клієнтка",
    img: "assets/images/olena.webp",
    text: "Нарешті знайшла місце, де справді органічні продукти. Яйця й овочі смакують як з села, а доставка завжди вчасно.",
  },
  {
    name: "Андрій Мельник",
    role: "Власник кафе",
    img: "assets/images/andrew.webp",
    text: "Беремо в Organick горіхи та крупи для нашого кафе. Якість стабільна, відвідувачі помічають різницю в смаку.",
  },
];
const reviewsWrapper = document.getElementById("reviewsWrapper");
if (reviewsWrapper) {
  for (const review of reviews) {
    const slide = document.createElement("div");
    slide.className = "swiper-slide review-slide";

    const img = document.createElement("img");
    img.className = "girl";
    img.src = review.img;
    img.alt = review.name;

    const rating = document.createElement("div");
    rating.className = "rating";
    for (let i = 0; i < 5; i++) {
      rating.append(document.createElement("span"));
    }

    const text = document.createElement("blockquote");
    text.className = "testimonial-girl";
    text.textContent = review.text;

    const name = document.createElement("p");
    name.className = "name";
    name.textContent = review.name;

    const role = document.createElement("p");
    role.className = "consumer";
    role.textContent = review.role;

    slide.append(img, rating, text, name, role);
    reviewsWrapper.append(slide);
  }
  if (typeof Swiper !== "undefined") {
    new Swiper("#reviewsSwiper", {
      loop: true,
      grabCursor: true,
      spaceBetween: 30,
      pagination: { el: ".swiper-pagination", clickable: true },
      keyboard: { enabled: true },
    });
  }
}

async function loadProducts() {
  let module = await import("./app.js");
  let db = module.db;

  let result = await db
    .from("products")
    .select(
      "id, name, price, old_price, image_url, description, details, weight, origin, shelf_life, categories(name)",
    )
    .order("name");
  if (result.error) {
    throw result.error;
  }

  let products = [];
  for (let i = 0; i < result.data.length; i++) {
    let item = result.data[i];

    products.push({
      id: item.id,
      name: item.name,
      category: item.categories ? item.categories.name : "Без категорії",
      price: Number(item.price),
      oldPrice: item.old_price ? Number(item.old_price) : null,
      image: item.image_url,
      description: item.description,
      details: item.details,
      weight: item.weight,
      origin: item.origin,
      shelfLife: item.shelf_life,
    });
  }

  return products;
}
function formatPrice(value) {
  return "$" + value.toFixed(2);
}

function createElement(tag, className, text) {
  let element = document.createElement(tag);
  if (className) {
    element.className = className;
  }
  if (text) {
    element.textContent = text;
  }
  return element;
}

function createProductCard(product) {
  let url = "shopSingle.html?id=" + product.id;

  let card = createElement("article", "product-card");
  let badge = createElement("span", "badge", product.category);

  let image = document.createElement("img");
  image.src = product.image;
  image.alt = product.name;
  image.loading = "lazy";

  let info = createElement("div", "product-info");
  let title = document.createElement("h3");
  let link = createElement("a", "product-card-link", product.name);
  link.href = url;
  title.appendChild(link);

  let bottom = createElement("div", "product-bottom");
  let prices = createElement("div", "prices");
    if (product.oldPrice) {
    prices.appendChild(
      createElement("span", "old-price", formatPrice(product.oldPrice)),
    );
  }
  prices.appendChild(
    createElement("span", "new-price", formatPrice(product.price)),
  );

  let rating = createElement("div", "rating");
  for (let i = 0; i < 5; i++) {
    rating.appendChild(document.createElement("span"));
  }

  bottom.appendChild(prices);
  bottom.appendChild(rating);
  info.appendChild(title);
  info.appendChild(bottom);

  card.appendChild(badge);
  card.appendChild(image);
  card.appendChild(info);

  card.addEventListener("click", function (event) {
    if (event.target.closest("a")) {
      return;
    }
    window.location.href = url;
  });

  return card;
}

function showLoadError(box, retry) {
  box.textContent =
    "Не вдалося завантажити товари. Перевірте зʼєднання з інтернетом.";

  let button = createElement(
    "button",
    "shop-toolbar-reset",
    "Спробувати ще раз",
  );
  button.type = "button";
  button.addEventListener("click", retry);

  box.appendChild(document.createElement("br"));
  box.appendChild(button);
  box.hidden = false;
}

function initShopPage() {
  let grid = document.getElementById("shopGrid");
  let statusBox = document.getElementById("shopStatus");
  let emptyMessage = document.getElementById("shopEmpty");
  let searchInput = document.getElementById("headerSearch");
  let categorySelect = document.getElementById("shopCategory");
  let sortSelect = document.getElementById("shopSort");
  let resetButton = document.getElementById("shopReset");

  let products = [];

  function fillCategories() {
    let names = [];
    for (let i = 0; i < products.length; i++) {
      if (!names.includes(products[i].category)) {
        names.push(products[i].category);
      }
    }
    for (let i = 0; i < names.length; i++) {
      let option = createElement("option", "", names[i]);
      option.value = names[i];
      categorySelect.appendChild(option);
    }
  }

  function render() {
    let text = searchInput.value.trim().toLowerCase();
    let category = categorySelect.value;
    let mode = sortSelect.value;

    let visible = products.filter(function (product) {
      let nameOk = product.name.toLowerCase().includes(text);
      let categoryOk = category === "" || product.category === category;
      return nameOk && categoryOk;
    });

    if (mode === "price-asc") {
      visible.sort(function (a, b) {
        return a.price - b.price;
      });
    } else if (mode === "price-desc") {
      visible.sort(function (a, b) {
        return b.price - a.price;
      });
    } else if (mode === "name-asc") {
      visible.sort(function (a, b) {
        return a.name.localeCompare(b.name, "uk");
      });
    } else if (mode === "name-desc") {
      visible.sort(function (a, b) {
        return b.name.localeCompare(a.name, "uk");
      });
    }

    grid.innerHTML = "";
    for (let i = 0; i < visible.length; i++) {
      grid.appendChild(createProductCard(visible[i]));
    }

    emptyMessage.hidden = visible.length > 0;
  }

  async function start() {
    statusBox.textContent = "Завантаження товарів…";
    statusBox.hidden = false;

    try {
      products = await loadProducts();
      statusBox.hidden = true;
      fillCategories();
      render();
    } catch (error) {
      console.error("Помилка завантаження товарів:", error);
      showLoadError(statusBox, start);
    }
  }

  searchInput.addEventListener("input", render);
  categorySelect.addEventListener("change", render);
  sortSelect.addEventListener("change", render);

  searchInput.form.addEventListener("submit", function (event) {
    event.preventDefault();
  });

  resetButton.addEventListener("click", function () {
    searchInput.value = "";
    categorySelect.value = "";
    sortSelect.value = "default";
    render();
  });

  let params = new URLSearchParams(window.location.search);
  searchInput.value = params.get("search") || "";

  start();
}

function showProduct(product, products) {
  currentProduct = product;
  document.title = product.name + " — Organick";
  document.getElementById("pImage").src = product.image;
  document.getElementById("pImage").alt = product.name;
  document.getElementById("pBadge").textContent = product.category;
  document.getElementById("pName").textContent = product.name;
  document.getElementById("pOld").textContent = product.oldPrice
    ? formatPrice(product.oldPrice)
    : "";
  document.getElementById("pNew").textContent = formatPrice(product.price);
  document.getElementById("pShort").textContent = product.description;
  document.getElementById("pLong").textContent = product.details;
  document.getElementById("pWeight").textContent = product.weight;
  document.getElementById("pOrigin").textContent = product.origin;
  document.getElementById("pCategory").textContent = product.category;
  document.getElementById("pShelf").textContent = product.shelfLife;

  let related = [];
  for (let i = 0; i < products.length; i++) {
    if (
      products[i].id !== product.id &&
      products[i].category === product.category
    ) {
      related.push(products[i]);
    }
  }
  for (let i = 0; i < products.length; i++) {
    if (
      products[i].id !== product.id &&
      products[i].category !== product.category
    ) {
      related.push(products[i]);
    }
  }

  let relatedBox = document.getElementById("relatedProducts");
  relatedBox.innerHTML = "";
  for (let i = 0; i < related.length && i < 4; i++) {
    relatedBox.appendChild(createProductCard(related[i]));
  }
}

function initProductPage() {
  let statusBox = document.getElementById("productStatus");
  let content = document.getElementById("productContent");

  async function start() {
    statusBox.textContent = "Завантаження товару…";
    statusBox.hidden = false;
    content.hidden = true;

    try {
      let products = await loadProducts();
      let params = new URLSearchParams(window.location.search);
      let product = null;

      if (params.get("id") === null) {
        product = products[0];
      } else {
        let id = params.get("id");
        for (let i = 0; i < products.length; i++) {
          if (String(products[i].id) === id) {
            product = products[i];
          }
        }
      }

      if (!product) {
        window.location.href = "404.html";
        return;
      }

      showProduct(product, products);
      statusBox.hidden = true;
      content.hidden = false;
    } catch (error) {
      console.error("Помилка завантаження товару:", error);
      showLoadError(statusBox, start);
    }
  }

  let tabButtons = document.querySelectorAll(".tab-btn");
  let tabContents = document.querySelectorAll(".tab-content");

  for (let i = 0; i < tabButtons.length; i++) {
    tabButtons[i].addEventListener("click", function () {
      for (let j = 0; j < tabButtons.length; j++) {
        tabButtons[j].classList.remove("active");
        tabContents[j].classList.remove("active");
      }
      tabButtons[i].classList.add("active");
      document
        .getElementById("tab-" + tabButtons[i].dataset.tab)
        .classList.add("active");
    });
  }

  let qty = document.getElementById("qty");
  let qtyError = document.getElementById("qtyError");

  function showQtyError() {
    let text = qty.value.trim();
    let number = Number(text);
    let message = "";

    if (text === "") message = "Введіть кількість від 1 до 100.";
    else if (!Number.isInteger(number))
      message = "Кількість має бути цілим числом.";
    else if (number < 1) message = "Мінімальна кількість: 1.";
    else if (number > 100) message = "Максимальна кількість: 100.";

    if (qtyError) {
      qtyError.textContent = message;
      qtyError.hidden = message === "";
    }
    qty.classList.toggle("is-invalid", message !== "");
    return message === "";
  }

  qty.addEventListener("input", showQtyError);

  start();
}

function initHomeProducts() {
  let grid = document.getElementById("homeProducts");
  let statusBox = document.getElementById("homeStatus");
  let moreButton = document.getElementById("homeMore");

  let products = [];
  let shown = 0;

  function showMore(count) {
    let end = Math.min(shown + count, products.length);

    for (let i = shown; i < end; i++) {
      grid.appendChild(createProductCard(products[i]));
    }
    shown = end;
    moreButton.hidden = shown >= products.length;
  }

  async function start() {
    statusBox.textContent = "Завантаження товарів…";
    statusBox.hidden = false;

    try {
      products = await loadProducts();
      statusBox.hidden = true;
      showMore(8);
    } catch (error) {
      console.error("Помилка завантаження товарів:", error);
      showLoadError(statusBox, start);
    }
  }

  moreButton.addEventListener("click", function () {
    showMore(4);
  });

  start();
}

if (document.getElementById("homeProducts")) {
  initHomeProducts();
}
if (document.getElementById("shopGrid")) {
  initShopPage();
}

if (document.getElementById("pName")) {
  initProductPage();
}

let cartItems = [];
try {
  cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
} catch {
  cartItems = [];
}

function saveCart() {
  localStorage.setItem("cartItems", JSON.stringify(cartItems));
}

function getCartCount() {
  return cartItems.reduce((sum, item) => sum + item.qty, 0);
}

function getCartTotal() {
  return cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function addToCart(product, qty) {
  const existing = cartItems.find(
    (item) => String(item.id) === String(product.id),
  );
  if (existing) {
    existing.qty += qty;
  } else {
    cartItems.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      qty: qty,
    });
  }
  saveCart();
  renderCart();
}

const cartOverlay = document.createElement("div");
cartOverlay.className = "modal-overlay";
cartOverlay.id = "cartOverlay";
cartOverlay.innerHTML = `
  <div class="modal cart-modal" role="dialog" aria-modal="true" aria-labelledby="cartTitle">
    <button type="button" class="modal-close" id="cartClose" aria-label="Закрити">
      <i class="fa-solid fa-xmark"></i>
    </button>
    <h2 class="modal-title" id="cartTitle">Кошик</h2>
    <ul class="cart-list" id="cartList"></ul>
    <p class="cart-total" id="cartTotal"></p>
    <p class="cart-pay-message" id="cartPayMessage" role="status" aria-live="polite"></p>
    <button type="button" class="modal-btn" id="cartBuy">Купити</button>
    <button type="button" class="modal-btn" id="cartClear">Очистити кошик</button>
  </div>`;
document.body.append(cartOverlay);

const cartList = document.getElementById("cartList");
const cartTotalBox = document.getElementById("cartTotal");
const cartClearBtn = document.getElementById("cartClear");
const cartBuyBtn = document.getElementById("cartBuy");
const cartPayMessage = document.getElementById("cartPayMessage");
const cartText = document.querySelector(".cart-box span");

function renderCart() {
  cartList.replaceChildren();

  if (cartItems.length === 0) {
    cartList.append(createElement("li", "cart-empty", "Кошик порожній."));
  }

  for (const item of cartItems) {
    const li = createElement("li", "cart-item");

    if (item.image) {
      const img = document.createElement("img");
      img.src = item.image;
      img.alt = item.name;
      li.append(img);
    }

    const info = createElement("div", "cart-item-info");
    info.append(createElement("div", "cart-item-name", item.name));
    info.append(
      createElement(
        "div",
        "cart-item-sum",
        item.qty +
          " × " +
          formatPrice(item.price) +
          " = " +
          formatPrice(item.qty * item.price),
      ),
    );
    li.append(info);

    const removeBtn = createElement("button", "cart-remove", "Видалити");
    removeBtn.type = "button";
    removeBtn.addEventListener("click", () => {
      cartItems = cartItems.filter(
        (other) => String(other.id) !== String(item.id),
      );
      saveCart();
      renderCart();
    });
    li.append(removeBtn);

    cartList.append(li);
  }

  cartTotalBox.textContent = "Разом: " + formatPrice(getCartTotal());
  cartTotalBox.hidden = cartItems.length === 0;
  cartClearBtn.hidden = cartItems.length === 0;
  cartBuyBtn.hidden = cartItems.length === 0;
  if (cartItems.length === 0) cartPayMessage.textContent = "";

  if (cartText) {
    cartText.textContent = "Кошик (" + getCartCount() + ")";
  }
}

function openCart() {
  cartPayMessage.textContent = "";
  renderCart();
  cartOverlay.classList.add("active");
}

function closeCart() {
  cartOverlay.classList.remove("active");
}

document.querySelector(".cart-box")?.addEventListener("click", openCart);
document.getElementById("cartClose").addEventListener("click", closeCart);
cartOverlay.addEventListener("click", (event) => {
  if (event.target === cartOverlay) closeCart();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeCart();
});

cartClearBtn.addEventListener("click", () => {
  cartItems = [];
  saveCart();
  renderCart();
});

document
  .querySelector(".single-cart-btn")
  ?.addEventListener("click", (event) => {
    if (!currentProduct) return;

    const qtyInput = document.getElementById("qty");
    const text = qtyInput.value.trim();
    const number = Number(text);
    const valid =
      text !== "" && Number.isInteger(number) && number >= 1 && number <= 100;

    if (!valid) {
      qtyInput.dispatchEvent(new Event("input"));
      qtyInput.focus();
      return;
    }

    addToCart(currentProduct, number);

    const button = event.currentTarget;
    const oldText = button.textContent;
    button.textContent = "Додано";
    setTimeout(() => {
      button.textContent = oldText;
    }, 1200);
  });

cartBuyBtn.addEventListener("click", () => {
  if (cartItems.length === 0) return;

  if (confirm("Ви точно хочете купити?")) {
    cartPayMessage.textContent = "Оплачено! Дякуємо за покупку.";
  }
});

function getFormMessage(form, className) {
  let box = form.querySelector("." + className);
  if (!box) {
    box = document.createElement("p");
    box.className = className;
    box.setAttribute("role", "status");
    form.append(box);
  }
  return box;
}

function showFormMessage(box, text, isError) {
  box.textContent = text;
  box.classList.toggle("is-error", isError);
  box.classList.toggle("error", isError);
}

const newsletterForm =
  document.getElementById("newsletterForm") ||
  document.querySelector(".newsletter form");

if (newsletterForm) {
  const newsletterEmail = newsletterForm.querySelector("input");
  const newsletterMessage = getFormMessage(
    newsletterForm,
    "newsletter-message",
  );

  newsletterForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!/^\S+@\S+\.\S+$/.test(newsletterEmail.value.trim())) {
      showFormMessage(
        newsletterMessage,
        "Введіть коректну електронну адресу.",
        true,
      );
      return;
    }

    showFormMessage(
      newsletterMessage,
      "Дякуємо! Ви підписались на розсилку.",
      false,
    );
    newsletterForm.reset();
  });
}

const contactForm = document.getElementById("contactForm");

if (contactForm) {
  const contactMessage = getFormMessage(contactForm, "contact-message");
  const contactFields = contactForm.querySelectorAll(
    "input:not([type=hidden]):not([type=submit]):not([type=checkbox]), textarea, select",
  );

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    let hasEmpty = false;
    contactFields.forEach((field) => {
      const empty = field.value.trim() === "";
      field.classList.toggle("is-invalid", empty);
      if (empty) hasEmpty = true;
    });

    if (hasEmpty) {
      showFormMessage(contactMessage, "Помилка: заповніть усі поля.", true);
      return;
    }

    const emailField = contactForm.querySelector("input[type=email]");
    if (emailField && !/^\S+@\S+\.\S+$/.test(emailField.value.trim())) {
      emailField.classList.add("is-invalid");
      showFormMessage(
        contactMessage,
        "Помилка: введіть коректну електронну пошту.",
        true,
      );
      return;
    }

    showFormMessage(contactMessage, "Повідомлення надіслано!", false);
    contactForm.reset();
  });
}
renderCart();
