// routes/productos.js
const express = require("express");
const router = express.Router();
const db = require("../db/db");

// GET /api/productos - Lista de productos extraídos
router.get("/", async (req, res, next) => {
  try {
    // Parámetros de paginación y filtrado opcionales
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const offset = (page - 1) * limit;

    // Construir consulta base
    let query = db("productos as p")
      .select(
        "p.id_producto",
        "p.nombre_producto",
        "p.descripcion",
        "p.stock",
        "p.precio",
        "c.nombre_clinica",
        "sc.nombre_super_clinica",
        "ti.descripcion as tipo_iva",
        "ti.valor as valor_iva"
      )
      .leftJoin("clinicas as c", "p.id_clinica", "c.id_clinica")
      .leftJoin(
        "super_clinicas as sc",
        "p.id_super_clinica",
        "sc.id_super_clinica"
      )
      .leftJoin("tipo_iva as ti", "p.id_tipo_iva", "ti.id_tipo_iva")
      .where("p.id_estado_registro", 1);

    // Aplicar filtro de búsqueda si se proporciona
    if (search) {
      query = query.where((builder) => {
        builder
          .where("p.nombre_producto", "like", `%${search}%`)
          .orWhere("p.descripcion", "like", `%${search}%`)
          .orWhere("p.codigo", "like", `%${search}%`)
          .orWhere("p.codigo_barras", "like", `%${search}%`);
      });
    }

    // Ejecutar consulta con paginación
    const productos = await query
      .orderBy("p.nombre_producto")
      .limit(limit)
      .offset(offset);

    // Obtener conteo total para la paginación
    const [{ total }] = await db("productos")
      .count("* as total")
      .where("id_estado_registro", 1)
      .modify((builder) => {
        if (search) {
          builder
            .where("nombre_producto", "like", `%${search}%`)
            .orWhere("descripcion", "like", `%${search}%`)
            .orWhere("codigo", "like", `%${search}%`)
            .orWhere("codigo_barras", "like", `%${search}%`);
        }
      });

    res.json({
      error: false,
      count: productos.length,
      total,
      page,
      limit,
      data: productos,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/productos/:id - Obtener un producto específico
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    // Obtener información del producto
    const producto = await db("productos as p")
      .select(
        "p.*",
        "c.nombre_clinica",
        "sc.nombre_super_clinica",
        "ti.descripcion as tipo_iva",
        "ti.valor as valor_iva"
      )
      .leftJoin("clinicas as c", "p.id_clinica", "c.id_clinica")
      .leftJoin(
        "super_clinicas as sc",
        "p.id_super_clinica",
        "sc.id_super_clinica"
      )
      .leftJoin("tipo_iva as ti", "p.id_tipo_iva", "ti.id_tipo_iva")
      .where("p.id_producto", id)
      .first();

    if (!producto) {
      return res.status(404).json({
        error: true,
        message: `No se encontró ningún producto con ID ${id}`,
      });
    }

    // Obtener presupuestos que incluyen este producto
    const presupuestos = await db("detalle_presupuesto as d")
      .select(
        "p.id_presupuesto",
        "p.fecha",
        "pac.nombre as nombre_paciente",
        "pac.apellido as apellido_paciente",
        "d.precio",
        "d.cantidad",
        "d.total_item"
      )
      .join("presupuestos as p", "d.id_presupuesto", "p.id_presupuesto")
      .join("pacientes as pac", "p.id_paciente", "pac.id_paciente")
      .where("d.id_producto", id)
      .orderBy("p.fecha", "desc")
      .limit(10);

    res.json({
      error: false,
      data: {
        ...producto,
        presupuestos,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
