# Memoria de Migración y Ajustes de VideoStudioOS

Este documento sirve como memoria técnica del proyecto, detallando la problemática encontrada, los análisis realizados y las soluciones definitivas implementadas para el soporte vertical, la corrección de fallos en previsualización de imágenes y la rotación del video para pantallas físicas.

---

## 1. Problemas Identificados y Soluciones

### A. Fallos de CORS en la Previsualización de Imágenes
> ⚠️ **HISTÓRICO — ya no aplica (verificado 23 jul 2026).** El proxy `/api/proxy` descrito aquí **fue eliminado** al migrar a assets locales; no existe en `server.js`. Los assets se sirven desde `public/uploads` en el mismo origen, así que no hay CORS que evadir. Se conserva por contexto de la etapa nube.

* **Causa:** El cliente consume imágenes y videos directamente de Firebase Storage. Al cargarse en el lienzo canvas de Remotion (`<Player>`), el navegador arroja errores de seguridad CORS si Google Cloud Storage no expone las cabeceras correspondientes.
* **Solución:**
  1. Se implementó un middleware proxy en el servidor Express local (`server.js`) accesible en `/api/proxy?url=...`.
  2. En el panel de control (`Editor.tsx`), se modificó la entrega de propiedades hacia el `<Player>` para reescribir de forma dinámica las URLs externas y pasarlas a través del proxy.
  3. Esto asegura que la previsualización y el Puppeteer del motor de renderizado puedan descargar los assets de forma segura.

### B. Líneas Blancas (Fringes) en Transiciones de Platillos
* **Causa:** Ruido de subpíxeles o bordes transparentes en las imágenes aportadas por el usuario. Al escalarse dinámicamente con el efecto Ken Burns, provocaban una línea blanca parpadeante durante el fade.
* **Solución:**
  1. Se configuró un sistema **Smart Blurred Fit** de doble capa en `PremiumMenu.tsx` (capa trasera de fondo con blur extremo de 25px, y capa delantera con ajuste contain).
  2. En la capa delantera (foreground), se aplicó la regla CSS de recorte de bordes:
     `clipPath: 'inset(5px 2px)'`
     Esto recorta imperceptiblemente un par de píxeles exteriores de la imagen, absorbiendo y eliminando cualquier residuo blanco de los bordes.

### C. Requerimiento de Rotación de Salida para Pantallas Físicas Verticales
* **Causa:** El usuario instaló una pantalla de forma física vertical en la pared y desea que el video MP4 de salida se exporte como un archivo horizontal estándar de `1920x1080` píxeles, pero con el contenido rotado -90° (girado a la izquierda), para que al reproducirse en reproductores estándar y mostrarse en la TV vertical, se vea correctamente.
* **Solución:**
  1. Se agregó la propiedad `rotation?: 'none' | 'left'` a la composición.
  2. Cuando se selecciona formato **Vertical (9:16)** y la rotación está activada (`rotation === 'left'`), el archivo `Root.tsx` establece las dimensiones de salida de la composición a horizontal (`width={1920}`, `height={1080}`).
  3. En `PremiumMenu.tsx`, el contenido vertical se encapsula en una caja rígida de `1080x1920` (preservando fuentes y flujos tipográficos originales) y se rota mediante la transformación CSS:
     `transform: 'translate(-50%, -50%) rotate(-90deg)'`
  4. En el dashboard, la previsualización se ajusta para mostrar el lienzo horizontal completo permitiendo validar la rotación en tiempo real.

### D. Error de Decodificación de Video (`PIPELINE_ERROR_DECODE`)
* **Causa:** En renders locales pesados con clips de video (>25MB), el Chromium headless por defecto de Puppeteer fallaba en decodificar los flujos H.264/AAC debido a la falta de licencias integradas.
* **Solución:**
  1. Modificado el script de renderizado local `scripts/render-video.js`.
  2. Se añadió un escáner automático que busca la existencia de **Google Chrome** o **Microsoft Edge** en el sistema local de Windows y redirige el `browserExecutable` a este.
  3. Al utilizar el navegador Chrome/Edge oficial del sistema del usuario, Chromium obtiene la capacidad nativa de decodificar H.264, eliminando por completo los fallos en renderizados locales con videos.

