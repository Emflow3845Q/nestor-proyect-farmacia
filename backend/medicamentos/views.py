import pandas as pd
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from django.http import HttpResponse
from .models import Medicamento
from .serializers import MedicamentoSerializer

class MedicamentoViewSet(viewsets.ModelViewSet):
    queryset = Medicamento.objects.all().order_by('nombre_producto')
    serializer_class = MedicamentoSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        buscar = self.request.query_params.get('buscar', None)
        
        if buscar:
            queryset = queryset.filter(
                Q(nombre_producto__icontains=buscar) |
                Q(id_medicamento__icontains=buscar) |
                Q(laboratorio__icontains=buscar) |
                Q(categoria__icontains=buscar) |
                Q(ubicacion__icontains=buscar)
            )
        return queryset

    @action(detail=False, methods=['post'])
    def cargar_excel(self, request):
        """Endpoint para cargar medicamentos desde archivo Excel"""
        try:
            archivo = request.FILES.get('archivo')
            if not archivo:
                return Response(
                    {'error': 'No se proporcionó ningún archivo'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Leer el archivo Excel
            df = pd.read_excel(archivo)
            
            # Validar columnas requeridas
            columnas_requeridas = [
                'ID', 'Nombre del producto', 'Presentación', 'Categoría', 
                'Laboratorio', 'Lote', 'Fecha de vencimiento', 'Stock actual',
                'Stock mínimo', 'Precio unitario', 'Ubicación', 'Proveedor'
            ]
            
            for columna in columnas_requeridas:
                if columna not in df.columns:
                    return Response(
                        {'error': f'Falta la columna: {columna}'}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )

            medicamentos_creados = 0
            errores = []

            # Mapeo de categorías del Excel al modelo
            mapeo_categorias = {
                'Analgésico': 'analgesico',
                'Antibiótico': 'antibiotico',
                'Antiinflamatorio': 'antiinflamatorio',
                'Antihistamínico': 'antihistaminico',
                'Cardiovascular': 'cardiovascular',
                'Digestivo': 'digestivo',
                'Respiratorio': 'respiratorio',
                'Rehidratante': 'rehidratante',
                'Antiséptico': 'antiseptico',
                'Gastroprotector': 'gastroprotector',
                'Antialérgico': 'antialergico',
                'Otros': 'otros'
            }

            for index, fila in df.iterrows():
                try:
                    # Convertir categoría del Excel al formato del modelo
                    categoria_excel = str(fila['Categoría']).strip()
                    categoria_modelo = mapeo_categorias.get(categoria_excel, 'otros')
                    
                    # Manejar fechas que puedan venir como NaN
                    fecha_ingreso = fila.get('Fecha de ingreso')
                    if pd.isna(fecha_ingreso):
                        fecha_ingreso = None

                    # Crear o actualizar medicamento
                    medicamento, creado = Medicamento.objects.update_or_create(
                        id_medicamento=str(fila['ID']),
                        defaults={
                            'nombre_producto': str(fila['Nombre del producto']),
                            'presentacion': str(fila['Presentación']),
                            'categoria': categoria_modelo,
                            'laboratorio': str(fila['Laboratorio']),
                            'lote': str(fila['Lote']),
                            'fecha_vencimiento': fila['Fecha de vencimiento'],
                            'stock_actual': int(fila['Stock actual']),
                            'stock_minimo': int(fila['Stock mínimo']),
                            'precio_unitario': float(fila['Precio unitario']),
                            'ubicacion': str(fila['Ubicación']),
                            'proveedor': str(fila['Proveedor']),
                            'fecha_ingreso': fecha_ingreso,
                            'observaciones': str(fila.get('Observaciones', '')),
                        }
                    )
                    if creado:
                        medicamentos_creados += 1
                        
                except Exception as e:
                    errores.append(f"Fila {index + 2}: {str(e)}")

            return Response({
                'mensaje': f'Se crearon {medicamentos_creados} medicamentos',
                'errores': errores,
                'total_filas': len(df)
            })

        except Exception as e:
            return Response(
                {'error': f'Error procesando el archivo: {str(e)}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get'])
    def descargar_plantilla(self, request):
        """Endpoint para descargar plantilla Excel con el formato correcto"""
        try:
            # Crear DataFrame con el formato exacto que necesitan
            datos_ejemplo = {
                'ID': ['1', '2', '3'],
                'Nombre del producto': [
                    'Paracetamol 500 mg', 
                    'Amoxicilina 500 mg', 
                    'Ibuprofeno 400 mg'
                ],
                'Presentación': [
                    'Tabletas x 10', 
                    'Cápsulas x 12', 
                    'Tabletas x 10'
                ],
                'Categoría': [
                    'Analgésico', 
                    'Antibiótico', 
                    'Antiinflamatorio'
                ],
                'Laboratorio': ['Genfar', 'Pfizer', 'Tecnoquímicas'],
                'Lote': ['L1234', 'A5678', 'B2345'],
                'Fecha de vencimiento': ['2026-03-15', '2025-12-30', '2026-06-10'],
                'Stock actual': [120, 60, 80],
                'Stock mínimo': [30, 20, 25],
                'Precio unitario': [1200, 3500, 1500],
                'Ubicación': ['Estante A1', 'Estante B3', 'Estante A2'],
                'Proveedor': [
                    'Distribuidora Farma', 
                    'FarmaExpress', 
                    'Droguería Central'
                ],
                'Fecha de ingreso': ['2025-09-01', '2025-08-20', '2025-09-10'],
                'Observaciones': [
                    'Buen estado', 
                    'Controlado', 
                    'Buen estado'
                ]
            }
            
            df = pd.DataFrame(datos_ejemplo)
            
            # Crear respuesta HTTP con el Excel
            response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            response['Content-Disposition'] = 'attachment; filename=plantilla_medicamentos.xlsx'
            
            with pd.ExcelWriter(response, engine='openpyxl') as writer:
                df.to_excel(writer, sheet_name='Medicamentos', index=False)
                
                # Obtener la hoja de trabajo para formatear
                worksheet = writer.sheets['Medicamentos']
                
                # Ajustar el ancho de las columnas
                for column in df:
                    column_width = max(df[column].astype(str).map(len).max(), len(column))
                    col_idx = df.columns.get_loc(column)
                    worksheet.column_dimensions[chr(65 + col_idx)].width = column_width + 2
                
            return response

        except Exception as e:
            return Response(
                {'error': f'Error generando plantilla: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def opciones_categoria(self, request):
        """Endpoint para obtener las opciones de categoría"""
        opciones = Medicamento.CATEGORIAS
        return Response(opciones)