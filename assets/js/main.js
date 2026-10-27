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

//  Магазин: пошук, фільтр, сортування
let shopCategory = document.getElementById("shopCategory");

if (shopCategory) {
  let grid = document.querySelector(".shop-products .products");
  let searchInput = document.getElementById("headerSearch");
  let sortSelect = document.getElementById("shopSort");
  let resetButton = document.getElementById("shopReset");
  let emptyMessage = document.getElementById("shopEmpty");

  let cards = Array.from(grid.children);

  function getName(card) {
    return card.querySelector("h3").textContent;
  }

  function getCategory(card) {
    return card.querySelector(".badge").textContent;
  }

  function getPrice(card) {
    let text = card.querySelector(".new-price").textContent;
    return parseFloat(text.replace("$", ""));
  }

  function fillCategories() {
    let names = [];
    for (let i = 0; i < cards.length; i++) {
      let name = getCategory(cards[i]);
      if (!names.includes(name)) {
        names.push(name);
      }
    }
    for (let i = 0; i < names.length; i++) {
      let option = document.createElement("option");
      option.value = names[i];
      option.textContent = names[i];
      shopCategory.appendChild(option);
    }
  }

  function sortCards() {
    let sorted = cards.slice();
    let mode = sortSelect.value;

    if (mode === "price-asc") {
      sorted.sort(function (a, b) { return getPrice(a) - getPrice(b); });
    } else if (mode === "price-desc") {
      sorted.sort(function (a, b) { return getPrice(b) - getPrice(a); });
    } else if (mode === "name-asc") {
      sorted.sort(function (a, b) { return getName(a).localeCompare(getName(b), "uk"); });
    } else if (mode === "name-desc") {
      sorted.sort(function (a, b) { return getName(b).localeCompare(getName(a), "uk"); });
    }

    for (let i = 0; i < sorted.length; i++) {
      grid.appendChild(sorted[i]);
    }
  }

  function update() {
    let text = searchInput.value.toLowerCase();
    let category = shopCategory.value;
    let found = 0;

    for (let i = 0; i < cards.length; i++) {
      let card = cards[i];
      let nameOk = getName(card).toLowerCase().includes(text);
      let categoryOk = category === "" || getCategory(card) === category;

      if (nameOk && categoryOk) {
        card.hidden = false;
        found = found + 1;
      } else {
        card.hidden = true;
      }
    }

    sortCards();
    if (emptyMessage) {
  emptyMessage.hidden = found > 0;
}
  }

  searchInput.addEventListener("input", update);
  shopCategory.addEventListener("change", update);
  sortSelect.addEventListener("change", update);

  searchInput.form.addEventListener("submit", function (event) {
    event.preventDefault();
  });

 if (resetButton) {
  resetButton.addEventListener("click", function () {
    searchInput.value = "";
    shopCategory.value = "";
    sortSelect.value = "default";
    update();
  });
}

  let params = new URLSearchParams(window.location.search);
  searchInput.value = params.get("search") || "";

  fillCategories();
  update();
}

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

