# Documentación de la API REST

## Información General

La API REST proporciona acceso a los datos migrados de la clínica dental. Todos los endpoints devuelven datos en formato JSON.

**URL Base**: `http://localhost:3000/api`

## Formato de Respuesta

Las respuestas siguen un formato estándar:

```json
{
  "error": false,
  "count": 10,
  "total": 100,
  "page": 1,
  "limit": 10,
  "totalPages": 10,
  "data": [...]
}
```

Donde:

- `error`: Indica si hubo un error (boolean)
- `count`: Número de registros en la respuesta actual
- `total`: Número total de registros disponibles
- `page`: Página actual
- `limit`: Límite de registros por página
- `totalPages`: Número total de páginas
- `data`: Array con los datos solicitados

En caso de error, la respuesta tendrá el siguiente formato:

```json
{
  "error": true,
  "message": "Descripción del error"
}
```

## Autenticación

Actualmente, la API no requiere autenticación. Está diseñada para uso local o en un entorno seguro.

## Endpoints

### Pacientes

#### Obtener todos los pacientes

```
GET /pacientes
```

Parámetros de consulta opcionales:

- `page`: Número de página (por defecto: 1)
- `limit`: Número de resultados por página (por defecto: 10)
- `search`: Buscar por nombre, apellido, email o teléfono

Ejemplo de respuesta:

```json
{
  "error": false,
  "count": 2,
  "total": 2,
  "page": 1,
  "limit": 10,
  "totalPages": 1,
  "data": [
    {
      "id_paciente": 1,
      "nombre": "Rosi",
      "apellido": "Ayala Plaza",
      "email": "rosiayalaplaza1@gmail.com",
      "telefono": "658852058",
      "fecha_nacimiento": "1953-02-07",
      "fecha_alta": "2023-03-26"
    },
    {
      "id_paciente": 2,
      "nombre": "Juan",
      "apellido": "Pérez García",
      "email": "juan@example.com",
      "telefono": "612345678",
      "fecha_nacimiento": "1980-05-15",
      "fecha_alta": "2023-01-10"
    }
  ]
}
```

#### Obtener un paciente específico

```
GET /pacientes/:id
```

Parámetros de ruta:

- `id`: ID del paciente

Ejemplo de respuesta:

```json
{
  "error": false,
  "data": {
    "id_paciente": 1,
    "nombre": "Rosi",
    "apellido": "Ayala Plaza",
    "email": "rosiayalaplaza1@gmail.com",
    "telefono": "658852058",
    "fecha_nacimiento": "1953-02-07",
    "id_sexo": 2,
    "direccion": null,
    "ciudad": null,
    "id_clinica": 63,
    "codigo_postal": "0",
    "nif_cif": "0",
    "referido": "Particular",
    "id_super_clinica": 47,
    "id_estado_registro": 1,
    "id_cliente": null,
    "lopd_aceptado": 0,
    "Importado": null,
    "kommo_lead_id": null,
    "old_id": "303",
    "fecha_alta": "2023-03-26",
    "fecha_creacion": "2025-01-12 18:21:59",
    "fecha_modificacion": null,
    "usuario_creacion": "importacion Critenias",
    "id_usuario_creacion": null,
    "sexo": "Femenino",
    "nombre_clinica": "DentalCare Madrid Centro",
    "nombre_super_clinica": "Grupo Clínico Dental Plus",
    "presupuestos": [
      {
        "id_presupuesto": 7589,
        "fecha": "2025-02-03 00:18:11",
        "monto_total": "300.00",
        "monto_pagado": "300.00",
        "saldo_pendiente": "0.00",
        "estado": "Pendiente"
      }
    ]
  }
}
```

### Presupuestos

#### Obtener todos los presupuestos

```
GET /presupuestos
```

Parámetros de consulta opcionales:

- `page`: Número de página (por defecto: 1)
- `limit`: Número de resultados por página (por defecto: 10)
- `search`: Buscar por nombre/apellido del paciente o ID del presupuesto
- `estado`: Filtrar por estado (1: Pendiente, 2: Aceptado, 3: Rechazado, 4: Finalizado)

Ejemplo de respuesta:

