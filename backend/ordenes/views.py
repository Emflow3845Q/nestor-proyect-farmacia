from rest_framework import viewsets, status
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

    @action(detail=True, methods=['patch', 'post'])
    def cambiar_estado(self, request, pk=None):
        """
        Endpoint para cambiar el estado de una orden
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