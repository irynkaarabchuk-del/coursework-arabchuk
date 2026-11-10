// пошук в мобільній версії
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

iconBlock.addEventListener('click', () => {
    iconOpen.classList.toggle('d-none')
    iconClose.classList.toggle('d-none')
    mainMenu.classList.toggle('menu-open')
})


const exploreBtn = document.getElementById('exploreBtn');
const modalOverlay = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');

exploreBtn?.addEventListener('click', () => {
    modalOverlay.classList.add('active');
});

modalClose.addEventListener('click', () => {
    modalOverlay.classList.remove('active');
});

modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
        modalOverlay.classList.remove('active');
    }
});
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
    img: "assets/images/girl.jpg",
    text: "Замовляю в Organick вже пів року. Овочі завжди свіжі, доставка швидка, а смак як з бабусиного городу. Дуже рекомендую!",
  },
  {
    name: "Олена Коваль",
    role: "Постійна клієнтка",
    img: "assets/images/olena.jpg",
    text: "Нарешті знайшла місце, де справді органічні продукти. Яйця й овочі смакують як з села, а доставка завжди вчасно.",
  },
  {
    name: "Андрій Мельник",
    role: "Власник кафе",
    img: "assets/images/andrew.jpg",
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

  // підсвічуємо тільки той кружечок, на який натиснули
  for (let i = 0; i < reviewDots.length; i++) {
    reviewDots[i].classList.toggle("active", i === index);
  }
}

// працює тільки там, де є блок відгуків (головна сторінка)
if (reviewImg && reviewDots.length) {
  for (let i = 0; i < reviewDots.length; i++) {
    reviewDots[i].addEventListener("click", function () {
      showReview(i);
    });
  }
}
// Магазин

// адреса, звідки беремо товари
const PRODUCTS_URL = "assets/data/products.json";

// асинхронно завантажуємо список товарів
async function loadProducts() {
  let response = await fetch(PRODUCTS_URL);

  if (!response.ok) {
    throw new Error("Сервер відповів з помилкою " + response.status);
  }

  return await response.json();
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

// Сторінка одного товару
function showProduct(product, products) {
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

  // схожі товари: спочатку з тієї ж категорії, потім решта
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
        // якщо id немає, показуємо перший товар
        product = products[0];
      } else {
        let id = params.get("id");
        for (let i = 0; i < products.length; i++) {
          if (products[i].id === id) {
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

  // вкладки «Опис товару» і «Додаткова інформація»
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
// Головна сторінка: товари в блоці «Наші продукти»
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
let cartText = document.querySelector(".cart-box span");
let cartCount = Number(localStorage.getItem("cartCount")) || 0;

function showCartCount() {
  if (cartText) {
    cartText.textContent = "Кошик (" + cartCount + ")";
  }
}

showCartCount();

let addToCartButton = document.querySelector(".single-cart-btn");

if (addToCartButton) {
  addToCartButton.addEventListener("click", function () {
    let qty = Number(document.getElementById("qty").value);

    if (qty < 1) {
      qty = 1;
    }

    cartCount = cartCount + qty;
    localStorage.setItem("cartCount", cartCount);
    showCartCount();
  });
}