```json
{
  "error": false,
  "count": 1,
  "total": 1,
  "page": 1,
  "limit": 10,
  "totalPages": 1,
  "data": [
    {
      "id_presupuesto": 7589,
      "fecha": "2025-02-03 00:18:11",
      "monto_total": "300.00",
      "monto_pagado": "300.00",
      "saldo_pendiente": "0.00",
      "id_estado": 1,
      "id_paciente": 246754,
      "nombre_paciente": "Rosi",
      "apellido_paciente": "Ayala Plaza",
      "estado": "Pendiente",
      "nombre_clinica": "DentalCare Madrid Centro",
      "tipo_pago": "Al contado"
    }
  ]
}
```

#### Obtener un presupuesto específico

```
GET /presupuestos/:id
```

Parámetros de ruta:

- `id`: ID del presupuesto

Ejemplo de respuesta:

```json
{
  "error": false,
  "data": {
    "id_presupuesto": 7589,
    "id_paciente": 246754,
    "id_super_clinica": 47,
    "id_clinica": 63,
    "fecha": "2025-02-03 00:18:11",
    "url_presupuesto": "",
    "monto_total": "300.00",
    "monto_pagado": "300.00",
    "saldo_pendiente": "0.00",
    "id_estado": 1,
    "id_tipo_pago": 1,
    "old_id": "0",
    "id_estado_registro": 1,
    "numero_historia": null,
    "id_contacto": null,
    "fecha_creacion": "2025-02-03 00:18:11",
    "fecha_modificacion": "2025-02-11 03:23:41",
    "usuario_creacion": null,
    "id_usuario_creacion": null,
    "nombre_paciente": "Rosi",
    "apellido_paciente": "Ayala Plaza",
    "estado": "Pendiente",
    "tipo_pago": "Al contado",
    "nombre_clinica": "DentalCare Madrid Centro",
    "nombre_super_clinica": "Grupo Clínico Dental Plus",
    "detalles": [
      {
        "id_detalle_presupuesto": 9032,
        "id_presupuesto": 7589,
        "id_tratamiento": null,
        "item": 0,
        "descripcion": "",
        "cantidad": 1,
        "precio": "248.00",
        "descuento": "0.00",
        "id_tipo_iva": 1,
        "total_item": "247.93",
        "id_producto": 455,
        "old_id": 0,
        "nombre_producto": "Crema antiedad",
        "tipo_iva": "Iva 21%",
        "valor_iva": "0.21"
      }
    ],
    "estadisticas": {
      "totalItems": 1,
      "totalProductos": 1,
      "totalTratamientos": 0
    }
  }
}
```

### Tratamientos

#### Obtener todos los tratamientos

```
GET /tratamientos
```

Parámetros de consulta opcionales:

- `page`: Número de página (por defecto: 1)
- `limit`: Número de resultados por página (por defecto: 10)
- `search`: Buscar por nombre o descripción

Ejemplo de respuesta:

```json
{
  "error": false,
  "count": 1,
  "total": 1,
  "page": 1,
  "limit": 10,
  "totalPages": 1,
  "data": [
    {
      "id_tratamiento": 306,
      "nombre_tratamiento": "Cita de valoración",
      "descripcion": "VALORACIÓN PERSONALIZADA DE NUESTRAS PROFESIONALES PARA EL DIAGNOSTICO FACIAL Y CORPORAL INDICANDO LOS MEJORES TRATAMIENTOS SEGÚN LAS PREOCUPACIONES DEL PACIENTE, ASESORANDO DE LAS FORMAS DE PAGO.",
      "duracion": 30,
      "precio": "0.0000",
      "nombre_clinica": "DentalCare Madrid Centro",
      "nombre_super_clinica": "Grupo Clínico Dental Plus",
      "tipo_iva": "Iva 21%",
      "valor_iva": "0.21"
    }
  ]
}
```

#### Obtener un tratamiento específico

```
GET /tratamientos/:id
```

Parámetros de ruta:

- `id`: ID del tratamiento

Ejemplo de respuesta:

