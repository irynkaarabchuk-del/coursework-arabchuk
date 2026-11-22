require("dotenv").config();
const express = require("express");
const cors = require("cors");
const routes = require("./routes/routes");

const app = express();
const port = process.env.PORT || 3002;

const allowedOrigins = (process.env.ALLOWED_ORIGIN || "").split(",").filter(Boolean);
app.use(cors({ origin: allowedOrigins.length ? allowedOrigins : "*" }));
app.use(express.json({ limit: "10kb" }));

routes(app);

app.listen(port, () => {
  console.log("Сервер запущено на порту " + port);
});