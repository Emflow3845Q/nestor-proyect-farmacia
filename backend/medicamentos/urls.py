from django.urls import path
from . import views

urlpatterns = [
    path('', views.MedicamentoViewSet.as_view({'get': 'list', 'post': 'create'}), name='medicamento-list'),
    path('opciones_categoria/', views.MedicamentoViewSet.as_view({'get': 'opciones_categoria'}), name='medicamento-opciones-categoria'),
    path('cargar_excel/', views.MedicamentoViewSet.as_view({'post': 'cargar_excel'}), name='medicamento-cargar-excel'),
    path('descargar_plantilla/', views.MedicamentoViewSet.as_view({'get': 'descargar_plantilla'}), name='medicamento-descargar-plantilla'),
    path('<int:pk>/', views.MedicamentoViewSet.as_view({
        'get': 'retrieve', 
        'put': 'update', 
        'patch': 'partial_update', 
        'delete': 'destroy'
    }), name='medicamento-detail'),
]