# Sistema de Migración para Clínica Dental

Este proyecto consiste en un sistema de migración de datos para una clínica dental, que traslada información desde un sistema heredado a una nueva estructura de base de datos mejorada. Incluye también una API REST para consultar los datos migrados.

## Características

- Script de migración en Node.js para procesar archivos XLSX
- API REST con Express.js para consultar los datos
- Manejo adecuado de relaciones entre tablas
- Extracción de tratamientos y productos de los detalles de presupuestos
- Validación de datos antes de la inserción
- Manejo de valores por defecto según el esquema

## Requisitos

- Node.js (v14 o superior)
- MySQL (v5.7 o superior)
- Gestor de paquetes npm

## Estructura del Proyecto

```
clinica-dental-migracion/
├── data/                      # Archivos XLSX de entrada
│   ├── pacientes.xlsx
│   ├── presupuestos.xlsx
│   └── presupuestos_detalle.xlsx
├── db/                        # Configuración de la base de datos
│   ├── db.js
├── documentacion/             # Documentación del Sistema
│   ├── API-DOCUMENTACION.md
│   ├── ESTRATEGIA-MIGRACION.md
│   ├── INSTALACION.md
├── routes/                    # Rutas de la API
│   ├── pacientes.js
│   ├── presupuestos.js
│   ├── tratamientos.js
│   └── productos.js
├── tests/                     # Pruebas Unitarias
│   └── api.test.js
│   └── migration.test.js
├── utils/                     # Utilidades
│   └── migrationHelpers.js
│   └── xlsxHelpers.js
├── .env                       # Variables de entorno
├── migration.js               # Script de migración
├── package.json
├── server.js                  # Servidor API REST
└── README.md
```

## Instalación

1. Clonar el repositorio:

   ```bash
   git clone https://github.com/tuusuario/clinica-dental-migracion.git
   cd clinica-dental-migracion
   ```

2. Instalar las dependencias:

   ```bash
   npm install
   ```

3. Configurar las variables de entorno creando un archivo `.env` en la raíz del proyecto:

   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=su_contraseña
   DB_NAME=clinica_dental
   PORT=3000
   NODE_ENV=development
   ```

4. Crear la base de datos y las tablas utilizando el script SQL proporcionado:

   ```bash
   mysql -u root -p < esquema-db.sql
   ```

5. Colocar los archivos XLSX en el directorio `data/`:
   - `pacientes.xlsx`
   - `presupuestos.xlsx`
   - `presupuestos_detalle.xlsx`

## Uso

### Ejecutar la Migración

Para iniciar el proceso de migración:

```bash
npm run migrate
```

Este comando leerá los archivos XLSX, procesará los datos y los insertará en la base de datos respetando las relaciones y restricciones.

### Iniciar el Servidor API

Para iniciar el servidor API REST:

```bash
npm start
```

O para correrlo en modo live view:

```bash
npm run dev
```

## Estrategia de Migración

La migración se realiza en varias etapas, siguiendo un orden específico para mantener la integridad referencial:

1. **Migración de pacientes**: Se procesan primero ya que otras entidades dependen de ellos.
2. **Extracción y migración de tratamientos y productos**: Se identifican tratamientos y productos únicos a partir de los detalles de presupuestos.
3. **Migración de presupuestos**: Se utilizan los IDs de los pacientes migrados.
4. **Migración de detalles de presupuestos**: Se relacionan con los presupuestos, tratamientos y productos previamente migrados.

### Decisiones de Implementación

- **Manejo de campos obligatorios**: Para campos obligatorios que no están en los archivos de entrada, se utilizan valores predeterminados definidos en la base de datos o en la configuración.
- **Identificación de entidades**: Los tratamientos y productos se identifican por su nombre único y descripción.
- **Mapeo de IDs**: Se utiliza el campo `old_id` para mantener una referencia al ID original del sistema heredado.
- **Transacciones**: La migración se realiza dentro de una transacción para garantizar la consistencia de los datos.

## Endpoints de la API

### Pacientes

- `GET /api/pacientes`: Lista de pacientes con paginación
  - Parámetros: `page`, `limit`, `search`
- `GET /api/pacientes/:id`: Detalles de un paciente específico y sus presupuestos

### Presupuestos

- `GET /api/presupuestos`: Lista de presupuestos con paginación
  - Parámetros: `page`, `limit`, `search`, `estado`
- `GET /api/presupuestos/:id`: Detalles de un presupuesto específico, incluyendo sus líneas de detalle

### Tratamientos

- `GET /api/tratamientos`: Lista de tratamientos extraídos con paginación
  - Parámetros: `page`, `limit`, `search`
- `GET /api/tratamientos/:id`: Detalles de un tratamiento específico

### Productos

- `GET /api/productos`: Lista de productos extraídos con paginación
  - Parámetros: `page`, `limit`, `search`
- `GET /api/productos/:id`: Detalles de un producto específico

## Consideraciones Adicionales

- La API implementa paginación para optimizar las consultas con grandes volúmenes de datos.
- Se incluye un sistema de búsqueda para filtrar resultados.
- Las respuestas de la API siguen un formato estandarizado con metadatos de paginación.
- El sistema de migración incluye logs detallados para facilitar el seguimiento y depuración.
- Se implementa manejo de errores para proporcionar mensajes claros al usuario.
