from django.urls import path
from . import views

urlpatterns = [
    path('', views.PacienteViewSet.as_view({'get': 'list', 'post': 'create'}), name='paciente-list'),
    path('opciones_identificacion/', views.PacienteViewSet.as_view({'get': 'opciones_identificacion'}), name='paciente-opciones-identificacion'),
    path('<int:pk>/', views.PacienteViewSet.as_view({
        'get': 'retrieve', 
        'put': 'update', 
        'patch': 'partial_update', 
        'delete': 'destroy'
    }), name='paciente-detail'),
]