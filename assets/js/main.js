const API_URL = "http://localhost:3002";

// пошук в мобільній версії
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

// завантажуємо товари з бази даних
async function loadProducts() {
  // підключення до Supabase лежить в окремому файлі
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

// Сторінка одного товару
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

// Авторизація: вхід і реєстрація
(async function () {
  const { db } = await import("./app.js");
  let mode = "login";
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.id = "authOverlay";
  overlay.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="authTitle">
      <button type="button" class="modal-close" id="authClose" aria-label="Закрити">
        <i class="fa-solid fa-xmark"></i>
      </button>
      <h2 class="modal-title" id="authTitle">Увійти</h2>
      <p class="modal-subtitle">Ласкаво просимо до магазину Organick</p>
      <form class="modal-form" id="authForm" novalidate>
        <div class="modal-field">
          <label for="authEmail">Електронна пошта</label>
          <input id="authEmail" type="email" autocomplete="email" placeholder="Введіть вашу пошту" />
        </div>
        <div class="modal-field">
          <label for="authPassword">Пароль</label>
          <input id="authPassword" type="password" autocomplete="current-password" placeholder="Введіть ваш пароль" />
        </div>
        <div class="modal-field" id="authRepeatField" hidden>
          <label for="authRepeat">Повторіть пароль</label>
          <input id="authRepeat" type="password" autocomplete="off" placeholder="Повторіть пароль" />
        </div>
        <p class="modal-message" id="authMessage" role="status" aria-live="polite"></p>
        <button type="submit" class="modal-btn" id="authSubmit">Увійти</button>
      </form>
      <p class="modal-register">
        <span id="authSwitchText">Немає акаунту?</span>
        <a href="#" id="authSwitch">Зареєструйтесь</a>
      </p>
    </div>`;
  document.body.prepend(overlay);

  const $ = (id) => document.getElementById(id);
  const form = $("authForm");
  const emailInput = $("authEmail");
  const passInput = $("authPassword");
  const repeatInput = $("authRepeat");
  const repeatField = $("authRepeatField");
  const message = $("authMessage");
  const submitBtn = $("authSubmit");


  // іконка в шапці
  const authBtn = document.createElement("button");
  authBtn.type = "button";
  authBtn.className = "auth-btn";
  authBtn.id = "authBtn";
  authBtn.setAttribute("aria-label", "Увійти");
  authBtn.innerHTML = '<i class="fa-solid fa-user" aria-hidden="true"></i>';
  (document.querySelector(".top-panel") || document.querySelector(".navbar")).append(authBtn);

  function setMessage(text, isError = false) {
    message.textContent = text;
    message.classList.toggle("is-error", isError);
  }

  function setMode(newMode) {
    mode = newMode;
    const isLogin = mode === "login";
    $("authTitle").textContent = isLogin ? "Увійти" : "Реєстрація";
    submitBtn.textContent = isLogin ? "Увійти" : "Зареєструватися";
    repeatField.hidden = isLogin;
    passInput.autocomplete = "current-password";
    $("authSwitchText").textContent = isLogin ? "Немає акаунту?" : "Вже є акаунт?";
    $("authSwitch").textContent = isLogin ? "Зареєструйтесь" : "Увійдіть";
    setMessage("");
  }

  function openModal() {
    form.reset();
    setMode("login");
    overlay.classList.add("active");
    emailInput.focus();
  }

  function closeModal() {
    overlay.classList.remove("active");
  }

  function errorText(err) {
    const m = (err.message || "").toLowerCase();
    if (m.includes("invalid login")) return "Невірна пошта або пароль.";
    if (m.includes("already registered")) return "Користувач з такою поштою вже існує.";
    if (m.includes("email not confirmed")) return "Підтвердіть пошту за листом.";
    if (m.includes("rate limit")) return "Забагато спроб. Спробуйте пізніше.";
    if (m.includes("password")) return "Пароль має містити щонайменше 6 символів.";
    return "Сталася помилка. Спробуйте ще раз.";
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    const password = passInput.value;

    if (!/^\S+@\S+\.\S+$/.test(email)) return setMessage("Введіть коректну пошту.", true);
    if (password.length < 8) return setMessage("Пароль має містити щонайменше 8 символів.", true);
    if (mode === "register" && password !== repeatInput.value) {
      return setMessage("Паролі не збігаються.", true);
    }

    submitBtn.disabled = true;
    setMessage(mode === "login" ? "Вхід..." : "Реєстрація...");

    try {
      if (mode === "login") {
        const { error } = await db.auth.signInWithPassword({ email, password });
        if (error) throw error;
        closeModal();
      } else {
        const { data, error } = await db.auth.signUp({ email, password });
        if (error) throw error;
        if (data.session) {
          closeModal();
        } else {
          setMessage("Акаунт створено. Перевірте пошту, щоб підтвердити реєстрацію.");
        }
      }
    } catch (err) {
      console.error("Помилка авторизації:", err);
      setMessage(errorText(err), true);
    } finally {
      submitBtn.disabled = false;
    }
  });

  $("authSwitch").addEventListener("click", (e) => {
    e.preventDefault();
    setMode(mode === "login" ? "register" : "login");
  });

  $("authClose").addEventListener("click", closeModal);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  // кнопка в шапці: увійти або вийти
  let loggedIn = false;
  authBtn.addEventListener("click", async () => {
    if (!loggedIn) return openModal();
    const { error } = await db.auth.signOut();
    if (error) console.error("Помилка виходу:", error);
  });

   function updateHeader(session) {
    loggedIn = Boolean(session);
    const icon = authBtn.querySelector("i");
    icon.className = loggedIn ? "fa-solid fa-right-from-bracket" : "fa-solid fa-user";
    authBtn.setAttribute("aria-label", loggedIn ? "Вийти" : "Увійти");
    authBtn.title = loggedIn ? "Вийти (" + session.user.email + ")" : "Увійти";
  }
   // посилання на адмін-панель у меню бачить тільки адмін
  async function updateAdminLink(session) {
    let isAdmin = false;

    if (session) {
      const { data, error } = await db
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .maybeSingle();

      if (error) console.error("Помилка перевірки ролі:", error);
      isAdmin = Boolean(data && data.role === "admin");
    }

    const menu = document.getElementById("mainMenu");
    let link = document.getElementById("adminLink");

    if (isAdmin && !link && menu) {
      link = document.createElement("li");
      link.id = "adminLink";
      link.innerHTML = '<a href="admin.html">Адмін-панель</a>';
      menu.appendChild(link);
    }

    if (!isAdmin && link) {
      link.remove();
    }
  }

  db.auth.getSession().then(({ data }) => updateHeader(data.session));
  db.auth.onAuthStateChange((_event, session) => {
    updateHeader(session);
    updateAdminLink(session);
  });

})();

// Адмін-панель 
async function initAdminPage() {
  const { db } = await import("./app.js");

  const statusBox = document.getElementById("adminStatus");
  const panel = document.getElementById("adminPanel");
  const form = document.getElementById("productForm");
  const formTitle = document.getElementById("formTitle");
  const message = document.getElementById("formMessage");
  const saveBtn = document.getElementById("saveBtn");
  const cancelBtn = document.getElementById("cancelBtn");
  const rows = document.getElementById("productRows");
  const countBox = document.getElementById("productCount");
  const categorySelect = document.getElementById("fCategory");

  let adminProducts = [];

  function setMessage(text, isError = false) {
    message.textContent = text;
    message.classList.toggle("is-error", isError);
  }

  // повідомлення замість панелі 
  function showStatus(text, withLoginButton = false) {
    panel.hidden = true;
    statusBox.hidden = false;
    statusBox.textContent = text;

    if (withLoginButton) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "admin-btn";
      button.textContent = "Увійти";
      // кнопка входу в шапці відкриває вікно авторизації
      button.addEventListener("click", () => document.getElementById("authBtn")?.click());
      statusBox.appendChild(button);
    }
  }

  //пускаємо тільки залогіненого користувача з роллю admin
  async function checkAccess(session) {
    if (!session) {
      showStatus("Адмін-панель доступна лише після входу.", true);
      return;
    }

    showStatus("Перевірка доступу…");

    const { data, error } = await db
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .maybeSingle();

    if (error) {
      console.error("Помилка перевірки прав:", error);
      showStatus("Не вдалося перевірити права доступу. Спробуйте оновити сторінку.");
      return;
    }

    if (!data || data.role !== "admin") {
      showStatus("У вас немає прав адміністратора.");
      return;
    }

    statusBox.hidden = true;
    panel.hidden = false;
    await loadCategories();
    await loadAdminProducts();
  }

  async function loadCategories() {
    const { data, error } = await db.from("categories").select("id, name").order("name");

    if (error) {
      console.error("Помилка завантаження категорій:", error);
      setMessage("Не вдалося завантажити категорії.", true);
      return;
    }

    categorySelect.innerHTML = "";
    for (const category of data) {
      const option = document.createElement("option");
      option.value = category.id;
      option.textContent = category.name;
      categorySelect.appendChild(option);
    }
  }

  async function loadAdminProducts() {
    rows.innerHTML = '<tr><td colspan="5">Завантаження…</td></tr>';

    const { data, error } = await db
      .from("products")
      .select("id, name, price, old_price, image_url, description, details, weight, origin, shelf_life, category_id, categories(name)")
      .order("name");

    if (error) {
      console.error("Помилка завантаження товарів:", error);
      rows.innerHTML = '<tr><td colspan="5">Не вдалося завантажити товари.</td></tr>';
      return;
    }

    adminProducts = data;
    renderRows();
  }

  function renderRows() {
 const visible = adminProducts;

    countBox.textContent = adminProducts.length;
    rows.innerHTML = "";

    if (visible.length === 0) {
      rows.innerHTML = '<tr><td colspan="5">Нічого не знайдено.</td></tr>';
      return;
    }

    for (const product of visible) {
      const tr = document.createElement("tr");

      const imageCell = document.createElement("td");
      const image = document.createElement("img");
      image.src = product.image_url || "";
      image.alt = product.name;
      imageCell.appendChild(image);

      const nameCell = document.createElement("td");
      nameCell.textContent = product.name;

      const categoryCell = document.createElement("td");
      categoryCell.textContent = product.categories ? product.categories.name : "—";

      const priceCell = document.createElement("td");
      priceCell.textContent = "$" + Number(product.price).toFixed(2);

      const actionsCell = document.createElement("td");

      const editBtn = document.createElement("button");
      editBtn.type = "button";
      editBtn.className = "admin-btn admin-btn-light";
      editBtn.textContent = "Редагувати";
      editBtn.addEventListener("click", () => startEdit(product));

      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.className = "admin-btn admin-btn-danger";
      deleteBtn.textContent = "Видалити";
      deleteBtn.addEventListener("click", () => deleteProduct(product));

      actionsCell.append(editBtn, deleteBtn);
      tr.append(imageCell, nameCell, categoryCell, priceCell, actionsCell);
      rows.appendChild(tr);
    }
  }

  // заповнюємо форму даними товару для редагування
  function startEdit(product) {
    document.getElementById("productId").value = product.id;
    document.getElementById("fName").value = product.name;
    categorySelect.value = product.category_id;
    document.getElementById("fPrice").value = product.price;
    document.getElementById("fOldPrice").value = product.old_price ?? "";
    document.getElementById("fImage").value = product.image_url ?? "";
    document.getElementById("fDescription").value = product.description ?? "";
    document.getElementById("fDetails").value = product.details ?? "";
    document.getElementById("fWeight").value = product.weight ?? "";
    document.getElementById("fOrigin").value = product.origin ?? "";
    document.getElementById("fShelf").value = product.shelf_life ?? "";

    formTitle.textContent = "Редагування товару";
    saveBtn.textContent = "Зберегти зміни";
    cancelBtn.hidden = false;
    setMessage("");
    form.scrollIntoView({ behavior: "smooth" });
  }

  function resetForm() {
    form.reset();
    document.getElementById("productId").value = "";
    formTitle.textContent = "Новий товар";
    saveBtn.textContent = "Додати товар";
    cancelBtn.hidden = true;
  }

  // збираємо дані з форми в обʼєкт для бази
  function readForm() {
    const value = (id) => document.getElementById(id).value.trim();
    const oldPrice = value("fOldPrice");

    return {
      name: value("fName"),
      category_id: Number(categorySelect.value),
      price: Number(value("fPrice")),
      old_price: oldPrice === "" ? null : Number(oldPrice),
      image_url: value("fImage") || null,
      description: value("fDescription") || null,
      details: value("fDetails") || null,
      weight: value("fWeight") || null,
      origin: value("fOrigin") || null,
      shelf_life: value("fShelf") || null,
    };
  }
  async function adminRequest(method, path, body) {
    const { data } = await db.auth.getSession();
    const token = data.session?.access_token;

    const response = await fetch(API_URL + path, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || "Помилка сервера.");
    return result;
  }
  
  // CREATE і UPDATE
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const product = readForm();
    const id = document.getElementById("productId").value;

    if (product.name === "") return setMessage("Введіть назву товару.", true);
    if (document.getElementById("fPrice").value === "" || product.price < 0) {
      return setMessage("Введіть коректну ціну.", true);
    }
    if (!product.category_id) return setMessage("Оберіть категорію.", true);

    saveBtn.disabled = true;
    setMessage("Збереження…");

        try {
      if (id) {
        await adminRequest("PUT", "/api/products/" + id, product);
      } else {
        await adminRequest("POST", "/api/products", product);
      }

      setMessage(id ? "Зміни збережено." : "Товар додано.");
      resetForm();
      await loadAdminProducts();
    } catch (error) {
      console.error("Помилка збереження:", error);
      setMessage("Не вдалося зберегти товар: " + error.message, true);
    } finally {
      saveBtn.disabled = false;
    }
  });

  // DELETE
    async function deleteProduct(product) {
    if (!confirm("Видалити товар «" + product.name + "»?")) return;

    try {
      await adminRequest("DELETE", "/api/products/" + product.id);
      setMessage("Товар видалено.");
      if (document.getElementById("productId").value == product.id) resetForm();
      await loadAdminProducts();
    } catch (error) {
      console.error("Помилка видалення:", error);
      setMessage("Не вдалося видалити товар: " + error.message, true);
    }
  }


  // перевіряємо доступ при відкритті сторінки, вході та виході
  db.auth.onAuthStateChange((event, session) => {
    if (event === "INITIAL_SESSION" || event === "SIGNED_IN" || event === "SIGNED_OUT") {
      setTimeout(() => checkAccess(session), 0);
    }
  });
}

if (document.getElementById("adminPanel")) {
  initAdminPage();
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

  // коротке підтвердження на кнопці, бо кошик тепер не відкривається
  const button = event.currentTarget;
  const oldText = button.textContent;
  button.textContent = "Додано";
  setTimeout(() => {
    button.textContent = oldText;
  }, 1200);
});

renderCart();