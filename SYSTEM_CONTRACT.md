# 📜 CONTRATO DEL SISTEMA - DIGITAL MENU STUDIO (SYSTEM CONTRACT)

Este contrato define las reglas inmutables de funcionamiento, arquitectura y protocolos de recuperación para el proyecto Digital Menu Studio. **NUNCA DEBE SER IGNORADO.**

---

## 🏗️ 1. PILARES ARQUITECTÓNICOS

### 1.1 Sincronización Híbrida
- **STORAGE LOCAL**: Prioridad de visualización instantánea. `localStorage` guarda la última sesión para evitar pérdida de datos por falta de internet.
- **STORAGE CLOUD**: Persistencia real. Los datos se suben a **Google Cloud Firestore**.
- **REGLA DE ORO**: El usuario siempre debe ver su `UID` en la cabecera para confirmar que está en su propia sesión de datos.

### 1.2 Integración de Imágenes
- **PROTOCOLO BLOB**: Imagen cargada en el navegador. Marcada con icono naranja. **PROHIBIDO RENDERIZAR EN LA NUBE CON BLOBS.**
- **PROTOCOLO URL**: Imagen subida a Firebase. Única aceptada para el renderizado final.
- **SYNC AUTOMÁTICO**: Al pulsar "Exportar MP4", el sistema detecta blobs locales y los sube a la nube automáticamente antes de disparar el render.

### 1.3 Blindaje de Resiliencia (Armor Points)
- **DYNAMIC FONT SIZING**: El sistema ajusta el tamaño del texto automáticamente para evitar desbordamientos en nombres largos de platillos.
- **FALLBACK IMAGES**: Si una imagen falla o no existe, se muestra un asset premium de respaldo en lugar de un cuadro vacío.
- **RENDER LOCK**: El botón de exportación se bloquea durante el proceso para evitar duplicidad de costos y fallos técnicos.

---

## 🔑 2. CONFIGURACIÓN DE SEGURIDAD (PROTOCOLO FIREBASE)

### 2.1 Requisitos de Inicialización
Si el sistema se despliega en un nuevo proyecto de Firebase, estos pasos son **OBLIGATORIOS**:
1. **HABILITAR ANONYMOUS AUTH**: Sin esto, el sistema falla silenciosamente al intentar subir imágenes.
2. **CREAR FIRESTORE EN MODO NATIVO**: No usar modo Datastore.
3. **REGLAS PÚBLICAS (FASE DESARROLLO)**: 
   - Firestore: `allow read, write: if true;`
   - Storage: `allow read, write: if true;`

---

## ⚙️ 3. PROTOCOLO DE RENDERIZADO (GOOGLE CLOUD RUN)

### 3.1 Cadena de Mando
1. `Editor.tsx` dispara la función `handleExportWorkflow` al servidor Cloud Run vía POST (`/api/render`).
2. **Pre-vuelo**: Sincronización forzada de imágenes locales a Firebase Storage.
3. Se envía un payload JSON al motor en la nube con la configuración final { projectId, menuConfig, quality }.
4. **Bandeja de Salida**: Se registra la tarea en Firestore (`renders/` o `exports/`) para seguimiento en tiempo real.
5. Cloud Run (Node.js + Puppeteer Headless) instancia el canvas, renderiza los frames y empaqueta el MP4 nativamente.
6. El backend sube el video final a Storage y envía el Link directamente a la UI.
7. La interfaz actualiza el estado a "Completado" y habilita el botón de descarga.

### 3.2 Protocolo de Descarga (Hotfix v2.1)
- El boton DESCARGAR MP4 usa una descarga Blob en memoria (sin abrir nueva pestaña).
- Implementado en `handleDownload()` dentro de `MenuControls.tsx`.
- El archivo se nombra `Menu_[RestaurantName].mp4` automáticamente.
- **REGLA**: No usar `<a href target=_blank download>` para archivos de GCS — los navegadores modernos bloquean la descarga directa de dominios cruzados.
- Si `fetch()` falla por CORS, se hace fallback a `window.open(url)`.


---

## 🚑 4. PROTOCOLO DE EMERGENCIA (TROUBLESHOOTING)

### 4.1 "El video sale sin imágenes"
- **CAUSA**: Se intentó renderizar con imágenes locales (blobs) que fallaron al subir.
- **SOLUCIÓN**: Revisar conexión a internet y estado de la "Bandeja de Salida" para ver errores específicos.

### 4.2 "Unauthorized storage error"
- **CAUSA**: Las reglas de Firebase Storage no están publicadas o no son `if true`.
- **SOLUCIÓN**: Ir a Firebase Console -> Storage -> Rules -> Publish.

### 4.3 "Focus perdido al escribir"
- **CAUSA**: El estado principal (props) se actualiza en cada tecla, forzando un re-render completo.
- **SOLUCIÓN INMUTABLE**: Usar estados locales en `MenuItemCard` y sincronizar solo al pulsar "GUARDAR".

---

## 📖 5. DICCIONARIO DE ICONOS (UX/UI)

- **☁️ Naranja (Pulsante)**: Imagen local. Acción: SE REQUIERE SUBIDA (El sistema lo hará solo al exportar).
- **⚠️ Alerta Roja**: Fallo de conexión o límite de tiempo en Cloud Run excedido (>30 minutos con rev-00006).
- **✅ Check Verde**: Cambios sincronizados con la nube.
- **💾 Botón Ámbar (Parpadeante)**: Cambios detectados sin guardar. Acción: PULSAR GUARDAR.
- **📤 Bandeja de Salida**: Estado del render: `Queued` (Gris), `Rendering` (Azul), `Completed` (Verde), `Failed` (Rojo).

---

##  Aprendizajes Recientes (Learning Log)
- *08/03/2026* — **Hotfix Descarga Forzada v2.1**: Reemplazado `<a href download>` con `handleDownload()` Blob-based en `MenuControls.tsx`. Los navegadores modernos bloquean la descarga directa de GCS Storage en dominios cruzados.
- *08/03/2026* — **Cloud Run rev-00006**: Incremento de recursos a 4 vCPU / 8 GB RAM / 30 min timeout. Resuelve definitivamente los cuelgues al procesar videos de alta duración con Remotion/FFmpeg.
- *08/03/2026* — **Timeout Frontend v2.1**: `AbortController` elevado a 25 minutos en `cloudRunService.ts` para alinearse con el nuevo techo del servidor.
- *08/03/2026*: Migración total del engine de renderizado de GitHub Actions a Google Cloud Run + Express local para evitar colas de espera.
- *08/03/2026*: Se solucionaron crashes de Linux detectando correctamente el binario de Chromium embebido vía variable `REMOTION_PUPPETEER_EXECUTABLE_PATH`.
- *08/03/2026*: Vite cachea variables estáticas. Modificaciones a la URL de Cloud Run en el `.env` exigen limpieza de `/dist` y rebuild completo para tener efecto real en deploy de Firebase Hosting.
- *15/02/2026*: Se implementó el "Blindaje de Resiliencia" para manejar textos largos y fallos de imagen.

---

**ESTABLECIDO EL**: 8 de Marzo, 2026 | **Última actualización**: 8 de Marzo, 2026 (v2.1).
**CERTIFICADO PARA**: BoxesMedia360.

