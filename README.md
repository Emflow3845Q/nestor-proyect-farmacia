### Ejemplo Completo: Crear un Paciente

**1. Usuario completa formulario**

```
Usuario ingresa:
- Nombre: Juan Pérez
- Tipo ID: CC
- Número: 1234567890
- Fecha ingreso: 2025-10-17
```

**2. Frontend envía petición**

```javascript
// frontend/src/components/forms/AddPatientForm.jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  
  const data = {
    nombre_completo: "Juan Pérez",
    tipo_identificacion: "CC",
    numero_identificacion: "1234567890",
    fecha_ingreso: "2025-10-17",
    ultima_atencion: null,
    observaciones: ""
  };
  
  // Petición POST con Axios
  const response = await api.post('/api/pacientes/', data);
  console.log(response); // Paciente creado
};
```

**3. Backend recibe petición**

```
POST http://localhost:8000/api/pacientes/
Content-Type: application/json

{
  "nombre_completo": "Juan Pérez",
  "tipo_identificacion": "CC",
  "numero_identificacion": "1234567890",
  "fecha_ingreso": "2025-10-17",
  "ultima_atencion": null,
  "observaciones": ""
}
```

**4. Django procesa en PacienteViewSet**

```python
# backend/pacientes/views.py
class PacienteViewSet(viewsets.ModelViewSet):
    def create(self, request):
        # 1. Recibe datos del request
        serializer = PacienteSerializer(data=request.data)
        
        # 2. Valida datos
        if serializer.is_valid():
            # 3. Guarda en base de datos
            serializer.save()
            # 4. Retorna respuesta
            return Response(serializer.data, status=201)
        else:
            return Response(serializer.errors, status=400)
```

**5. Base de datos ejecuta INSERT**

```sql
INSERT INTO pacientes (
  nombre_completo,
  tipo_identificacion,
  numero_identificacion,
  fecha_ingreso,
  ultima_atencion,
  observaciones,
  creado_en,
  actualizado_en
) VALUES (
  'Juan Pérez',
  'CC',
  '1234567890',
  '2025-10-17',
  NULL,
  '',
  NOW(),
  NOW()
);
```

**6. Backend retorna respuesta**

```json
{
  "id": 5,
  "nombre_completo": "Juan Pérez",
  "tipo_identificacion": "CC",
  "numero_identificacion": "1234567890",
  "fecha_ingreso": "2025-10-17",
  "ultima_atencion": null,
  "observaciones": "",
  "creado_en": "2025-10-17T10:30:00.123456Z",
  "actualizado_en": "2025-10-17T10:30:00.123456Z"
}
```

**7. Frontend actualiza interfaz**

```javascript
// Agregar nuevo paciente a la lista existente
setPatients(prev => [newPatient, ...prev]);

// Cerrar formulario
setShowForm(false);

// Mostrar mensaje de éxito (opcional)
alert('Paciente creado exitosamente');
```

---

## Ejemplos de Uso

### Ejemplo 1: Buscar Medicamentos

**Frontend:**

```javascript
const handleSearch = (e) => {
  const value = e.target.value;
  setSearchTerm(value);
  cargarMedicamentos(value);
};

const cargarMedicamentos = async (buscar = "") => {
  const params = buscar ? { buscar } : {};
  const response = await api.get('/api/medicamentos/', { params });
  setMedicamentos(response);
};
```

**Petición HTTP:**

```
GET http://localhost:8000/api/medicamentos/?buscar=paracetamol
```

**Backend ejecuta:**

```python
def get_queryset(self):
    queryset = super().get_queryset()
    buscar = self.request.query_params.get('buscar', None)
    
    if buscar:
        queryset = queryset.filter(
            Q(nombre_producto__icontains=buscar) |
            Q(id_medicamento__icontains=buscar) |
            Q(laboratorio__icontains=buscar)
        )
    return queryset
```

**SQL generado:**

```sql
SELECT * FROM medicamentos
WHERE nombre_producto LIKE '%paracetamol%'
   OR id_medicamento LIKE '%paracetamol%'
   OR laboratorio LIKE '%paracetamol%'
ORDER BY nombre_producto;
```

### Ejemplo 2: Cargar Medicamentos desde Excel

**1. Usuario selecciona archivo Excel:**

```
plantilla_medicamentos.xlsx
- MED001 | Paracetamol 500mg | ...
- MED002 | Ibuprofeno 400mg | ...
- MED003 | Amoxicilina 500mg | ...
```

**2. Frontend envía archivo:**

```javascript
const handleUpload = async (file) => {
  const formData = new FormData();
  formData.append('archivo', file);
  
  const response = await api.post('/api/medicamentos/cargar_excel/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  
  console.log(response.mensaje);
  // "Se crearon 3 medicamentos"
};
```

**3. Backend procesa con Pandas:**

```python
@action(detail=False, methods=['post'])
def cargar_excel(self, request):
    archivo = request.FILES.get('archivo')
    
    # Leer Excel
    df = pd.read_excel(archivo)
    
    # Procesar cada fila
    for index, fila in df.iterrows():
        datos = {
            'nombre_producto': str(fila['Nombre del producto']),
            'stock_actual': int(fila['Stock actual']),
            # ... más campos
        }
        
        # Crear o actualizar
        Medicamento.objects.update_or_create(
            id_medicamento=fila['ID'],
            defaults=datos
        )
    
    return Response({'mensaje': 'Carga exitosa'})
```

**4. Resultado:**

```json
{
  "mensaje": "Se crearon 3 medicamentos",
  "detalle": {
    "creados": 3,
    "actualizados": 0,
    "total_procesados": 3
  },
  "errores": [],
  "total_filas": 3
}
```

### Ejemplo 3: Cambiar Estado de Orden

**1. Usuario hace clic en botón "Marcar Entregado"**

**2. Frontend llama al endpoint:**

```javascript
const cambiarEstado = async (ordenId) => {
  const response = await api.patch(
    `/api/ordenes/${ordenId}/cambiar_estado/`,
    { estado: 'entregado' }
  );
  
  console.log(response.mensaje);
  // "Estado cambiado a Entregado"
};
```

**3. Backend actualiza:**

```python
@action(detail=True, methods=['patch'])
def cambiar_estado(self, request, pk=None):
    orden = self.get_object()
    nuevo_estado = request.data.get('estado')
    
    # Validar estado
    estados_validos = ['pendiente', 'entregado']
    if nuevo_estado not in estados_validos:
        return Response({'error': 'Estado no válido'}, status=400)
    
    # Actualizar
    orden.estado = nuevo_estado
    orden.save()
    
    serializer = self.get_serializer(orden)
    return Response({
        'mensaje': f'Estado cambiado a {orden.get_estado_display()}',
        'orden': serializer.data
    })
```

**4. SQL ejecutado:**

```sql
UPDATE ordenes
SET estado = 'entregado',
    actualizado_en = NOW()
WHERE id = 1;
```

---

## Testing y Depuración

### Testing con Postman

**Colección de pruebas recomendada:**

**1. Autenticación**

```
POST http://localhost:8000/api/auth/login/
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}

Respuesta esperada: 200 OK
{
  "success": true,
  "user": { ... }
}
```

**2. Listar Pacientes**

```
GET http://localhost:8000/api/pacientes/

Respuesta esperada: 200 OK
[
  {
    "id": 1,
    "nombre_completo": "Juan Pérez",
    ...
  }
]
```

**3. Crear Paciente**

```
POST http://localhost:8000/api/pacientes/
Content-Type: application/json

{
  "nombre_completo": "María González",
  "tipo_identificacion": "CC",
  "numero_identificacion": "9876543210",
  "fecha_ingreso": "2025-10-17"
}

Respuesta esperada: 201 Created
```

**4. Buscar Medicamentos**

```
GET http://localhost:8000/api/medicamentos/?buscar=paracetamol

Respuesta esperada: 200 OK
[filtrado de medicamentos]
```

**5. Cambiar Estado de Orden**

```
PATCH http://localhost:8000/api/ordenes/1/cambiar_estado/
Content-Type: application/json

{
  "estado": "entregado"
}

Respuesta esperada: 200 OK
{
  "mensaje": "Estado cambiado a Entregado",
  "orden": { ... }
}
```

### Depuración en Backend

**Habilitar logs detallados:**

```python
# backend/settings.py
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'DEBUG',
    },
}
```

**Ver queries SQL ejecutadas:**

```python
# En cualquier vista o método
from django.db import connection

def mi_vista(request):
    # ... código que hace consultas
    
    # Ver todas las queries
    for query in connection.queries:
        print(query['sql'])
        print(query['time'])
```

**Usar Django Shell:**

```bash
python manage.py shell
```

```python
# Probar modelos y queries
from pacientes.models import Paciente
from medicamentos.models import Medicamento

# Crear paciente
paciente = Paciente.objects.create(
    nombre_completo="Test",
    tipo_identificacion="CC",
    numero_identificacion="123456"
)

# Ver todos los pacientes
Paciente.objects.all()

# Filtrar medicamentos
Medicamento.objects.filter(categoria='analgesico')

# Ver SQL de una query
print(Medicamento.objects.filter(categoria='analgesico').query)
```

### Depuración en Frontend

**Consola del navegador:**

```javascript
// Ver datos de usuario
console.log(localStorage.getItem('user'));

// Ver respuesta de API
api.get('/api/pacientes/')
  .then(response => console.log(response))
  .catch(error => console.error(error));

// Ver estado de React
console.log('Pacientes:', patients);
console.log('Loading:', loading);
```

**React DevTools:**

```
1. Instalar extensión React Developer Tools en Chrome/Firefox
2. Abrir DevTools (F12)
3. Ir a pestaña "Components"
4. Seleccionar componente
5. Ver props, state, hooks en tiempo real
```

**Network Tab:**

```
1. Abrir DevTools (F12)
2. Ir a pestaña "Network"
3. Filtrar por "XHR" o "Fetch"
4. Ver todas las peticiones HTTP
5. Inspeccionar headers, payload, response
```

---

## Troubleshooting

### Problemas Comunes y Soluciones

#### 1. Error: "No module named 'MySQLdb'"

**Causa:** No está instalado el conector de MySQL

**Solución:**

```bash
pip install mysqlclient

# Si falla en Windows, descargar wheel desde:
# https://www.lfd.uci.edu/~gohlke/pythonlibs/#mysqlclient
pip install mysqlclient‑2.x.x‑cpXX‑cpXX‑win_amd64.whl
```

#### 2. Error: "Access denied for user 'root'@'localhost'"

**Causa:** Credenciales incorrectas en settings.py

**Solución:**

```python
# backend/settings.py
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'farmacia_db',
        'USER': 'root',           # Verificar usuario
        'PASSWORD': 'tu_password', # Agregar contraseña correcta
        'HOST': 'localhost',
        'PORT': '3306',
    }
}
```

#### 3. Error: "Table doesn't exist"

**Causa:** No se han aplicado las migraciones

**Solución:**

```bash
cd backend
python manage.py migrate

# Ver estado de migraciones
python manage.py showmigrations

# Si hay problemas, resetear migraciones
python manage.py migrate --run-syncdb
```

#### 4. Error CORS en Frontend

**Causa:** Backend no permite peticiones desde localhost:3000

**Solución:**

```python
# backend/settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
]

CORS_ALLOW_CREDENTIALS = True

# Verificar que 'corsheaders' esté en INSTALLED_APPS
INSTALLED_APPS = [
    ...
    'corsheaders',
    ...
]

# Verificar que el middleware esté primero
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Debe estar primero
    'django.middleware.common.CommonMiddleware',
    ...
]
```

#### 5. Error: "Port 8000 is already in use"

**Causa:** El puerto ya está siendo usado

**Solución:**

```bash
# Usar otro puerto
python manage.py runserver 8001

# O matar el proceso (Windows)
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# O matar el proceso (Linux/Mac)
lsof -ti:8000 | xargs kill -9
```

#### 6. Error: "Port 3000 is already in use"

**Causa:** React ya está corriendo en otro terminal

**Solución:**

```bash
# Usar otro puerto
PORT=3001 npm start

# O matar el proceso (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# O matar el proceso (Linux/Mac)
lsof -ti:3000 | xargs kill -9
```

#### 7. Error: npm install falla

**Causa:** Caché corrupta o versiones incompatibles

**Solución:**

```bash
# Limpiar caché
npm cache clean --force

# Eliminar node_modules y package-lock.json
rm -rf node_modules package-lock.json

# Reinstalar
npm install

# Si persiste, usar npm ci
npm ci
```

#### 8. Error: "Django admin CSS not loading"

**Causa:** No se han recopilado archivos estáticos

**Solución:**

```bash
cd backend
python manage.py collectstatic --noinput
```

#### 9. Error: Fechas con formato incorrecto

**Causa:** Diferencias en formato de fecha entre frontend y backend

**Solución:**

```javascript
// Frontend: asegurar formato ISO
const fecha = new Date('2025-10-17').toISOString().split('T')[0];
// Resultado: "2025-10-17"
```

```python
# Backend: usar DateField
from django.db import models

class Paciente(models.Model):
    fecha_ingreso = models.DateField()  # Acepta YYYY-MM-DD
```

#### 10. Error: "Duplicate entry" al crear paciente

**Causa:** Ya existe un paciente con ese tipo y número de identificación

**Solución:**

El modelo tiene `unique_together`:

```python
class Meta:
    unique_together = ['tipo_identificacion', 'numero_identificacion']
```

Validar en frontend antes de enviar:

```javascript
const validarPaciente = async (tipo, numero) => {
  const pacientes = await api.get('/api/pacientes/');
  const existe = pacientes.some(p => 
    p.tipo_identificacion === tipo && 
    p.numero_identificacion === numero
  );
  
  if (existe) {
    alert('Ya existe un paciente con esta identificación');
    return false;
  }
  return true;
};
```

---

## Mejoras Futuras

### Backend

**1. Implementar JWT Authentication**

```bash
pip install djangorestframework-simplejwt
```

```python
# settings.py
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
}

# urls.py
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('api/token/', TokenObtainPairView.as_view()),
    path('api/token/refresh/', TokenRefreshView.as_view()),
]
```

**2. Agregar Paginación**

```python
# settings.py
REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20
}
```

**3. Implementar Sistema de Roles**

```python
from django.contrib.auth.models import User, Group

# Crear grupos
admin_group = Group.objects.create(name='Administradores')
farmaceutico_group = Group.objects.create(name='Farmacéuticos')

# Asignar permisos
from django.contrib.auth.models import Permission

view_paciente = Permission.objects.get(codename='view_paciente')
farmaceutico_group.permissions.add(view_paciente)
```

**4. Agregar Auditoría**

```python
# Crear modelo de auditoría
class AuditLog(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    accion = models.CharField(max_length=50)  # CREATE, UPDATE, DELETE
    modelo = models.CharField(max_length=50)
    objeto_id = models.IntegerField()
    cambios = models.JSONField()
    timestamp = models.DateTimeField(auto_now_add=True)
```

**5. Relación Orden-Medicamento**

```python
class DetalleOrden(models.Model):
    orden = models.ForeignKey(Orden, on_delete=models.CASCADE)
    medicamento = models.ForeignKey(Medicamento, on_delete=models.PROTECT)
    cantidad = models.IntegerField()
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)
    
    def save(self, *args, **kwargs):
        # Reducir stock automáticamente
        if self.pk is None:  # Es nuevo
            self.medicamento.stock_actual -= self.cantidad
            self.medicamento.save()
        super().save(*args, **kwargs)
```

