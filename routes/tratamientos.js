// routes/tratamientos.js
const express = require("express");
const router = express.Router();
const db = require("../db/db");

// GET /api/tratamientos - Lista de tratamientos extraídos
router.get("/", async (req, res, next) => {
  try {
    // Parámetros de paginación y filtrado opcionales
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const offset = (page - 1) * limit;

    // Construir consulta base
    let query = db("tratamientos as t")
      .select(
        "t.id_tratamiento",
        "t.nombre_tratamiento",
        "t.descripcion",
        "t.duracion",
        "t.precio",
        "c.nombre_clinica",
        "sc.nombre_super_clinica",
        "ti.descripcion as tipo_iva",
        "ti.valor as valor_iva"
      )
      .leftJoin("clinicas as c", "t.id_clinica", "c.id_clinica")
      .leftJoin(
        "super_clinicas as sc",
        "t.id_super_clinica",
        "sc.id_super_clinica"
      )
      .leftJoin("tipo_iva as ti", "t.id_tipo_iva", "ti.id_tipo_iva")
      .where("t.id_estado_registro", 1);

    // Aplicar filtro de búsqueda si se proporciona
    if (search) {
      query = query.where((builder) => {
        builder
          .where("t.nombre_tratamiento", "like", `%${search}%`)
          .orWhere("t.descripcion", "like", `%${search}%`);
      });
    }

    // Ejecutar consulta con paginación
    const tratamientos = await query
      .orderBy("t.nombre_tratamiento")
      .limit(limit)
      .offset(offset);

    // Obtener conteo total para la paginación
    const [{ total }] = await db("tratamientos")
      .count("* as total")
      .where("id_estado_registro", 1)
      .modify((builder) => {
        if (search) {
          builder
            .where("nombre_tratamiento", "like", `%${search}%`)
            .orWhere("descripcion", "like", `%${search}%`);
        }
      });

    res.json({
      error: false,
      count: tratamientos.length,
      total,
      page,
      limit,
      data: tratamientos,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/tratamientos/:id - Obtener un tratamiento específico
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    // Obtener información del tratamiento
    const tratamiento = await db("tratamientos as t")
      .select(
        "t.*",
        "c.nombre_clinica",
        "sc.nombre_super_clinica",
        "ti.descripcion as tipo_iva",
        "ti.valor as valor_iva"
      )
      .leftJoin("clinicas as c", "t.id_clinica", "c.id_clinica")
      .leftJoin(
        "super_clinicas as sc",
        "t.id_super_clinica",
        "sc.id_super_clinica"
      )
      .leftJoin("tipo_iva as ti", "t.id_tipo_iva", "ti.id_tipo_iva")
      .where("t.id_tratamiento", id)
      .first();

    if (!tratamiento) {
      return res.status(404).json({
        error: true,
        message: `No se encontró ningún tratamiento con ID ${id}`,
      });
    }

    // Obtener presupuestos que incluyen este tratamiento
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
      .where("d.id_tratamiento", id)
      .orderBy("p.fecha", "desc")
      .limit(10);

    res.json({
      error: false,
      data: {
        ...tratamiento,
        presupuestos,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
