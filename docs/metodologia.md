# Metodología V1.0 – Estimación de horas hombre de ingeniería

Fecha de elaboración: 16 de octubre de 2026.

## Objeto y alcance

Estimar exclusivamente esfuerzo de servicios de ingeniería (conceptual, básica y detalle), por disciplina, entregable y perfil. No estima horas de construcción, montaje, instalación ni fabricación. La tarifa promedio por H/H convierte el esfuerzo a importe; no agrega margen comercial.

Disciplinas: PRO Procesos; CIV Civil y arquitectura; EST Estructuras; MEC Mecánica y equipos; PIP Cañerías; ELE Electricidad; INS Instrumentación y control; HSE Seguridad y ambiente; GES Gestión de ingeniería.

## Modelo principal

Para cada actividad i contratada:

- Q_i: cantidad real (modo detallado) o supuesta por una relación cuantitativa trazable (modo rápido).
- h_i: H/H de referencia por unidad para el alcance definido.
- Fc_i: factor de complejidad (1 por defecto).
- Fr_i: factor de repetición/reutilización (1 por defecto).
- HH_i = Q_i × h_i × Fc_i × Fr_i.

HH_directas = suma de HH_i de las actividades técnicas seleccionadas.
HH_indirectas = reuniones, coordinación, gestiones, control documental y revisiones extraordinarias, cargadas explícitamente o por factor sobre base definida, nunca ambas si se superponen.
HH_totales = HH_directas + HH_indirectas.
Presupuesto = HH_totales × tarifa_promedio_por_HH.

**Precaución:** las H/H de revisión técnica interna están repartidas dentro de las horas de cada entregable; el reparto entre roles no agrega trabajo adicional. Revisiones EXTRA y re-trabajos fuera del alcance sí podrán presupuestarse aparte.

## Evidencia y calidad

- B-caso: relación numérica de un caso ilustrativo publicado; no benchmark universal.
- B-practica: ratio procedente de una planilla profesional o guía sectorial, no necesariamente vigente ni validado estadísticamente.
- C: **hipótesis de arranque**, NO ratio bibliográfico ni tasa estándar. Es editable y debe calibrarse antes de ofertar formalmente.

Biblioteca inicial: 72 actividades, con 5 B-caso, 13 B-practica y 54 C. Actualmente no se ha calibrado contra históricos del usuario.

AACE 34R-05 y 36R-08 respaldan metodologías, documentación y comparadores; NO son fuente de todos los números del catálogo.

## Etapas de ingeniería

- Conceptual: alternativas, hipótesis y dimensionamientos tempranos.
- Básica: bases de diseño, cálculos base, configuraciones, primeras versiones de documentos y especificaciones.
- Detalle: terminaciones de cálculos, documentos para construcción y emisión final.

Se puede contratar cada etapa o varias en secuencia. Si se contrata solo detalle sin antecedentes, las horas correspondientes a elaborar ingeniería base desde cero no pueden omitirse: un entregable registrado como revisión incremental no sustituye la elaboración inicial.

## Dos modos de operación

### Rápido

1. Elegir tipología de proyecto y etapas.
2. Activar disciplinas.
3. Indicar magnitudes físicas: m² de galpón; m³ hormigón; tonelaje estructural; número y masa de equipos; líneas e isométricos; potencia en kW; tableros; instrumentos y lazos.
4. Predecir cantidades de paquetes de documentos solo si existe una regla marcada y trazable. Donde no haya relación validada, pedir una cantidad aproximada o marcarla como hipótesis visible.
5. Seleccionar/editar los entregables propuestos y revisar alertas.

### Detallado

1. Registrar lista de entregables concreta por etapa.
2. Introducir cantidades, complejidades, H/H unitarias y método de producción.
3. Repartir H/H por perfiles sin alterar el total.
4. Añadir coordinación y revisiones que no estén incorporadas.
5. Emitir base de estimación, alcances y exclusiones.

## Uso correcto de las magnitudes físicas

La superficie, volumen y tonelaje pueden ser *predictores de cantidad de documentos* y características de complejidad, pero **NO** son por sí mismos ratios universales de diseño. Los 0,8–1,2 H/H/m³ de hormigón, 0,3 H/H/m² y 0,02 H/H/kg, propuestos preliminarmente al inicio del proyecto, NO han sido identificados como normas universalmente validadas para horas de ingeniería. Por tal razón no aparecen en la biblioteca como ratios técnicos comprobados.

Las relaciones Q_documentos = a × carga^b deberían ajustarse por especialidad/actividad usando proyectos históricos; el exponente 0,70 no debe aplicarse globalmente a todas las horas ya calculadas mediante cantidades. Para tareas repetitivas resulta más claro distinguir el costo intelectual de la primera solución del trabajo marginal por repetirla.