### Frontend

**1. Implementar Protección de Rutas**

```javascript
// components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated');
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// App.js
<Route 
  path="/dashboard" 
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  } 
/>
```

**2. Agregar Notificaciones Toast**

```bash
npm install react-hot-toast
```

```javascript
import toast, { Toaster } from 'react-hot-toast';

// En el componente
const handleSubmit = async () => {
  try {
    await api.post('/api/pacientes/', data);
    toast.success('Paciente creado exitosamente');
  } catch (error) {
    toast.error('Error al crear paciente');
  }
};

// En App.js
<Toaster position="top-right" />
```

**3. Implementar Modo Oscuro**

```javascript
// hooks/useDarkMode.js
import { useState, useEffect } from 'react';

export const useDarkMode = () => {
  const [darkMode, setDarkMode] = useState(false);
  
  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDark);
    
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);
  
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    localStorage.setItem('darkMode', !darkMode);
    document.documentElement.classList.toggle('dark');
  };
  
  return [darkMode, toggleDarkMode];
};
```

**4. Agregar Validación de Formularios**

```bash
npm install react-hook-form yup
```

```javascript
import { useForm } from 'react-hook-form';
import * as yup from 'yup';

const schema = yup.object({
  nombre_completo: yup.string().required('Nombre es requerido'),
  numero_identificacion: yup.string()
    .matches(/^[0-9]+$/, 'Solo números')
    .required('Identificación es requerida'),
});

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: yupResolver(schema)
});
```

**5. Implementar Paginación en Tablas**

```javascript
const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 10;

const indexOfLastItem = currentPage * itemsPerPage;
const indexOfFirstItem = indexOfLastItem - itemsPerPage;
const currentItems = items.slice(indexOfFirstItem, indexOfLastItem);

const totalPages = Math.ceil(items.length / itemsPerPage);
```

---

## Comandos Útiles

### Backend (Django)

```bash
# Gestión del proyecto
python manage.py runserver              # Iniciar servidor
python manage.py runserver 8001         # Iniciar en puerto diferente
python manage.py check                  # Verificar problemas

# Base de datos
python manage.py makemigrations         # Crear migraciones
python manage.py migrate                # Aplicar migraciones
python manage.py showmigrations         # Ver estado de migraciones
python manage.py sqlmigrate app 0001    # Ver SQL de migración

# Usuarios
python manage.py createsuperuser        # Crear admin
python manage.py changepassword user    # Cambiar contraseña

# Shell y testing
python manage.py shell                  # Shell interactivo
python manage.py test                   # Ejecutar tests
python manage.py dbshell                # Acceder a MySQL directamente

# Datos
python manage.py dumpdata > backup.json # Exportar datos
python manage.py loaddata backup.json   # Importar datos
python manage.py flush                  # Limpiar base de datos

# Archivos estáticos
python manage.py collectstatic          # Recopilar archivos estáticos
python manage.py findstatic file.css    # Buscar archivo estático
```

### Frontend (React)

```bash
# Gestión del proyecto
npm start                    # Iniciar en desarrollo
npm run build                # Compilar para producción
npm test                     # Ejecutar tests
npm run eject                # Eyectar configuración (irreversible)

# Dependencias
npm install                  # Instalar dependencias
npm install package-name     # Instalar paquete específico
npm uninstall package-name   # Desinstalar paquete
npm update                   # Actualizar paquetes
npm outdated                 # Ver paquetes desactualizados

# Limpieza
npm cache clean --force      # Limpiar caché
rm -rf node_modules          # Eliminar node_modules
npm ci                       # Instalación limpia

# Análisis
npm run build -- --stats     # Analizar tamaño del build
npm audit                    # Ver vulnerabilidades
npm audit fix                # Corregir vulnerabilidades
```

### Base de Datos (MySQL)

```bash
# Acceder a MySQL
mysql -u root -p

# Comandos dentro de MySQL
SHOW DATABASES;              # Ver bases de datos
USE farmacia_db;             # Seleccionar base de datos
SHOW TABLES;                 # Ver tablas
DESCRIBE pacientes;          # Ver estructura de tabla
SELECT * FROM pacientes;     # Ver datos

# Backup
mysqldump -u root -p farmacia_db > backup.sql

# Restaurar
mysql -u root -p farmacia_db < backup.sql

# Salir
EXIT;
```

### Git (Control de Versiones)

```bash
# Configuración inicial
git init                     # Inicializar repositorio
git remote add origin URL    # Conectar con GitHub

# Trabajo diario
git status                   # Ver estado
git add .                    # Agregar cambios
git commit -m "mensaje"      # Crear commit
git push origin main         # Subir cambios

# Branching
git branch feature-name      # Crear rama
git checkout feature-name    # Cambiar de rama
git merge feature-name       # Fusionar rama

# Historial
git log                      # Ver historial
git diff                     # Ver cambios
```

---

## Estructura de Base de Datos SQL

### Script de Creación Completo

```sql
-- Crear base de datos
CREATE DATABASE IF NOT EXISTS farmacia_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_general_ci;

USE farmacia_db;

-- Tabla de pacientes
CREATE TABLE pacientes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    nombre_completo VARCHAR(200) NOT NULL,
    tipo_identificacion VARCHAR(2) NOT NULL,
    numero_identificacion VARCHAR(20) NOT NULL,
    fecha_ingreso DATE NOT NULL,
    ultima_atencion DATE NULL,
    observaciones TEXT,
    creado_en DATETIME NOT NULL,
    actualizado_en DATETIME NOT NULL,
    UNIQUE KEY (tipo_identificacion, numero_identificacion),
    INDEX idx_nombre (nombre_completo),
    INDEX idx_fecha_ingreso (fecha_ingreso)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de medicamentos
CREATE TABLE medicamentos (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    id_medicamento VARCHAR(50) UNIQUE NOT NULL,
    nombre_producto VARCHAR(200) NOT NULL,
    presentacion VARCHAR(100) NOT NULL,
    categoria VARCHAR(20) NOT NULL,
    laboratorio VARCHAR(100) NOT NULL,
    lote VARCHAR(50) NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    stock_actual INT NOT NULL DEFAULT 0,
    stock_minimo INT NOT NULL DEFAULT 10,
    precio_unitario DECIMAL(10,2) NOT NULL,
    ubicacion VARCHAR(100) NOT NULL,
    proveedor VARCHAR(100) NOT NULL,
    fecha_ingreso DATE NOT NULL,
    observaciones TEXT,
    uso_frecuente BOOLEAN NOT NULL DEFAULT FALSE,
    creado_en DATETIME NOT NULL,
    actualizado_en DATETIME NOT NULL,
    INDEX idx_nombre_producto (nombre_producto),
    INDEX idx_categoria (categoria),
    INDEX idx_fecha_vencimiento (fecha_vencimiento),
    INDEX idx_stock (stock_actual)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de órdenes
CREATE TABLE ordenes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    paciente_id BIGINT NOT NULL,
    identificacion VARCHAR(50) UNIQUE NOT NULL,
    fecha DATE NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente',
    descripcion TEXT,
    creado_en DATETIME NOT NULL,
    actualizado_en DATETIME NOT NULL,
    FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE,
    INDEX idx_fecha (fecha),
    INDEX idx_estado (estado),
    INDEX idx_paciente (paciente_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Consultas SQL Útiles

```sql
-- Ver pacientes con órdenes pendientes
SELECT p.nombre_completo, COUNT(o.id) as ordenes_pendientes
FROM pacientes p
INNER JOIN ordenes o ON p.id = o.paciente_id
WHERE o.estado = 'pendiente'
GROUP BY p.id, p.nombre_completo;

-- Medicamentos con stock bajo
SELECT nombre_producto, stock_actual, stock_minimo
FROM medicamentos
WHERE stock_actual <= stock_minimo
ORDER BY stock_actual ASC;

-- Medicamentos próximos a vencer (30 días)
SELECT nombre_producto, fecha_vencimiento, stock_actual
FROM medicamentos
WHERE fecha_vencimiento BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
ORDER BY fecha_vencimiento ASC;

-- Estadísticas de órdenes por mes
SELECT 
    YEAR(fecha) as año,
    MONTH(fecha) as mes,
    COUNT(*) as total_ordenes,
    SUM(CASE WHEN estado = 'entregado' THEN 1 ELSE 0 END) as entregadas,
    SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END) as pendientes
FROM ordenes
GROUP BY YEAR(fecha), MONTH(fecha)
ORDER BY año DESC, mes DESC;

-- Pacientes sin atención reciente (más de 30 días)
SELECT nombre_completo, ultima_atencion
FROM pacientes
WHERE ultima_atencion < DATE_SUB(CURDATE(), INTERVAL 30 DAY)
   OR ultima_atencion IS NULL
ORDER BY ultima_atencion ASC;
```

---

## Usuarios de Prueba

### Credenciales de Acceso

| Usuario | Contraseña | Rol | Email |
|---------|------------|-----|-------|
| admin | admin123 | Superusuario | farmacia@farmacia.com |
| admin2 | admin123 | Superusuario | test@test.com |

### Crear Nuevos Usuarios

**Desde Django Admin:**

```bash
# 1. Iniciar servidor
python manage.py runserver

# 2. Acceder a http://localhost:8000/admin/
# 3. Login con admin / admin123
# 4. Ir a "Users" → "Add user"
# 5. Completar formulario
```

**Desde Terminal:**

```bash
python manage.py createsuperuser

# Ingresar:
# Username: nuevo_usuario
# Email: usuario@ejemplo.com
# Password: contraseña_segura
# Password (again): contraseña_segura
```

**Desde Django Shell:**

```python
python manage.py shell

from django.contrib.auth.models import User

# Crear usuario normal
user = User.objects.create_user(
    username='farmaceutico1',
    email='farmaceutico@farmacia.com',
    password='password123'
)

# Crear superusuario
superuser = User.objects.create_superuser(
    username='admin3',
    email='admin3@farmacia.com',
    password='admin123'
)
```

---

## Datos de Ejemplo

El archivo SQL incluido (`farmacia_db.sql`) contiene los siguientes datos de ejemplo:

### Pacientes (2 registros)

```sql
INSERT INTO pacientes VALUES
(1, 'TEST', 'CC', '1234567890', '2025-10-16', '2025-10-10', 'TEST DE FUNCIONAMIENTO'),
(2, 'JUAN CAMILO PEREZ', 'CC', '1020304050', '2025-10-16', '2025-10-14', 'HOLA, ESTO ES UN TEST DE FUNCIONAMIENTO');
```

### Medicamentos (10 registros)

| ID | Nombre | Categoría | Stock | Precio |
|----|--------|-----------|-------|--------|
| 1 | Paracetamol 500 mg | Analgésico | 120 | $1,200 |
| 2 | Amoxicilina 500 mg | Antibiótico | 60 | $3,500 |
| 3 | Ibuprofeno 400 mg | Antiinflamatorio | 80 | $1,500 |
| 4 | Loratadina 10 mg | Antialérgico | 45 | $1,800 |
| 5 | Omeprazol 20 mg | Gastroprotector | 70 | $2,800 |
| 6 | Suero Oral 500 ml | Rehidratante | 30 | $3,500 |
| 7 | Alcohol Antiséptico 70% | Antiséptico | 25 | $5,000 |
| 8 | Acetaminofén Pediátrico | Analgésico | 55 | $4,200 |
| 9 | Diclofenaco Sódico 50 mg | Antiinflamatorio | 90 | $1,600 |
| 10 | Clorfenamina 4 mg | Antialérgico | 55 | $1,300 |

### Órdenes (4 registros)

```sql
INSERT INTO ordenes VALUES
(1, 1, 'ORD-001', '2025-10-16', 'entregado', 'SE ENTREGO POR URGENCIAS'),
(2, 1, 'ORD-002', '2025-10-16', 'pendiente', 'NO HAY'),
(3, 2, 'ORD-003', '2025-10-16', 'entregado', 'SE ENTRO POR URGENCIAS'),
(4, 2, 'ORD-004', '2025-10-16', 'pendiente', 'EJEMPLO');
```

---

## Seguridad

### Consideraciones de Seguridad para Desarrollo

Este proyecto está configurado para **desarrollo local** con las siguientes configuraciones:

```python
# backend/settings.py - CONFIGURACIÓN DE DESARROLLO
DEBUG = True
SECRET_KEY = 'django-insecure-...'  # Clave de desarrollo
ALLOWED_HOSTS = []
CORS_ALLOWED_ORIGINS = ["http://localhost:3000"]
```

**Advertencia:** Estas configuraciones NO son seguras para producción.

### Para Llevar a Producción

Si deseas desplegar este proyecto en un servidor real, debes implementar:

**1. Variables de Entorno**

```python
# backend/settings.py
import os
from pathlib import Path

SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY')
DEBUG = os.environ.get('DEBUG', 'False') == 'True'
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', '').split(',')

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': os.environ.get('DB_NAME'),
        'USER': os.environ.get('DB_USER'),
        'PASSWORD': os.environ.get('DB_PASSWORD'),
        'HOST': os.environ.get('DB_HOST'),
        'PORT': os.environ.get('DB_PORT', '3306'),
    }
}
```

**2. Archivo .env**

```bash
# .env
DJANGO_SECRET_KEY=tu_clave_secreta_aqui
DEBUG=False
ALLOWED_HOSTS=tudominio.com,www.tudominio.com
DB_NAME=farmacia_db
DB_USER=usuario_db
DB_PASSWORD=password_seguro
DB_HOST=localhost
DB_PORT=3306
```

**3. Instalar python-decouple**

```bash
pip install python-decouple
```

```python
# settings.py
from decouple import config

SECRET_KEY = config('DJANGO_SECRET_KEY')
DEBUG = config('DEBUG', default=False, cast=bool)
```

**4. Configurar HTTPS**

```python
# settings.py para producción
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
```

**5. Implementar Rate Limiting**

```bash
pip install django-ratelimit
```

```python
from django_ratelimit.decorators import ratelimit

@ratelimit(key='ip', rate='5/m')
def login_view(request):
    # Limita a 5 intentos por minuto por IP
    ...
```

**6. Configurar CORS Apropiadamente**

```python
# Producción - NO usar '*'
CORS_ALLOWED_ORIGINS = [
    "https://tudominio.com",
    "https://www.tudominio.com",
]
```

**7. JWT en lugar de autenticación básica**

```bash
pip install djangorestframework-simplejwt
```

```python
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
}
```

---

## Despliegue

### Preparar para Producción

**Backend:**

```bash
# 1. Crear archivo requirements.txt actualizado
pip freeze > requirements.txt

# 2. Configurar settings para producción
# Crear settings_prod.py basado en settings.py

# 3. Recopilar archivos estáticos
python manage.py collectstatic --noinput

# 4. Verificar configuración
python manage.py check --deploy
```

**Frontend:**

```bash
# 1. Compilar para producción
npm run build

