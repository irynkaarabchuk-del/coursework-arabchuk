import { db } from "./app.js";

function initAuth() {
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

  //увійти або вийти
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
   // посилання на адмін-панель
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
      link.innerHTML = '<a href="admin.html">Адмін</a>';
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

}

initAuth();