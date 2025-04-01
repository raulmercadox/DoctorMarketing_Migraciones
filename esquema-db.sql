-- Tablas con datos predefinidos (referencia)

CREATE TABLE `estado_registro` (
    id_estado INT AUTO_INCREMENT,
    nombre_estado VARCHAR(50) NOT NULL,
    descripcion TEXT,
    PRIMARY KEY (id_estado),
    UNIQUE INDEX (nombre_estado)
);

INSERT INTO `estado_registro` VALUES
(1, 'activo', 'Registro operativo y visible'),
(2, 'inactivo', 'Registro oculto, pero mantenido en el sistema'),
(3, 'archivado', 'Registro guardado para referencia histórica');

CREATE TABLE `sexo` (
    id_sexo INT AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL,
    PRIMARY KEY (id_sexo)
);

INSERT INTO `sexo` VALUES
(1, 'Masculino'),
(2, 'Femenino');

CREATE TABLE `tipo_iva` (
    id_tipo_iva BIGINT AUTO_INCREMENT,
    descripcion VARCHAR(100) NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (id_tipo_iva)
);

INSERT INTO `tipo_iva` VALUES
(1, 'Iva 21%', 0.21),
(2, 'Iva 10%', 0.10),
(3, 'Iva 5%', 0.05),
(4, 'Iva 0%', 0.00),
(5, 'Iva 4%', 0.04);

CREATE TABLE `tipo_pago_presupuesto` (
    id_tipo_pago INT AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL,
    descripcion VARCHAR(255),
    activo TINYINT(1) NOT NULL DEFAULT 1,
    PRIMARY KEY (id_tipo_pago)
);

INSERT INTO `tipo_pago_presupuesto` VALUES
(1, 'Al contado', 'El cliente podrá pagar el importe total de una sola vez o realizar pagos parciales como anticipos hasta completar el importe total sin un plan formal de plazos.', 1),
(2, 'A plazo', 'El cliente pagará el importe total mediante un plan de financiación con varios plazos establecidos. Incluye opciones de financiación con o sin intereses según se configure posteriormente.', 1),
(3, 'Por cita', 'El cliente pagará según avance el tratamiento, asociando los pagos a las citas realizadas. Permite flexibilidad en el monto a pagar en cada visita.', 1);

CREATE TABLE `estados_presupuestos` (
    id INT AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL,
    descripcion VARCHAR(255),
    PRIMARY KEY (id)
);

INSERT INTO `estados_presupuestos` VALUES
(1, 'Pendiente', 'Presupuesto creado pero no aceptado aún'),
(2, 'Aceptado', 'Presupuesto aceptado por el paciente'),
(3, 'Rechazado', 'Presupuesto rechazado por el paciente'),
(4, 'Finalizado', 'Tratamiento completado y presupuesto cerrado');

-- Tablas de referencia con estructura completa
CREATE TABLE `super_clinicas` (
    id_super_clinica BIGINT AUTO_INCREMENT,
    nombre_super_clinica VARCHAR(255) NOT NULL,
    direccion VARCHAR(255),
    ciudad VARCHAR(100),
    pais VARCHAR(100),
    PRIMARY KEY (id_super_clinica)
);

-- Insertar datos de ejemplo para super_clinicas
INSERT INTO `super_clinicas` (id_super_clinica, nombre_super_clinica, direccion, ciudad, pais) VALUES
(2, 'Super Clinica Default', 'Av. Principal 123', 'Madrid', 'España'),
(47, 'Grupo Clínico Dental Plus', 'Calle San Bernardo 61', 'Barcelona', 'España');

CREATE TABLE `clinicas` (
    id_clinica BIGINT AUTO_INCREMENT,
    id_super_clinica BIGINT,
    nombre_clinica VARCHAR(255) NOT NULL,
    cif VARCHAR(50),
    direccion VARCHAR(255),
    telefono VARCHAR(20),
    ciudad VARCHAR(100),
    pais VARCHAR(100),
    email VARCHAR(100),
    codigo_postal VARCHAR(10) NOT NULL,
    url_logo VARCHAR(255),
    url_firma VARCHAR(255),
    rep_legal VARCHAR(255),
    nif_rep_legal VARCHAR(50),
    PRIMARY KEY (id_clinica),
    FOREIGN KEY (id_super_clinica) REFERENCES super_clinicas (id_super_clinica)
);

-- Insertar datos de ejemplo para clinicas
INSERT INTO `clinicas` (id_clinica, id_super_clinica, nombre_clinica, cif, direccion, telefono, ciudad, pais, email, codigo_postal) VALUES
(37, 2, 'Clinica Default', 'B12345678', 'Calle Mayor 45', '912345678', 'Madrid', 'España', 'contacto@clinicadefault.com', '28001'),
(63, 47, 'DentalCare Madrid Centro', 'B87654321', 'Gran Vía 72', '913456789', 'Madrid', 'España', 'info@dentalcare.es', '28013');

-- Tablas para migración

CREATE TABLE `clientes` (
    id_cliente BIGINT AUTO_INCREMENT,
    nombre VARCHAR(100),
    apellido VARCHAR(100),
    email VARCHAR(100),
    telefono VARCHAR(20),
    direccion VARCHAR(255),
    ciudad VARCHAR(100),
    codigo_postal VARCHAR(10),
    nif_cif VARCHAR(20),
    id_clinica BIGINT,
    id_super_clinica BIGINT,
    referido VARCHAR(255),
    PRIMARY KEY (id_cliente),
    FOREIGN KEY (id_clinica) REFERENCES clinicas (id_clinica),
    FOREIGN KEY (id_super_clinica) REFERENCES super_clinicas (id_super_clinica)
);