# 2. La carpeta build/ contiene los archivos estáticos
# 3. Configurar servidor web (Nginx/Apache) para servir estos archivos
```

### Opciones de Hosting

**Backend Django:**
- Heroku
- DigitalOcean
- AWS EC2
- Google Cloud Platform
- PythonAnywhere

**Frontend React:**
- Vercel
- Netlify
- GitHub Pages
- Firebase Hosting

**Base de Datos:**
- AWS RDS (MySQL)
- Google Cloud SQL
- DigitalOcean Managed Databases
- PlanetScale

---

## Licencia

Este es un proyecto académico desarrollado con fines educativos para demostrar conocimientos en desarrollo full-stack.

**Licencia:** MIT (o especificar la licencia que prefieras)

---

## Contribuciones

Este es un proyecto universitario. Si encuentras errores o mejoras:

1. Fork del repositorio
2. Crear branch (`git checkout -b feature/mejora`)
3. Commit cambios (`git commit -m 'Agregar mejora'`)
4. Push al branch (`git push origin feature/mejora`)
5. Crear Pull Request

---

## Contacto y Soporte

### Autores

- **Proyecto Universitario**: Sistema FarmaGestión
- **Institución**: [Nombre de la Universidad]
- **Materia**: [Nombre de la Materia]
- **Docente**: [Nombre del Docente]
- **Año**: 2025

### Reporte de Problemas

Para reportar bugs o sugerir mejoras:

1. Ir a la sección "Issues" en GitHub
2. Crear nuevo issue
3. Describir el problema o sugerencia
4. Incluir screenshots si es necesario

---

## Recursos Adicionales

### Documentación Oficial

**Django:**
- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [Django ORM Queries](https://docs.djangoproject.com/en/stable/topics/db/queries/)

**React:**
- [React Documentation](https://react.dev/)
- [React Router](https://reactrouter.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)

**Base de Datos:**
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [SQL Tutorial](https://www.w3schools.com/sql/)

### Tutoriales Recomendados

**Backend:**
- [Django for Beginners](https://djangoforbeginners.com/)
- [Django REST Framework Tutorial](https://www.django-rest-framework.org/tutorial/quickstart/)
- [Real Python - Django Tutorials](https://realpython.com/tutorials/django/)

**Frontend:**
- [React Official Tutorial](https://react.dev/learn)
- [Tailwind CSS Course](https://tailwindcss.com/docs/installation)
- [JavaScript MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

**Full Stack:**
- [Full Stack Open](https://fullstackopen.com/)
- [The Odin Project](https://www.theodinproject.com/)

### Herramientas Útiles

**Desarrollo:**
- [Visual Studio Code](https://code.visualstudio.com/) - Editor de código
- [Postman](https://www.postman.com/) - Testing de APIs
- [DBeaver](https://dbeaver.io/) - Cliente de base de datos
- [Git](https://git-scm.com/) - Control de versiones

**Diseño:**
- [Figma](https://www.figma.com/) - Diseño de interfaces
- [Coolors](https://coolors.co/) - Paletas de colores
- [Hero Icons](https://heroicons.com/) - Iconos

**Testing:**
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)
- [React Developer Tools](https://react.dev/learn/react-developer-tools)
- [Django Debug Toolbar](https://django-debug-toolbar.readthedocs.io/)

---

## FAQ - Preguntas Frecuentes

**1. ¿Por qué usar MySQL en lugar de PostgreSQL?**

MySQL es ampliamente usado, fácil de instalar con XAMPP/WAMP, y suficiente para este proyecto académico. PostgreSQL es excelente pero requiere más configuración inicial.

**2. ¿Por qué no usar TypeScript?**

Para mantener la simplicidad y enfocarse en los conceptos fundamentales. TypeScript es recomendable para proyectos grandes en producción.

**3. ¿Se puede usar con PostgreSQL?**

Sí, solo cambiar la configuración en settings.py:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'farmacia_db',
        'USER': 'postgres',
        'PASSWORD': 'password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

**4. ¿Cómo agregar más categorías de medicamentos?**

Editar el modelo en `medicamentos/models.py`:

```python
CATEGORIAS = [
    ('analgesico', 'Analgésico'),
    ('antibiotico', 'Antibiótico'),
    # ... agregar más categorías
    ('nueva_categoria', 'Nueva Categoría'),
]
```

Luego crear y aplicar migración:
```bash
python manage.py makemigrations
python manage.py migrate
```

**5. ¿Cómo resetear la base de datos?**

```bash
# Opción 1: Flush (mantiene estructura)
python manage.py flush

# Opción 2: Eliminar y recrear
DROP DATABASE farmacia_db;
CREATE DATABASE farmacia_db;
python manage.py migrate
```

**6. ¿Funciona en móviles?**

Sí, el frontend está diseñado con Tailwind CSS y es completamente responsive. Se adapta a tablets y smartphones.

**7. ¿Cómo cambiar el puerto del backend?**

```bash
python manage.py runserver 8080
```

Y actualizar axios.js:
```javascript
baseURL: 'http://localhost:8080'
```

**8. ¿Se puede desplegar gratis?**

Sí, opciones gratuitas:
- Backend: Heroku (free tier), PythonAnywhere
- Frontend: Vercel, Netlify, GitHub Pages
- Base de Datos: ElephantSQL (PostgreSQL), PlanetScale (MySQL)

**9. ¿Cómo agregar más funcionalidades?**

1. Definir el modelo en `models.py`
2. Crear serializer en `serializers.py`
3. Crear viewset en `views.py`
4. Agregar URL en `urls.py`
5. Crear componente React en frontend
6. Hacer peticiones con Axios

**10. ¿Necesito conocimientos previos?**

**Recomendado:**
- Python básico
- JavaScript/React básico
- HTML/CSS
- SQL básico
- Git básico

**Se aprende en el camino:**
- Django ORM
- Django REST Framework
- Tailwind CSS
- Axios
- Gestión de estado en React

---

## Glosario de Términos

**API (Application Programming Interface):** Interfaz que permite la comunicación entre el frontend y backend.

**CRUD:** Create, Read, Update, Delete - Operaciones básicas de base de datos.

**ORM (Object-Relational Mapping):** Técnica para interactuar con bases de datos usando objetos en lugar de SQL directo.

**Serializer:** Componente que convierte datos entre JSON y modelos de Django.

**ViewSet:** Clase de Django REST Framework que agrupa las vistas CRUD.

**Component:** Bloque de código React reutilizable que representa parte de la UI.

**Hook:** Funciones especiales de React (useState, useEffect) para manejar estado y efectos.

**Props:** Datos que se pasan de un componente padre a un hijo en React.

**State:** Datos internos de un componente que pueden cambiar.

**Endpoint:** URL específica de la API que realiza una función.

**Migration:** Archivo que describe cambios en la estructura de la base de datos.

**CORS:** Mecanismo que permite peticiones entre diferentes dominios.

**JWT:** JSON Web Token - Método de autenticación basado en tokens.

**LocalStorage:** Almacenamiento en el navegador que persiste entre sesiones.

---

## Changelog

### Versión 1.0.0 (Octubre 2025)

**Características Iniciales:**
- Sistema de autenticación básico
- CRUD completo de Pacientes
- CRUD completo de Medicamentos
- CRUD completo de Órdenes
- Dashboard con estadísticas
- Módulo de Reportes
- Módulo de Inventarios
- Carga masiva de medicamentos desde Excel
- Diseño responsive con Tailwind CSS
- Búsqueda en tiempo real
- Gráficos con Chart.js

**Tecnologías:**
- Django 5.2.7
- React 19.2.0
- MySQL/MariaDB
- Tailwind CSS 3.4.18

---

## Agradecimientos

Agradecimientos especiales a:

- **Django Software Foundation** por el excelente framework
- **React Team** por la librería y documentación
- **Tailwind Labs** por Tailwind CSS
- **Comunidad Open Source** por las librerías utilizadas
- **Docentes y compañeros** por el apoyo en el proyecto

---

## Anexos

### Anexo A: Estructura Completa de Archivos

```
farmacia/
│
├── backend/
│   ├── backend/
│   │   ├── __init__.py
│   │   ├── asgi.py
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   │
│   ├── usuarios/
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── models.py
│   │   ├── urls.py
│   │   └── views.py
│   │
│   ├── pacientes/
│   │   ├── migrations/
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── urls.py
│   │   └── views.py
│   │
│   ├── medicamentos/
│   │   ├── migrations/
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── urls.py
│   │   └── views.py
│   │
│   ├── ordenes/
│   │   ├── migrations/
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── urls.py
│   │   └── views.py
│   │
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   ├── favicon.ico
│   │   └── manifest.json
│   │
│   ├── src/
│   │   ├── assets/
│   │   │
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Header.jsx
│   │   │   │   └── Sidebar.jsx
│   │   │   │
│   │   │   └── forms/
│   │   │       ├── AddPatientForm.jsx
│   │   │       ├── AddMedicamentoForm.jsx
│   │   │       ├── AddOrderForm.jsx
│   │   │       └── UploadExcelForm.jsx
│   │   │
│   │   ├── config/
│   │   │   └── axios.js
│   │   │
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Pacientes.jsx
│   │   │   ├── Medicamentos.jsx
│   │   │   ├── Ordenes.jsx
│   │   │   ├── Reportes.jsx
│   │   │   └── Inventarios.jsx
│   │   │
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   │
│   ├── .gitignore
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── .gitignore
├── farmacia_db.sql
└── README.md
```

### Anexo B: Paleta de Colores

```css
/* Colores principales */
--primary: #08988e;          /* Verde azulado principal */
--primary-dark: #067a74;     /* Verde oscuro (hover) */
--primary-darker: #05776f;   /* Verde más oscuro */
--primary-light: #5cc3b6;    /* Verde claro */
--primary-lighter: #a8e0db;  /* Verde muy claro */

/* Colores de estado */
--success: #10b981;          /* Verde éxito */
--warning: #f6ad55;          /* Naranja advertencia */
--danger: #ef4444;           /* Rojo error */
--info: #3b82f6;             /* Azul información */

/* Grises */
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-300: #d1d5db;
--gray-400: #9ca3af;
--gray-500: #6b7280;
--gray-600: #4b5563;
--gray-700: #374151;
--gray-800: #1f2937;
--gray-900: #111827;
```

### Anexo C: Endpoints Completos de la API

```
# Autenticación
POST   /api/auth/login/

# Pacientes
GET    /api/pacientes/
POST   /api/pacientes/
GET    /api/pacientes/{id}/
PUT    /api/pacientes/{id}/
PATCH  /api/pacientes/{id}/
DELETE /api/pacientes/{id}/
GET    /api/pacientes/opciones_identificacion/

# Medicamentos
GET    /api/medicamentos/
POST   /api/medicamentos/
GET    /api/medicamentos/{id}/
PUT    /api/medicamentos/{id}/
PATCH  /api/medicamentos/{id}/
DELETE /api/medicamentos/{id}/
GET    /api/medicamentos/opciones_categoria/
POST   /api/medicamentos/cargar_excel/
GET    /api/medicamentos/descargar_plantilla/

# Órdenes
GET    /api/ordenes/
POST   /api/ordenes/
GET    /api/ordenes/{id}/
PUT    /api/ordenes/{id}/
PATCH  /api/ordenes/{id}/
DELETE /api/ordenes/{id}/
GET    /api/ordenes/opciones_estado/
PATCH  /api/ordenes/{id}/cambiar_estado/

# Admin (Django)
GET    /admin/
```

---

**Nota Final:** Esta documentación fue creada para facilitar la comprensión, instalación y uso del sistema FarmaGestión. Si encuentras algún error o tienes sugerencias de mejora, no dudes en contribuir al proyecto.

**Versión de Documentación:** 1.0.0  
**Última actualización:** Octubre 2025  
**Proyecto:** Sistema FarmaGestión - Proyecto Universitario# FarmaGestión - Sistema de Gestión Farmacéutica

## Descripción del Proyecto

FarmaGestión es un sistema integral de gestión farmacéutica desarrollado como proyecto universitario. Permite administrar pacientes, medicamentos, órdenes de entrega e inventarios en un entorno hospitalario o farmacéutico.

El sistema está compuesto por:
- **Backend**: API REST desarrollada en Django + Django REST Framework
- **Frontend**: Aplicación web en React con Tailwind CSS
- **Base de Datos**: MySQL/MariaDB

---

## Tabla de Contenidos

1. [Tecnologías Utilizadas](#tecnologías-utilizadas)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Requisitos Previos](#requisitos-previos)
4. [Instalación Completa](#instalación-completa)
5. [Configuración Detallada](#configuración-detallada)
6. [Estructura del Proyecto](#estructura-del-proyecto)
7. [Modelos de Base de Datos](#modelos-de-base-de-datos)
8. [Backend - API REST](#backend---api-rest)
9. [Frontend - Componentes y Páginas](#frontend---componentes-y-páginas)
10. [Flujo de Datos](#flujo-de-datos)
11. [Ejemplos de Uso](#ejemplos-de-uso)
12. [Testing y Depuración](#testing-y-depuración)
13. [Troubleshooting](#troubleshooting)
14. [Mejoras Futuras](#mejoras-futuras)

---

## Tecnologías Utilizadas

### Backend
```
Django 5.2.7                    - Framework web principal
Django REST Framework 3.16.1    - Framework para API REST
django-cors-headers 4.9.0       - Manejo de CORS
mysqlclient 2.2.7               - Conector MySQL
pandas 2.3.3                    - Procesamiento de archivos Excel
openpyxl 3.1.5                  - Lectura/escritura de Excel
```

### Frontend
```
React 19.2.0                    - Librería principal de UI
Tailwind CSS 3.4.18            - Framework de estilos
Axios 1.12.2                   - Cliente HTTP
Chart.js 4.5.1                 - Gráficos y visualizaciones
React Router DOM 7.9.4         - Enrutamiento
React Icons 5.5.0              - Iconos
React ChartJS 2 5.3.0          - Integración de Chart.js con React
```

### Base de Datos
```
MySQL 8.0+ / MariaDB 10.0+
```

---

## Arquitectura del Sistema

### Diagrama de Arquitectura General

```
┌─────────────────────────────────────────────────────────────┐
│                     NAVEGADOR WEB                            │
│                  http://localhost:3000                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTP Requests
                         │
┌────────────────────────▼────────────────────────────────────┐
│                  FRONTEND (React)                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Componentes:                                        │   │
│  │  - Login, Dashboard, Pacientes, Medicamentos        │   │
│  │  - Órdenes, Reportes, Inventarios                   │   │
│  │  - Header, Sidebar, Forms                           │   │
│  └─────────────────────────────────────────────────────┘   │
│                         │                                    │
│  ┌─────────────────────▼────────────────────────────────┐  │
│  │         Axios (HTTP Client)                          │  │
│  │         baseURL: http://localhost:8000               │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ API REST (JSON)
                         │
┌────────────────────────▼────────────────────────────────────┐
│              BACKEND (Django + DRF)                          │
│                 http://localhost:8000                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  API Endpoints:                                       │  │
│  │  - /api/auth/login/                                  │  │
│  │  - /api/pacientes/                                   │  │
│  │  - /api/medicamentos/                                │  │
│  │  - /api/ordenes/                                     │  │
│  └───────────────┬──────────────────────────────────────┘  │
│                  │                                           │
│  ┌───────────────▼──────────────────────────────────────┐  │
│  │  ViewSets (Lógica de Negocio):                       │  │
│  │  - PacienteViewSet                                   │  │
│  │  - MedicamentoViewSet                                │  │
│  │  - OrdenViewSet                                      │  │
│  └───────────────┬──────────────────────────────────────┘  │
│                  │                                           │
│  ┌───────────────▼──────────────────────────────────────┐  │
│  │  Serializers (Validación y Transformación):          │  │
│  │  - PacienteSerializer                                │  │
│  │  - MedicamentoSerializer                             │  │
│  │  - OrdenSerializer                                   │  │
│  └───────────────┬──────────────────────────────────────┘  │
│                  │                                           │
│  ┌───────────────▼──────────────────────────────────────┐  │
│  │  Models (ORM):                                        │  │
│  │  - Paciente                                          │  │
│  │  - Medicamento                                       │  │
│  │  - Orden                                             │  │
│  └───────────────┬──────────────────────────────────────┘  │
└──────────────────┼──────────────────────────────────────────┘
                   │
                   │ SQL Queries
                   │
