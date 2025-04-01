// migration.js
require("dotenv").config();
const mysql = require("mysql2/promise");
const xlsx = require("xlsx");

// Configuración de la base de datos
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "clinica_dental",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Valores por defecto para registros
const defaultValues = {
  id_super_clinica: 47, // Grupo Clínico Dental Plus
  id_clinica: 63, // DentalCare Madrid Centro
  id_estado_registro: 1, // activo
  id_tipo_iva: 1, // IVA 21%
};

// Utilidad para leer archivos XLSX
const readXlsxFile = (filePath) => {
  try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    return xlsx.utils.sheet_to_json(worksheet);
  } catch (error) {
    console.error(`Error al leer archivo ${filePath}:`, error);
    return [];
  }
};

// Función principal para la migración
async function migrateData() {
  let connection;

  try {
    // Establecer conexión a la base de datos
    connection = await mysql.createConnection(dbConfig);
    console.log("Conexión establecida con la base de datos");

    // Iniciar transacción
    await connection.beginTransaction();
    console.log("Transacción iniciada");

    // Leer archivos XLSX
    console.log("Leyendo archivos XLSX...");
    const pacientesData = readXlsxFile("./data/pacientes.xlsx");
    const presupuestosData = readXlsxFile("./data/presupuestos.xlsx");
    const presupuestosDetalleData = readXlsxFile(
      "./data/presupuestos_detalle.xlsx"
    );

    console.log(
      `Registros leídos: ${pacientesData.length} pacientes, ${presupuestosData.length} presupuestos, ${presupuestosDetalleData.length} detalles de presupuestos`
    );

    // Paso 1: Migrar pacientes
    console.log("Migrando pacientes...");
    const pacientesMap = await migrarPacientes(connection, pacientesData);

    // Paso 2: Extraer y migrar tratamientos y productos de detalles de presupuestos
    console.log("Extrayendo y migrando tratamientos y productos...");
    const [tratamientosMap, productosMap] =
      await extraerYMigrarTratamientosYProductos(
        connection,
        presupuestosDetalleData
      );

    // Paso 3: Migrar presupuestos
    console.log("Migrando presupuestos...");
    const presupuestosMap = await migrarPresupuestos(
      connection,
      presupuestosData,
      pacientesMap
    );

    // Paso 4: Migrar detalles de presupuestos
    console.log("Migrando detalles de presupuestos...");
    await migrarDetallesPresupuestos(
      connection,
      presupuestosDetalleData,
      presupuestosMap,
      tratamientosMap,
      productosMap
    );

    // Confirmar transacción
    await connection.commit();
    console.log("Transacción confirmada");
    console.log("Migración completada exitosamente");
  } catch (error) {
    console.error("Error durante la migración:", error);

    if (connection) {
      try {
        // Revertir transacción en caso de error
        await connection.rollback();
        console.log("Transacción revertida");
      } catch (rollbackError) {
        console.error("Error al revertir la transacción:", rollbackError);
      }
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log("Conexión cerrada");
    }
  }
}

