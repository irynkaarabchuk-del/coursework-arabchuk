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

const iconBlock = document.getElementById('iconBlock');
const iconOpen = document.getElementById('iconOpen');
const iconClose = document.getElementById('iconClose');
const mainMenu = document.getElementById('mainMenu');

if (iconBlock) {
  iconBlock.addEventListener('click', () => {
    iconOpen.classList.toggle('d-none');
    iconClose.classList.toggle('d-none');
    mainMenu.classList.toggle('menu-open');
  });
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { }, { threshold: 0, rootMargin: '0px 0px -50px 0px'  });

document.querySelectorAll(
  '.about, .products-section, .testimonial, .offer, .about-us, .galery, .blog, .newsletter, footer'
).forEach(el => {
  el.classList.add('animate');
  observer.observe(el);
});


// відгуки
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

let reviewImg = document.getElementById("reviewImg");
let reviewText = document.getElementById("reviewText");
let reviewName = document.getElementById("reviewName");
let reviewRole = document.getElementById("reviewRole");
let reviewDots = document.querySelectorAll(".testimonial-page");

function showReview(index) {
  let review = reviews[index];

  reviewImg.src = review.img;
  reviewImg.alt = review.name;
  reviewText.textContent = review.text;
  reviewName.textContent = review.name;
  reviewRole.textContent = review.role;

  for (let i = 0; i < reviewDots.length; i++) {
    reviewDots[i].classList.toggle("active", i === index);
  }
}

if (reviewImg && reviewDots.length) {
  for (let i = 0; i < reviewDots.length; i++) {
    reviewDots[i].addEventListener("click", function () {
      showReview(i);
    });
  }
}
// Магазин

// завантажуємо товари з бази даних
async function loadProducts() {
  let module = await import("./app.js");
  let db = module.db;

   let result = await db
    .from("products")
    .select("id, name, price, old_price, image_url, description, details, weight, origin, shelf_life, categories(name)")
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
      category: item.categories.name,
      price: Number(item.price),
      oldPrice: Number(item.old_price),
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

// будуємо картку товару з обʼєкта даних
function createProductCard(product) {
  let url = "shopSingle.html?id=" + product.id;

  let card = createElement("article", "product-card");
  let badge = createElement("span", "badge", product.category);

  let image = document.createElement("img");
  image.src = product.image;
  image.alt = product.name;

  let info = createElement("div", "product-info");
  let title = document.createElement("h3");
  let link = createElement("a", "product-card-link", product.name);
  link.href = url;
  title.appendChild(link);

  let bottom = createElement("div", "product-bottom");
  let prices = createElement("div", "prices");
  prices.appendChild(createElement("span", "old-price", formatPrice(product.oldPrice)));
  prices.appendChild(createElement("span", "new-price", formatPrice(product.price)));

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
  box.textContent = "Не вдалося завантажити товари. Перевірте зʼєднання з інтернетом.";

  let button = createElement("button", "shop-toolbar-reset", "Спробувати ще раз");
  button.type = "button";
  button.addEventListener("click", retry);

  box.appendChild(document.createElement("br"));
  box.appendChild(button);
  box.hidden = false;
}

// Каталог: завантаження, пошук, фільтр, сортування
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
      visible.sort(function (a, b) { return a.price - b.price; });
    } else if (mode === "price-desc") {
      visible.sort(function (a, b) { return b.price - a.price; });
    } else if (mode === "name-asc") {
      visible.sort(function (a, b) { return a.name.localeCompare(b.name, "uk"); });
    } else if (mode === "name-desc") {
      visible.sort(function (a, b) { return b.name.localeCompare(a.name, "uk"); });
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
  document.getElementById("pOld").textContent = formatPrice(product.oldPrice);
  document.getElementById("pNew").textContent = formatPrice(product.price);
  document.getElementById("pShort").textContent = product.description;
  document.getElementById("pLong").textContent = product.details;
  document.getElementById("pWeight").textContent = product.weight;
  document.getElementById("pOrigin").textContent = product.origin;
  document.getElementById("pCategory").textContent = product.category;
  document.getElementById("pShelf").textContent = product.shelfLife;

  // схожі товари
  let related = [];
  for (let i = 0; i < products.length; i++) {
    if (products[i].id !== product.id && products[i].category === product.category) {
      related.push(products[i]);
    }
  }
  for (let i = 0; i < products.length; i++) {
    if (products[i].id !== product.id && products[i].category !== product.category) {
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
      document.getElementById("tab-" + tabButtons[i].dataset.tab).classList.add("active");
    });
  }

  let qty = document.getElementById("qty");
  qty.addEventListener("change", function () {
    if (qty.value === "" || Number(qty.value) < 1) {
      qty.value = 1;
    }
  });

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

// Кошик
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
  const existing = cartItems.find((item) => String(item.id) === String(product.id));
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
    <button type="button" class="modal-btn" id="cartClear">Очистити кошик</button>
  </div>`;
document.body.append(cartOverlay);

const cartList = document.getElementById("cartList");
const cartTotalBox = document.getElementById("cartTotal");
const cartClearBtn = document.getElementById("cartClear");
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
        item.qty + " × " + formatPrice(item.price) + " = " + formatPrice(item.qty * item.price)
      )
    );
    li.append(info);

    const removeBtn = createElement("button", "cart-remove", "Видалити");
    removeBtn.type = "button";
    removeBtn.addEventListener("click", () => {
      cartItems = cartItems.filter((other) => String(other.id) !== String(item.id));
      saveCart();
      renderCart();
    });
    li.append(removeBtn);

    cartList.append(li);
  }

  cartTotalBox.textContent = "Разом: " + formatPrice(getCartTotal());
  cartTotalBox.hidden = cartItems.length === 0;
  cartClearBtn.hidden = cartItems.length === 0;

  if (cartText) {
    cartText.textContent = "Кошик (" + getCartCount() + ")";
  }
}

function openCart() {
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

document.querySelector(".single-cart-btn")?.addEventListener("click", (event) => {
  if (!currentProduct) return;

  let qty = Number(document.getElementById("qty").value);
  if (!qty || qty < 1) qty = 1;

  addToCart(currentProduct, qty);

  const button = event.currentTarget;
  const oldText = button.textContent;
  button.textContent = "Додано";
  setTimeout(() => {
    button.textContent = oldText;
  }, 1200);
});

renderCart();