CREATE TABLE `pacientes` (
    id_paciente BIGINT AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    telefono VARCHAR(30) NOT NULL,
    fecha_nacimiento DATE,
    id_sexo INT,
    direccion VARCHAR(255),
    ciudad VARCHAR(100),
    id_clinica BIGINT,
    codigo_postal VARCHAR(10) NOT NULL DEFAULT '0',
    nif_cif VARCHAR(255) NOT NULL DEFAULT '0',
    referido VARCHAR(255),
    id_super_clinica BIGINT NOT NULL,
    id_estado_registro INT,
    id_cliente BIGINT,
    lopd_aceptado TINYINT(1) NOT NULL DEFAULT 0,
    Importado INT,
    kommo_lead_id VARCHAR(255),
    old_id BIGINT,
    fecha_alta DATE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    usuario_creacion VARCHAR(100),
    id_usuario_creacion BIGINT,
    PRIMARY KEY (id_paciente),
    FOREIGN KEY (id_sexo) REFERENCES sexo (id_sexo),
    FOREIGN KEY (id_clinica) REFERENCES clinicas (id_clinica),
    FOREIGN KEY (id_super_clinica) REFERENCES super_clinicas (id_super_clinica),
    FOREIGN KEY (id_estado_registro) REFERENCES estado_registro (id_estado),
    FOREIGN KEY (id_cliente) REFERENCES clientes (id_cliente)
);

CREATE TABLE `tratamientos` (
    id_tratamiento BIGINT AUTO_INCREMENT,
    nombre_tratamiento VARCHAR(255),
    descripcion TEXT,
    duracion INT,
    precio DECIMAL(10,4),
    id_clinica BIGINT,
    id_super_clinica BIGINT NOT NULL,
    id_tipo_iva BIGINT NOT NULL,
    id_estado_registro INT NOT NULL DEFAULT 1,
    PRIMARY KEY (id_tratamiento),
    FOREIGN KEY (id_clinica) REFERENCES clinicas (id_clinica),
    FOREIGN KEY (id_super_clinica) REFERENCES super_clinicas (id_super_clinica),
    FOREIGN KEY (id_tipo_iva) REFERENCES tipo_iva (id_tipo_iva),
    FOREIGN KEY (id_estado_registro) REFERENCES estado_registro (id_estado)
);

CREATE TABLE `productos` (
    id_producto BIGINT AUTO_INCREMENT,
    nombre_producto VARCHAR(255),
    descripcion TEXT,
    stock INT,
    precio DECIMAL(10,4),
    id_clinica BIGINT,
    id_super_clinica BIGINT NOT NULL,
    id_tipo_iva BIGINT NOT NULL,
    id_estado_registro INT NOT NULL DEFAULT 1,
    codigo VARCHAR(100),
    codigo_barras VARCHAR(100),
    proveedor VARCHAR(255),
    precio_costo DECIMAL(10,4),
    descuento DECIMAL(10,2) DEFAULT 0.00,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    usuario_creacion VARCHAR(100),
    id_usuario_creacion BIGINT,
    PRIMARY KEY (id_producto),
    FOREIGN KEY (id_clinica) REFERENCES clinicas (id_clinica),
    FOREIGN KEY (id_super_clinica) REFERENCES super_clinicas (id_super_clinica),
    FOREIGN KEY (id_tipo_iva) REFERENCES tipo_iva (id_tipo_iva),
    FOREIGN KEY (id_estado_registro) REFERENCES estado_registro (id_estado)
);

CREATE TABLE `presupuestos` (
    id_presupuesto BIGINT AUTO_INCREMENT,
    id_paciente BIGINT NOT NULL,
    id_super_clinica BIGINT NOT NULL,
    id_clinica BIGINT NOT NULL,
    fecha DATETIME NOT NULL,
    url_presupuesto TEXT,
    monto_total DECIMAL(10,2) NOT NULL,
    monto_pagado DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    saldo_pendiente DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    id_estado INT NOT NULL DEFAULT 1,
    id_tipo_pago INT,
    old_id BIGINT NOT NULL,
    id_estado_registro INT DEFAULT 1,
    numero_historia VARCHAR(50),
    id_contacto BIGINT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    usuario_creacion VARCHAR(100),
    id_usuario_creacion BIGINT,
    PRIMARY KEY (id_presupuesto),
    FOREIGN KEY (id_paciente) REFERENCES pacientes (id_paciente) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (id_super_clinica) REFERENCES super_clinicas (id_super_clinica),
    FOREIGN KEY (id_clinica) REFERENCES clinicas (id_clinica),
    FOREIGN KEY (id_estado) REFERENCES estados_presupuestos (id),
    FOREIGN KEY (id_tipo_pago) REFERENCES tipo_pago_presupuesto (id_tipo_pago)
);

CREATE TABLE `detalle_presupuesto` (
    id_detalle_presupuesto BIGINT AUTO_INCREMENT,
    id_presupuesto BIGINT NOT NULL,
    id_tratamiento BIGINT,
    item INT NOT NULL,
    descripcion VARCHAR(255) NOT NULL,
    cantidad INT NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    descuento DECIMAL(10,2) NOT NULL,
    id_tipo_iva BIGINT,
    total_item DECIMAL(10,2) NOT NULL,
    id_producto BIGINT,
    old_id INT NOT NULL DEFAULT 0,
    PRIMARY KEY (id_detalle_presupuesto),
    FOREIGN KEY (id_presupuesto) REFERENCES presupuestos (id_presupuesto) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (id_tratamiento) REFERENCES tratamientos (id_tratamiento) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (id_producto) REFERENCES productos (id_producto) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (id_tipo_iva) REFERENCES tipo_iva (id_tipo_iva)
);