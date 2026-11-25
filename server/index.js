const path = require("path");
require("dotenv").config({ quiet: true });

const express = require("express");
const cors = require("cors");
const routes = require("./routes/routes");

const app = express();
const port = process.env.PORT || 3002;

const allowedOrigins = (process.env.ALLOWED_ORIGIN || "").split(",").filter(Boolean);
app.use(cors({ origin: allowedOrigins.length ? allowedOrigins : "*" }));
app.use(express.json({ limit: "10kb" }));

routes(app);

app.use("/server", (request, response) => response.status(404).end());
app.use(express.static(path.join(__dirname, "..")));

app.listen(port, () => {
  console.log("Сервер запущено на порту " + port);
});
app.use((request, response) => {
  response.status(404).json({ error: "Маршрут не знайдено." });
});

app.use((error, request, response, next) => {
  console.error("Помилка сервера:", error);
  response.status(500).json({ error: "Внутрішня помилка сервера." });
});
