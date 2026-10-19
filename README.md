# ESTIMA V6 — Asistente guiado para presupuestos de ingeniería

La V6 inicia con un flujo de **cinco pasos**: Proyecto → Dimensiones → Alcance → Horas y tarifa → Propuesta.

* Todas las selecciones siguen utilizando el motor y la biblioteca de la V5 (101 actividades).
* Se puede retroceder, acceder directamente a cualquier paso, y regresar al modo **Vista avanzada** sin perder el proyecto.
* El modelado 3D requiere pulsar **Aplicar 3D al presupuesto**, para evitar sustituciones ocultas de entregables.
* La propuesta final ofrece impresión/PDF, CSV y proyecto JSON.
* El trabajo se guarda automáticamente en almacenamiento local del navegador. La calibración de ratios puede publicarse mediante `data/calibracion.json`.
* Los ratios de H/H incluyen hipótesis no validadas: revisar antes de ofertar.

## Publicar en GitHub Pages

1. Descomprimir y copiar los archivos y carpetas en la raíz del repositorio `iggarcia2/estima-ingenieria` (no subir la carpeta contenedora).
2. Confirmar los cambios en `main`.
3. Ir a **Settings → Pages → Deploy from a branch → main → /(root)**.
4. Abrir https://iggarcia2.github.io/estima-ingenieria/ .

Usar un servidor HTTP o GitHub Pages para abrir la versión modular (el modo `file://` no puede cargar los JSON).

## Estructura

- `index.html`: documento principal
- `css/`: visual Hydra, V5 y wizard V6
- `js/wizard.js`: navegación y experiencia de 5 pasos
- `js/estimacion.js`: motor de horas
- `js/config.js`: catálogos y configuración
- `data/biblioteca_ratios.json`: entregables y HH unitarias
- `data/calibracion.json`: ratios globales publicados
- `tests/`: comprobaciones automatizadas

## Nota sobre cálculos

No se alteraron las fórmulas del motor de la V5. La selección automática de disciplinas y magnitudes depende de la tipología y toma cantidades de **ejemplo**. El usuario debe reemplazarlas por datos de su proyecto y validar entregables, revisiones y solapamientos. Los estándares de CAI/CEPSI respaldan definiciones de alcance, no coeficientes de H/H.

---

# ESTIMA V5.0 — Presupuestos de ingeniería, más simples

**Estimador de horas hombre y presupuesto de ingeniería multidisciplinaria** para publicar directamente con **GitHub Pages**. Conserva la biblioteca de 101 actividades, cálculos por disciplina y perfil, etapas independientes, modelado 3D opcional y calibración; simplifica lo que se muestra al comenzar.

## Novedades V5

En la pantalla principal solamente hay tres secciones de entrada:

1. **Proyecto y alcance** — nombre, tipo de proyecto y etapas a cotizar. Podés modificar Conceptual, Básica y Detalle de forma independiente. La situación de partida y la etapa objetivo proponen una selección; no te obligan a mantenerla.
2. **Magnitudes principales** — m², m³, toneladas, equipos, líneas y potencia. Otros datos aparecen solo cuando los desplegás y según las disciplinas activadas.
3. **Precio de ingeniería** — tarifa promedio y moneda (sin conversión automática de divisas).

A la derecha se muestran **H/H totales y presupuesto en tiempo real**, con tres pestañas: **Resumen**, **Entregables** y **Ayuda y calibración**. Los documentos están agrupados por disciplina; editar cantidades/H/H se hace desde Entregables. Las funciones especializadas están en **Opciones adicionales** (disciplinas, modelado 3D, rondas adicionales, notas). En móvil, una barra inferior muestra los totales y permite ir al resultado.

**Nota de diseño:** esta versión **no es un asistente paso a paso**; conserva la pantalla principal compacta. No cambia el modelo de cálculo anterior.

## Empezar a cotizar

