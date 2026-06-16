# Memoria de Migración y Ajustes de VideoStudioOS

Este documento sirve como memoria técnica del proyecto, detallando la problemática encontrada, los análisis realizados y las soluciones definitivas implementadas para el soporte vertical, la corrección de fallos en previsualización de imágenes y la rotación del video para pantallas físicas.

---

## 1. Problemas Identificados y Soluciones

### A. Fallos de CORS en la Previsualización de Imágenes
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

---

## 2. Contrato de Arquitectura (Reglas de Oro)

1. **Monocromatismo Verde Matrix (para documentación externa):** Para todos los reportes visuales se debe seguir el esquema de color Matrix.
2. **Dimensiones de Rotación:** Al renderizar con rotación izquierda activada, la composición principal *siempre* debe exportar una resolución de `1920x1080` píxeles. La simulación vertical ocurre estrictamente en un subcontenedor interno rotado.
3. **Uso de Proxy:** No se debe evadir el proxy de Express para peticiones de assets de Firebase Storage en desarrollo local, de lo contrario volverán a surgir errores CORS.
