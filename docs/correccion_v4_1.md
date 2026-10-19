# ESTIMA V4.1 — corrección de selección de modelado 3D

## Problema encontrado
`toggleSelected()` desmarcaba sin autorización isométricos manuales `PIP-005` al activar extracciones 3D `PIP-006` y MTO manual `PIP-012` al activar su alternativa 3D `PIP-011`. Esto podía reducir el total H/H y presupuesto al supuestamente **agregar** trabajo.

## Solución
- Ninguna selección desmarca otras filas de forma implícita.
- El botón de incorporación masiva de modelado 3D respeta los trabajos manuales; cuando ya hay un método manual activo, omite la alternativa automática de emisión del mismo documento.
- Se avisa de dobles conteos cuando se seleccionan ambas alternativas para un mismo alcance.
- Los cambios en presupuestos anteriores pueden incluir actividades seleccionadas que estaban ocultas o eliminadas por la regla anterior; verificar la matriz antes de emitir propuestas.

## Prueba
`node tests/verificar_calculos.js`

## Concepto
El costo de **añadir alcance 3D** debe ser no decreciente si métricas, tarifas y demás entregables se mantienen. **Cambiar método de ejecución** de manual a 3D sí puede reducir o aumentar las horas, pero requiere desmarcar manualmente los entregables sustituidos y comprobar las cantidades, para que el cambio sea consciente.
