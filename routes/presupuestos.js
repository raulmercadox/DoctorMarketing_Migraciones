// routes/presupuestos.js
const express = require("express");
const router = express.Router();
const db = require("../db/db");

// GET /api/presupuestos - Lista de presupuestos
router.get("/", async (req, res, next) => {
  try {
    // Parámetros de paginación y filtrado opcionales
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const estado = req.query.estado ? parseInt(req.query.estado) : null;
    const offset = (page - 1) * limit;

    // Construir consulta base
    let query = db("presupuestos as p")
      .select(
        "p.id_presupuesto",
        "p.fecha",
        "p.monto_total",
        "p.monto_pagado",
        "p.saldo_pendiente",
        "p.id_estado",
        "pac.id_paciente",
        "pac.nombre as nombre_paciente",
        "pac.apellido as apellido_paciente",
        "e.nombre as estado",
        "c.nombre_clinica",
        "tp.nombre as tipo_pago"
      )
      .join("pacientes as pac", "p.id_paciente", "pac.id_paciente")
      .leftJoin("estados_presupuestos as e", "p.id_estado", "e.id")
      .leftJoin("clinicas as c", "p.id_clinica", "c.id_clinica")
      .leftJoin(
        "tipo_pago_presupuesto as tp",
        "p.id_tipo_pago",
        "tp.id_tipo_pago"
      )
      .where("p.id_estado_registro", 1);

    // Aplicar filtros adicionales si se proporcionan
    if (search) {
      query = query.where((builder) => {
        builder
          .where("pac.nombre", "like", `%${search}%`)
          .orWhere("pac.apellido", "like", `%${search}%`)
          .orWhere("p.id_presupuesto", "like", `%${search}%`);
      });
    }

    if (estado !== null) {
      query = query.where("p.id_estado", estado);
    }

    // Ejecutar consulta con paginación
    const presupuestos = await query
      .orderBy("p.fecha", "desc")
      .limit(limit)
      .offset(offset);

    // Obtener conteo total para la paginación
    const [{ total }] = await db("presupuestos as p")
      .count("* as total")
      .join("pacientes as pac", "p.id_paciente", "pac.id_paciente")
      .where("p.id_estado_registro", 1)
      .modify((builder) => {
        if (search) {
          builder
            .where("pac.nombre", "like", `%${search}%`)
            .orWhere("pac.apellido", "like", `%${search}%`)
            .orWhere("p.id_presupuesto", "like", `%${search}%`);
        }
        if (estado !== null) {
          builder.where("p.id_estado", estado);
        }
      });

    res.json({
      error: false,
      count: presupuestos.length,
      total,
      page,
      limit,
      data: presupuestos,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/presupuestos/:id - Detalles de un presupuesto específico
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    // Obtener información del presupuesto
    const presupuesto = await db("presupuestos as p")
      .select(
        "p.*",
        "pac.nombre as nombre_paciente",
        "pac.apellido as apellido_paciente",
        "e.nombre as estado",
        "tp.nombre as tipo_pago",
        "c.nombre_clinica",
        "sc.nombre_super_clinica"
      )
      .join("pacientes as pac", "p.id_paciente", "pac.id_paciente")
      .leftJoin("estados_presupuestos as e", "p.id_estado", "e.id")
      .leftJoin(
        "tipo_pago_presupuesto as tp",
        "p.id_tipo_pago",
        "tp.id_tipo_pago"
      )
      .leftJoin("clinicas as c", "p.id_clinica", "c.id_clinica")
      .leftJoin(
        "super_clinicas as sc",
        "p.id_super_clinica",
        "sc.id_super_clinica"
      )
      .where("p.id_presupuesto", id)
      .first();

    if (!presupuesto) {
      return res.status(404).json({
        error: true,
        message: `No se encontró ningún presupuesto con ID ${id}`,
      });
    }

    // Obtener detalles del presupuesto
    const detalles = await db("detalle_presupuesto as d")
      .select(
        "d.*",
        "t.nombre_tratamiento",
        "p.nombre_producto",
        "ti.descripcion as tipo_iva",
        "ti.valor as valor_iva"
      )
      .leftJoin("tratamientos as t", "d.id_tratamiento", "t.id_tratamiento")
      .leftJoin("productos as p", "d.id_producto", "p.id_producto")
      .leftJoin("tipo_iva as ti", "d.id_tipo_iva", "ti.id_tipo_iva")
      .where("d.id_presupuesto", id)
      .orderBy("d.item");

    // Calcular totales y estadísticas
    const totalItems = detalles.length;
    const totalProductos = detalles.filter((d) => d.id_producto).length;
    const totalTratamientos = detalles.filter((d) => d.id_tratamiento).length;

    res.json({
      error: false,
      data: {
        ...presupuesto,
        detalles,
        estadisticas: {
          totalItems,
          totalProductos,
          totalTratamientos,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
