-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 18-10-2025 a las 03:11:53
-- Versión del servidor: 12.0.2-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `farmacia_db`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `auth_group`
--

CREATE TABLE `auth_group` (
  `id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `auth_group_permissions`
--

CREATE TABLE `auth_group_permissions` (
  `id` bigint(20) NOT NULL,
  `group_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `auth_permission`
--

CREATE TABLE `auth_permission` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `content_type_id` int(11) NOT NULL,
  `codename` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `auth_permission`
--

INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES
(1, 'Can add log entry', 1, 'add_logentry'),
(2, 'Can change log entry', 1, 'change_logentry'),
(3, 'Can delete log entry', 1, 'delete_logentry'),
(4, 'Can view log entry', 1, 'view_logentry'),
(5, 'Can add permission', 2, 'add_permission'),
(6, 'Can change permission', 2, 'change_permission'),
(7, 'Can delete permission', 2, 'delete_permission'),
(8, 'Can view permission', 2, 'view_permission'),
(9, 'Can add group', 3, 'add_group'),
(10, 'Can change group', 3, 'change_group'),
(11, 'Can delete group', 3, 'delete_group'),
(12, 'Can view group', 3, 'view_group'),
(13, 'Can add user', 4, 'add_user'),
(14, 'Can change user', 4, 'change_user'),
(15, 'Can delete user', 4, 'delete_user'),
(16, 'Can view user', 4, 'view_user'),
(17, 'Can add content type', 5, 'add_contenttype'),
(18, 'Can change content type', 5, 'change_contenttype'),
(19, 'Can delete content type', 5, 'delete_contenttype'),
(20, 'Can view content type', 5, 'view_contenttype'),
(21, 'Can add session', 6, 'add_session'),
(22, 'Can change session', 6, 'change_session'),
(23, 'Can delete session', 6, 'delete_session'),
(24, 'Can view session', 6, 'view_session'),
(25, 'Can add Paciente', 7, 'add_paciente'),
(26, 'Can change Paciente', 7, 'change_paciente'),
(27, 'Can delete Paciente', 7, 'delete_paciente'),
(28, 'Can view Paciente', 7, 'view_paciente'),
(29, 'Can add Orden', 8, 'add_orden'),
(30, 'Can change Orden', 8, 'change_orden'),
(31, 'Can delete Orden', 8, 'delete_orden'),
(32, 'Can view Orden', 8, 'view_orden'),
(33, 'Can add Medicamento', 9, 'add_medicamento'),
(34, 'Can change Medicamento', 9, 'change_medicamento'),
(35, 'Can delete Medicamento', 9, 'delete_medicamento'),
(36, 'Can view Medicamento', 9, 'view_medicamento');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `auth_user`
--

CREATE TABLE `auth_user` (
  `id` int(11) NOT NULL,
  `password` varchar(128) NOT NULL,
  `last_login` datetime(6) DEFAULT NULL,
  `is_superuser` tinyint(1) NOT NULL,
  `username` varchar(150) NOT NULL,
  `first_name` varchar(150) NOT NULL,
  `last_name` varchar(150) NOT NULL,
  `email` varchar(254) NOT NULL,
  `is_staff` tinyint(1) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `date_joined` datetime(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `auth_user`
--

INSERT INTO `auth_user` (`id`, `password`, `last_login`, `is_superuser`, `username`, `first_name`, `last_name`, `email`, `is_staff`, `is_active`, `date_joined`) VALUES
(1, 'pbkdf2_sha256$1000000$aTSKJD0A3mpblnOfnSlNaP$mGNIkvvIcosfSAyLt0cFwqWeFNVrrNp/lG530LO/0pQ=', '2025-10-18 01:10:04.490337', 1, 'admin', '', '', 'farmacia@farmacia.com', 1, 1, '2025-10-16 02:09:40.779770');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `auth_user_groups`
--

CREATE TABLE `auth_user_groups` (
  `id` bigint(20) NOT NULL,
  `user_id` int(11) NOT NULL,
  `group_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `auth_user_user_permissions`
--

CREATE TABLE `auth_user_user_permissions` (
  `id` bigint(20) NOT NULL,
  `user_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `django_admin_log`
--

CREATE TABLE `django_admin_log` (
  `id` int(11) NOT NULL,
  `action_time` datetime(6) NOT NULL,
  `object_id` longtext DEFAULT NULL,
  `object_repr` varchar(200) NOT NULL,
  `action_flag` smallint(5) UNSIGNED NOT NULL CHECK (`action_flag` >= 0),
  `change_message` longtext NOT NULL,
  `content_type_id` int(11) DEFAULT NULL,
  `user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `django_admin_log`
--

INSERT INTO `django_admin_log` (`id`, `action_time`, `object_id`, `object_repr`, `action_flag`, `change_message`, `content_type_id`, `user_id`) VALUES
(4, '2025-10-18 01:10:23.653065', '1', 'admin', 2, '[{\"changed\": {\"fields\": [\"password\"]}}]', 4, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `django_content_type`
--

CREATE TABLE `django_content_type` (
  `id` int(11) NOT NULL,
  `app_label` varchar(100) NOT NULL,
  `model` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `django_content_type`
--

INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES
(1, 'admin', 'logentry'),
(3, 'auth', 'group'),
(2, 'auth', 'permission'),
(4, 'auth', 'user'),
(5, 'contenttypes', 'contenttype'),
(9, 'medicamentos', 'medicamento'),
(8, 'ordenes', 'orden'),
(7, 'pacientes', 'paciente'),
(6, 'sessions', 'session');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `django_migrations`
--

CREATE TABLE `django_migrations` (
  `id` bigint(20) NOT NULL,
  `app` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `applied` datetime(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `django_migrations`
--

INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES
(1, 'contenttypes', '0001_initial', '2025-10-16 02:09:11.502901'),
(2, 'auth', '0001_initial', '2025-10-16 02:09:11.752905'),
(3, 'admin', '0001_initial', '2025-10-16 02:09:11.803877'),
(4, 'admin', '0002_logentry_remove_auto_add', '2025-10-16 02:09:11.803877'),
(5, 'admin', '0003_logentry_add_action_flag_choices', '2025-10-16 02:09:11.812872'),
(6, 'contenttypes', '0002_remove_content_type_name', '2025-10-16 02:09:11.853280'),
(7, 'auth', '0002_alter_permission_name_max_length', '2025-10-16 02:09:11.909789'),
(8, 'auth', '0003_alter_user_email_max_length', '2025-10-16 02:09:11.922991'),
(9, 'auth', '0004_alter_user_username_opts', '2025-10-16 02:09:11.922991'),
(10, 'auth', '0005_alter_user_last_login_null', '2025-10-16 02:09:11.951149'),
(11, 'auth', '0006_require_contenttypes_0002', '2025-10-16 02:09:11.953153'),
(12, 'auth', '0007_alter_validators_add_error_messages', '2025-10-16 02:09:11.959587'),
(13, 'auth', '0008_alter_user_username_max_length', '2025-10-16 02:09:11.973225'),
(14, 'auth', '0009_alter_user_last_name_max_length', '2025-10-16 02:09:11.988748'),
(15, 'auth', '0010_alter_group_name_max_length', '2025-10-16 02:09:12.007374'),
(16, 'auth', '0011_update_proxy_permissions', '2025-10-16 02:09:12.007374'),
(17, 'auth', '0012_alter_user_first_name_max_length', '2025-10-16 02:09:12.026817'),
(18, 'pacientes', '0001_initial', '2025-10-16 02:09:12.061327'),
(19, 'ordenes', '0001_initial', '2025-10-16 02:09:12.086475'),
(20, 'sessions', '0001_initial', '2025-10-16 02:09:12.118030'),
(21, 'medicamentos', '0001_initial', '2025-10-16 02:38:25.386406'),
(22, 'medicamentos', '0002_alter_medicamento_categoria', '2025-10-16 03:10:48.724664'),
(23, 'ordenes', '0002_alter_orden_estado', '2025-10-16 04:29:22.925070');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `django_session`
--

CREATE TABLE `django_session` (
  `session_key` varchar(40) NOT NULL,
  `session_data` longtext NOT NULL,
  `expire_date` datetime(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `django_session`
--

INSERT INTO `django_session` (`session_key`, `session_data`, `expire_date`) VALUES
('99tp4ks4na9qh0450wtgneahsvzqujxl', '.eJxVjDkOwjAUBe_iGll4jUxJzxms77_gAHKkOKki7g6RUkD7ZuZtKsO61Lx2nvNI6qKMOv1uBfDJbQf0gHafNE5tmceid0UftOvbRPy6Hu7fQYVev3VElHAevHWJpEQJA7NQdMWLZy4UhcEkxyAW2bKJASE4EpPEWQlWvT8b4Tle:1v9vSh:TW912HI8nZBaHToOYSGeuThda73Y61YVKWucLUlWIK0', '2025-11-01 01:10:23.659331');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `medicamentos`
--

CREATE TABLE `medicamentos` (
  `id` bigint(20) NOT NULL,
  `id_medicamento` varchar(50) NOT NULL,
  `nombre_producto` varchar(200) NOT NULL,
  `presentacion` varchar(100) NOT NULL,
  `categoria` varchar(20) NOT NULL,
  `laboratorio` varchar(100) NOT NULL,
  `lote` varchar(50) NOT NULL,
  `fecha_vencimiento` date NOT NULL,
  `stock_actual` int(11) NOT NULL,
  `stock_minimo` int(11) NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `ubicacion` varchar(100) NOT NULL,
  `proveedor` varchar(100) NOT NULL,
  `fecha_ingreso` date NOT NULL,
  `observaciones` longtext NOT NULL,
  `uso_frecuente` tinyint(1) NOT NULL,
  `creado_en` datetime(6) NOT NULL,
  `actualizado_en` datetime(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `medicamentos`
--

INSERT INTO `medicamentos` (`id`, `id_medicamento`, `nombre_producto`, `presentacion`, `categoria`, `laboratorio`, `lote`, `fecha_vencimiento`, `stock_actual`, `stock_minimo`, `precio_unitario`, `ubicacion`, `proveedor`, `fecha_ingreso`, `observaciones`, `uso_frecuente`, `creado_en`, `actualizado_en`) VALUES
(1, '1', 'Paracetamol 500 mg', 'Tabletas x 10', 'analgesico', 'Genfar', 'L1234', '2026-03-15', 120, 30, 1200.00, 'Estante A1', 'Distribuidora Farma', '2025-09-01', 'Buen estado', 0, '2025-10-16 03:39:46.142506', '2025-10-17 19:19:36.191265'),
(2, '2', 'Amoxicilina 500 mg', 'Cápsulas x 12', 'antibiotico', 'Pfizer', 'A5678', '2025-12-30', 60, 20, 3500.00, 'Estante B3', 'FarmaExpress', '2025-08-20', 'Controlado', 0, '2025-10-16 03:39:46.146304', '2025-10-17 19:19:36.201393'),
(3, '3', 'Ibuprofeno 400 mg', 'Tabletas x 10', 'antiinflamatorio', 'Tecnoquímicas', 'B2345', '2026-06-10', 80, 25, 1500.00, 'Estante A2', 'Droguería Central', '2025-09-10', 'Buen estado', 0, '2025-10-16 03:39:46.149331', '2025-10-17 19:19:36.204958'),
(4, '4', 'Loratadina 10 mg', 'Tabletas x 10', 'antialergico', 'MK', 'C6789', '2027-01-05', 45, 15, 1800.00, 'Estante A3', 'Distribuidora Farma', '2025-09-05', 'Mantener seco', 0, '2025-10-16 03:39:46.160551', '2025-10-17 19:19:36.219689'),
(5, '5', 'Omeprazol 20 mg', 'Cápsulas x 14', 'gastroprotector', 'Siegfried', 'D3456', '2026-11-20', 70, 25, 2800.00, 'Estante B1', 'FarmaExpress', '2025-08-18', 'Buen estado', 0, '2025-10-16 03:39:46.163615', '2025-10-17 19:19:36.222071'),
(6, '6', 'Suero Oral 500 ml', 'Botella 500 ml', 'rehidratante', 'Bayer', 'E7890', '2027-04-15', 30, 10, 3500.00, 'Estante C1', 'Droguería Central', '2025-09-12', 'Frágil', 0, '2025-10-16 03:39:46.165720', '2025-10-17 19:19:36.224273'),
(7, '7', 'Alcohol Antiséptico 70%', 'Frasco 500 ml', 'antiseptico', 'Bayer', 'F8910', '2027-05-10', 25, 10, 5000.00, 'Estante C2', 'Droguería Central', '2025-10-01', 'Frágil', 1, '2025-10-16 03:39:46.167953', '2025-10-17 19:19:36.239969'),
(8, '8', 'Acetaminofén Pediátrico 120 mg/5ml', 'Frasco 120 ml', 'analgesico', 'MK', 'G2341', '2026-08-25', 55, 15, 4200.00, 'Estante D1', 'Distribuidora Farma', '2025-09-08', 'Uso pediátrico', 1, '2025-10-16 03:39:46.169883', '2025-10-17 19:19:36.241985'),
(9, '9', 'Diclofenaco Sódico 50 mg', 'Tabletas x 10', 'antiinflamatorio', 'Tecnoquímicas', 'H5674', '2026-09-10', 90, 25, 1600.00, 'Estante A4', 'FarmaExpress', '2025-09-15', 'Buen estado', 0, '2025-10-16 03:39:46.171901', '2025-10-17 19:19:36.243881'),
(10, '10', 'Clorfenamina 4 mg', 'Tabletas x 10', 'antialergico', 'Genfar', 'I4567', '2026-12-12', 55, 20, 1300.00, 'Estante A3', 'Distribuidora Farma', '2025-09-03', 'Mantener seco', 0, '2025-10-16 03:39:46.187166', '2025-10-17 19:19:36.253302');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ordenes`
--

CREATE TABLE `ordenes` (
  `id` bigint(20) NOT NULL,
  `identificacion` varchar(50) NOT NULL,
  `fecha` date NOT NULL,
  `estado` varchar(20) NOT NULL,
  `descripcion` longtext NOT NULL,
  `creado_en` datetime(6) NOT NULL,
  `actualizado_en` datetime(6) NOT NULL,
  `paciente_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `ordenes`
--

INSERT INTO `ordenes` (`id`, `identificacion`, `fecha`, `estado`, `descripcion`, `creado_en`, `actualizado_en`, `paciente_id`) VALUES
(1, 'ORD-001', '2025-10-16', 'entregado', 'SE ENTREGO POR URGENCIAS', '2025-10-16 04:35:53.418389', '2025-10-16 04:35:53.418389', 1),
(2, 'ORD-002', '2025-10-16', 'pendiente', 'NO HAY', '2025-10-16 04:39:43.765325', '2025-10-16 04:39:43.765325', 1),
(3, 'ORD-003', '2025-10-16', 'entregado', 'SE ENTRO POR URGENCIAS', '2025-10-17 00:05:09.248315', '2025-10-17 00:05:09.248315', 2),
(4, 'ORD-004', '2025-10-16', 'pendiente', 'EJEMPLO', '2025-10-17 00:13:11.872610', '2025-10-17 18:00:14.221924', 2);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pacientes`
--

CREATE TABLE `pacientes` (
  `id` bigint(20) NOT NULL,
  `nombre_completo` varchar(200) NOT NULL,
  `tipo_identificacion` varchar(2) NOT NULL,
  `numero_identificacion` varchar(20) NOT NULL,
  `fecha_ingreso` date NOT NULL,
  `ultima_atencion` date DEFAULT NULL,
  `observaciones` longtext NOT NULL,
  `creado_en` datetime(6) NOT NULL,
  `actualizado_en` datetime(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pacientes`
--

INSERT INTO `pacientes` (`id`, `nombre_completo`, `tipo_identificacion`, `numero_identificacion`, `fecha_ingreso`, `ultima_atencion`, `observaciones`, `creado_en`, `actualizado_en`) VALUES
(1, 'TEST', 'CC', '1234567890', '2025-10-16', '2025-10-10', 'TEST DE FUNCIONAMIENTO', '2025-10-16 04:33:56.343729', '2025-10-16 04:33:56.343729'),
(2, 'JUAN CAMILO PEREZ', 'CC', '1020304050', '2025-10-16', '2025-10-14', 'HOLA, ESTO ES UN TEST DE FUNCIONAMIENTO', '2025-10-17 00:01:17.229155', '2025-10-17 00:01:17.230156');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `auth_group`
--
ALTER TABLE `auth_group`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indices de la tabla `auth_group_permissions`
--
ALTER TABLE `auth_group_permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `auth_group_permissions_group_id_permission_id_0cd325b0_uniq` (`group_id`,`permission_id`),
  ADD KEY `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` (`permission_id`);

--
-- Indices de la tabla `auth_permission`
--
ALTER TABLE `auth_permission`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `auth_permission_content_type_id_codename_01ab375a_uniq` (`content_type_id`,`codename`);

--
-- Indices de la tabla `auth_user`
--
ALTER TABLE `auth_user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indices de la tabla `auth_user_groups`
--
ALTER TABLE `auth_user_groups`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `auth_user_groups_user_id_group_id_94350c0c_uniq` (`user_id`,`group_id`),
  ADD KEY `auth_user_groups_group_id_97559544_fk_auth_group_id` (`group_id`);

--
-- Indices de la tabla `auth_user_user_permissions`
--
ALTER TABLE `auth_user_user_permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `auth_user_user_permissions_user_id_permission_id_14a6b632_uniq` (`user_id`,`permission_id`),
  ADD KEY `auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm` (`permission_id`);

--
-- Indices de la tabla `django_admin_log`
--
ALTER TABLE `django_admin_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `django_admin_log_content_type_id_c4bce8eb_fk_django_co` (`content_type_id`),
  ADD KEY `django_admin_log_user_id_c564eba6_fk_auth_user_id` (`user_id`);

--
-- Indices de la tabla `django_content_type`
--
ALTER TABLE `django_content_type`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `django_content_type_app_label_model_76bd3d3b_uniq` (`app_label`,`model`);

--
-- Indices de la tabla `django_migrations`
--
ALTER TABLE `django_migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `django_session`
--
ALTER TABLE `django_session`
  ADD PRIMARY KEY (`session_key`),
  ADD KEY `django_session_expire_date_a5c62663` (`expire_date`);

--
-- Indices de la tabla `medicamentos`
--
ALTER TABLE `medicamentos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id_medicamento` (`id_medicamento`);

--
-- Indices de la tabla `ordenes`
--
ALTER TABLE `ordenes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `identificacion` (`identificacion`),
  ADD KEY `ordenes_paciente_id_227be46d_fk_pacientes_id` (`paciente_id`);

--
-- Indices de la tabla `pacientes`
--
ALTER TABLE `pacientes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `pacientes_tipo_identificacion_nume_b155e6e3_uniq` (`tipo_identificacion`,`numero_identificacion`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `auth_group`
--
ALTER TABLE `auth_group`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `auth_group_permissions`
--
ALTER TABLE `auth_group_permissions`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `auth_permission`
--
ALTER TABLE `auth_permission`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT de la tabla `auth_user`
--
ALTER TABLE `auth_user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `auth_user_groups`
--
ALTER TABLE `auth_user_groups`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `auth_user_user_permissions`
--
ALTER TABLE `auth_user_user_permissions`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `django_admin_log`
--
ALTER TABLE `django_admin_log`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `django_content_type`
--
ALTER TABLE `django_content_type`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `django_migrations`
--
ALTER TABLE `django_migrations`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT de la tabla `medicamentos`
--
ALTER TABLE `medicamentos`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `ordenes`
--
ALTER TABLE `ordenes`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `pacientes`
--
ALTER TABLE `pacientes`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `auth_group_permissions`
--
ALTER TABLE `auth_group_permissions`
  ADD CONSTRAINT `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  ADD CONSTRAINT `auth_group_permissions_group_id_b120cbf9_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`);

--
-- Filtros para la tabla `auth_permission`
--
ALTER TABLE `auth_permission`
  ADD CONSTRAINT `auth_permission_content_type_id_2f476e4b_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`);

--
-- Filtros para la tabla `auth_user_groups`
--
ALTER TABLE `auth_user_groups`
  ADD CONSTRAINT `auth_user_groups_group_id_97559544_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`),
  ADD CONSTRAINT `auth_user_groups_user_id_6a12ed8b_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`);

--
-- Filtros para la tabla `auth_user_user_permissions`
--
ALTER TABLE `auth_user_user_permissions`
  ADD CONSTRAINT `auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  ADD CONSTRAINT `auth_user_user_permissions_user_id_a95ead1b_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`);

--
-- Filtros para la tabla `django_admin_log`
--
ALTER TABLE `django_admin_log`
  ADD CONSTRAINT `django_admin_log_content_type_id_c4bce8eb_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`),
  ADD CONSTRAINT `django_admin_log_user_id_c564eba6_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`);

--
-- Filtros para la tabla `ordenes`
--
ALTER TABLE `ordenes`
  ADD CONSTRAINT `ordenes_paciente_id_227be46d_fk_pacientes_id` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
