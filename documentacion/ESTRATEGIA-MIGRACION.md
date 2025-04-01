# Estrategia de Migración

## Visión General

Este documento describe la estrategia utilizada para migrar datos del sistema heredado a la nueva estructura de base de datos para la clínica dental. El proceso está diseñado para garantizar la integridad referencial, manejar correctamente las transformaciones de datos y proporcionar un mecanismo robusto para rastrear las relaciones entre el sistema antiguo y el nuevo.

## Flujo del Proceso de Migración

La migración sigue un orden específico para mantener la integridad referencial:

1. **Lectura de archivos XLSX**: Lectura y validación inicial de los datos de entrada.
2. **Migración de pacientes**: Primera entidad en ser migrada ya que otras entidades dependen de ella.
3. **Extracción y migración de tratamientos y productos**: Identificación y migración de tratamientos y productos únicos extraídos de los detalles de presupuestos.
4. **Migración de presupuestos**: Utilizando los IDs de pacientes ya migrados.
5. **Migración de detalles de presupuestos**: Relacionando con los presupuestos, tratamientos y productos ya migrados.

## Diagrama de Flujo

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Leer archivos  │     │    Migrar       │     │  Extraer y      │
│     XLSX        │────▶│   pacientes     │────▶│  migrar trat.   │
└─────────────────┘     └─────────────────┘     │  y productos    │
                                                └─────────┬───────┘
                                                          │
┌─────────────────┐     ┌─────────────────┐               │
│  Migrar         │     │    Migrar       │               │
│  detalles de    │◀────│   presupuestos  │◀──────────────┘
│  presupuestos   │     └─────────────────┘
└─────────────────┘
```

## Desafíos y Soluciones

### 1. Manejo de Referencias y Claves Foráneas

**Desafío**: Mantener la integridad referencial entre tablas durante la migración.

**Solución**:

- Implementación de un enfoque por fases que respeta el orden de las dependencias.
- Uso de mapas para relacionar IDs antiguos con nuevos IDs.
- Validación de relaciones antes de insertar registros.

### 2. Campos Obligatorios No Disponibles

**Desafío**: Algunos campos obligatorios en la nueva estructura no están presentes en los datos de origen.

**Solución**:

- Definición de valores predeterminados basados en el contexto del negocio.
- Uso de constantes para valores comunes como IDs de clínica y super clínica.
- Validación y transformación de datos para asegurar el cumplimiento de restricciones.

### 3. Extracción de Entidades

**Desafío**: Extraer tratamientos y productos únicos de los detalles de presupuestos.

**Solución**:

- Algoritmo para identificar entidades únicas basado en nombre y descripción.
- Uso de estructuras de datos Map para eliminar duplicados.
- Generación de IDs consistentes para mantener referencias.

### 4. Transformación de Datos

**Desafío**: Adaptar los datos al nuevo esquema, considerando diferentes tipos de datos y formatos.

**Solución**:

- Funciones de utilidad para validar y normalizar los diferentes tipos de datos.
- Manejo especial para fechas, valores numéricos y campos de texto.
- Uso de parámetros preparados en consultas SQL para evitar problemas de formato e inyección.

## Mecanismo de Seguimiento

Para facilitar la trazabilidad entre el sistema antiguo y el nuevo:

- Cada entidad migrada mantiene su ID original en un campo `old_id`.
- Se generan logs detallados durante el proceso de migración.
- Se implementan mapas de relación entre IDs antiguos y nuevos que podrían ser exportados para referencia futura.

## Manejo de Errores

El proceso de migración incluye:

- Validación previa de los datos de entrada.
- Transacciones para garantizar que las operaciones sean atómicas.
- Mecanismo de rollback en caso de fallos.
- Logs detallados con información de errores.
- Manejo de excepciones para evitar que un error en un registro afecte a todo el proceso.

## Optimizaciones

Para mejorar el rendimiento y fiabilidad de la migración:

- Procesamiento por lotes para grandes volúmenes de datos.
- Uso de consultas preparadas para mejorar el rendimiento de las inserciones.
- Manejo de memoria eficiente mediante la lectura incremental de archivos XLSX.
- Mapeo de objetos para reducir la complejidad del código.

## Consideraciones de Escalabilidad

El diseño permite:

- Procesar incrementalmente archivos de gran tamaño.
- Adaptar la migración a diferentes fuentes de datos.
- Extender el proceso para incluir más entidades en el futuro.
- Parametrizar valores y comportamientos para diferentes escenarios de migración.

## Pruebas

La estrategia de pruebas incluye:

- Pruebas unitarias para las funciones de utilidad.
- Validación de la integridad de los datos migrados.
- Verificación de las relaciones entre entidades.
- Comparación de conteos y totales entre sistemas.
