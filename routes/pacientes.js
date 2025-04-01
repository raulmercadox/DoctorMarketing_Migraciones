// routes/pacientes.js
const express = require("express");
const router = express.Router();
const db = require("../db/db");

// GET /api/pacientes - Lista de pacientes
router.get("/", async (req, res, next) => {
  try {
    // Parámetros de paginación y filtrado opcionales
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const offset = (page - 1) * limit;

    // Construir consulta base
    let query = db("pacientes")
      .select(
        "id_paciente",
        "nombre",
        "apellido",
        "email",
        "telefono",
        "fecha_nacimiento",
        "fecha_alta"
      )
      .where("id_estado_registro", 1);

    // Aplicar filtro de búsqueda si se proporciona
    if (search) {
      query = query.where((builder) => {
        builder
          .where("nombre", "like", `%${search}%`)
          .orWhere("apellido", "like", `%${search}%`)
          .orWhere("email", "like", `%${search}%`)
          .orWhere("telefono", "like", `%${search}%`);
      });
    }

    // Ejecutar consulta con paginación
    const pacientes = await query
      .orderBy("id_paciente", "desc")
      .limit(limit)
      .offset(offset);

    // Obtener conteo total para la paginación
    const [{ total }] = await db("pacientes")
      .count("* as total")
      .where("id_estado_registro", 1)
      .modify((builder) => {
        if (search) {
          builder
            .where("nombre", "like", `%${search}%`)
            .orWhere("apellido", "like", `%${search}%`)
            .orWhere("email", "like", `%${search}%`)
            .orWhere("telefono", "like", `%${search}%`);
        }
      });

    res.json({
      error: false,
      count: pacientes.length,
      total,
      page,
      limit,
      data: pacientes,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/pacientes/:id - Detalles de un paciente específico
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    // Obtener información del paciente
    const paciente = await db("pacientes as p")
      .select(
        "p.*",
        "s.nombre as sexo",
        "c.nombre_clinica",
        "sc.nombre_super_clinica"
      )
      .leftJoin("sexo as s", "p.id_sexo", "s.id_sexo")
      .leftJoin("clinicas as c", "p.id_clinica", "c.id_clinica")
      .leftJoin(
        "super_clinicas as sc",
        "p.id_super_clinica",
        "sc.id_super_clinica"
      )
      .where("p.id_paciente", id)
      .first();

    if (!paciente) {
      return res.status(404).json({
        error: true,
        message: `No se encontró ningún paciente con ID ${id}`,
      });
    }

    // Obtener presupuestos relacionados con este paciente
    const presupuestos = await db("presupuestos as pres")
      .select(
        "pres.id_presupuesto",
        "pres.fecha",
        "pres.monto_total",
        "pres.monto_pagado",
        "pres.saldo_pendiente",
        "est.nombre as estado"
      )
      .leftJoin("estados_presupuestos as est", "pres.id_estado", "est.id")
      .where("pres.id_paciente", id)
      .orderBy("pres.fecha", "desc");

    res.json({
      error: false,
      data: {
        ...paciente,
        presupuestos,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
