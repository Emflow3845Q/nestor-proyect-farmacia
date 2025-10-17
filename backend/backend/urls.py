from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('usuarios.urls')),
    path('api/pacientes/', include('pacientes.urls')),  
    path('api/ordenes/', include('ordenes.urls')),
    path('api/medicamentos/', include('medicamentos.urls')),
]