┌──────────────────▼──────────────────────────────────────────┐
│                BASE DE DATOS (MySQL)                         │
│                    farmacia_db                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Tablas:                                              │  │
│  │  - pacientes                                         │  │
│  │  - medicamentos                                      │  │
│  │  - ordenes                                           │  │
│  │  - auth_user                                         │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Estructura de Carpetas Completa

```
farmacia/
├── backend/
│   ├── backend/
│   │   ├── __init__.py
│   │   ├── settings.py          # Configuración de Django
│   │   ├── urls.py               # Rutas principales
│   │   ├── wsgi.py               # Configuración WSGI
│   │   └── asgi.py
│   ├── usuarios/
│   │   ├── __init__.py
│   │   ├── apps.py
│   │   ├── views.py              # Vista de login
│   │   └── urls.py               # Ruta: /api/auth/
│   ├── pacientes/
│   │   ├── __init__.py
│   │   ├── apps.py
│   │   ├── models.py             # Modelo Paciente
│   │   ├── serializers.py        # Serializer Paciente
│   │   ├── views.py              # ViewSet Paciente
│   │   └── urls.py               # Rutas: /api/pacientes/
│   ├── medicamentos/
│   │   ├── __init__.py
│   │   ├── apps.py
│   │   ├── models.py             # Modelo Medicamento
│   │   ├── serializers.py        # Serializer Medicamento
│   │   ├── views.py              # ViewSet Medicamento
│   │   └── urls.py               # Rutas: /api/medicamentos/
│   ├── ordenes/
│   │   ├── __init__.py
│   │   ├── apps.py
│   │   ├── models.py             # Modelo Orden
│   │   ├── serializers.py        # Serializer Orden
│   │   ├── views.py              # ViewSet Orden
│   │   └── urls.py               # Rutas: /api/ordenes/
│   ├── manage.py                 # Script de gestión de Django
│   └── requirements.txt          # Dependencias Python
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Header.jsx           # Encabezado de páginas
│   │   │   │   └── Sidebar.jsx          # Menú lateral
│   │   │   └── forms/
│   │   │       ├── AddPatientForm.jsx   # Formulario de pacientes
│   │   │       ├── AddMedicamentoForm.jsx
│   │   │       ├── AddOrderForm.jsx
│   │   │       └── UploadExcelForm.jsx
│   │   ├── config/
│   │   │   └── axios.js          # Configuración de Axios
│   │   ├── pages/
│   │   │   ├── Login.jsx         # Página de login
│   │   │   ├── Dashboard.jsx     # Dashboard principal
│   │   │   ├── Pacientes.jsx     # Gestión de pacientes
│   │   │   ├── Medicamentos.jsx  # Gestión de medicamentos
│   │   │   ├── Ordenes.jsx       # Gestión de órdenes
│   │   │   ├── Reportes.jsx      # Visualización de reportes
│   │   │   └── Inventarios.jsx   # Control de inventario
│   │   ├── App.js                # Componente principal
│   │   ├── index.js              # Punto de entrada
│   │   └── index.css             # Estilos globales
│   ├── package.json              # Dependencias Node.js
│   ├── tailwind.config.js        # Configuración de Tailwind
│   └── postcss.config.js
└── farmacia_db.sql               # Backup de base de datos
```

---

## Requisitos Previos

### Software Requerido

```bash
# Python 3.8 o superior
python --version
# Salida esperada: Python 3.8.x o superior

# Node.js 14.x o superior
node --version
# Salida esperada: v14.x.x o superior

# npm 6.x o superior
npm --version
# Salida esperada: 6.x.x o superior

# MySQL 8.0+ o MariaDB 10.0+
mysql --version
# Salida esperada: mysql Ver 8.0.x o MariaDB 10.x

# Git
git --version
# Salida esperada: git version 2.x.x
```

---

## Instalación Completa

### Paso 1: Clonar el Repositorio

```bash
# Clonar desde GitHub
git clone https://github.com/tu-usuario/farmagestion.git

# Navegar al directorio
cd farmagestion
```

### Paso 2: Configurar la Base de Datos

#### Opción A: Importar Base de Datos (Recomendado)

Esta opción incluye datos de ejemplo para pruebas.

```bash
# 1. Abrir MySQL
mysql -u root -p
# Ingresar contraseña cuando se solicite

# 2. Crear la base de datos (dentro del prompt de MySQL)
CREATE DATABASE farmacia_db CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

# 3. Salir de MySQL
EXIT;

# 4. Importar el archivo SQL
mysql -u root -p farmacia_db < farmacia_db.sql
# Ingresar contraseña cuando se solicite

# 5. Verificar importación
mysql -u root -p
USE farmacia_db;
SHOW TABLES;
# Deberías ver: pacientes, medicamentos, ordenes, auth_user, etc.
EXIT;
```

#### Opción B: Crear Base de Datos desde Cero

Si prefieres crear todo desde cero sin datos de ejemplo:

```bash
# 1. Crear base de datos
mysql -u root -p

CREATE DATABASE farmacia_db CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
EXIT;

# 2. Las migraciones se aplicarán en el siguiente paso
```

### Paso 3: Configurar el Backend

```bash
# 1. Navegar a la carpeta backend
cd backend

# 2. Crear entorno virtual
# En Windows:
python -m venv venv

# En Linux/Mac:
python3 -m venv venv

# 3. Activar entorno virtual
# En Windows:
venv\Scripts\activate

# En Linux/Mac:
source venv/bin/activate

# Deberías ver (venv) al inicio de tu terminal

# 4. Actualizar pip
python -m pip install --upgrade pip

# 5. Instalar dependencias
pip install -r requirements.txt

# Esto instalará:
# - Django 5.2.7
# - djangorestframework 3.16.1
# - django-cors-headers 4.9.0
# - mysqlclient 2.2.7
# - pandas 2.3.3
# - openpyxl 3.1.5
# - y todas las demás dependencias

# 6. Si usaste la Opción B (crear desde cero), aplicar migraciones
python manage.py migrate

# Esto creará todas las tablas necesarias

# 7. Si usaste la Opción B, crear superusuario
python manage.py createsuperuser
# Username: admin
# Email: admin@farmacia.com
# Password: admin123
# Password (again): admin123
```

### Paso 4: Configurar el Frontend

```bash
# 1. Abrir una NUEVA terminal (dejar el backend en la anterior)
# 2. Navegar a la carpeta frontend
cd farmacia/frontend

# 3. Instalar dependencias
npm install

# Esto instalará:
# - react 19.2.0
# - axios 1.12.2
# - chart.js 4.5.1
# - tailwindcss 3.4.18
# - react-router-dom 7.9.4
# - react-icons 5.5.0
# - y todas las demás dependencias

# El proceso puede tomar varios minutos
```

### Paso 5: Verificar la Instalación

```bash
# Terminal 1 - Backend
cd backend
python manage.py check
# Salida esperada: System check identified no issues (0 silenced).

# Terminal 2 - Frontend
cd frontend
npm run build
# Si no hay errores, la instalación fue exitosa
```

---

## Configuración Detallada

### Configuración del Backend

#### Archivo: `backend/backend/settings.py`

**Configuración de Base de Datos:**

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'farmacia_db',          # Nombre de la base de datos
        'USER': 'root',                  # Usuario de MySQL (cambiar si es necesario)
        'PASSWORD': '',                  # Contraseña (vacía por defecto en XAMPP)
        'HOST': 'localhost',             # Host del servidor MySQL
        'PORT': '3306',                  # Puerto de MySQL
        'OPTIONS': {
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
        },
    }
}
```

**Explicación de cada campo:**
- `ENGINE`: Motor de base de datos (MySQL en este caso)
- `NAME`: Nombre de la base de datos creada
- `USER`: Usuario de MySQL (por defecto 'root')
- `PASSWORD`: Contraseña del usuario (vacía en instalaciones locales como XAMPP)
- `HOST`: Servidor donde está MySQL (localhost para desarrollo local)
- `PORT`: Puerto de MySQL (3306 por defecto)

**Configuración de CORS:**

```python
# Permite peticiones desde el frontend en React
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",    # URL del frontend
]

# Permite envío de credenciales (cookies, headers de autenticación)
CORS_ALLOW_CREDENTIALS = True
```

**¿Qué es CORS?**
CORS (Cross-Origin Resource Sharing) permite que el frontend (puerto 3000) haga peticiones al backend (puerto 8000). Sin esta configuración, el navegador bloquearía las peticiones.

**Aplicaciones Instaladas:**

```python
INSTALLED_APPS = [
    'django.contrib.admin',         # Panel de administración
    'django.contrib.auth',          # Sistema de autenticación
    'django.contrib.contenttypes',  # Framework de tipos de contenido
    'django.contrib.sessions',      # Manejo de sesiones
    'django.contrib.messages',      # Framework de mensajes
    'django.contrib.staticfiles',   # Manejo de archivos estáticos
    'rest_framework',               # Django REST Framework
    'corsheaders',                  # Manejo de CORS
    'usuarios',                     # App de autenticación
    'pacientes',                    # App de gestión de pacientes
    'ordenes',                      # App de gestión de órdenes
    'medicamentos',                 # App de gestión de medicamentos
]
```

### Configuración del Frontend

#### Archivo: `frontend/src/config/axios.js`

```javascript
import axios from 'axios';

// Crear instancia de Axios con configuración base
const api = axios.create({
  baseURL: 'http://localhost:8000',    // URL del backend
  timeout: 10000,                       // Tiempo máximo de espera: 10 segundos
  headers: {
    'Content-Type': 'application/json',  // Tipo de contenido
  },
});

// Interceptor de respuestas
// Devuelve directamente response.data para simplificar el código
api.interceptors.response.use(
  (response) => response.data,           // Si la petición es exitosa
  (error) => {
    console.error('Error de API:', error);
    return Promise.reject(error);        // Si hay error
  }
);

export default api;
```

**Explicación:**
- `baseURL`: Todas las peticiones se harán a esta URL base
- `timeout`: Si una petición tarda más de 10 segundos, se cancela
- `interceptors`: Procesa automáticamente las respuestas antes de llegar al código

**Ejemplo de uso:**

```javascript
// Sin interceptor (forma tradicional)
const response = await axios.get('/api/pacientes/');
const data = response.data;  // Necesitas acceder a .data

// Con interceptor (forma simplificada)
const data = await api.get('/api/pacientes/');
// Ya tienes los datos directamente
```

---

## Estructura del Proyecto

### Backend - Detalle de Archivos

#### 1. `backend/backend/urls.py` - Rutas Principales

```python
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),                    # Panel admin: /admin/
    path('api/auth/', include('usuarios.urls')),        # Autenticación: /api/auth/
    path('api/pacientes/', include('pacientes.urls')),  # Pacientes: /api/pacientes/
    path('api/ordenes/', include('ordenes.urls')),      # Órdenes: /api/ordenes/
    path('api/medicamentos/', include('medicamentos.urls')),  # Medicamentos: /api/medicamentos/
]
```

**Flujo de rutas:**
1. Django recibe petición: `http://localhost:8000/api/pacientes/`
2. Busca en `urlpatterns` el patrón que coincida: `api/pacientes/`
3. Delega a `pacientes.urls` para manejar el resto
4. En `pacientes/urls.py` se define qué hacer con la petición

#### 2. `manage.py` - Script de Gestión

```python
#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys

def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)

if __name__ == '__main__':
    main()
```

**Comandos comunes:**
```bash
python manage.py runserver        # Iniciar servidor
python manage.py migrate          # Aplicar migraciones
python manage.py makemigrations   # Crear migraciones
python manage.py createsuperuser  # Crear usuario admin
python manage.py shell            # Abrir consola Python con Django
```

### Frontend - Detalle de Archivos

#### 1. `frontend/src/App.js` - Componente Principal

```javascript
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Pacientes from './pages/Pacientes';
import Medicamentos from './pages/Medicamentos';
import Ordenes from './pages/Ordenes';
import Reportes from './pages/Reportes';
import Inventarios from './pages/Inventarios';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/pacientes" element={<Pacientes />} />
        <Route path="/medicamentos" element={<Medicamentos />} />
        <Route path="/ordenes" element={<Ordenes />} />
        <Route path="/reportes" element={<Reportes />} />
        <Route path="/inventarios" element={<Inventarios />} />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
```

**Explicación del enrutamiento:**
- `BrowserRouter`: Habilita navegación sin recargar la página
- `Routes`: Contenedor de rutas
- `Route`: Define una ruta específica
  - `path`: URL de la ruta
  - `element`: Componente a renderizar
- `Navigate`: Redirecciona automáticamente

#### 2. `frontend/src/index.js` - Punto de Entrada

```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**Flujo de inicio:**
1. `index.js` es el primer archivo que se ejecuta
2. Busca el elemento con `id="root"` en `public/index.html`
3. Renderiza el componente `<App />` dentro de ese elemento
4. `App.js` maneja todas las rutas y componentes

---

## Modelos de Base de Datos

### 1. Modelo Paciente

**Archivo:** `backend/pacientes/models.py`

```python
from django.db import models
from django.utils import timezone

class Paciente(models.Model):
    # Opciones para el tipo de identificación
    TIPO_IDENTIFICACION = [
        ('CC', 'Cédula de Ciudadanía'),
        ('TI', 'Tarjeta de Identidad'),
        ('PA', 'Pasaporte'),
    ]
    
    # Campos del modelo
    nombre_completo = models.CharField(max_length=200)
    tipo_identificacion = models.CharField(max_length=2, choices=TIPO_IDENTIFICACION)
    numero_identificacion = models.CharField(max_length=20)
    fecha_ingreso = models.DateField(default=timezone.now)
    ultima_atencion = models.DateField(null=True, blank=True)
    observaciones = models.TextField(blank=True)
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'pacientes'
        verbose_name = 'Paciente'
        verbose_name_plural = 'Pacientes'
        unique_together = ['tipo_identificacion', 'numero_identificacion']

    def __str__(self):
        return f"{self.nombre_completo} - {self.get_tipo_identificacion_display()} {self.numero_identificacion}"
```

**Explicación de campos:**

| Campo | Tipo | Descripción | Restricciones |
|-------|------|-------------|---------------|
| `nombre_completo` | CharField | Nombre del paciente | max_length=200 |
| `tipo_identificacion` | CharField | Tipo de documento | choices (CC, TI, PA) |
| `numero_identificacion` | CharField | Número de documento | max_length=20 |
| `fecha_ingreso` | DateField | Fecha de registro | default=hoy |
| `ultima_atencion` | DateField | Última vez atendido | null=True, blank=True |
| `observaciones` | TextField | Notas adicionales | blank=True |
| `creado_en` | DateTimeField | Fecha de creación | auto_now_add=True |
| `actualizado_en` | DateTimeField | Última actualización | auto_now=True |

**Restricciones importantes:**
- `unique_together`: No pueden existir dos pacientes con el mismo tipo y número de identificación
- `blank=True`: El campo puede estar vacío en formularios
- `null=True`: El campo puede ser NULL en la base de datos

### 2. Modelo Medicamento

**Archivo:** `backend/medicamentos/models.py`

```python
from django.db import models
from django.utils import timezone