1. Elegí tipo de obra y etapas.
2. Cargá las magnitudes físicas y una tarifa promedio H/H.
3. Mirá el presupuesto; entrá en **Entregables** si necesitás incluir/quitar trabajos o modificar ratios.
4. Si corresponde, abrí **Opciones adicionales → Modelado 3D** y confirmá con **Aplicar 3D al presupuesto**: la selección no cambia el importe hasta confirmar.
5. Elegí **PDF / Propuesta** para imprimir o guardar en PDF, o **Guardar** para descargar un JSON del proyecto.

En **Ayuda y calibración** están los criterios, supuestos, parámetros de ajuste y la exportación de calibración. Los cambios de calibración se guardan localmente en el navegador. Para fijarlos como valores predeterminados del sitio, exportá `calibracion.json` y reemplazá `data/calibracion.json` en GitHub. Un navegador con ajustes locales propios puede seguir mostrando sus valores particulares.

## Publicar en GitHub Pages

Repositorio existente: <https://github.com/iggarcia2/estima-ingenieria>

1. Descomprimí el ZIP.
2. Subí **el contenido** de la carpeta a la **raíz** del repositorio, sobrescribiendo archivos homónimos (`index.html`, `css/`, `js/`, `data/`, `docs/`). No subas una carpeta contenedora como nivel adicional.
3. Si GitHub Pages ya está activo en rama `main` / carpeta `/ (root)`, no necesitás cambiar la configuración. Si todavía no lo está: **Settings → Pages → Deploy from a branch → main → / (root)**.
4. Abrí <https://iggarcia2.github.io/estima-ingenieria/> cuando termine el despliegue. Si no ves la V5, hacé una actualización forzada del navegador.

Para probar en computadora sin publicar, ejecutá `python -m http.server 8000` en la carpeta y abrí `http://localhost:8000/`. No uses `file://` porque la biblioteca JSON se carga por `fetch()`.

## Archivos

```text
index.html
css/base.css
css/hydra.css
css/simple.css          <-- interfaz simplificada
js/config.js            <-- perfiles, disciplinas, etapas, estado
js/estimacion.js        <-- motor H/H
js/interfaz.js          <-- funciones base y matriz
js/exportacion.js       <-- CSV, JSON, propuesta imprimible
js/app.js               <-- eventos y persistencia
js/simple.js            <-- presentación simplificada V5
 data/biblioteca_ratios.json  <-- 101 actividades
 data/calibracion.json        <-- defaults compartidos
 docs/metodologia.md
 tests/                     <-- pruebas automatizadas
```

La separación modular hace posible mejorar la interfaz sin reescribir las fórmulas. El diseño oscuro conserva la identidad visual Hydra.

## Validación

Para repetir los tests (si tenés Node.js y Playwright con Chromium instalados):

```bash
node tests/verificar_calculos.js
node tests/verificar_calibracion.js
node tests/verificar_modelado_v44.js
python tests/verificar_interfaz_simple.py
```

## Limitaciones y alcance

- Se estiman **horas de ingeniería de diseño**, no horas de fabricación, construcción, montaje, compra de equipos o materiales.
- Muchos coeficientes son **hipótesis de calibración**, no ratios industriales universalmente validados. La bibliografía CAI/CEPSI sirve para delimitar entregables, **no certifica H/H**.
- El modelo 3D utiliza factores LOD provisionales, editables; no son tablas oficiales BIM ni CAI.
- El presupuesto es **H/H × tarifa promedio**, sin margen, impuestos ni conversión de moneda.
- Guardar un proyecto local o calibrar en un navegador no modifica el repositorio GitHub. Para compartir defaults entre navegadores hay que actualizar `data/calibracion.json`.
- Antes de utilizar una estimación en un contrato, revisá cantidades y entregables de la propuesta.

Archivos de referencia de etapas y alcances: `docs/metodologia.md`. Las notas de versiones anteriores están en `docs/`.
