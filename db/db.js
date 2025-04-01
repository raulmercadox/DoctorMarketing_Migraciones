// db.js - Utilidad para conectar a la base de datos
require("dotenv").config();
const knex = require("knex");

// Exportar la configuración de conexión a la base de datos
const db = knex({
  client: "mysql2",
  connection: {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "clinica_dental",
  },
  pool: { min: 0, max: 7 },
  debug: process.env.NODE_ENV === "development",
});

module.exports = db;
