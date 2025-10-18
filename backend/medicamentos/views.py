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

            df = pd.read_excel(archivo)
            
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
            medicamentos_actualizados = 0
            errores = []

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
                    id_medicamento = str(fila['ID']).strip()
                    if not id_medicamento:
                        errores.append(f"Fila {index + 2}: El ID no puede estar vacío")
                        continue

                    categoria_excel = str(fila['Categoría']).strip()
                    categoria_modelo = mapeo_categorias.get(categoria_excel, 'otros')
                    
                    fecha_ingreso = fila.get('Fecha de ingreso')
                    if pd.isna(fecha_ingreso):
                        fecha_ingreso = None

                    fecha_vencimiento = fila['Fecha de vencimiento']
                    if pd.isna(fecha_vencimiento):
                        errores.append(f"Fila {index + 2}: La fecha de vencimiento no puede estar vacía")
                        continue

                    datos_medicamento = {
                        'nombre_producto': str(fila['Nombre del producto']),
                        'presentacion': str(fila['Presentación']),
                        'categoria': categoria_modelo,
                        'laboratorio': str(fila['Laboratorio']),
                        'lote': str(fila['Lote']),
                        'fecha_vencimiento': fecha_vencimiento,
                        'stock_actual': int(fila['Stock actual']),
                        'stock_minimo': int(fila['Stock mínimo']),
                        'precio_unitario': float(fila['Precio unitario']),
                        'ubicacion': str(fila['Ubicación']),
                        'proveedor': str(fila['Proveedor']),
                        'fecha_ingreso': fecha_ingreso,
                        'observaciones': str(fila.get('Observaciones', '')),
                    }

                    # Crear o actualizar medicamento
                    medicamento, creado = Medicamento.objects.update_or_create(
                        id_medicamento=id_medicamento,
                        defaults=datos_medicamento
                    )
                    
                    if creado:
                        medicamentos_creados += 1
                    else:
                        medicamentos_actualizados += 1
                        
                except Exception as e:
                    errores.append(f"Fila {index + 2}: {str(e)}")

            mensaje = []
            if medicamentos_creados > 0:
                mensaje.append(f'Se crearon {medicamentos_creados} medicamentos')
            if medicamentos_actualizados > 0:
                mensaje.append(f'Se actualizaron {medicamentos_actualizados} medicamentos')
            
            return Response({
                'mensaje': '; '.join(mensaje) if mensaje else 'No se realizaron cambios',
                'detalle': {
                    'creados': medicamentos_creados,
                    'actualizados': medicamentos_actualizados,
                    'total_procesados': medicamentos_creados + medicamentos_actualizados
                },
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
                'ID': ['MED001', 'MED002', 'MED003'],
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
            
            response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            response['Content-Disposition'] = 'attachment; filename=plantilla_medicamentos.xlsx'
            
            with pd.ExcelWriter(response, engine='openpyxl') as writer:
                df.to_excel(writer, sheet_name='Medicamentos', index=False)
                
                worksheet = writer.sheets['Medicamentos']
                
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