### E. Frames Defectuosos al Combinar Varios Videos (congelan / saltan / repiten) — jun 2026
* **Causa:** la composición elegía el componente de video según `isRendering`, pero `isRendering` es solo estado de UI del editor y **nunca llegaba al render**. Por eso el render headless caía en el `<Video>` del DOM (`remotion`), cuyo seeking no es frame-exacto → frames congelados, saltos y repeticiones. Agravado por una discordancia de fps: videos de origen a **24 fps** dentro de una composición a **30 fps** (duplicación de frames / judder), confirmado con `ffprobe`.
* **Solución:**
  1. En `scripts/render-video.js` se fuerza `isRendering: true` en los `inputProps`, de modo que el render use el `<Video>` de **`@remotion/media`** (frame-exacto, el componente recomendado por Remotion).
  2. Se hizo el **fps configurable** (selector **24/30** en `MenuControls.tsx`, default 24). `Root.tsx` fija el `fps` de la composición y el cálculo de duración; `PremiumMenu.tsx` y `Editor.tsx` usan `useVideoConfig().fps` en todo el frame-math, así escenas y textos conservan su **misma duración real** a cualquier fps. Con videos de 24 fps, renderizar a 24 fps los reproduce 1:1 (sin judder).

### F. Auditoría Completa del Proyecto — 23 jul 2026

Revisión de todo el código y la documentación con el sistema corriendo (`:3001` Vite + `:3003` Express). Resultados:

* **Corregido — Remote de git con el nombre viejo.** `.git/config` apuntaba a `BoxesMedia360-Logo-Animation.git`, el nombre anterior al renombrado. GitHub redirige los repos renombrados, así que fetch y push funcionaban igual y el desfase pasó inadvertido durante un mes. Verificado con `gh api` (devuelve `full_name: Digital-Menu-Studio`) y actualizado con `git remote set-url`. **El README siempre estuvo bien; lo desactualizado era la config local.**
* **Corregido — El proxy `/api/proxy` no existe.** La sección A de esta memoria y la Regla de Oro 3 describían un middleware proxy de Express para evadir CORS de Firebase Storage. Se eliminó al migrar a assets locales: hoy `server.js` solo expone `/api/upload-asset`, `/api/render`, `/api/render-local`, `/api/videos` y `/api/health`. Documentación corregida abajo. *Esa entrada obsoleta ya había provocado que se describieran capacidades inexistentes del backend en material del proyecto.*
* **Abierto (ALTO) — La duración se calcula tres veces con reglas distintas:** `Editor.tsx` (preview), `Root.tsx` (duración de la composición) y `PremiumMenu.tsx` (posición de cada escena). Solo `PremiumMenu` aplica el mínimo de 30 frames por escena, y solo `Root` el mínimo total de 30. Con 2 platillos a 1 s y 24 fps: preview 23 frames, composición 30, escenas reales terminando en el 35 → **la última escena sale cortada y el preview no coincide con el MP4**. Con duraciones normales (4 s) no se manifiesta. Arreglo: una sola `calculateTimeline(props, fps)` consumida por los tres.
* **Abierto (ALTO) — Dos flujos de exportación.** El botón del header (`Editor.handleExport`) auto-sincroniza los `blob:` al servidor local; el de la barra lateral (`MenuControls.handleExport`) bloquea con un alert de la era nube ("deben subirse a la nube antes de exportar"). Hay que dejar uno.
* **Abierto (REVISAR) — Reglas de Firebase abiertas.** `firestore.rules` y `storage.rules` siguen en `allow read, write: if true` sobre el proyecto real `boxesos-crmtest`. El `/api/health` del backend reporta `firebase: connected`, o sea que Firebase Admin sí encuentra credenciales en esta máquina y `/api/render` escribiría en el Firestore real. Confirmar si el proyecto sigue vivo y cerrarlo.
* **Abierto (MEDIO) — `npm run lint` no compila.** `tsconfig.json` usa `module: commonjs` y `lib: es2015`, incompatible con Vite: `import.meta.env` falla en 5 servicios y el `include` arrastra `skills/`. ~28 errores que enmascaran los reales.
* **Abierto (MEDIO) — Backend expuesto en la red.** `server.js` hace `listen(PORT)` sin host (0.0.0.0), con `cors({origin:true})` y subida de 200 MB sin autenticación. Verificado con `netstat`. Vite sí está limitado a localhost.
* **Abierto (MEDIO) — Firebase residual en el editor.** `MenuControls.tsx` importa `auth` y monta un `onAuthStateChanged` que nunca dispara (nadie llama a `signInAnonymously`): inicializa y empaqueta el SDK sin cumplir función.
* **Abierto (MEDIO) — Higiene de disco.** `out/` 853 MB (19 MP4) y `public/uploads/` 157 MB, sin rutina de limpieza. La bandeja vive en `localStorage`: al vaciar `out/` quedan enlaces rotos mostrados como "LISTO".
* **Cerrado (23 jul) — Línea de acento eliminada.** La barra difuminada de la esquina inferior izquierda de `DishScene` pasó por tres etapas el mismo día: prop opcional (`e519d7f`), toggle en la UI (`8c42cdb`) y finalmente **eliminación completa** (`228eaac`) a petición del usuario, que no la necesitaba. Ya no queda ninguna referencia a `showAccentLine` en `src/`; un valor guardado en `localStorage` simplemente se ignora. Verificado renderizando con `showAccentLine: true`: el MP4 sale sin línea.
  * También se eliminó el **selector de COLOR** del panel (`11a00a1`). `accentColor` queda fijo en `#D4AF37` y sigue tiñendo el precio, el borde de su tarjeta y las partículas doradas — **no** era el control de la línea, cosa que causó confusión: quitar el color no borraba la barra.
