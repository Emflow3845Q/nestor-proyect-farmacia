from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import Orden
from .serializers import OrdenSerializer

class OrdenViewSet(viewsets.ModelViewSet):
    queryset = Orden.objects.all().select_related('paciente').order_by('-creado_en')
    serializer_class = OrdenSerializer

    def get_queryset(self):
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
        opciones = Orden.ESTADOS
        return Response(opciones)