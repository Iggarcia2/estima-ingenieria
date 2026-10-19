# ESTIMA V4.4 – guía de campos y modelo 3D presupuestado

**Novedades**

- Nueva pestaña **Guía de campos**: explica proyecto, etapas, 13 métricas físicas, H/H, Fc/Fr, calibración y LOD.
- **Modelo 3D**: selecciona alcance (ninguno, parcial por disciplina, o integral), nivel LOD y especialidades.
- Vista previa de **H/H y presupuesto actual vs. propuesto**. Los selectores NO cambian la cotización hasta hacer clic en **Aplicar cambios 3D al presupuesto**.
- Los trabajos 2D/manuales no se eliminan automáticamente. Las extracciones de isométricos y MTO CAD siguen siendo alternativas que se eligen manualmente en la matriz.
- LOD aplica un multiplicador de H/H solo a la geometría 3D. Factores **hipotéticos y editables** en Calibración: LOD 200=0,70; 300=1,00; 350=1,20; 400=1,45; sin definir=1,00. **NO son tablas oficiales CAI/BIM**.
- Configuración de LOD guardable con `data/calibracion.json`, y proyectos existentes compatibles.
- Todo se puede alojar en GitHub Pages.

**Precaución:** el modelo 3D está clasificado actualmente en etapa de detalle. Si cotizás solo conceptual o básica, tendrás que habilitar Detalle para computar las actividades 3D de esta versión. Revisá superposiciones con planos manuales en Control de Alcance.

# ESTIMA V4.3 — Calculadora paramétrica de ingeniería

Calculadora de esfuerzo de ingeniería multidisciplinaria por actividad, etapa, disciplina y perfil. Sitio **estático**, compatible con **GitHub Pages** y sin servidor de backend.

## Estructura

```text
estima-ingenieria-github/
├── index.html                  # Página principal
├── css/
│   ├── base.css                # Estilos base y de impresión
│   └── hydra.css               # Identidad visual Hydra y diseño responsive
├── js/
│   ├── config.js               # Disciplinas, etapas, escenarios, estado y perfiles
│   ├── estimacion.js           # Cantidades, H/H, factores, alertas y totales
│   ├── interfaz.js             # Dashboard, formularios y matriz de entregables
│   ├── exportacion.js          # CSV, JSON, impresión/PDF
│   └── app.js                  # Eventos, interacción y arranque
├── data/
│   └── biblioteca_ratios.json  # 101 registros: 72 previos + 29 nuevos, contenido y fuentes de alcance
└── docs/
    └── metodologia.md         # Notas y supuestos de cálculo
```

## Publicar gratis en GitHub Pages

1. Crear un repositorio público nuevo en GitHub (en tu caso, `iggarcia2/estima-ingenieria`).
2. Subir **el contenido** de esta carpeta a la **raíz** del repositorio: `index.html`, las carpetas `css`, `js`, `data`, `docs`, y los otros archivos de raíz. No subir una carpeta contenedora extra.
3. Entrar a **Settings → Pages → Build and deployment** y elegir **Deploy from a branch**.
4. Elegir la rama `main` y carpeta `/ (root)`, y guardar.
5. Cuando Pages termine de publicar, la URL tendrá el formato `https://iggarcia2.github.io/estima-ingenieria/`.

Para un repositorio de usuario llamado `TU-USUARIO.github.io`, la URL será `https://TU-USUARIO.github.io/`.

## Probarlo en tu computadora

**No** abrir `index.html` por doble clic: la biblioteca JSON se carga con `fetch()` y normalmente el navegador no permite este acceso usando `file://`.

En la carpeta del proyecto, ejecutar:

```bash
python -m http.server 8000
```

Luego abrir <http://localhost:8000/>. Con VS Code también sirve **Live Server**.

## Cómo funcionan las etapas

- **Situación previa** + **Objetivo** marcan automáticamente las casillas de Conceptual, Básica y Detalle.
- Las **tres casillas siguen siendo independientes**: podés quitar o agregar cualquiera.
- Si modificás una casilla manualmente, queda en selección personalizada hasta volver a elegir una situación/objetivo.
- La aplicación advierte sobre posibles dependencias (por ejemplo, detalle sin básica disponible), pero no añade tareas sin tu permiso.
- Se pueden guardar y recuperar proyectos en JSON; los ajustes se conservan también en el navegador si hay almacenamiento disponible.

## Qué cambió en V4

- **101 actividades** (72 originales + 29 nuevas). Las nuevas son hipótesis horarias de categoría **C**, no ratios publicados por CAI.
- **CATÁLOGO CAI/CEPSI:** fichas desplegables describen alcance, documentos relacionados, inclusión/exclusión y apartado de bibliografía. La fuente documental justifica qué se entrega, no cuánto demora.
- **Tres etapas independientes** (Conceptual, Básica, Detalle); se mantienen las situaciones previas que marcan automáticamente los tres checkboxes. Al activar **Básica**, se puede elegir convencional o extendida; la extendida agrega documentos específicos opcionales.
- **Revisiones adicionales**: cantidad de rondas y factor por ronda; por defecto 0 rondas y 0,12 por ronda (editable). Las H/H base ya incluyen revisión interna normal; la ronda extra se indica separadamente.
- **Modelo 3D**: sin modelo, parcial e integral; LOD a definir/200/300/350/400, entregables seleccionables por especialidad y coordinación 30/60/90, interferencias. No se suman nuevas actividades 3D por el solo hecho de elegir el tipo de modelo: en la pestaña Modelo 3D hay que confirmar Aplicar cambios, o seleccionar trabajos manualmente en la matriz. **Desde V4.4, elegir un LOD y presionar Aplicar afecta las H/H de modelado geométrico a través de un factor provisional configurable.**
- **CSV y PDF mejorados** con contenido por entregable, fuente de alcance, desglose de revisiones y exclusiones, además de horas por perfil.
- Proyectos V3 guardados localmente pueden recuperarse como punto de partida (salvo incompatibilidades de versiones); también se pueden abrir sus JSON.