let PRODUCTS = [
  {
    id: 1,
    category: "Овочі",
    img: "assets/images/brocoli1.png",
    name: "Броколі калабрезе",
    oldPrice: 20,
    price: 13,
    weight: "500 г",
    shelf: "7 днів",
    short: "Свіжа броколі з органічних господарств. Соковита, хрустка та повна вітамінів.",
    long: "Броколі калабрезе вирощується без хімічних добрив і пестицидів. Багата на вітамін C, клітковину та антиоксиданти. Чудово підходить для супів, салатів, запікання та гарнірів.",
  },
  {
    id: 2,
    category: "Свіже",
    img: "assets/images/bananes.png",
    name: "Свіжі банани",
    oldPrice: 20,
    price: 14,
    weight: "1 кг",
    shelf: "5 днів",
    short: "Солодкі стиглі банани — натуральне джерело енергії протягом дня.",
    long: "Наші банани ретельно відбираються за якістю та стиглістю. Містять калій і природні цукри, ідеально підходять для перекусу, смузі та випічки.",
  },
  {
    id: 3,
    category: "Крупи",
    img: "assets/images/nuts.png",
    name: "Білі горіхи",
    oldPrice: 20,
    price: 15,
    weight: "500 г",
    shelf: "12 місяців",
    short: "Натуральні білі горіхи без добавок і консервантів.",
    long: "Білі горіхи багаті на білок, корисні жири та мінерали. Підходять як самостійний перекус, до каш, десертів і випічки.",
  },
  {
    id: 4,
    category: "Овочі",
    img: "assets/images/tomato.png",
    name: "Веганський червоний томат",
    oldPrice: 20,
    price: 17,
    weight: "1 кг",
    shelf: "7 днів",
    short: "Соковиті червоні томати з насиченим смаком, вирощені природним способом.",
    long: "Томати дозрівають на сонці та збираються вручну. Містять лікопін і вітаміни, чудово підходять для салатів, соусів і консервації.",
  },
  {
    id: 5,
    category: "Здоровʼя",
    img: "assets/images/bean.png",
    name: "Боби мунг",
    oldPrice: 20,
    price: 11,
    weight: "500 г",
    shelf: "12 місяців",
    short: "Корисні боби мунг — джерело рослинного білка та клітковини.",
    long: "Боби мунг легко засвоюються та швидко готуються. Підходять для супів, каш, салатів і пророщування.",
  },
  {
    id: 6,
    category: "Горіхи",
    img: "assets/images/hazelnut.png",
    name: "Коричневий фундук",
    oldPrice: 20,
    price: 12,
    weight: "500 г",
    shelf: "12 місяців",
    short: "Ароматний фундук із насиченим горіховим смаком.",
    long: "Фундук містить вітамін E, магній і корисні жири. Його можна їсти сирим, підсмаженим або додавати до десертів і шоколаду.",
  },
  {
    id: 7,
    category: "Свіже",
    img: "assets/images/agges.png",
    name: "Яйця",
    oldPrice: 20,
    price: 17,
    weight: "10 шт.",
    shelf: "25 днів",
    short: "Свіжі яйця від курей вільного вигулу з перевірених ферм.",
    long: "Яйця надходять просто з ферми та проходять контроль якості. Джерело білка та вітамінів групи B, підходять для сніданків і випічки.",
  },
  {
    id: 8,
    category: "Свіже",
    img: "assets/images/bread.png",
    name: "Сухарики Zelco Suji Elaichi",
    oldPrice: 20,
    price: 15,
    weight: "300 г",
    shelf: "6 місяців",
    short: "Хрусткі сухарики з легким ароматом кардамону.",
    long: "Випікаються з якісного борошна з додаванням натуральних спецій. Чудово поєднуються з чаєм, кавою або молоком.",
  },
  {
    id: 9,
    category: "Здоровʼя",
    img: "assets/images/shop/bean.png",
    name: "Цукіні",
    oldPrice: 20,
    price: 11,
    weight: "1 кг",
    shelf: "10 днів",
    short: "Ніжні молоді цукіні з органічних грядок.",
    long: "Цукіні низькокалорійні та багаті на воду й клітковину. Відмінно підходять для смаження, запікання, рагу та оладок.",
  },
  {
    id: 10,
    category: "Горіхи",
    img: "assets/images/shop/hazelnut.png",
    name: "Горіхи кеш'ю",
    oldPrice: 20,
    price: 12,
    weight: "500 г",
    shelf: "12 місяців",
    short: "Вершкові горіхи кеш'ю з ніжним солодкуватим смаком.",
    long: "Кеш'ю містять магній, цинк і корисні жири. Підходять для перекусу, соусів, веганських десертів і страв азійської кухні.",
  },
  {
    id: 11,
    category: "Свіже",
    img: "assets/images/shop/corn.png",
    name: "Свіжа кукурудза",
    oldPrice: 20,
    price: 17,
    weight: "4 шт.",
    shelf: "5 днів",
    short: "Солодка молода кукурудза просто з поля.",
    long: "Качани збираються у період молочної стиглості, тому зерна соковиті й солодкі. Можна варити, запікати на грилі або додавати до салатів.",
  },
  {
    id: 12,
    category: "Горіхи",
    img: "assets/images/shop/almonds.png",
    name: "Органічний мигдаль",
    oldPrice: 20,
    price: 15,
    weight: "500 г",
    shelf: "12 місяців",
    short: "Органічний мигдаль без обробки та добавок.",
    long: "Мигдаль багатий на вітамін E, кальцій і білок. Підходить для перекусу, випічки, домашнього мигдального молока та пасти.",
  },
];

