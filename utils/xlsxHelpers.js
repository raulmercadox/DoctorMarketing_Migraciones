// utils/xlsxHelpers.js
// Funciones de utilidad para procesar archivos XLSX
const xlsx = require("xlsx");
const fs = require("fs");
const path = require("path");

/**
 * Lee un archivo XLSX y lo convierte a JSON
 * @param {string} filePath - Ruta del archivo XLSX
 * @returns {Array} - Array de objetos con los datos del archivo
 */
function readXlsxFile(filePath) {
  try {
    console.log(`Leyendo archivo: ${filePath}`);

    // Verificar si el archivo existe
    if (!fs.existsSync(filePath)) {
      throw new Error(`El archivo ${filePath} no existe`);
    }

    // Leer el archivo XLSX
    const workbook = xlsx.readFile(filePath, {
      cellDates: true, // Convertir fechas a objetos Date
      dateNF: "yyyy-mm-dd", // Formato de fecha
      raw: false, // No convertir valores a tipos primitivos
    });

    // Obtener la primera hoja
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convertir a JSON
    const data = xlsx.utils.sheet_to_json(worksheet, {
      defval: null, // Valor por defecto para celdas vacías
      raw: false, // No convertir valores automáticamente
      blankrows: false, // Omitir filas en blanco
    });

    console.log(
      `Se leyeron ${data.length} registros del archivo ${path.basename(
        filePath
      )}`
    );

    // Información sobre las columnas
    const headers = Object.keys(data[0] || {});
    console.log(`Columnas encontradas: ${headers.join(", ")}`);

    return data;
  } catch (error) {
    console.error(`Error al leer archivo ${filePath}:`, error);
    return [];
  }
}

/**
 * Normaliza los nombres de las columnas para manejar diferentes formatos
 * @param {Array} data - Array de objetos con los datos
 * @param {Object} columnMappings - Mapeo de nombres de columnas
 * @returns {Array} - Datos con nombres de columnas normalizados
 */
function normalizeColumnNames(data, columnMappings) {
  return data.map((row) => {
    const normalizedRow = {};

    // Aplicar mapeos de columnas
    Object.entries(row).forEach(([key, value]) => {
      const normalizedKey = columnMappings[key.toLowerCase()] || key;
      normalizedRow[normalizedKey] = value;
    });

    return normalizedRow;
  });
}

/**
 * Realiza transformaciones específicas en los datos
 * @param {Array} data - Array de objetos con los datos
 * @param {Object} transformations - Funciones de transformación por campo
 * @returns {Array} - Datos transformados
 */
function transformData(data, transformations) {
  return data.map((row) => {
    const transformedRow = { ...row };

    // Aplicar transformaciones por campo
    Object.entries(transformations).forEach(([field, transformFn]) => {
      if (transformedRow.hasOwnProperty(field)) {
        transformedRow[field] = transformFn(
          transformedRow[field],
          transformedRow
        );
      }
    });

    return transformedRow;
  });
}

/**
 * Filtra los registros según un criterio
 * @param {Array} data - Array de objetos con los datos
 * @param {Function} filterFn - Función de filtrado
 * @returns {Array} - Datos filtrados
 */
function filterData(data, filterFn) {
  return data.filter(filterFn);
}

/**
 * Agrupa los datos por un campo específico
 * @param {Array} data - Array de objetos con los datos
 * @param {string} field - Campo por el cual agrupar
 * @returns {Object} - Objeto con los datos agrupados
 */
function groupByField(data, field) {
  return data.reduce((grouped, item) => {
    const key = item[field];
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(item);
    return grouped;
  }, {});
}

module.exports = {
  readXlsxFile,
  normalizeColumnNames,
  transformData,
  filterData,
  groupByField,
};
