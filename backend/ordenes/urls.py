from django.urls import path
from . import views

urlpatterns = [
    path('', views.OrdenViewSet.as_view({'get': 'list', 'post': 'create'}), name='orden-list'),
    path('opciones_estado/', views.OrdenViewSet.as_view({'get': 'opciones_estado'}), name='orden-opciones-estado'),
    path('<int:pk>/', views.OrdenViewSet.as_view({
        'get': 'retrieve', 
        'put': 'update', 
        'patch': 'partial_update', 
        'delete': 'destroy'
    }), name='orden-detail'),
    path('<int:pk>/cambiar_estado/', views.OrdenViewSet.as_view({'patch': 'cambiar_estado'}), name='orden-cambiar-estado'),
]