```json
{
  "error": false,
  "data": {
    "id_tratamiento": 306,
    "nombre_tratamiento": "Cita de valoración",
    "descripcion": "VALORACIÓN PERSONALIZADA DE NUESTRAS PROFESIONALES PARA EL DIAGNOSTICO FACIAL Y CORPORAL INDICANDO LOS MEJORES TRATAMIENTOS SEGÚN LAS PREOCUPACIONES DEL PACIENTE, ASESORANDO DE LAS FORMAS DE PAGO.",
    "duracion": 30,
    "precio": "0.0000",
    "id_clinica": 63,
    "id_super_clinica": 47,
    "id_tipo_iva": 1,
    "id_estado_registro": 1,
    "nombre_clinica": "DentalCare Madrid Centro",
    "nombre_super_clinica": "Grupo Clínico Dental Plus",
    "tipo_iva": "Iva 21%",
    "valor_iva": "0.21",
    "presupuestos": [
      {
        "id_presupuesto": 7590,
        "fecha": "2025-02-10 10:30:00",
        "nombre_paciente": "María",
        "apellido_paciente": "González",
        "precio": "0.00",
        "cantidad": 1,
        "total_item": "0.00"
      }
    ]
  }
}
```

### Productos

#### Obtener todos los productos

```
GET /productos
```

Parámetros de consulta opcionales:

- `page`: Número de página (por defecto: 1)
- `limit`: Número de resultados por página (por defecto: 10)
- `search`: Buscar por nombre, descripción, código o código de barras

Ejemplo de respuesta:

```json
{
  "error": false,
  "count": 1,
  "total": 1,
  "page": 1,
  "limit": 10,
  "totalPages": 1,
  "data": [
    {
      "id_producto": 377,
      "nombre_producto": "Crema antiedad",
      "descripcion": "Antiarrugas",
      "stock": 10,
      "precio": "66.1157",
      "nombre_clinica": "DentalCare Madrid Centro",
      "nombre_super_clinica": "Grupo Clínico Dental Plus",
      "tipo_iva": "Iva 21%",
      "valor_iva": "0.21"
    }
  ]
}
```

#### Obtener un producto específico

```
GET /productos/:id
```

Parámetros de ruta:

- `id`: ID del producto

Ejemplo de respuesta:

```json
{
  "error": false,
  "data": {
    "id_producto": 377,
    "nombre_producto": "Crema antiedad",
    "descripcion": "Antiarrugas",
    "stock": 10,
    "precio": "66.1157",
    "id_clinica": 63,
    "id_super_clinica": 47,
    "id_tipo_iva": 1,
    "id_estado_registro": 1,
    "codigo": null,
    "codigo_barras": null,
    "proveedor": null,
    "precio_costo": null,
    "descuento": "0.00",
    "fecha_creacion": "2025-01-17 10:15:52",
    "fecha_modificacion": "2025-01-17 10:17:44",
    "usuario_creacion": null,
    "id_usuario_creacion": null,
    "nombre_clinica": "DentalCare Madrid Centro",
    "nombre_super_clinica": "Grupo Clínico Dental Plus",
    "tipo_iva": "Iva 21%",
    "valor_iva": "0.21",
    "presupuestos": [
      {
        "id_presupuesto": 7589,
        "fecha": "2025-02-03 00:18:11",
        "nombre_paciente": "Rosi",
        "apellido_paciente": "Ayala Plaza",
        "precio": "248.00",
        "cantidad": 1,
        "total_item": "247.93"
      }
    ]
  }
}
```

## Códigos de Estado HTTP

La API utiliza los siguientes códigos de estado HTTP:

- `200 OK`: La solicitud se completó correctamente
- `400 Bad Request`: La solicitud contiene parámetros incorrectos
- `404 Not Found`: El recurso solicitado no existe
- `500 Internal Server Error`: Error en el servidor

## Consideraciones Técnicas

- La API implementa paginación para todas las listas de recursos
- Los resultados se pueden filtrar utilizando el parámetro `search`
- La API sigue un diseño RESTful
- Todos los endpoints son de solo lectura (GET) ya que el propósito principal es consultar los datos migrados

## Ejemplos de Uso

### Obtener pacientes con paginación y búsqueda

```bash
curl "http://localhost:3000/api/pacientes?page=1&limit=5&search=Ayala"
```

### Obtener un presupuesto específico con sus detalles

```bash
curl "http://localhost:3000/api/presupuestos/7589"
```

### Obtener tratamientos filtrados por descripción

```bash
curl "http://localhost:3000/api/tratamientos?search=valoración"
```
