from rest_framework import serializers
from .models import Orden

class OrdenSerializer(serializers.ModelSerializer):
    paciente_nombre = serializers.CharField(source='paciente.nombre_completo', read_only=True)
    paciente_identificacion = serializers.CharField(source='paciente.numero_identificacion', read_only=True)
    tipo_identificacion_display = serializers.CharField(source='paciente.get_tipo_identificacion_display', read_only=True)
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    
    class Meta:
        model = Orden
        fields = [
            'id',
            'paciente',
            'paciente_nombre',
            'paciente_identificacion',
            'tipo_identificacion_display',
            'identificacion',
            'fecha',
            'estado',
            'estado_display',
            'descripcion',
            'creado_en',
            'actualizado_en'
        ]
        read_only_fields = ['creado_en', 'actualizado_en']

    def validate_identificacion(self, value):
        if Orden.objects.filter(identificacion=value).exists():
            raise serializers.ValidationError("Ya existe una orden con esta identificación")
        return value