class Medicamento(models.Model):
    # Categorías de medicamentos
    CATEGORIAS = [
        ('analgesico', 'Analgésico'),
        ('antibiotico', 'Antibiótico'),
        ('antiinflamatorio', 'Antiinflamatorio'),
        ('antihistaminico', 'Antihistamínico'),
        ('cardiovascular', 'Cardiovascular'),
        ('digestivo', 'Digestivo'),
        ('respiratorio', 'Respiratorio'),
        ('rehidratante', 'Rehidratante'),
        ('antiseptico', 'Antiséptico'),
        ('gastroprotector', 'Gastroprotector'),
        ('antialergico', 'Antialérgico'),
        ('otros', 'Otros'),
    ]
    
    id_medicamento = models.CharField(max_length=50, unique=True, verbose_name="ID")
    nombre_producto = models.CharField(max_length=200, verbose_name="Nombre del producto")
    presentacion = models.CharField(max_length=100, verbose_name="Presentación")
    categoria = models.CharField(max_length=20, choices=CATEGORIAS, verbose_name="Categoría")
    laboratorio = models.CharField(max_length=100, verbose_name="Laboratorio")
    lote = models.CharField(max_length=50, verbose_name="Lote")
    fecha_vencimiento = models.DateField(verbose_name="Fecha de vencimiento")
    stock_actual = models.IntegerField(default=0, verbose_name="Stock actual")
    stock_minimo = models.IntegerField(default=10, verbose_name="Stock mínimo")
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Precio unitario")
    ubicacion = models.CharField(max_length=100, verbose_name="Ubicación")
    proveedor = models.CharField(max_length=100, verbose_name="Proveedor")
    fecha_ingreso = models.DateField(default=timezone.now, verbose_name="Fecha de ingreso")
    observaciones = models.TextField(blank=True, verbose_name="Observaciones")
    uso_frecuente = models.BooleanField(default=False, verbose_name="Uso frecuente")
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'medicamentos'
        verbose_name = 'Medicamento'
        verbose_name_plural = 'Medicamentos'
        ordering = ['nombre_producto']

    def __str__(self):
        return f"{self.nombre_producto} - {self.presentacion}"

    @property
    def estado_stock(self):
        """Calcula el estado del stock basado en cantidades"""
        if self.stock_actual <= 0:
            return 'agotado'
        elif self.stock_actual <= self.stock_minimo:
            return 'bajo'
        else:
            return 'normal'
```

**Explicación de la propiedad `estado_stock`:**

```python
@property
def estado_stock(self):
    if self.stock_actual <= 0:
        return 'agotado'        # No hay existencias
    elif self.stock_actual <= self.stock_minimo:
        return 'bajo'           # Stock por debajo del mínimo
    else:
        return 'normal'         # Stock normal
```

Esta propiedad se calcula dinámicamente y no se almacena en la base de datos. Se puede acceder como:
```python
medicamento = Medicamento.objects.get(id=1)
print(medicamento.estado_stock)  # Imprime: 'normal', 'bajo', o 'agotado'
```

### 3. Modelo Orden

**Archivo:** `backend/ordenes/models.py`

```python
from django.db import models
from django.utils import timezone
from pacientes.models import Paciente

class Orden(models.Model):
    # Estados posibles de una orden
    ESTADOS = [
        ('pendiente', 'Pendiente'),
        ('entregado', 'Entregado'),
    ]
    
    # Relación con Paciente (muchas órdenes pueden pertenecer a un paciente)
    paciente = models.ForeignKey(Paciente, on_delete=models.CASCADE, related_name='ordenes')
    identificacion = models.CharField(max_length=50, unique=True)
    fecha = models.DateField(default=timezone.now)
    estado = models.CharField(max_length=20, choices=ESTADOS, default='pendiente')
    descripcion = models.TextField(blank=True, verbose_name='Descripción')
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'ordenes'
        verbose_name = 'Orden'
        verbose_name_plural = 'Órdenes'
        ordering = ['-fecha', '-creado_en']

    def __str__(self):
        return f"Orden {self.identificacion} - {self.paciente.nombre_completo}"

    def get_estado_display(self):
        """Método para obtener la representación legible del estado"""
        return dict(self.ESTADOS).get(self.estado, self.estado)
```

**Explicación de ForeignKey:**

```python
paciente = models.ForeignKey(Paciente, on_delete=models.CASCADE, related_name='ordenes')
```

- `ForeignKey`: Crea una relación muchos-a-uno (muchas órdenes → un paciente)
- `on_delete=models.CASCADE`: Si se elimina un paciente, se eliminan todas sus órdenes
- `related_name='ordenes'`: Permite acceder a las órdenes desde un paciente:
  ```python
  paciente = Paciente.objects.get(id=1)
  ordenes = paciente.ordenes.all()  # Todas las órdenes del paciente
  ```

### Diagrama de Relaciones entre Modelos

```
┌─────────────────────────┐
│       Paciente          │
│  (pacientes)            │
├─────────────────────────┤
│ id (PK)                 │
│ nombre_completo         │
│ tipo_identificacion     │
│ numero_identificacion   │
│ fecha_ingreso           │
│ ultima_atencion         │
└────────────┬────────────┘
             │
             │ 1:N (Un paciente tiene muchas órdenes)
             │
             ▼
┌─────────────────────────┐
│        Orden            │
│  (ordenes)              │
├─────────────────────────┤
│ id (PK)                 │
│ paciente_id (FK) ───────┘
│ identificacion          │
│ fecha                   │
│ estado                  │
│ descripcion             │
└─────────────────────────┘

┌─────────────────────────┐
│     Medicamento         │
│  (medicamentos)         │
├─────────────────────────┤
│ id (PK)                 │
│ id_medicamento          │
│ nombre_producto         │
│ categoria               │
│ stock_actual            │
│ stock_minimo            │
│ precio_unitario         │
└─────────────────────────┘
(Sin relación directa con Orden en esta versión)
```

---

## Backend - API REST

### Serializers - Transformación de Datos

Los serializers convierten los modelos de Django en JSON y viceversa.

#### 1. PacienteSerializer

**Archivo:** `backend/pacientes/serializers.py`

```python
from rest_framework import serializers
from .models import Paciente

class PacienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Paciente
        fields = '__all__'  # Incluye todos los campos del modelo
```

**Ejemplo de serialización:**

```python
# Modelo → JSON
paciente = Paciente.objects.get(id=1)
serializer = PacienteSerializer(paciente)
print(serializer.data)

# Salida:
{
    "id": 1,
    "nombre_completo": "Juan Pérez",
    "tipo_identificacion": "CC",
    "numero_identificacion": "1234567890",
    "fecha_ingreso": "2025-10-16",
    "ultima_atencion": "2025-10-10",
    "observaciones": "Paciente regular",
    "creado_en": "2025-10-16T04:33:56.343729Z",
    "actualizado_en": "2025-10-16T04:33:56.343729Z"
}
```

#### 2. MedicamentoSerializer

**Archivo:** `backend/medicamentos/serializers.py`

```python
from rest_framework import serializers
from .models import Medicamento

class MedicamentoSerializer(serializers.ModelSerializer):
    # Campos calculados (solo lectura)
    categoria_display = serializers.CharField(source='get_categoria_display', read_only=True)
    estado_stock_display = serializers.CharField(source='estado_stock', read_only=True)
    
    class Meta:
        model = Medicamento
        fields = [
            'id', 'id_medicamento', 'nombre_producto', 'presentacion',
            'categoria', 'categoria_display', 'laboratorio', 'lote',
            'fecha_vencimiento', 'stock_actual', 'stock_minimo',
            'precio_unitario', 'ubicacion', 'proveedor', 'fecha_ingreso',
            'observaciones', 'uso_frecuente', 'estado_stock',
            'estado_stock_display', 'creado_en', 'actualizado_en'
        ]

    def validate_stock_actual(self, value):
        """Validación personalizada para stock_actual"""
        if value < 0:
            raise serializers.ValidationError("El stock actual no puede ser negativo")
        return value

    def validate_stock_minimo(self, value):
        """Validación personalizada para stock_minimo"""
        if value < 0:
            raise serializers.ValidationError("El stock mínimo no puede ser negativo")
        return value

    def validate_id_medicamento(self, value):
        """Validación personalizada para id_medicamento"""
        if not value.strip():
            raise serializers.ValidationError("El ID del medicamento no puede estar vacío")
        return value
```

**Explicación de validaciones:**

Las validaciones se ejecutan automáticamente cuando se intenta crear o actualizar un medicamento:

```python
# Intento de crear medicamento con stock negativo
data = {
    "id_medicamento": "MED001",
    "nombre_producto": "Aspirina",
    "stock_actual": -5,  # INVÁLIDO
    ...
}

serializer = MedicamentoSerializer(data=data)
serializer.is_valid()  # Retorna False
print(serializer.errors)
# Salida: {'stock_actual': ['El stock actual no puede ser negativo']}
```

#### 3. OrdenSerializer

**Archivo:** `backend/ordenes/serializers.py`

```python
from rest_framework import serializers
from .models import Orden

class OrdenSerializer(serializers.ModelSerializer):
    # Campos relacionados (solo lectura)
    paciente_nombre = serializers.CharField(source='paciente.nombre_completo', read_only=True)
    paciente_identificacion = serializers.CharField(source='paciente.numero_identificacion', read_only=True)
    tipo_identificacion_display = serializers.CharField(source='paciente.get_tipo_identificacion_display', read_only=True)
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    
    class Meta:
        model = Orden
        fields = [
            'id', 'paciente', 'paciente_nombre', 'paciente_identificacion',
            'tipo_identificacion_display', 'identificacion', 'fecha',
            'estado', 'estado_display', 'descripcion', 'creado_en', 'actualizado_en'
        ]
        read_only_fields = ['creado_en', 'actualizado_en']

    def validate_identificacion(self, value):
        """Valida que la identificación de orden sea única"""
        if Orden.objects.filter(identificacion=value).exists():
            raise serializers.ValidationError("Ya existe una orden con esta identificación")
        return value
```

**Explicación de campos relacionados:**

```python
paciente_nombre = serializers.CharField(source='paciente.nombre_completo', read_only=True)
```

Esto permite incluir información del paciente en la respuesta sin necesidad de hacer peticiones adicionales:

```json
{
  "id": 1,
  "paciente": 1,                          // ID del paciente
  "paciente_nombre": "Juan Pérez",        // Nombre completo del paciente
  "paciente_identificacion": "1234567890", // Cédula del paciente
  "identificacion": "ORD-001",
  "estado": "pendiente"
}
```

### ViewSets - Lógica de Negocio

Los ViewSets manejan las operaciones CRUD y la lógica de negocio.

#### 1. PacienteViewSet

**Archivo:** `backend/pacientes/views.py`

```python
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import Paciente
from .serializers import PacienteSerializer

class PacienteViewSet(viewsets.ModelViewSet):
    queryset = Paciente.objects.all().order_by('-creado_en')
    serializer_class = PacienteSerializer

    def get_queryset(self):
        """Filtra el queryset según parámetros de búsqueda"""
        queryset = super().get_queryset()
        search = self.request.query_params.get('search', None)
        
        if search:
            # Búsqueda en múltiples campos usando Q objects
            queryset = queryset.filter(
                Q(nombre_completo__icontains=search) |
                Q(numero_identificacion__icontains=search) |
                Q(tipo_identificacion__icontains=search)
            )
        return queryset

    @action(detail=False, methods=['get'])
    def opciones_identificacion(self, request):
        """Endpoint personalizado para obtener opciones de tipo de identificación"""
        opciones = Paciente.TIPO_IDENTIFICACION
        return Response(opciones)
```

**Explicación de Q objects:**

```python
Q(nombre_completo__icontains=search) |
Q(numero_identificacion__icontains=search) |
Q(tipo_identificacion__icontains=search)
```

Esto crea una consulta SQL con OR:
```sql
SELECT * FROM pacientes 
WHERE nombre_completo LIKE '%search%' 
   OR numero_identificacion LIKE '%search%' 
   OR tipo_identificacion LIKE '%search%';
```

**Explicación de @action:**

```python
@action(detail=False, methods=['get'])
def opciones_identificacion(self, request):
    ...
```

- `detail=False`: La acción no requiere un ID específico (actúa sobre toda la colección)
- `methods=['get']`: Solo acepta peticiones GET
- Crea el endpoint: `/api/pacientes/opciones_identificacion/`

#### 2. MedicamentoViewSet

**Archivo:** `backend/medicamentos/views.py`

```python
import pandas as pd
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from django.http import HttpResponse
from .models import Medicamento
from .serializers import MedicamentoSerializer