// Función para migrar pacientes
async function migrarPacientes(connection, pacientesData) {
  const pacientesMap = new Map(); // Mapa para relacionar old_id con new_id

  for (const paciente of pacientesData) {
    try {
      // Validar y preparar datos del paciente
      const pacienteValido = validarYPreparaPaciente(paciente);

      // Insertar paciente en la nueva base de datos
      const [result] = await connection.execute(
        `INSERT INTO pacientes (
          nombre, apellido, email, telefono, fecha_nacimiento, 
          id_sexo, direccion, ciudad, id_clinica, codigo_postal, 
          nif_cif, referido, id_super_clinica, id_estado_registro, 
          lopd_aceptado, old_id, fecha_alta, usuario_creacion
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          pacienteValido.nombre,
          pacienteValido.apellido,
          pacienteValido.email,
          pacienteValido.telefono,
          pacienteValido.fecha_nacimiento,
          pacienteValido.id_sexo,
          pacienteValido.direccion,
          pacienteValido.ciudad,
          pacienteValido.id_clinica,
          pacienteValido.codigo_postal,
          pacienteValido.nif_cif,
          pacienteValido.referido,
          pacienteValido.id_super_clinica,
          pacienteValido.id_estado_registro,
          pacienteValido.lopd_aceptado,
          pacienteValido.old_id,
          pacienteValido.fecha_alta,
          pacienteValido.usuario_creacion,
        ]
      );

      // Guardar relación entre old_id y new_id
      pacientesMap.set(pacienteValido.old_id.toString(), result.insertId);
      console.log(
        `Paciente migrado: ${pacienteValido.nombre} ${pacienteValido.apellido}, ID original: ${pacienteValido.old_id}, Nuevo ID: ${result.insertId}`
      );
    } catch (error) {
      console.error(
        `Error al migrar paciente ${JSON.stringify(paciente)}:`,
        error
      );
    }
  }

  console.log(`Total de pacientes migrados: ${pacientesMap.size}`);
  return pacientesMap;
}

// Función para validar y preparar datos de paciente
function validarYPreparaPaciente(paciente) {
  return {
    nombre: paciente.nombre || "",
    apellido: paciente.apellidos || paciente.apellido || "",
    email: paciente.email || null,
    telefono: paciente.telefono || "",
    fecha_nacimiento: paciente.fecha_nacimiento || null,
    id_sexo: paciente.id_sexo || null,
    direccion: paciente.direccion || null,
    ciudad: paciente.ciudad || null,
    id_clinica: paciente.id_clinica || defaultValues.id_clinica,
    codigo_postal: paciente.codigo_postal || "0",
    nif_cif: paciente.nif_cif || "0",
    referido: paciente.referido || null,
    id_super_clinica:
      paciente.id_super_clinica || defaultValues.id_super_clinica,
    id_estado_registro:
      paciente.id_estado_registro || defaultValues.id_estado_registro,
    lopd_aceptado: paciente.lopd_aceptado || 0,
    old_id: paciente.id || paciente.id_paciente || 0,
    fecha_alta: paciente.fecha_alta || new Date().toISOString().split("T")[0],
    usuario_creacion: paciente.usuario_creacion || "Script migración",
  };
}

// Función para extraer y migrar tratamientos y productos
async function extraerYMigrarTratamientosYProductos(connection, detallesData) {
  const tratamientosMap = new Map();
  const productosMap = new Map();

  // Extracción de tratamientos únicos
  const tratamientosUnicos = new Map();
  const productosUnicos = new Map();

  for (const detalle of detallesData) {
    // Identificar si es tratamiento o producto basado en alguna lógica de negocio
    // Por ejemplo, podría ser según un campo del detalle o algún criterio específico

    if (detalle.id_tratamiento) {
      // Es un tratamiento
      const nombreTratamiento =
        detalle.nombre_tratamiento || `Tratamiento ${detalle.id_tratamiento}`;
      const claveTratamiento = nombreTratamiento.toLowerCase();

      if (!tratamientosUnicos.has(claveTratamiento)) {
        tratamientosUnicos.set(claveTratamiento, {
          id_tratamiento: detalle.id_tratamiento,
          nombre_tratamiento: nombreTratamiento,
          descripcion: detalle.descripcion_tratamiento || "",
          duracion: detalle.duracion || 30,
          precio: detalle.precio || 0,
          id_clinica: detalle.id_clinica || defaultValues.id_clinica,
          id_super_clinica:
            detalle.id_super_clinica || defaultValues.id_super_clinica,
          id_tipo_iva: detalle.id_tipo_iva || defaultValues.id_tipo_iva,
          id_estado_registro: defaultValues.id_estado_registro,
        });
      }
    } else if (detalle.id_producto) {
      // Es un producto
      const nombreProducto =
        detalle.nombre_producto || `Producto ${detalle.id_producto}`;
      const claveProducto = nombreProducto.toLowerCase();

      if (!productosUnicos.has(claveProducto)) {
        productosUnicos.set(claveProducto, {
          id_producto: detalle.id_producto,
          nombre_producto: nombreProducto,
          descripcion: detalle.descripcion_producto || "",
          stock: detalle.stock || 0,
          precio: detalle.precio || 0,
          id_clinica: detalle.id_clinica || defaultValues.id_clinica,
          id_super_clinica:
            detalle.id_super_clinica || defaultValues.id_super_clinica,
          id_tipo_iva: detalle.id_tipo_iva || defaultValues.id_tipo_iva,
          id_estado_registro: defaultValues.id_estado_registro,
        });
      }
    }
  }

  // Migrar tratamientos únicos
  for (const [clave, tratamiento] of tratamientosUnicos.entries()) {
    try {
      const [result] = await connection.execute(
        `INSERT INTO tratamientos (
          nombre_tratamiento, descripcion, duracion, precio, 
          id_clinica, id_super_clinica, id_tipo_iva, id_estado_registro
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          tratamiento.nombre_tratamiento,
          tratamiento.descripcion,
          tratamiento.duracion,
          tratamiento.precio,
          tratamiento.id_clinica,
          tratamiento.id_super_clinica,
          tratamiento.id_tipo_iva,
          tratamiento.id_estado_registro,
        ]
      );

      tratamientosMap.set(
        tratamiento.id_tratamiento.toString(),
        result.insertId
      );
      console.log(
        `Tratamiento migrado: ${tratamiento.nombre_tratamiento}, ID original: ${tratamiento.id_tratamiento}, Nuevo ID: ${result.insertId}`
      );
    } catch (error) {
      console.error(
        `Error al migrar tratamiento ${JSON.stringify(tratamiento)}:`,
        error
      );
    }
  }

  // Migrar productos únicos
  for (const [clave, producto] of productosUnicos.entries()) {
    try {
      const [result] = await connection.execute(
        `INSERT INTO productos (
          nombre_producto, descripcion, stock, precio, 
          id_clinica, id_super_clinica, id_tipo_iva, id_estado_registro
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          producto.nombre_producto,
          producto.descripcion,
          producto.stock,
          producto.precio,
          producto.id_clinica,
          producto.id_super_clinica,
          producto.id_tipo_iva,
          producto.id_estado_registro,
        ]
      );

      productosMap.set(producto.id_producto.toString(), result.insertId);
      console.log(
        `Producto migrado: ${producto.nombre_producto}, ID original: ${producto.id_producto}, Nuevo ID: ${result.insertId}`
      );
    } catch (error) {
      console.error(
        `Error al migrar producto ${JSON.stringify(producto)}:`,
        error
      );
    }
  }

  console.log(`Total de tratamientos migrados: ${tratamientosMap.size}`);
  console.log(`Total de productos migrados: ${productosMap.size}`);

  return [tratamientosMap, productosMap];
}

// Función para migrar presupuestos
async function migrarPresupuestos(connection, presupuestosData, pacientesMap) {
  const presupuestosMap = new Map();

  for (const presupuesto of presupuestosData) {
    try {
      // Validar y preparar datos del presupuesto
      const presupuestoValido = validarYPreparaPresupuesto(presupuesto);

      // Verificar si el paciente existe en el mapa
      const nuevoPacienteId = pacientesMap.get(
        presupuestoValido.id_paciente.toString()
      );

      if (!nuevoPacienteId) {
        console.warn(
          `Presupuesto con ID ${presupuestoValido.id_presupuesto} tiene un id_paciente (${presupuestoValido.id_paciente}) que no existe en el mapa de pacientes`
        );
        continue;
      }

      // Insertar presupuesto en la nueva base de datos
      const [result] = await connection.execute(
        `INSERT INTO presupuestos (
          id_paciente, id_super_clinica, id_clinica, fecha, 
          url_presupuesto, monto_total, monto_pagado, saldo_pendiente, 
          id_estado, id_tipo_pago, old_id, id_estado_registro
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          nuevoPacienteId,
          presupuestoValido.id_super_clinica,
          presupuestoValido.id_clinica,
          presupuestoValido.fecha,
          presupuestoValido.url_presupuesto,
          presupuestoValido.monto_total,
          presupuestoValido.monto_pagado,
          presupuestoValido.saldo_pendiente,
          presupuestoValido.id_estado,
          presupuestoValido.id_tipo_pago,
          presupuestoValido.id_presupuesto, // old_id
          presupuestoValido.id_estado_registro,
        ]
      );

      // Guardar relación entre old_id y new_id
      presupuestosMap.set(
        presupuestoValido.id_presupuesto.toString(),
        result.insertId
      );
      console.log(
        `Presupuesto migrado: ID original: ${presupuestoValido.id_presupuesto}, Nuevo ID: ${result.insertId}`
      );
    } catch (error) {
      console.error(
        `Error al migrar presupuesto ${JSON.stringify(presupuesto)}:`,
        error
      );
    }
  }

  console.log(`Total de presupuestos migrados: ${presupuestosMap.size}`);
  return presupuestosMap;
}