* **Abierto (MENOR) — Código muerto de la era nube:** `cloudRunService.ts`, `githubActionsService.ts`, `renderService.ts`, `vertexAI.ts`, `scripts/upload-to-storage-action.js`, `Dockerfile`, `firebase.json`. Más `translateX` sin usar en `PremiumMenu.tsx`.

### G. Tarjeta de Precio Vacía ("el óvalo") — 23 jul 2026

* **Síntoma:** un pequeño recuadro redondeado oscuro flotando sobre la imagen, sin contenido. Reportado justo después de eliminar la línea de acento, lo que hacía pensar que era un resto de ella.
* **Causa:** la tarjeta del precio se montaba siempre, tuviera o no texto. Con `price: ''` quedaba el contenedor con `backgroundColor: rgba(212,175,55,0.125)`, `border: 1px` y `padding: 10px 25px` — un óvalo vacío. Nada que ver con la línea de acento.
* **Solución (`ca1fbbd`):** el texto del precio se calcula una sola vez en `priceText` (ya sin símbolo si el platillo lo oculta) y la tarjeta se monta solo si no está vacío. Un precio que queda en `""` tras retirarle el símbolo tampoco dibuja nada.
* **Verificado** en el editor con los tres casos: `"$14.99"` → tarjeta; `""` → nada; `"$9.99"` con `showCurrencySymbol: false` → `9.99`.

### Nota de Migración a Local (jun 2026)
* El proyecto pasó a **render 100% local** (sin Firebase/Cloud Run). El repositorio se renombró a **`Digital-Menu-Studio`** (rama activa `sandbox/reverse-engineering`). El proxy de Firebase Storage y la persistencia en Firestore quedaron como **legado en retiro**; la persistencia activa es `localStorage` + `public/uploads`.

---

## 2. Contrato de Arquitectura (Reglas de Oro)

1. **Monocromatismo Verde Matrix (para documentación externa):** Para todos los reportes visuales se debe seguir el esquema de color Matrix.
2. **Dimensiones de Rotación:** Al renderizar con rotación izquierda activada, la composición principal *siempre* debe exportar una resolución de `1920x1080` píxeles. La simulación vertical ocurre estrictamente en un subcontenedor interno rotado.
3. ~~**Uso de Proxy:** No se debe evadir el proxy de Express para peticiones de assets de Firebase Storage en desarrollo local, de lo contrario volverán a surgir errores CORS.~~
   **DEROGADA (23 jul 2026).** El proxy no existe desde la migración a local. Regla vigente: **los assets se sirven desde el mismo origen** (`public/uploads` vía `/uploads` en `:3003`); no se introducen dependencias de assets remotos en el render.
4. **Fuente única de duración:** el cálculo de frames por escena debe vivir en un solo sitio y ser consumido por preview, composición y escenas. Hoy está duplicado en tres — ver sección F.
