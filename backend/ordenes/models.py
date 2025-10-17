from django.db import models
from django.utils import timezone
from pacientes.models import Paciente

class Orden(models.Model):
    ESTADOS = [
        ('pendiente', 'Pendiente'),
        ('entregado', 'Entregado'),
    ]
    
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