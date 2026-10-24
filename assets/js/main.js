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