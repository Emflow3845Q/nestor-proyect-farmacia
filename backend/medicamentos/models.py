from django.db import models
from django.utils import timezone

class Medicamento(models.Model):
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
        if self.stock_actual <= 0:
            return 'agotado'
        elif self.stock_actual <= self.stock_minimo:
            return 'bajo'
        else:
            return 'normal'