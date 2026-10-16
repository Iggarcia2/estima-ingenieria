# ESTIMA V4 — Registro de cambios y alcance de las fuentes

## Versión y compatibilidad

Esta versión mantiene el proyecto estático y modular; no requiere build de npm ni backend. Está preparada para GitHub Pages bajo la raíz de `iggarcia2/estima-ingenieria`.

- La V3 tenía 72 registros. La V4 tiene **101**, de los cuales **29** son nuevas hipótesis categoría C, desactivadas por defecto.
- Se mantienen 3 checkbox independientes de etapa: Conceptual, Básica y Detalle; dos selectores de situación previa aplican una preselección automática. Los checkbox siempre pueden modificarse manualmente.
- Básica Extendida es una variante del alcance Básica, visible al seleccionarla. No implica la selección automática de nuevos entregables.
- El 3D tiene modos Ninguno, Parcial e Integral y nivel LOD configurable; las tareas se activan solo desde la matriz o con el botón de sugerencia.

## Cambios en base de estimación

- `contenido_referencia`: descripción de trabajo de la actividad.
- `referencia_alcance`: fuente CEPSI y capítulo/apartado, cuando aplica.
- `grupo_documental`: agrupa el mismo documento a través de fases y revisiones. Ej.: `PRO-PID` para P&ID de básica, básica extendida y detalle. Ayuda al usuario a revisar alcances duplicados.
- `ratio_validado_por_cai: false`: el CAI no proporciona los valores horarios utilizados en nuestra tabla.
- `actividad_modelado_3d`: etiqueta para filtrar y excluir trabajo 3D cuando no está contratado.
- `ciclo_documental`: permite reconocer actividades de nueva producción o actualización incremental.

## Revisiones

Las H/H de biblioteca se consideran inclusivas de una revisión interna normal. Por defecto hay 0 rondas extra de comentarios de cliente, por lo que la estimación no cambia al actualizar desde V3 en iguales condiciones.

Para las actividades técnicas por cantidad se usa:

`HH_base = cantidad × H/H_unitarias × factor_complejidad × factor_repeticion`

`HH_extra = HH_base × rondas_extra × factor_ronda`

La ronda extra se reparte como hipótesis: 50% Ingeniero y 50% Revisor; las H/H originales siguen distribuidas de acuerdo al registro. El porcentaje puede editarse desde el panel Tarifa/Modelo 3D. No utilizar esta opción junto a `GES-004` para el mismo trabajo.

## Bibliografía documental aportada por usuario

1. CAI/CEPSI **Alcances de Ingeniería**, SC01-01-0: 4.2 (etapas); 5.2-5.5 (alcances); 6.1-6.6 (matriz y contenidos de entregables).
2. CAI/CEPSI **Gestión Básica de Ingeniería en Proyectos**, v.03 2021: PEI, documentos, aprobaciones, cambios y control de avance.
3. CAI/CEPSI **Alcances de Ingeniería — Modelo 3D**: capítulos 4-9 (LOD, 30/60/90, revisión y detección de interferencias).

**Advertencia**: ninguno de los tres constituye una fuente de ratios de H/H unitarias para las 29 actividades agregadas. Los datos dimensionales tampoco constituyen una base empírica validada para predecir la cantidad de documentos; revisar y calibrar con proyectos reales antes de ofertar.

## Procedimiento de publicación

1. Hacer copia de seguridad del contenido de la rama `main` del repositorio.
2. Subir el contenido del ZIP a la **raíz**, manteniendo `css/`, `js/`, `data/` y `docs/`.
3. Confirmar GitHub Pages en `main` y `/ (root)`.
4. Abrir `https://iggarcia2.github.io/estima-ingenieria/`, refrescar con Ctrl+Shift+R y confirmar que el encabezado diga `V4.0`.
5. Revisar una cotización antigua al importarla: la V4 conserva ajustes previos cuando son compatibles; las actividades nuevas arrancan desactivadas.