**Fuentes documentales aportadas**: CAI/CEPSI `SC01-01-0-Alcances_de_Ingenieria.pdf`, `GESTION BASICA.pdf`, `Modelado3D_segun Alcance de Ingenieria.pdf`. Estos documentos **no proporcionan los coeficientes horarios** añadidos en V4.

## Editar ratios o fórmulas

- Valores bibliográficos y supuestos: `data/biblioteca_ratios.json` (registro `ratios`, campos como `hh_unitarias`, `etapa`, `disciplina`, `referencia_alcance`, `contenido_referencia`, etc.).
- Conversión de magnitudes físicas a cantidades de entregables (supuestos): `js/estimacion.js` → `quantityGuess()`.
- Fórmula y lógica de horas: `js/estimacion.js` → `lineCompute()` y `calculate()`.
- Escenarios de obra y selección: `js/config.js` → `FAMILIES`, `computeStageSet()`; interfaz `js/interfaz.js`.
- UI y colores: `css/hydra.css`.

**Advertencia técnica:** muchas H/H de la biblioteca son hipótesis sin validación. Los coeficientes de m², m³ y toneladas se utilizan para prever cantidades de documentos, no como ratios universales de ingeniería. Calibrar con proyectos reales antes de presentar propuestas contractuales. La tarifa es una sola tarifa promedio; el total no incluye margen comercial.

## Dependencias

- No necesita Node, `npm`, compilación ni base de datos.
- Utiliza Tailwind mediante CDN y tipografías Google Fonts; requiere conexión para esas dependencias visuales. Los cálculos están implementados en JavaScript local.
- Los proyectos y datos ingresados no se envían a un backend propio: se guardan en `localStorage` en el navegador o en un JSON descargado por el usuario.

## Licencias y fuentes

Las notas y referencias bibliográficas de cada actividad están incluidas en `data/biblioteca_ratios.json` y en el panel de metodología. Esta biblioteca es un borrador de trabajo, no una norma AACE ni una base de productividad certificada.


## Corrección V4.1 — Agregar modelado 3D sin descontar horas

- Los botones de selección de entregables ya no desmarcan silenciosamente alternativas.
- «Aplicar cambios 3D» incorpora los trabajos correspondientes al alcance elegido, con vista previa y sin sustituir trabajos manuales 2D. Si se desactiva explícitamente una disciplina 3D, sus horas de modelado pueden disminuir.
- Si hay isométricos o MTO manuales seleccionados, el botón no activa automáticamente el método alternativo derivado del modelo. El usuario puede activarlo manualmente cuando tenga sentido y ajustar sus cantidades.
- Cuando ambas rutas manual/3D están activas, el cálculo advierte del posible doble cómputo.
- No se modifican ratios, precios por H/H ni coeficientes financieros.
- Se incluyen verificaciones automáticas de regresión en `tests/verificar_calculos.js`.

**Actualización GitHub Pages:** subir todas las carpetas del ZIP nuevo a la raíz de la rama `main`, reemplazando los archivos anteriores; no arrastrar la carpeta contenedora. La actualización conserva los proyectos guardados en el navegador.


## V4.3 — Calibración y persistencia de parámetros

- Nueva pestaña **Calibración** con coeficientes de H/H *complementarias* por magnitud física y porcentaje visible de las horas totales.
- Todos los coeficientes físicos comienzan en **cero** para evitar contar dos veces los trabajos asociados a planos y cálculos. Si se activan se muestran como filas independientes `FIS-*` y se advierte del posible solapamiento.
- Nueve coeficientes que convierten magnitudes físicas en cantidades de documentos (`m³ por plano de fundación`, `t por plano estructural`, etc.) son ahora editables y afectan el modo rápido. No son ratios normalizados.
- Se pueden promover los ratios H/H editados en **Modo detallado → Matriz** a valores generales de la calculadora.
- Los ajustes de calibración se guardan automáticamente en `localStorage` bajo una clave separada de los proyectos. Esto **no modifica** archivos del servidor y solo persiste en ese navegador.
- Con **Descargar calibración definitiva** se genera `calibracion.json`. Para establecer los valores como predeterminados para todos los usuarios, reemplazar **`data/calibracion.json`** en GitHub. La aplicación carga ese archivo al inicio; después aplica los ajustes locales existentes, si los hay.
- Se pueden importar calibraciones, restaurar valores publicados y guardar proyectos de modo independiente.

**IMPORTANTE:** GitHub Pages es estático; no permite que los usuarios reescriban el HTML desde el navegador. Si querés un repositorio con nuevas calibraciones para todos, hay que subir `data/calibracion.json` mediante un commit. Solo las modificaciones dentro de `data/calibracion.json` viajan con la web publicada; los proyectos quedan en el navegador o su propio JSON.