function formatPrice(value) {
  return "$" + value.toFixed(2);
}

// шукаємо товар за id
function findProductById(id) {
  for (let i = 0; i < PRODUCTS.length; i++) {
    if (PRODUCTS[i].id === id) {
      return PRODUCTS[i];
    }
  }
  return null;
}

// шукаємо товар за назвою
function findProductByName(name) {
  for (let i = 0; i < PRODUCTS.length; i++) {
    if (PRODUCTS[i].name === name) {
      return PRODUCTS[i];
    }
  }
  return null;
}

//  робимо картки клікабельними
function linkShopCards() {
  let cards = document.querySelectorAll(".shop-products .product-card");

  for (let i = 0; i < cards.length; i++) {
    let card = cards[i];
    let title = card.querySelector("h3");
    let product = findProductByName(title.textContent.trim());

    if (product === null) {
      continue;
    }

    // робимо з назви посилання на сторінку товару
    let link = document.createElement("a");
    link.className = "product-card-link";
    link.href = "shopSingle.html?id=" + product.id;
    link.textContent = product.name;
    title.textContent = "";
    title.appendChild(link);

    // клік по будь-якому місцю картки теж відкриває товар
    card.addEventListener("click", function (event) {
      if (event.target.closest("a")) {
        return;
      }
      window.location.href = link.href;
    });
  }
}

function createProductCard(product) {
  let card = document.createElement("article");
  card.className = "product-card";

  card.innerHTML =
    '<span class="badge">' + product.category + "</span>" +
    '<img src="' + product.img + '" alt="' + product.name + '" />' +
    '<div class="product-info">' +
    '<h3><a class="product-card-link" href="shopSingle.html?id=' + product.id + '">' + product.name + "</a></h3>" +
    '<div class="product-bottom">' +
    '<div class="prices">' +
    '<span class="old-price">' + formatPrice(product.oldPrice) + "</span>" +
    '<span class="new-price">' + formatPrice(product.price) + "</span>" +
    "</div>" +
    '<div class="rating"><span></span><span></span><span></span><span></span><span></span></div>' +
    "</div>" +
    "</div>";

  card.addEventListener("click", function (event) {
    if (event.target.closest("a")) {
      return;
    }
    window.location.href = "shopSingle.html?id=" + product.id;
  });

  return card;
}

function initProductPage() {
  let params = new URLSearchParams(window.location.search);
  let id = Number(params.get("id"));
  let product = findProductById(id);

  // якщо id немає, показуємо перший товар
  if (params.get("id") === null) {
    product = PRODUCTS[0];
  }

  // якщо такого товару немає, відкриваємо 404
  if (product === null) {
    window.location.href = "404.html";
    return;
  }

  // підставляємо дані товару на сторінку
  document.title = product.name + " — Organick";
  document.getElementById("pImage").src = product.img;
  document.getElementById("pImage").alt = product.name;
  document.getElementById("pBadge").textContent = product.category;
  document.getElementById("pName").textContent = product.name;
  document.getElementById("pOld").textContent = formatPrice(product.oldPrice);
  document.getElementById("pNew").textContent = formatPrice(product.price);
  document.getElementById("pShort").textContent = product.short;
  document.getElementById("pLong").textContent = product.long;
  document.getElementById("pWeight").textContent = product.weight;
  document.getElementById("pOrigin").textContent = "Україна";
  document.getElementById("pCategory").textContent = product.category;
  document.getElementById("pShelf").textContent = product.shelf;

  let related = [];

  for (let i = 0; i < PRODUCTS.length; i++) {
    if (PRODUCTS[i].id !== product.id && PRODUCTS[i].category === product.category) {
      related.push(PRODUCTS[i]);
    }
  }
  for (let i = 0; i < PRODUCTS.length; i++) {
    if (PRODUCTS[i].id !== product.id && PRODUCTS[i].category !== product.category) {
      related.push(PRODUCTS[i]);
    }
  }

  let relatedBox = document.getElementById("relatedProducts");
  relatedBox.innerHTML = "";

  for (let i = 0; i < 4; i++) {
    relatedBox.appendChild(createProductCard(related[i]));
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
}

if (document.querySelector(".shop-products .product-card")) {
  linkShopCards();
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