// Función para validar y preparar datos de presupuesto
function validarYPreparaPresupuesto(presupuesto) {
  return {
    id_presupuesto: presupuesto.id_presupuesto || presupuesto.id || 0,
    id_paciente: presupuesto.id_paciente || 0,
    id_super_clinica:
      presupuesto.id_super_clinica || defaultValues.id_super_clinica,
    id_clinica: presupuesto.id_clinica || defaultValues.id_clinica,
    fecha: presupuesto.fecha || new Date().toISOString(),
    url_presupuesto: presupuesto.url_presupuesto || "",
    monto_total: presupuesto.monto_total || 0,
    monto_pagado: presupuesto.monto_pagado || 0,
    saldo_pendiente: presupuesto.saldo_pendiente || 0,
    id_estado: presupuesto.id_estado || 1,
    id_tipo_pago: presupuesto.id_tipo_pago || 1,
    id_estado_registro:
      presupuesto.id_estado_registro || defaultValues.id_estado_registro,
  };
}

// Función para migrar detalles de presupuestos
async function migrarDetallesPresupuestos(
  connection,
  detallesData,
  presupuestosMap,
  tratamientosMap,
  productosMap
) {
  let detallesMigrados = 0;

  for (const detalle of detallesData) {
    try {
      // Validar y preparar datos del detalle
      const detalleValido = validarYPreparaDetallePresupuesto(detalle);

      // Verificar si el presupuesto existe en el mapa
      const nuevoPresupuestoId = presupuestosMap.get(
        detalleValido.id_presupuesto.toString()
      );

      if (!nuevoPresupuestoId) {
        console.warn(
          `Detalle con ID ${detalleValido.id_detalle_presupuesto} tiene un id_presupuesto (${detalleValido.id_presupuesto}) que no existe en el mapa de presupuestos`
        );
        continue;
      }

      // Buscar nuevos IDs para tratamiento y producto
      let nuevoTratamientoId = null;
      let nuevoProductoId = null;

      if (detalleValido.id_tratamiento) {
        nuevoTratamientoId = tratamientosMap.get(
          detalleValido.id_tratamiento.toString()
        );
      }

      if (detalleValido.id_producto) {
        nuevoProductoId = productosMap.get(
          detalleValido.id_producto.toString()
        );
      }

      // Insertar detalle en la nueva base de datos
      const [result] = await connection.execute(
        `INSERT INTO detalle_presupuesto (
          id_presupuesto, id_tratamiento, item, descripcion, 
          cantidad, precio, descuento, id_tipo_iva, 
          total_item, id_producto, old_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          nuevoPresupuestoId,
          nuevoTratamientoId,
          detalleValido.item,
          detalleValido.descripcion,
          detalleValido.cantidad,
          detalleValido.precio,
          detalleValido.descuento,
          detalleValido.id_tipo_iva,
          detalleValido.total_item,
          nuevoProductoId,
          detalleValido.id_detalle_presupuesto, // old_id
        ]
      );

      detallesMigrados++;
      console.log(
        `Detalle de presupuesto migrado: ID original: ${detalleValido.id_detalle_presupuesto}, Nuevo ID: ${result.insertId}`
      );
    } catch (error) {
      console.error(
        `Error al migrar detalle de presupuesto ${JSON.stringify(detalle)}:`,
        error
      );
    }
  }

  console.log(
    `Total de detalles de presupuestos migrados: ${detallesMigrados}`
  );
}

// Función para validar y preparar datos de detalle de presupuesto
function validarYPreparaDetallePresupuesto(detalle) {
  return {
    id_detalle_presupuesto: detalle.id_detalle_presupuesto || detalle.id || 0,
    id_presupuesto: detalle.id_presupuesto || 0,
    id_tratamiento: detalle.id_tratamiento || null,
    item: detalle.item || 0,
    descripcion: detalle.descripcion || "",
    cantidad: detalle.cantidad || 1,
    precio: detalle.precio || 0,
    descuento: detalle.descuento || 0,
    id_tipo_iva: detalle.id_tipo_iva || defaultValues.id_tipo_iva,
    total_item: detalle.total_item || 0,
    id_producto: detalle.id_producto || null,
  };
}

// Iniciar el proceso de migración
migrateData().catch(console.error);
