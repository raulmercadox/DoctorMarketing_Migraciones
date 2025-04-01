// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

// Importar rutas
const pacientesRoutes = require("./routes/pacientes");
const presupuestosRoutes = require("./routes/presupuestos");
const tratamientosRoutes = require("./routes/tratamientos");
const productosRoutes = require("./routes/productos");

// Inicialización de la aplicación Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Rutas de la API
app.use("/api/pacientes", pacientesRoutes);
app.use("/api/presupuestos", presupuestosRoutes);
app.use("/api/tratamientos", tratamientosRoutes);
app.use("/api/productos", productosRoutes);

// Ruta de inicio
app.get("/", (req, res) => {
  res.json({
    message: "API de Clínica Dental",
    endpoints: [
      "/api/pacientes",
      "/api/pacientes/:id",
      "/api/presupuestos",
      "/api/presupuestos/:id",
      "/api/tratamientos",
      "/api/tratamientos/:id",
      "/api/productos",
      "/api/productos/:id",
    ],
  });
});

// Middleware para manejar rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    error: true,
    message: "Endpoint no encontrado",
  });
});

// Middleware para manejar errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: true,
    message: "Error interno del servidor",
    details: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});

module.exports = app; // Para pruebas