class MedicamentoViewSet(viewsets.ModelViewSet):
    queryset = Medicamento.objects.all().order_by('nombre_producto')
    serializer_class = MedicamentoSerializer

    def get_queryset(self):
        """Filtra medicamentos por búsqueda"""
        queryset = super().get_queryset()
        buscar = self.request.query_params.get('buscar', None)
        
        if buscar:
            queryset = queryset.filter(
                Q(nombre_producto__icontains=buscar) |
                Q(id_medicamento__icontains=buscar) |
                Q(laboratorio__icontains=buscar) |
                Q(categoria__icontains=buscar) |
                Q(ubicacion__icontains=buscar)
            )
        return queryset

    @action(detail=False, methods=['post'])
    def cargar_excel(self, request):
        """Endpoint para cargar medicamentos desde archivo Excel"""
        try:
            archivo = request.FILES.get('archivo')
            if not archivo:
                return Response(
                    {'error': 'No se proporcionó ningún archivo'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Leer archivo Excel con pandas
            df = pd.read_excel(archivo)
            
            # Validar columnas requeridas
            columnas_requeridas = [
                'ID', 'Nombre del producto', 'Presentación', 'Categoría', 
                'Laboratorio', 'Lote', 'Fecha de vencimiento', 'Stock actual',
                'Stock mínimo', 'Precio unitario', 'Ubicación', 'Proveedor'
            ]
            
            for columna in columnas_requeridas:
                if columna not in df.columns:
                    return Response(
                        {'error': f'Falta la columna: {columna}'}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )

            medicamentos_creados = 0
            medicamentos_actualizados = 0
            errores = []

            # Mapeo de categorías de texto a código
            mapeo_categorias = {
                'Analgésico': 'analgesico',
                'Antibiótico': 'antibiotico',
                'Antiinflamatorio': 'antiinflamatorio',
                'Antihistamínico': 'antihistaminico',
                'Cardiovascular': 'cardiovascular',
                'Digestivo': 'digestivo',
                'Respiratorio': 'respiratorio',
                'Rehidratante': 'rehidratante',
                'Antiséptico': 'antiseptico',
                'Gastroprotector': 'gastroprotector',
                'Antialérgico': 'antialergico',
                'Otros': 'otros'
            }

            # Procesar cada fila del Excel
            for index, fila in df.iterrows():
                try:
                    id_medicamento = str(fila['ID']).strip()
                    if not id_medicamento:
                        errores.append(f"Fila {index + 2}: El ID no puede estar vacío")
                        continue

                    categoria_excel = str(fila['Categoría']).strip()
                    categoria_modelo = mapeo_categorias.get(categoria_excel, 'otros')
                    
                    fecha_ingreso = fila.get('Fecha de ingreso')
                    if pd.isna(fecha_ingreso):
                        fecha_ingreso = None

                    fecha_vencimiento = fila['Fecha de vencimiento']
                    if pd.isna(fecha_vencimiento):
                        errores.append(f"Fila {index + 2}: La fecha de vencimiento no puede estar vacía")
                        continue

                    datos_medicamento = {
                        'nombre_producto': str(fila['Nombre del producto']),
                        'presentacion': str(fila['Presentación']),
                        'categoria': categoria_modelo,
                        'laboratorio': str(fila['Laboratorio']),
                        'lote': str(fila['Lote']),
                        'fecha_vencimiento': fecha_vencimiento,
                        'stock_actual': int(fila['Stock actual']),
                        'stock_minimo': int(fila['Stock mínimo']),
                        'precio_unitario': float(fila['Precio unitario']),
                        'ubicacion': str(fila['Ubicación']),
                        'proveedor': str(fila['Proveedor']),
                        'fecha_ingreso': fecha_ingreso,
                        'observaciones': str(fila.get('Observaciones', '')),
                    }

                    # Crear o actualizar medicamento (upsert)
                    medicamento, creado = Medicamento.objects.update_or_create(
                        id_medicamento=id_medicamento,
                        defaults=datos_medicamento
                    )
                    
                    if creado:
                        medicamentos_creados += 1
                    else:
                        medicamentos_actualizados += 1
                        
                except Exception as e:
                    errores.append(f"Fila {index + 2}: {str(e)}")

            mensaje = []
            if medicamentos_creados > 0:
                mensaje.append(f'Se crearon {medicamentos_creados} medicamentos')
            if medicamentos_actualizados > 0:
                mensaje.append(f'Se actualizaron {medicamentos_actualizados} medicamentos')
            
            return Response({
                'mensaje': '; '.join(mensaje) if mensaje else 'No se realizaron cambios',
                'detalle': {
                    'creados': medicamentos_creados,
                    'actualizados': medicamentos_actualizados,
                    'total_procesados': medicamentos_creados + medicamentos_actualizados
                },
                'errores': errores,
                'total_filas': len(df)
            })

        except Exception as e:
            return Response(
                {'error': f'Error procesando el archivo: {str(e)}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get'])
    def descargar_plantilla(self, request):
        """Endpoint para descargar plantilla Excel con el formato correcto"""
        try:
            # Crear DataFrame con datos de ejemplo
            datos_ejemplo = {
                'ID': ['MED001', 'MED002', 'MED003'],
                'Nombre del producto': [
                    'Paracetamol 500 mg', 
                    'Amoxicilina 500 mg', 
                    'Ibuprofeno 400 mg'
                ],
                'Presentación': [
                    'Tabletas x 10', 
                    'Cápsulas x 12', 
                    'Tabletas x 10'
                ],
                'Categoría': [
                    'Analgésico', 
                    'Antibiótico', 
                    'Antiinflamatorio'
                ],
                'Laboratorio': ['Genfar', 'Pfizer', 'Tecnoquímicas'],
                'Lote': ['L1234', 'A5678', 'B2345'],
                'Fecha de vencimiento': ['2026-03-15', '2025-12-30', '2026-06-10'],
                'Stock actual': [120, 60, 80],
                'Stock mínimo': [30, 20, 25],
                'Precio unitario': [1200, 3500, 1500],
                'Ubicación': ['Estante A1', 'Estante B3', 'Estante A2'],
                'Proveedor': [
                    'Distribuidora Farma', 
                    'FarmaExpress', 
                    'Droguería Central'
                ],
                'Fecha de ingreso': ['2025-09-01', '2025-08-20', '2025-09-10'],
                'Observaciones': [
                    'Buen estado', 
                    'Controlado', 
                    'Buen estado'
                ]
            }
            
            df = pd.DataFrame(datos_ejemplo)
            
            # Crear respuesta HTTP con archivo Excel
            response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            response['Content-Disposition'] = 'attachment; filename=plantilla_medicamentos.xlsx'
            
            # Escribir Excel en la respuesta
            with pd.ExcelWriter(response, engine='openpyxl') as writer:
                df.to_excel(writer, sheet_name='Medicamentos', index=False)
                
                # Ajustar ancho de columnas
                worksheet = writer.sheets['Medicamentos']
                for column in df:
                    column_width = max(df[column].astype(str).map(len).max(), len(column))
                    col_idx = df.columns.get_loc(column)
                    worksheet.column_dimensions[chr(65 + col_idx)].width = column_width + 2
                
            return response

        except Exception as e:
            return Response(
                {'error': f'Error generando plantilla: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def opciones_categoria(self, request):
        """Endpoint para obtener las opciones de categoría"""
        opciones = Medicamento.CATEGORIAS
        return Response(opciones)
```

**Explicación de update_or_create:**

```python
medicamento, creado = Medicamento.objects.update_or_create(
    id_medicamento=id_medicamento,  # Criterio de búsqueda
    defaults=datos_medicamento      # Datos a crear/actualizar
)
```

Comportamiento:
1. Busca un medicamento con ese `id_medicamento`
2. Si existe: actualiza con los datos de `defaults`
3. Si no existe: crea uno nuevo con `id_medicamento` + `defaults`
4. Retorna: (objeto, True si fue creado / False si fue actualizado)

#### 3. OrdenViewSet

**Archivo:** `backend/ordenes/views.py`

```python
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import Orden
from .serializers import OrdenSerializer

class OrdenViewSet(viewsets.ModelViewSet):
    # select_related('paciente') optimiza la consulta (JOIN en SQL)
    queryset = Orden.objects.all().select_related('paciente').order_by('-creado_en')
    serializer_class = OrdenSerializer

    def get_queryset(self):
        """Filtra órdenes por búsqueda"""
        queryset = super().get_queryset()
        buscar = self.request.query_params.get('buscar', None)
        
        if buscar:
            queryset = queryset.filter(
                Q(identificacion__icontains=buscar) |
                Q(paciente__nombre_completo__icontains=buscar) |
                Q(descripcion__icontains=buscar) |
                Q(estado__icontains=buscar)
            )
        return queryset

    @action(detail=False, methods=['get'])
    def opciones_estado(self, request):
        """Endpoint para obtener opciones de estado"""
        opciones = Orden.ESTADOS
        return Response(opciones)

    @action(detail=True, methods=['patch', 'post'])
    def cambiar_estado(self, request, pk=None):
        """
        Endpoint para cambiar el estado de una orden
        URL: /api/ordenes/{id}/cambiar_estado/
        """
        try:
            orden = self.get_object()
            nuevo_estado = request.data.get('estado')
            
            if not nuevo_estado:
                return Response(
                    {'error': 'El campo "estado" es requerido'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            estados_validos = [estado[0] for estado in Orden.ESTADOS]
            if nuevo_estado not in estados_validos:
                return Response(
                    {'error': f'Estado no válido. Estados permitidos: {estados_validos}'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            orden.estado = nuevo_estado
            orden.save()
            
            serializer = self.get_serializer(orden)
            return Response({
                'mensaje': f'Estado cambiado a {orden.get_estado_display()}',
                'orden': serializer.data
            })
            
        except Orden.DoesNotExist:
            return Response(
                {'error': 'Orden no encontrada'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': f'Error interno del servidor: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
```

**Explicación de select_related:**

```python
queryset = Orden.objects.all().select_related('paciente')
```

Sin `select_related`:
```python
# Hace 1 consulta para obtener órdenes
ordenes = Orden.objects.all()

# Para cada orden, hace 1 consulta adicional para obtener el paciente
for orden in ordenes:
    print(orden.paciente.nombre_completo)  # N consultas adicionales
# Total: 1 + N consultas (Problema N+1)
```

Con `select_related`:
```python
# Hace 1 sola consulta con JOIN
ordenes = Orden.objects.all().select_related('paciente')

for orden in ordenes:
    print(orden.paciente.nombre_completo)  # Sin consultas adicionales
# Total: 1 consulta
```

### Autenticación

**Archivo:** `backend/usuarios/views.py`

```python
from django.contrib.auth import authenticate
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

@csrf_exempt
def login_view(request):
    """
    Vista de autenticación básica
    Método: POST
    URL: /api/auth/login/
    """
    if request.method == 'POST':
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')

        # Autenticar usuario
        user = authenticate(username=username, password=password)
        
        if user is not None:
            return JsonResponse({
                'success': True,
                'message': 'Inicio de sesión exitoso',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                }
            })
        else:
            return JsonResponse({
                'success': False,
                'message': 'Usuario o contraseña incorrectos'
            })
            
    return JsonResponse({'success': False, 'message': 'Método no permitido'})
```

**Explicación de @csrf_exempt:**

```python
@csrf_exempt
def login_view(request):
    ...
```

- Django por defecto protege contra ataques CSRF (Cross-Site Request Forgery)
- `@csrf_exempt` desactiva esta protección para esta vista específica
- Necesario porque el frontend React hace peticiones desde otro dominio
- En producción, se debe usar JWT o tokens CSRF apropiados

---

## Frontend - Componentes y Páginas

### Componentes de Layout

#### 1. Header Component

**Archivo:** `frontend/src/components/layout/Header.jsx`

```javascript
import React, { useEffect, useState, useRef } from "react";

const Header = ({ title, subtitle }) => {
  const [user, setUser] = useState({
    name: "Usuario",
    role: "Sin rol asignado",
    initials: "U",
  });

  const [currentDate, setCurrentDate] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Cargar usuario desde localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      const name = parsedUser.username || parsedUser.name || parsedUser.email || "Usuario";
      const role = parsedUser.role || "Usuario del sistema";

      // Generar iniciales
      const initials = name.includes("@")
        ? name
            .split("@")[0]
            .split(/[._-]/)
            .map(word => word.charAt(0).toUpperCase())
            .join("")
            .slice(0, 2)
        : name.charAt(0).toUpperCase();

      setUser({ name, role, initials });
    }

    // Establecer fecha actual
    const now = new Date();
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    const formattedDate = now.toLocaleDateString('es-ES', options);
    setCurrentDate(formattedDate);

    // Cerrar dropdown al hacer clic fuera
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("access_token");
    window.location.href = "/login";
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 p-4 sm:p-0">
      {/* Sección de título y fecha */}
      <div className="flex-1 min-w-0">
        <h3 className="text-gray-500 font-medium text-sm sm:text-base">
          {subtitle || currentDate}
        </h3>
        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 truncate">
          {title}
        </h2>
      </div>

      {/* Sección del usuario - OCULTO EN MÓVIL */}
      <div className="hidden lg:flex items-center gap-3 relative w-full sm:w-auto" ref={dropdownRef}>
        <div 
          className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 rounded-lg p-2 transition-colors w-full sm:w-auto"
          onClick={toggleDropdown}
        >
          {/* Círculo con iniciales */}
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#08988e] text-white flex items-center justify-center text-base sm:text-lg font-semibold flex-shrink-0">
            {user.initials}
          </div>
          
          {/* Información del usuario */}
          <div className="hidden xs:block min-w-0 flex-1">
            <div className="text-gray-800 font-medium text-sm sm:text-base truncate max-w-[120px] sm:max-w-[150px]">
              {user.name}
            </div>
            <div className="text-gray-500 text-xs sm:text-sm truncate max-w-[120px] sm:max-w-[150px]">
              {user.role}
            </div>
          </div>

          {/* Icono de flecha */}
          <svg 
            className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${showDropdown ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        
        {/* Dropdown menu */}
        {showDropdown && (
          <div className="absolute top-14 sm:top-16 right-0 bg-white rounded-lg shadow-lg border border-gray-200 py-2 w-48 sm:w-52 z-50">
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Cerrar sesión</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
```

**Características principales del Header:**

1. **Props**: Recibe `title` y `subtitle` para personalizar el encabezado
2. **LocalStorage**: Lee información del usuario guardada en el navegador
3. **Generación de iniciales**: Crea iniciales automáticamente del nombre
4. **Fecha actual**: Muestra la fecha en formato español
5. **Dropdown**: Menú desplegable con opción de cerrar sesión
6. **Responsive**: Se oculta en pantallas pequeñas (< 1024px)
7. **Click outside**: Cierra el dropdown al hacer clic fuera de él

**Uso del Header:**

```javascript
// En cualquier página
<Header title="Dashboard" subtitle="Panel principal" />
<Header title="Pacientes" />  // subtitle toma la fecha automáticamente
```

#### 2. Sidebar Component

**Archivo:** `frontend/src/components/layout/Sidebar.jsx`

```javascript
import React, { useState, useEffect } from "react";
import {
  FaClinicMedical,
  FaHome,
  FaUserInjured,
  FaPills,
  FaFileMedical,
  FaChartLine,
  FaBoxes,
  FaBars,
  FaTimes,
  FaSignOutAlt,
} from "react-icons/fa";

const Sidebar = ({ activePage }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [user, setUser] = useState({
    name: "Usuario",
    role: "Sin rol asignado",
    initials: "U",
  });
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      const name = parsedUser.username || parsedUser.name || parsedUser.email || "Usuario";
      const role = parsedUser.role || "Usuario del sistema";

      const initials = name.includes("@")
        ? name
            .split("@")[0]
            .split(/[._-]/)
            .map(word => word.charAt(0).toUpperCase())
            .join("")
            .slice(0, 2)
        : name.charAt(0).toUpperCase();

      setUser({ name, role, initials });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("access_token");
    window.location.href = "/login";
  };

  const menuItems = [
    { icon: <FaHome />, label: "Dashboard", path: "/dashboard" },
    { icon: <FaUserInjured />, label: "Pacientes", path: "/pacientes" },
    { icon: <FaPills />, label: "Medicamentos", path: "/medicamentos" },
    { icon: <FaFileMedical />, label: "Órdenes", path: "/ordenes" },
    { icon: <FaChartLine />, label: "Reportes", path: "/reportes" },
    { icon: <FaBoxes />, label: "Inventarios", path: "/inventarios" },
  ];

  const toggleMobileMenu = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const handleMenuItemClick = () => {
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-[#08988e] text-white p-4 z-40 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaClinicMedical className="text-xl" />
            <span className="text-lg font-semibold">FarmaGestion</span>
          </div>
          <button
            onClick={toggleMobileMenu}
            className="p-2 rounded-lg hover:bg-[#05776f] transition-colors"
          >
            {isMobileOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
          </button>
        </div>
      </div>

      {/* Overlay para móvil */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 bg-[#08988e] text-white flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        lg:translate-x-0
        pt-20 lg:pt-6
        h-screen lg:h-auto
        overflow-y-auto
      `}>
        {/* Logo - oculto en móvil porque está en el header */}
        <div className="hidden lg:block px-6">
          <h2 className="text-2xl font-semibold mb-8 flex items-center gap-2">
            <FaClinicMedical /> <span>FarmaGestión</span>
          </h2>
        </div>

        {/* Menú */}
        <ul className="space-y-2 flex-1 px-3">
          {menuItems.map((item) => (
            <li key={item.label}>
              <a
                href={item.path}
                onClick={handleMenuItemClick}
                className={`
                  flex items-center gap-3 p-3 rounded-lg transition-all duration-200
                  ${activePage === item.label.toLowerCase()
                    ? "bg-[#05776f] font-semibold shadow-md"
                    : "hover:bg-[#05776f] hover:shadow-sm"
                  }
                  text-base
                `}
              >
                <span className="text-lg flex-shrink-0">{item.icon}</span>
                <span className="flex-1">{item.label}</span>
              </a>
            </li>
          ))}
        </ul>

        {/* Información del usuario SOLO EN MÓVIL */}
        <div className="lg:hidden px-3 pb-4">
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#05776f] transition-all w-full text-left"
            >
              <div className="w-10 h-10 rounded-full bg-white text-[#08988e] flex items-center justify-center text-base font-semibold flex-shrink-0">
                {user.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-medium text-sm truncate">
                  {user.name}
                </div>
                <div className="text-[#a8e0db] text-xs truncate">
                  {user.role}
                </div>
              </div>
              <svg 
                className={`w-3 h-3 text-[#a8e0db] transition-transform flex-shrink-0 ${showUserDropdown ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Dropdown del usuario */}
            {showUserDropdown && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                >
                  <FaSignOutAlt className="w-3 h-3 flex-shrink-0" />
                  <span>Cerrar sesión</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Información adicional para desktop */}
        <div className="hidden lg:block mt-4 px-6 pt-4 border-t border-[#05776f]">
          <p className="text-xs text-[#a8e0db] text-center">
            Sistema de Gestión Farmacéutica
          </p>
        </div>
      </aside>

      {/* Espacio para el header móvil */}
      <div className="lg:hidden h-16" />
    </>
  );
};

export default Sidebar;
```

**Características del Sidebar:**

1. **Props**: Recibe `activePage` para resaltar la página actual
2. **Menú de navegación**: 6 opciones principales del sistema
3. **Responsive**: 
   - Desktop: Sidebar fijo siempre visible
   - Móvil: Menú hamburguesa con animación de deslizamiento
4. **Overlay**: Fondo oscuro en móvil cuando el menú está abierto
5. **Información de usuario**: Solo visible en móviles
6. **Estado activo**: Resalta visualmente la página actual

**Uso del Sidebar:**

```javascript
// En la página de Dashboard
<Sidebar activePage="dashboard" />

// En la página de Pacientes
<Sidebar activePage="pacientes" />
```

### Páginas Principales

#### 1. Login Page

**Archivo:** `frontend/src/pages/Login.jsx`

```javascript
import React, { useState } from "react";
import { FaClinicMedical, FaUser, FaLock, FaSignInAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        // Guardar información del usuario en localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('isAuthenticated', 'true');
        
        // Redirigir al dashboard
        navigate('/dashboard');
      } else {
        setError(data.message || 'Error en el login');
      }
    } catch (error) {
      setError('Error de conexión con el servidor');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Panel Izquierdo - Visible en desktop */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#08988e] flex-col justify-center items-center text-white p-8">
        <div className="max-w-md w-full text-center">
          <FaClinicMedical className="text-6xl mb-6 mx-auto" />
          <h1 className="text-4xl font-bold mb-4">FarmaGestión</h1>
          <p className="text-xl opacity-90">Sistema de Gestión Farmacéutica</p>
        </div>
      </div>

      {/* Panel Derecho - Formulario */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-md">
          {/* Header móvil */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <FaClinicMedical className="text-4xl text-[#08988e] mr-3" />
              <div className="text-left">
                <h1 className="text-2xl font-bold text-[#08988e]">FarmaGestión</h1>
                <p className="text-sm text-gray-600">Sistema de Gestión Farmacéutica</p>
              </div>
            </div>
          </div>

          {/* Card del formulario */}
          <div className="bg-white rounded-2xl shadow-lg p-8 lg:p-10 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center justify-center lg:justify-start">
              <FaUser className="text-[#08988e] mr-3 text-xl" /> 
              Iniciar Sesión
            </h2>
            
            {/* Mensaje de error */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="username"
                  placeholder="Usuario"
                  value={formData.username}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#08988e] focus:border-transparent transition-all duration-200 text-gray-700 placeholder-gray-400"
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  name="password"
                  placeholder="Contraseña"
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#08988e] focus:border-transparent transition-all duration-200 text-gray-700 placeholder-gray-400"
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full lg:w-auto bg-[#08988e] hover:bg-[#067a74] text-white font-medium py-3 px-8 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Procesando...</span>
                    </>
                  ) : (
                    <>
                      <FaSignInAlt className="text-lg" />
                      <span>Ingresar</span>
                    </>
                  )}
                </button>
                <a
                  href="/recuperar-contrasena"
                  className="text-[#08988e] hover:text-[#067a74] text-sm font-medium transition-colors duration-200 text-center lg:text-right block py-2 lg:py-0"
                >
                  ¿Olvidaste la Contraseña?
                </a>
              </div>
            </form>
          </div>

          {/* Footer móvil */}
          <div className="lg:hidden text-center mt-8">
            <p className="text-sm text-gray-500">
              © 2025 FarmaGestión. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
```

**Flujo de autenticación:**

1. Usuario ingresa credenciales
2. Formulario hace POST a `/api/auth/login/`
3. Backend valida credenciales con Django Auth
4. Si es exitoso:
   - Backend retorna datos del usuario
   - Frontend guarda en localStorage
   - Redirige a `/dashboard`
5. Si falla:
   - Muestra mensaje de error
   - Usuario puede intentar nuevamente

**LocalStorage después del login:**

```javascript
localStorage.getItem('user')
// Retorna: {"id": 1, "username": "admin", "email": "admin@farmacia.com"}

localStorage.getItem('isAuthenticated')
// Retorna: "true"
```

#### 2. Dashboard Page

**Archivo:** `frontend/src/pages/Dashboard.jsx`

**Funcionalidades principales:**

1. **Estadísticas generales**: Muestra 4 tarjetas con totales
2. **Gráfico de barras**: Órdenes mensuales (últimos 6 meses)
3. **Gráfico de dona**: Estado de órdenes
4. **Tabla**: Últimas 5 órdenes registradas

**Carga de datos:**

```javascript
const cargarDashboard = async () => {
  try {
    setLoading(true);
    
    // Cargar datos desde 3 endpoints en paralelo
    const [pacientesRes, medicamentosRes, ordenesRes] = await Promise.all([
      api.get('/api/pacientes/'),
      api.get('/api/medicamentos/'),
      api.get('/api/ordenes/')
    ]);

    // Procesar datos...
    const totalPacientes = Array.isArray(pacientesRes) ? pacientesRes.length : 0;
    const totalMedicamentos = Array.isArray(medicamentosRes) ? medicamentosRes.length : 0;
    const totalOrdenes = Array.isArray(ordenesRes) ? ordenesRes.length : 0;

    // Calcular alertas de inventario
    const alertasInventario = medicamentos.filter(med => 
      med.stock_actual <= med.stock_minimo
    ).length;

    setStats({
      totalPacientes,
      totalMedicamentos,
      totalOrdenes,
      alertasInventario
    });
  } catch (error) {
    console.error('Error cargando dashboard:', error);
  } finally {
    setLoading(false);
  }
};
```

**Explicación de Promise.all:**

```javascript
// Sin Promise.all (secuencial - más lento)
const pacientesRes = await api.get('/api/pacientes/');    // Espera 1s
const medicamentosRes = await api.get('/api/medicamentos/'); // Espera 1s
const ordenesRes = await api.get('/api/ordenes/');         // Espera 1s
// Total: 3 segundos

// Con Promise.all (paralelo - más rápido)
const [pacientesRes, medicamentosRes, ordenesRes] = await Promise.all([
  api.get('/api/pacientes/'),
  api.get('/api/medicamentos/'),
  api.get('/api/ordenes/')
]);
// Total: 1 segundo (todas las peticiones al mismo tiempo)
```

#### 3. Medicamentos Page

**Archivo:** `frontend/src/pages/Medicamentos.jsx`

**Funcionalidades:**

1. **Búsqueda en tiempo real**: Filtra por nombre, laboratorio, categoría
2. **Agregar medicamento**: Formulario modal individual
3. **Carga masiva**: Importar desde Excel
4. **Descargar plantilla**: Template Excel con formato correcto
5. **Uso frecuente**: Checkbox para marcar medicamentos importantes

**Función de descarga de plantilla:**

```javascript
const descargarPlantilla = async () => {
  try {
    const response = await api.get('/api/medicamentos/descargar_plantilla/', {
      responseType: 'blob'  // Importante: indica que es un archivo binario
    });

    // Crear URL temporal para el blob
    const url = window.URL.createObjectURL(new Blob([response]));
    
    // Crear link temporal y hacer clic automático
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'plantilla_medicamentos.xlsx');
    document.body.appendChild(link);
    link.click();
    
    // Limpiar
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error descargando plantilla:', error);
  }
};
```

**Actualizar uso frecuente:**

```javascript
const manejarUsoFrecuente = async (medicamentoId, usoFrecuente) => {
  try {
    await api.patch(`/api/medicamentos/${medicamentoId}/`, {
      uso_frecuente: usoFrecuente
    });
    cargarMedicamentos(); // Recargar lista
  } catch (error) {
    console.error('Error actualizando uso frecuente:', error);
  }
};

// Uso en el checkbox
<input
  type="checkbox"
  checked={medicamento.uso_frecuente}
  onChange={(e) => manejarUsoFrecuente(medicamento.id, e.target.checked)}
/>
```

#### 4. Órdenes Page

**Archivo:** `frontend/src/pages/Ordenes.jsx`

**Función principal - Cambiar estado:**

```javascript
const cambiarEstadoOrden = async (ordenId, nuevoEstado) => {
  try {
    setCambiandoEstado(prev => ({ ...prev, [ordenId]: true }));
    
    // Llamada al endpoint personalizado
    const responseData = await api.patch(
      `/api/ordenes/${ordenId}/cambiar_estado/`, 
      { estado: nuevoEstado }
    );
    
    // Actualizar orden en el estado local
    let ordenActualizada;
    if (responseData.orden) {
      ordenActualizada = responseData.orden;
    } else if (responseData.id) {
      ordenActualizada = responseData;
    }
    
    setOrdenes(prev => prev.map(orden => 
      orden.id === ordenId ? ordenActualizada : orden
    ));
    
  } catch (error) {
    console.error('Error cambiando estado:', error);
    setErrores({ general: 'Error al cambiar el estado de la orden' });
  } finally {
    setCambiandoEstado(prev => ({ ...prev, [ordenId]: false }));
  }
};
```

**Botones dinámicos según estado:**

```javascript
{orden.estado === 'pendiente' ? (
  <button
    onClick={() => cambiarEstadoOrden(orden.id, 'entregado')}
    disabled={cambiandoEstado[orden.id]}
    className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
  >
    {cambiandoEstado[orden.id] ? (
      <FaSync className="animate-spin" />
    ) : (
      <FaCheck />
    )}
    Marcar Entregado
  </button>
) : (
  <button
    onClick={() => cambiarEstadoOrden(orden.id, 'pendiente')}
    disabled={cambiandoEstado[orden.id]}
    className="flex items-center gap-1 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
  >
    {cambiandoEstado[orden.id] ? (
      <FaSync className="animate-spin" />
    ) : (
      <FaClock />
    )}
    Volver a Pendiente
  </button>
)}
```

---

## Flujo de Datos

### Ejemplo Completo: Crear un Paciente

**1. Usuario completa formulario**

```
Usuario ingresa:
- Nombre: Juan Pérez
- Tipo ID: CC
- Número: 1234567890
- Fecha ingreso: 2025-10-17
```

**2. Frontend envía petición**

```javascript
// frontend/src/components/forms/AddPatientForm.jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  
  const data = {
    nombre_completo: "Juan Pérez",
    tipo_identificacion: "CC",
    numero_identificacion: "1234567890",
    fecha_ingreso: "2025-10-17",
    ultima_atencion: null,
    observaciones: ""
  };
  
  // Petición POST con Axios
  const response = await api.post('/api/pacientes/', data);
  console.log(response); // Paciente creado
};
```

**3. Backend recibe petición**

```
POST http://localhost:8000/api/pacientes/
Content-Type: application/json

{
  "nombre_completo": "Juan Pérez",
  "tipo_identificacion": "CC",
  "numero_identificacion": "1234567890",
  "fecha_ingreso": "2025-10-17",
  "ultima_atencion": null,
  "observaciones": ""
}
```

**4. Django procesa en PacienteViewSet**

```python
# backend/pacientes/views.py
class PacienteViewSet(viewsets.ModelViewSet):
    def create(self, request):
        # 1. Recibe datos del request
        serializer = PacienteSerializer(data=request.data)
        
        # 2. Valida datos
        if serializer.is_valid():
            # 3. Guarda en base de datos
            serializer.save()
            # 4. Retorna respuesta
            return Response(serializer.data, status=201)
        else:
            return Response(serializer.errors, status=400)
```

**5. Base de datos ejecuta INSERT**

```sql
INSERT INTO pacientes (
  nombre_completo,
  tipo_identificacion,
  numero_identificacion,
  fecha_ingreso,
  ultima_atencion,
  observaciones,
  creado_en,
  actualizado_en
) VALUES (
  'Juan Pérez',
  'CC',
  '1234567890',
  '2025-10-17',
  NULL,
  '',
  NOW(),
  NOW()
);
```

**6. Backend retorna respuesta**

```json
{
  "id": 5,
  "nombre_completo": "Juan Pérez",
  "tipo_identificacion": "CC",
  "numero_identificacion": "1234567890",
  "fecha_ingreso": "2025-10-17",
  "ultima_atencion": null,
  "observaciones": "",
  "creado_en": "2025-10-17T10:30:00.123456Z",
  "actualizado_en": "2025-10-17T10:30:00.123456Z"
}
```

**7. Frontend actualiza interfaz**

```javascript
// Agregar nuevo paciente a la lista existente
setPatients(prev => [newPatient, ...prev]);

// Cerrar formulario
setShowForm(false);

// Mostrar mensaje de éxito (opcional)
alert('Paciente creado exitosamente');
```

---

## Ejemplos de Uso

### Ejemplo 1: Buscar Medicamentos

**Frontend:**

```javascript
const handleSearch = (e) => {
  const value = e.target.value;
  setSearchTerm(value);
  cargarMedicamentos(value);
};

const cargarMedicamentos = async (buscar = "") => {
  const params = buscar ? { buscar } : {};
  const response = await api.get('/api/medicamentos/', { params });
  setMedicamentos(response);
};
```

**Petición HTTP:**

```
GET http://localhost:8000/api/medicamentos/?buscar=paracetamol
```

**Backend ejecuta:**

```python
def get_queryset(self):
    queryset = super().get_queryset()
    buscar = self.request.query_params.get('buscar', None)
    
    if buscar:
        queryset = queryset.filter(
            Q(nombre_producto__icontains=buscar) |
            Q(id_medicamento__icontains=buscar) |
            Q(laboratorio__icontains=buscar)
        )
    return queryset
```

**SQL generado:**

```sql
SELECT * FROM medicamentos
WHERE nombre_producto LIKE '%paracetamol%'
   OR id_medicamento LIKE '%paracetamol%'
   OR laboratorio LIKE '%paracetamol%'
ORDER BY nombre_producto;
```

### Ejemplo 2: Cargar Medicamentos desde Excel

**1. Usuario selecciona archivo Excel:**

```
plantilla_medicamentos.xlsx
- MED001 | Paracetamol 500mg | ...
- MED002 | Ibuprofeno 400mg | ...
- MED003 | Amoxicilina 500mg | ...
```

**2. Frontend envía archivo:**

```javascript
const handleUpload = async (file) => {
  const formData = new FormData();
  formData.append('archivo', file);
  
  const response = await api.post('/api/medicamentos/cargar_excel/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  
  console.log(response.mensaje);
  // "Se crearon 3 medicamentos"
};
```

**3. Backend procesa con Pandas:**

```python
@action(detail=False, methods=['post'])
def cargar_excel(self, request):
    archivo = request.FILES.get('archivo')
    
    # Leer Excel
    df = pd.read_excel(archivo)
    
    # Procesar cada fila
    for index, fila in df.iterrows():
        datos = {
            'nombre_producto': str(fila['Nombre del producto']),
            'stock_actual': int(fila['Stock actual']),
            # ... más campos
        }
        
        # Crear o actualizar
        Medicamento.objects.update_or_create(
            id_medicamento=fila['ID'],
            defaults=datos
        )
    
    return Response({'mensaje': 'Carga exitosa'})
```

**4. Resultado:**

```json
{
  "mensaje": "Se crearon 3 medicamentos",
  "detalle": {
    "creados": 3,
    "actualizados": 0,
    "total_procesados": 3
  },
  "errores": [],
  "total_filas": 3
}
```

### Ejemplo 3: Cambiar Estado de Orden

**1. Usuario hace clic en botón "Marcar Entregado"**

**2. Frontend llama al endpoint:**

```javascript
const cambiarEstado = async (ordenId) => {
  const response = await api.patch(
    `/api/ordenes/${ordenId}/cambiar_estado/`,
    { estado: 'entregado' }
  );
  
  console.log(response.mensaje);
  // "Estado cambiado a Entregado"
};
```

**3. Backend actualiza:**

```python
@action(detail=True, methods=['patch'])
def cambiar_estado(self, request, pk=None):
    orden = self.get_object()
    nuevo_estado = request.data.get('estado')
    
    # Validar estado
    estados_validos = ['pendiente', 'entregado']
    if nuevo_estado not in estados_validos:
        return Response({'error': 'Estado no válido'}, status=400)
    
    # Actualizar
    orden.estado = nuevo_estado
    orden.save()
    
    serializer = self.get_serializer(orden)
    return Response({
        'mensaje': f'Estado cambiado a {orden.get_estado_display()}',
        'orden': serializer.data
    })
```

**4. SQL ejecutado:**

```sql
UPDATE ordenes
SET estado = 'entregado',
    actualizado_en = NOW()
WHERE id = 1;
```

---

## Testing y Depuración

### Testing con Postman

**Colección de pruebas recomendada:**

**1. Autenticación**

```
POST http://localhost:8000/api/auth/login/
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}

Respuesta esperada: 200 OK
{
  "success": true,
  "user": { ... }
}
```

**2. Listar Pacientes**

```
GET http://localhost:8000/api/pacientes/

Respuesta esperada: 200 OK
[
  {
    "id": 1,
    "nombre_completo": "Juan Pérez",
    ...
  }
]
```

**3. Crear Paciente**

```
POST http://localhost:8000/api/pacientes/
Content-Type: application/json

{
  "nombre_completo": "María González",
  "tipo_identificacion": "CC",
  "numero_identificacion": "9876543210",
  "fecha_ingreso": "2025-10-17"
}

Respuesta esperada: 201 Created
```

**4. Buscar Medicamentos**

```
GET http://localhost:8000/api/medicamentos/?buscar=paracetamol

Respuesta esperada: 200 OK
[filtrado de medicamentos]
```

**5. Cambiar Estado de Orden**

```
PATCH http://localhost:8000/api/ordenes/1/cambiar_estado/
Content-Type: application/json

{
  "estado": "entregado"
}

Respuesta esperada: 200 OK
{
  "mensaje": "Estado cambiado a Entregado",
  "orden": { ... }
}
```

### Depuración en Backend

**Habilitar logs detallados:**

```python
# backend/settings.py
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'DEBUG',
    },
}
```

**Ver queries SQL ejecutadas:**

```python
# En cualquier vista o método
from django.db import connection

def mi_vista(request):
    # ... código que hace consultas
    
    # Ver todas las queries
    for query in connection.queries:
        print(query['sql'])
        print(query['time'])
```

**Usar Django Shell:**

```bash
python manage.py shell
```

```python
# Probar modelos y queries
from pacientes.models import Paciente
from medicamentos.models import Medicamento

# Crear paciente
paciente = Paciente.objects.create(
    nombre_completo="Test",
    tipo_identificacion="CC",
    numero_identificacion="123456"
)

# Ver todos los pacientes
Paciente.objects.all()

# Filtrar medicamentos
Medicamento.objects.filter(categoria='analgesico')

# Ver SQL de una query
print(Medicamento.objects.filter(categoria='analgesico').query)
```

### Depuración en Frontend

**Consola del navegador:**

```javascript
// Ver datos de usuario
console.log(localStorage.getItem('user'));

// Ver respuesta de API
api.get('/api/pacientes/')
  .then(response => console.log(response))
  .catch(error => console.error(error));

// Ver estado de React
console.log('Pacientes:', patients);
console.log('Loading:', loading);
```

**React DevTools:**

```
1. Instalar extensión React Developer Tools en Chrome/Firefox
2. Abrir DevTools (F12)
3. Ir a pestaña "Components"
4. Seleccionar componente
5. Ver props, state, hooks en tiempo real
```

**Network Tab:**

```
1. Abrir DevTools (F12)
2. Ir a pestaña "Network"
3. Filtrar por "XHR" o "Fetch"
4. Ver todas las peticiones HTTP
5. Inspeccionar headers, payload, response
```

---

## Troubleshooting

### Problemas Comunes y Soluciones

#### 1. Error: "No module named 'MySQLdb'"

**Causa:** No está instalado el conector de MySQL

**Solución:**

```bash
pip install mysqlclient

# Si falla en Windows, descargar wheel desde:
# https://www.lfd.uci.edu/~gohlke/pythonlibs/#mysqlclient
pip install mysqlclient‑2.x.x‑cpXX‑cpXX‑win_amd64.whl
```

#### 2. Error: "Access denied for user 'root'@'localhost'"

**Causa:** Credenciales incorrectas en settings.py

**Solución:**

```python
# backend/settings.py
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'farmacia_db',
        'USER': 'root',           # Verificar usuario
        'PASSWORD': 'tu_password', # Agregar contraseña correcta
        'HOST': 'localhost',
        'PORT': '3306',
    }
}
```

#### 3. Error: "Table doesn't exist"

**Causa:** No se han aplicado las migraciones

**Solución:**

```bash
cd backend
python manage.py migrate

# Ver estado de migraciones
python manage.py showmigrations

# Si hay problemas, resetear migraciones
python manage.py migrate --run-syncdb
```

#### 4. Error CORS en Frontend

**Causa:** Backend no permite peticiones desde localhost:3000

**Solución:**

```python
# backend/settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
]

CORS_ALLOW_CREDENTIALS = True

# Verificar que 'corsheaders' esté en INSTALLED_APPS
INSTALLED_APPS = [
    ...
    'corsheaders',
    ...
]

# Verificar que el middleware esté primero
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Debe estar primero
    'django.middleware.common.CommonMiddleware',
    ...
]
```

#### 5. Error: "Port 8000 is already in use"

**Causa:** El puerto ya está siendo usado

**Solución:**

```bash
# Usar otro puerto
python manage.py runserver 8001

# O matar el proceso (Windows)
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# O matar el proceso (Linux/Mac)
lsof -ti:8000 | xargs kill -9
```

#### 6. Error: "Port 3000 is already in use"

**Causa:** React ya está corriendo en otro terminal

**Solución:**

```bash
# Usar otro puerto
PORT=3001 npm start

# O matar el proceso (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# O matar el proceso (Linux/Mac)
lsof -ti:3000 | xargs kill -9
```

#### 7. Error: npm install falla

**Causa:** Caché corrupta o versiones incompatibles

**Solución:**

```bash
# Limpiar caché
npm cache clean --force

# Eliminar node_modules y package-lock.json
rm -rf node_modules package-lock.json

# Reinstalar
npm install

# Si persiste, usar npm ci
npm ci
```

#### 8. Error: "Django admin CSS not loading"

**Causa:** No se han recopilado archivos estáticos

**Solución:**

```bash
cd backend
python manage.py collectstatic --noinput
```

#### 9. Error: Fechas con formato incorrecto

**Causa:** Diferencias en formato de fecha entre frontend y backend

**Solución:**

```javascript
// Frontend: asegurar formato ISO
const fecha = new Date('2025-10-17').toISOString().split('T')[0];
// Resultado: "2025-10-17"
```

```python
# Backend: usar DateField
from django.db import models

class Paciente(models.Model):
    fecha_ingreso = models.DateField()  # Acepta YYYY-MM-DD
```

#### 10. Error: "Duplicate entry" al crear paciente

**Causa:** Ya existe un paciente con ese tipo y número de identificación

**Solución:**

El modelo tiene `unique_together`:

```python
class Meta:
    unique_together = ['tipo_identificacion', 'numero_identificacion']
```

Validar en frontend antes de enviar:

```javascript
const validarPaciente = async (tipo, numero) => {
  const pacientes = await api.get('/api/pacientes/');
  const existe = pacientes.some(p => 
    p.tipo_identificacion === tipo && 
    p.numero_identificacion === numero
  );
  
  if (existe) {
    alert('Ya existe un paciente con esta identificación');
    return false;
  }
  return true;
};
```

---

## Mejoras Futuras

### Backend

**1. Implementar JWT Authentication**

```bash
pip install djangorestframework-simplejwt
```

```python
# settings.py
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
}

# urls.py
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('api/token/', TokenObtainPairView.as_view()),
    path('api/token/refresh/', TokenRefreshView.as_view()),
]
```

**2. Agregar Paginación**

```python
# settings.py
REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20
}
```

**3. Implementar Sistema de Roles**

```python
from django.contrib.auth.models import User, Group

# Crear grupos
admin_group = Group.objects.create(name='Administradores')
farmaceutico_group = Group.objects.create(name='Farmacéuticos')

# Asignar permisos
from django.contrib.auth.models import Permission

view_paciente = Permission.objects.get(codename='view_paciente')
farmaceutico_group.permissions.add(view_paciente)
```

**4. Agregar Auditoría**

```python
# Crear modelo de auditoría
class AuditLog(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    accion = models.CharField(max_length=50)  # CREATE, UPDATE, DELETE
    modelo = models.CharField(max_length=50)
    objeto_id = models.IntegerField()
    cambios = models.JSONField()
    timestamp = models.DateTimeField(auto_now_add=True)
```

**5. Relación Orden-Medicamento**

```python
class DetalleOrden(models.Model):
    orden = models.ForeignKey(Orden, on_delete=models.CASCADE)
    medicamento = models.ForeignKey(Medicamento, on_delete=models.PROTECT)
    cantidad = models.IntegerField()
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)
    
    def save(self, *args, **kwargs):
        # Reducir stock automáticamente
        if self.pk is None:  # Es nuevo
            self.medicamento.stock_actual -= self.cantidad
            self.medicamento.save()
        super().save(*args, **kwargs)
```

### Frontend

**1. Implementar Protección de Rutas**

```javascript
// components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated');
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// App.js
<Route 
  path="/dashboard" 
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  } 
/>
```

**2. Agregar Notificaciones Toast**

```bash
npm install react-hot-toast
```

```javascript
import toast, { Toaster } from 'react-hot-toast';

// En el componente
const handleSubmit = async () => {
  try {
    await api.post('/api/pacientes/', data);
    toast.success('Paciente creado exitosamente');
  } catch (error) {
    toast.error('Error al crear paciente');
  }
};

// En App.js
<Toaster position="top-right" />
```

**3. Implementar Modo Oscuro**

```javascript
// hooks/useDarkMode.js
import { useState, useEffect } from 'react';

export const useDarkMode = () => {
  const [darkMode, setDarkMode] = useState(false);
  
  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDark);
    
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);
  
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    localStorage.setItem('darkMode', !darkMode);
    document.documentElement.classList.toggle('dark');
  };
  
  return [darkMode, toggleDarkMode];
};
```

**4. Agregar Validación de Formularios**

```bash
npm install react-hook-form yup
```

```javascript
import { useForm } from 'react-hook-form';
import * as yup from 'yup';

const schema = yup.object({
  nombre_completo: yup.string().required('Nombre es requerido'),
  numero_identificacion: yup.string()
    .matches(/^[0-9]+$/, 'Solo números')
    .required('Identificación es requerida'),
});

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: yupResolver(schema)
});
```

**5. Implementar Paginación en Tablas**

```javascript
const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 10;

const indexOfLastItem = currentPage * itemsPerPage;
const indexOfFirstItem = indexOfLastItem - itemsPerPage;
const currentItems = items.slice(indexOfFirstItem, indexOfLastItem);

const totalPages = Math.ceil(items.length / itemsPerPage);
```

---

## Comandos Útiles

### Backend (Django)

```bash
# Gestión del proyecto
python manage.py runserver              # Iniciar servidor
python manage.py runserver 8001         # Iniciar en puerto diferente
python manage.py check                  # Verificar problemas

# Base de datos
python manage.py makemigrations         # Crear migraciones
python manage.py migrate                # Aplicar migraciones
python manage.py showmigrations         # Ver estado de migraciones
python manage.py sqlmigrate app 0001    # Ver SQL de migración

# Usuarios
python manage.py createsuperuser        # Crear admin
python manage.py changepassword user    # Cambiar contraseña

# Shell y testing
python manage.py shell                  # Shell interactivo
python manage.py test                   # Ejecutar tests
python manage.py dbshell                # Acceder a MySQL directamente

# Datos
python manage.py dumpdata > backup.json # Exportar datos
python manage.py loaddata backup.json   # Importar datos
python manage.py flush                  # Limpiar base de datos

# Archivos estáticos
python manage.py collectstatic          # Recopilar archivos estáticos
python manage.py findstatic file.css    # Buscar archivo estático
```

### Frontend (React)

```bash
# Gestión del proyecto
npm start                    # Iniciar en desarrollo
npm run build                # Compilar para producción
npm test                     # Ejecutar tests
npm run eject                # Eyectar configuración (irreversible)

# Dependencias
npm install                  # Instalar dependencias
npm install package-name     # Instalar paquete específico
npm uninstall package-name   # Desinstalar paquete
npm update                   # Actualizar paquetes
npm outdated                 # Ver paquetes desactualizados

# Limpieza
npm cache clean --force      # Limpiar caché
rm -rf node_modules          # Eliminar node_modules
npm ci                       # Instalación limpia

# Análisis
npm run build -- --stats     # Analizar tamaño del build
npm audit                    # Ver vulnerabilidades
npm audit fix                # Corregir vulnerabilidades
```

### Base de Datos (MySQL)

```bash
# Acceder a MySQL
mysql -u root -p

# Comandos dentro de MySQL
SHOW DATABASES;              # Ver bases de datos
USE farmacia_db;             # Seleccionar base de datos
SHOW TABLES;                 # Ver tablas
DESCRIBE pacientes;          # Ver estructura de tabla
SELECT * FROM pacientes;     # Ver datos

# Backup
mysqldump -u root -p farmacia_db > backup.sql

# Restaurar
mysql -u root -p farmacia_db < backup.sql

# Salir
EXIT;
```

### Git (Control de Versiones)

```bash
# Configuración inicial
git init                     # Inicializar repositorio
git remote add origin URL    # Conectar con GitHub

# Trabajo diario
git status                   # Ver estado
git add .                    # Agregar cambios
git commit -m "mensaje"      # Crear commit
git push origin main         # Subir cambios

# Branching
git branch feature-name      # Crear rama
git checkout feature-name    # Cambiar de rama
git merge feature-name       # Fusionar rama

# Historial
git log                      # Ver historial
git diff                     # Ver cambios
```

---

## Licencia

Este es un proyecto académico desarrollado con fines educativos.

---

## Contacto

Para preguntas sobre este proyecto universitario, contactar al equipo de desarrollo.

**Proyecto:** FarmaGestión  
**Versión:** 1.0.0  
**Año:** 2025