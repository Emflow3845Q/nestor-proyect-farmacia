from django.db import models
from django.utils import timezone

class Paciente(models.Model):
    TIPO_IDENTIFICACION = [
        ('CC', 'Cédula de Ciudadanía'),
        ('TI', 'Tarjeta de Identidad'),
        ('PA', 'Pasaporte'),
    ]
    
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