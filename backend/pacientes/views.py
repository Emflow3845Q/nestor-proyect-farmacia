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
        queryset = super().get_queryset()
        search = self.request.query_params.get('search', None)
        
        if search:
            queryset = queryset.filter(
                Q(nombre_completo__icontains=search) |
                Q(numero_identificacion__icontains=search) |
                Q(tipo_identificacion__icontains=search)
            )
        return queryset

    @action(detail=False, methods=['get'])
    def opciones_identificacion(self, request):
        """Endpoint para obtener las opciones del menú desplegable"""
        opciones = Paciente.TIPO_IDENTIFICACION
        return Response(opciones)