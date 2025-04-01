// utils/migrationHelpers.js
// Funciones de utilidad para el proceso de migración

// Validar y preparar campos, asegurando que cumplan con el formato requerido
function validateField(value, defaultValue, type = "string") {
  // Si el valor es null o undefined, devolver el valor por defecto
  if (value === null || value === undefined) {
    return defaultValue;
  }

  // Validar según el tipo
  switch (type) {
    case "string":
      return String(value).trim();
    case "number":
      return isNaN(Number(value)) ? defaultValue : Number(value);
    case "boolean":
      return Boolean(value);
    case "date":
      const date = new Date(value);
      return isNaN(date.getTime()) ? defaultValue : date.toISOString();
    case "decimal":
      return isNaN(parseFloat(value))
        ? defaultValue
        : parseFloat(value).toFixed(2);
    default:
      return value;
  }
}

// Generar una fecha en formato MySQL (YYYY-MM-DD)
function formatDateForMySQL(date) {
  if (!date) return null;

  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;

    return d.toISOString().split("T")[0];
  } catch (e) {
    return null;
  }
}

// Extraer entidades únicas (tratamientos, productos) basado en un criterio
function extractUniqueEntities(data, entityKey, uniqueKey) {
  const uniqueEntities = new Map();

  data.forEach((item) => {
    const key = item[uniqueKey]?.toString().toLowerCase();
    if (key && !uniqueEntities.has(key)) {
      uniqueEntities.set(key, { ...item });
    }
  });

  return Array.from(uniqueEntities.values());
}

// Generar logs detallados del proceso de migración
function logMigrationProgress(entity, status, details) {
  const timestamp = new Date().toISOString();
  const message = `[${timestamp}] [${entity}] [${status}] ${details}`;
  console.log(message);
  return message;
}

// Verificar si un registro ya existe en la base de datos
async function recordExists(db, table, field, value) {
  const result = await db(table).where(field, value).first();
  return Boolean(result);
}

// Exportar funciones de utilidad
module.exports = {
  validateField,
  formatDateForMySQL,
  extractUniqueEntities,
  logMigrationProgress,
  recordExists,
};
