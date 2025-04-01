# Instrucciones de Instalación y Ejecución

## Configuración del Entorno

### Requisitos Previos

- Node.js (v14 o superior)
- MySQL (v5.7 o superior)
- npm (incluido con Node.js)

### Pasos de Instalación

1. **Clonar el repositorio**

   ```

   ```

2. **Verificar la API REST**

   Para comprobar que la API está funcionando correctamente, probar el siguiente endpoint (se puede usar el navegador, curl o postman):

   ```bash
   curl http://localhost:3000/api/pacientes
   ```

   Se debería recibir una respuesta JSON con la lista de pacientes migrados.

## Estructura de Directorios

```
clinica-dental-migracion/
├── data/                     # Archivos XLSX de entrada
├── routes/                   # Rutas de la API
│   ├── pacientes.js
│   ├── presupuestos.js
│   ├── tratamientos.js
│   └── productos.js
├── utils/                    # Funciones de utilidad
│   ├── migrationHelpers.js
│   └── xlsxHelpers.js
├── tests/                    # Pruebas unitarias
├── .env                      # Variables de entorno
├── db.js                     # Configuración de la base de datos
├── migration.js              # Script de migración
├── server.js                 # Servidor API REST
└── package.json
```

Si hay algún problema con la instalación, se sugiere consultar los logs.

````

2. **Instalar dependencias**

```bash
npm install
````

3. **Configurar variables de entorno**

   Crear un archivo `.env` en la raíz del proyecto con el siguiente contenido:

   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=tu_contraseña
   DB_NAME=clinica_dental
   PORT=3000
   NODE_ENV=development
   ```

   Ajusta los valores según la configuración de MySQL.

4. **Crear la base de datos**

   ```bash
   mysql -u root -p
   ```

   Una vez dentro del cliente MySQL:

   ```sql
   CREATE DATABASE clinica_dental CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   EXIT;
   ```

5. **Importar esquema de base de datos**

   ```bash
   mysql -u root -p clinica_dental < esquema-db.sql
   ```

6. **Preparar archivos XLSX para la migración**

   Coloca los archivos de datos en la carpeta `data/`:

   - `pacientes.xlsx`
   - `presupuestos.xlsx`
   - `presupuestos_detalle.xlsx`

## Ejecución

### Migración de Datos

Para ejecutar la migración de datos:

```bash
npm run migrate
```

El proceso leerá los archivos XLSX, extraerá la información necesaria y la insertará en la base de datos. Se mostrarán logs en la consola con el progreso y posibles errores.

### Iniciar la API REST

Para iniciar el servidor API:

```bash
npm start
```

La API estará disponible en `http://localhost:3000`

Para desarrollo con live view ejecutar el siguiente comando:

```bash
npm run dev
```

## Verificación de la Instalación

1. **Verificar la base de datos**

   Puedes verificar que los datos se hayan migrado correctamente usando:

   ```bash
   mysql -u root -p clinica_dental -e "SELECT COUNT(*) FROM pacientes;"
   mysql -u root -p clinica_dental -e "SELECT COUNT(*) FROM presupuestos;"
   mysql -u root -p clinica_dental -e "SELECT COUNT(*) FROM detalle_presupuesto;"
   mysql -u root -p clinica_dental -e "SELECT COUNT(*) FROM tratamientos;"
   mysql -u root -p clinica_dental -e "SELECT COUNT(*) FROM productos;"
   ```