Ejemplo exclusivamente conceptual: si resolver la primera fundación tipo requiere 40 H/H y adaptar nueve fundaciones idénticas requiere 8 H/H cada una, diez fundaciones consumen 112 H/H. Diez fundaciones únicas podrían requerir hasta 400 H/H en el mismo supuesto. No son ratios bibliográficos, sino una demostración de la lógica fija + repetitiva.

## Ejemplo numérico trazable para piping

Tomar por hipótesis 4 equipos modelados (6 H/H), 20 líneas listadas (0,5 H/H), 20 líneas modeladas (4 H/H), 20 isométricos extraídos de 3D (1 H/H), 2 clases de especificación (20 H/H) y 5 líneas con análisis de tensiones (10 H/H):

- Modelado equipos: 4 × 6 = 24 H/H.
- Listado: 20 × 0,5 = 10 H/H.
- Modelado líneas: 20 × 4 = 80 H/H.
- Extracción de isométricos: 20 × 1 = 20 H/H.
- Clases: 2 × 20 = 40 H/H.
- Análisis de tensiones: 5 × 10 = 50 H/H.
- Subtotal directo = 224 H/H.
- Supervisión adicional del 10% SOLO SI coincide con la metodología y no se incluyó en las actividades: 22,4 H/H.
- Total 246,4 H/H; a una tarifa ficticia de 35 USD/H/H = 8.624 USD.

Estos parámetros provienen de valores predeterminados de PipingDesigners y **no constituyen una cotización lista para contratar**. Su propio sitio los clasifica como valores heredados de un modelo profesional, no referencias actuales de mercado. La interpretación de 4 H/H como 'por línea' requiere verificación contractual.

## Reglas de no duplicidad

- Isométrico generado desde modelo versus isométrico dibujado manualmente: se usa el proceso real, nunca se suman alternativas.
- MTO manual versus descargado del modelo: usar la ruta efectivamente ejecutada.
- Planos de piping 2D versus elaboración/extracción 3D: identificar tareas distintas y evitar imputar el mismo diseño dos veces.
- P&ID básica y final: si se cotizan ambas, la segunda recoge solo esfuerzo incremental; si se comienza de cero en detalle se valora la creación completa.
- Coordinación según plan de reuniones y porcentaje general: eliminar superposiciones.
- La cantidad de líneas no equivale a la cantidad de P&ID; los kW no equivalen al número de tableros y circuitos; el tonelaje no equivale por sí solo a la cantidad de cálculos estructurales.

## Distribución por perfiles

Perfiles: líder o especialista senior, ingeniero de diseño/cálculo, proyectista, dibujante CAD/BIM, revisor técnico y gestor/coordinador. La división porcentual cargada en el JSON es **propuesta** y debe calibrarse por disciplina. H/H por rol = H/H de la actividad × participación de ese rol. La suma de participaciones debe ser 100%.

## Qué registrar en los proyectos históricos

Proyecto y familia; etapa; descripción y tamaño físico; documentos entregados; unidad/cantidad; estándares requeridos; tecnología de diseño y reutilización; horas estimadas y reales por entregable y perfil; horas indirectas; número de revisiones; causa de desviación. Con esta base se pueden calibrar tanto la predicción de documentos como las H/H/documento y los factores de complejidad.

## Bibliografía y fuentes

1. AACE RP 34R-05, Basis of Estimate (2021): https://www-embed.pathlms.com/aace/courses/2928/documents/3819
2. AACE RP 36R-08, Development of Cost Estimate Plans (2019): https://www-embed.pathlms.com/aace/courses/2928/documents/3821
3. AACE RP 18R-97, Cost Estimate Classification System: https://www-embed.pathlms.com/aace/courses/2928/documents/3803
4. G. D. Oberlender, Project Management for Engineering and Construction, 2.ª ed., McGraw-Hill (2000), Tabla 7-1: https://books.google.com/books/about/Project_Management_for_Engineers_and_Con.html?id=yZNRAAAAMAAJ
5. PipingDesigners.com, Piping Man-Hour Estimator: https://pipingdesigners.com/tools-training/piping-man-hour-estimator/
6. The Piping Engineering World, Piping Design Manhours Estimation: https://www.pipingengineer.org/piping-design-manhours-estimation/
7. Hamdi A. Bashir y Vince Thomson, Models for estimating design effort and time, Design Studies (2001): https://www.sciencedirect.com/science/article/pii/S0142694X00000144
8. H+M Industrial EPC, EPC Engineering Deliverables: https://www.hm-ec.com/our-epc-approach/construction-engineering-deliverables-hm

## Estado de la V1.0

**Prototipo de biblioteca, no herramienta certificada:** no hay validación propia, ni coeficientes universales para todas las tareas, ni factores de incertidumbre demostrados. Es apta para configurar, revisar y probar la futura calculadora, pero requiere juicio profesional y contraste con proyectos reales antes de emitir presupuestos comerciales.
