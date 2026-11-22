const supabase = require("../data/config");

// перевірка, що запит надіслав залогінений адмін
async function requireAdmin(req, res, next) {
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Потрібен вхід." });

  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData.user) {
    return res.status(401).json({ error: "Недійсний токен." });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (profileError || !profile || profile.role !== "admin") {
    return res.status(403).json({ error: "Немає прав адміністратора." });
  }

  req.user = userData.user;
  next();
}

function readProduct(body) {
  const text = (value) => {
    const s = String(value ?? "").trim();
    return s === "" ? null : s;
  };

  const name = String(body.name || "").trim();
  const price = Number(body.price);
  const categoryId = Number(body.category_id);
  const oldRaw = body.old_price;
  const oldPrice = oldRaw === null || oldRaw === undefined || oldRaw === "" ? null : Number(oldRaw);

  if (name.length < 1 || name.length > 150) return { error: "Введіть назву (до 150 символів)." };
  if (!Number.isFinite(price) || price < 0) return { error: "Некоректна ціна." };
  if (!Number.isInteger(categoryId)) return { error: "Оберіть категорію." };
  if (oldPrice !== null && (!Number.isFinite(oldPrice) || oldPrice < 0)) {
    return { error: "Некоректна стара ціна." };
  }

  return {
    product: {
      name,
      category_id: categoryId,
      price,
      old_price: oldPrice,
      image_url: text(body.image_url),
      description: text(body.description),
      details: text(body.details),
      weight: text(body.weight),
      origin: text(body.origin),
      shelf_life: text(body.shelf_life),
    },
  };
}

const router = (app) => {
  app.get("/api/health", (request, response) => {
    response.json({ ok: true });
  });

  // CREATE
  app.post("/api/products", requireAdmin, async (request, response) => {
    const { product, error: invalid } = readProduct(request.body);
    if (invalid) return response.status(400).json({ error: invalid });

    const { data, error } = await supabase.from("products").insert(product).select().single();
    if (error) {
      console.error("Помилка додавання:", error);
      return response.status(500).json({ error: "Не вдалося додати товар." });
    }
    response.status(201).json(data);
  });

  // UPDATE
  app.put("/api/products/:id", requireAdmin, async (request, response) => {
    const { product, error: invalid } = readProduct(request.body);
    if (invalid) return response.status(400).json({ error: invalid });

    const { data, error } = await supabase
      .from("products")
      .update(product)
      .eq("id", request.params.id)
      .select()
      .maybeSingle();

    if (error) {
      console.error("Помилка оновлення:", error);
      return response.status(500).json({ error: "Не вдалося зберегти зміни." });
    }
    if (!data) return response.status(404).json({ error: "Товар не знайдено." });
    response.json(data);
  });

  // DELETE
  app.delete("/api/products/:id", requireAdmin, async (request, response) => {
    const { data, error } = await supabase
      .from("products")
      .delete()
      .eq("id", request.params.id)
      .select();

    if (error) {
      console.error("Помилка видалення:", error);
      return response.status(500).json({ error: "Не вдалося видалити товар." });
    }
    if (!data || data.length === 0) {
      return response.status(404).json({ error: "Товар не знайдено." });
    }
    response.json({ ok: true });
  });
};

module.exports = router;