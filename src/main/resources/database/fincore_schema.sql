CREATE DATABASE IF NOT EXISTS fincore_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE fincore_db;

CREATE TABLE roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(150),
    estado TINYINT(1) NOT NULL DEFAULT 1,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE usuarios (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    correo VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol_id BIGINT NOT NULL,
    estado ENUM('ACTIVO','INACTIVO','BLOQUEADO') NOT NULL DEFAULT 'ACTIVO',
    intentos_fallidos INT NOT NULL DEFAULT 0,
    ultimo_acceso DATETIME NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_usuarios_roles FOREIGN KEY (rol_id) REFERENCES roles(id)
);

CREATE TABLE clientes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    razon_social VARCHAR(150) NOT NULL,
    ruc VARCHAR(11) NULL UNIQUE,
    correo VARCHAR(120),
    telefono VARCHAR(30),
    direccion VARCHAR(200),
    estado TINYINT(1) NOT NULL DEFAULT 1,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE proveedores (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    razon_social VARCHAR(150) NOT NULL,
    ruc VARCHAR(11) NULL UNIQUE,
    correo VARCHAR(120),
    telefono VARCHAR(30),
    direccion VARCHAR(200),
    estado TINYINT(1) NOT NULL DEFAULT 1,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categorias (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    tipo ENUM('INGRESO','EGRESO','AMBOS') NOT NULL DEFAULT 'AMBOS',
    estado TINYINT(1) NOT NULL DEFAULT 1
);

CREATE TABLE cuentas_bancarias (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    banco VARCHAR(100) NOT NULL,
    numero_cuenta VARCHAR(50) NOT NULL UNIQUE,
    cci VARCHAR(50),
    moneda ENUM('PEN','USD') NOT NULL DEFAULT 'PEN',
    saldo_inicial DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    saldo_actual DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    estado TINYINT(1) NOT NULL DEFAULT 1,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE transacciones (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tipo ENUM('INGRESO','EGRESO') NOT NULL,
    fecha DATE NOT NULL,
    descripcion VARCHAR(250),
    monto DECIMAL(14,2) NOT NULL,
    moneda ENUM('PEN','USD') NOT NULL DEFAULT 'PEN',
    referencia VARCHAR(100),
    estado ENUM('PENDIENTE_CONCILIACION','CONCILIADO','ANULADO') NOT NULL DEFAULT 'PENDIENTE_CONCILIACION',
    cliente_id BIGINT NULL,
    proveedor_id BIGINT NULL,
    categoria_id BIGINT NOT NULL,
    cuenta_bancaria_id BIGINT NOT NULL,
    usuario_id BIGINT NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT chk_transacciones_monto CHECK (monto > 0),
    CONSTRAINT fk_transacciones_clientes FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    CONSTRAINT fk_transacciones_proveedores FOREIGN KEY (proveedor_id) REFERENCES proveedores(id),
    CONSTRAINT fk_transacciones_categorias FOREIGN KEY (categoria_id) REFERENCES categorias(id),
    CONSTRAINT fk_transacciones_cuentas FOREIGN KEY (cuenta_bancaria_id) REFERENCES cuentas_bancarias(id),
    CONSTRAINT fk_transacciones_usuarios FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE comprobantes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    transaccion_id BIGINT NOT NULL,
    nombre_archivo VARCHAR(180) NOT NULL,
    ruta_archivo VARCHAR(255) NOT NULL,
    tipo_archivo ENUM('PDF','XML','JPG','PNG') NOT NULL,
    peso_bytes BIGINT NOT NULL,
    subido_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_comprobantes_transacciones FOREIGN KEY (transaccion_id) REFERENCES transacciones(id)
);

CREATE TABLE cargas_bancarias (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    cuenta_bancaria_id BIGINT NOT NULL,
    nombre_archivo VARCHAR(180) NOT NULL,
    fecha_carga TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_id BIGINT NOT NULL,
    estado ENUM('PROCESADO','ERROR','PENDIENTE') NOT NULL DEFAULT 'PENDIENTE',
    CONSTRAINT fk_cargas_cuentas FOREIGN KEY (cuenta_bancaria_id) REFERENCES cuentas_bancarias(id),
    CONSTRAINT fk_cargas_usuarios FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE movimientos_bancarios (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    carga_bancaria_id BIGINT NOT NULL,
    fecha DATE NOT NULL,
    referencia VARCHAR(100),
    descripcion VARCHAR(250),
    monto DECIMAL(14,2) NOT NULL,
    tipo ENUM('INGRESO','EGRESO') NOT NULL,
    estado ENUM('PENDIENTE','CONCILIADO','NO_CONCILIADO') NOT NULL DEFAULT 'PENDIENTE',
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_movimientos_cargas FOREIGN KEY (carga_bancaria_id) REFERENCES cargas_bancarias(id)
);

CREATE TABLE conciliaciones (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    transaccion_id BIGINT NOT NULL,
    movimiento_bancario_id BIGINT NOT NULL,
    metodo ENUM('AUTOMATICO','MANUAL') NOT NULL DEFAULT 'AUTOMATICO',
    estado ENUM('CONCILIADO','OBSERVADO') NOT NULL DEFAULT 'CONCILIADO',
    observacion VARCHAR(250),
    conciliado_por BIGINT NOT NULL,
    conciliado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_conciliaciones_transacciones FOREIGN KEY (transaccion_id) REFERENCES transacciones(id),
    CONSTRAINT fk_conciliaciones_movimientos FOREIGN KEY (movimiento_bancario_id) REFERENCES movimientos_bancarios(id),
    CONSTRAINT fk_conciliaciones_usuarios FOREIGN KEY (conciliado_por) REFERENCES usuarios(id),
    UNIQUE KEY uk_conciliacion_unica (transaccion_id, movimiento_bancario_id)
);

CREATE TABLE auditorias (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id BIGINT NULL,
    modulo VARCHAR(80) NOT NULL,
    accion VARCHAR(80) NOT NULL,
    descripcion VARCHAR(250),
    ip_origen VARCHAR(45),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_auditorias_usuarios FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE INDEX idx_transacciones_fecha ON transacciones(fecha);
CREATE INDEX idx_transacciones_tipo_estado ON transacciones(tipo, estado);
CREATE INDEX idx_transacciones_cuenta ON transacciones(cuenta_bancaria_id);
CREATE INDEX idx_movimientos_fecha_estado ON movimientos_bancarios(fecha, estado);
CREATE INDEX idx_auditorias_fecha ON auditorias(fecha);

INSERT INTO roles(nombre, descripcion) VALUES
('ADMINISTRADOR', 'Acceso completo al sistema'),
('GERENTE', 'Consulta dashboard y reportes'),
('CONTADOR', 'Registra operaciones y genera reportes'),
('TESORERO', 'Gestiona cuentas y conciliación bancaria');

INSERT INTO usuarios(nombre, correo, password_hash, rol_id, estado) VALUES
('Administrador FinCore', 'admin@codenetsolutions.com', '$2a$10$EjemploHashBCryptCambiarLuego', 1, 'ACTIVO'),
('Usuario Gerente', 'gerente@codenetsolutions.com', '$2a$10$EjemploHashBCryptCambiarLuego', 2, 'ACTIVO'),
('Usuario Contador', 'contador@codenetsolutions.com', '$2a$10$EjemploHashBCryptCambiarLuego', 3, 'ACTIVO'),
('Usuario Tesorero', 'tesorero@codenetsolutions.com', '$2a$10$EjemploHashBCryptCambiarLuego', 4, 'ACTIVO');

INSERT INTO categorias(nombre, tipo) VALUES
('Ventas', 'INGRESO'),
('Consultoría', 'INGRESO'),
('Servicios', 'EGRESO'),
('Operativos', 'EGRESO'),
('Administrativos', 'EGRESO'),
('Financieros', 'EGRESO');

INSERT INTO clientes(razon_social, ruc, correo) VALUES
('Cliente A', '20111111111', 'clientea@correo.com'),
('Cliente B', '20222222222', 'clienteb@correo.com');

INSERT INTO proveedores(razon_social, ruc, correo) VALUES
('Proveedor XYZ S.A.C.', '20333333333', 'proveedorxyz@correo.com'),
('Servicios Generales Lima S.A.C.', '20444444444', 'contacto@servicioslima.com');

INSERT INTO cuentas_bancarias(banco, numero_cuenta, cci, moneda, saldo_inicial, saldo_actual) VALUES
('BCP', '191-00000001-0-00', '00219100000001000000', 'PEN', 47180.00, 47180.00),
('Interbank', '200-00000002-0-00', '00320000000002000000', 'PEN', 15000.00, 15000.00);