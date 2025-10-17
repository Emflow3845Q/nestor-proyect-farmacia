from rest_framework import serializers
from .models import Medicamento

class MedicamentoSerializer(serializers.ModelSerializer):
    categoria_display = serializers.CharField(source='get_categoria_display', read_only=True)
    estado_stock_display = serializers.CharField(source='estado_stock', read_only=True)
    
    class Meta:
        model = Medicamento
        fields = [
            'id',
            'id_medicamento',
            'nombre_producto',
            'presentacion',
            'categoria',
            'categoria_display',
            'laboratorio',
            'lote',
            'fecha_vencimiento',
            'stock_actual',
            'stock_minimo',
            'precio_unitario',
            'ubicacion',
            'proveedor',
            'fecha_ingreso',
            'observaciones',
            'uso_frecuente',
            'estado_stock',
            'estado_stock_display',
            'creado_en',
            'actualizado_en'
        ]

    def validate_stock_actual(self, value):
        if value < 0:
            raise serializers.ValidationError("El stock actual no puede ser negativo")
        return value

    def validate_stock_minimo(self, value):
        if value < 0:
            raise serializers.ValidationError("El stock mínimo no puede ser negativo")
        return value