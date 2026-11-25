import { db } from "./app.js";
const API_URL = "http://localhost:3002";

function initAdminPage() {

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
 
  function showStatus(text, withLoginButton = false) {
    panel.hidden = true;
    statusBox.hidden = false;
    statusBox.textContent = text;

    if (withLoginButton) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "admin-btn";
      button.textContent = "Увійти";
      button.addEventListener("click", () => document.getElementById("authBtn")?.click());
      statusBox.appendChild(button);
    }
  }

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

  db.auth.onAuthStateChange((event, session) => {
    if (event === "INITIAL_SESSION" || event === "SIGNED_IN" || event === "SIGNED_OUT") {
      setTimeout(() => checkAccess(session), 0);
    }
  });
}

if (document.getElementById("adminPanel")) {
  initAdminPage();
}