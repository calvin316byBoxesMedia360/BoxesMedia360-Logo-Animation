# 🎥 Digital Menu Studio - Manual de Operaciones

Este documento contiene todo el conocimiento técnico y operativo necesario para mantener, arreglar y escalar el Digital Menu Studio. **Lee esto antes de realizar cualquier cambio técnico.**

---

## ⚡ ESTADO ACTUAL (jun 2026) — RENDER 100% LOCAL

> **Importante:** el proyecto **migró de la nube a render 100% local**. Las secciones de Firebase / Cloud Run más abajo son **referencia histórica** (legado en retiro), no la arquitectura activa.

- **Repositorio:** `https://github.com/calvin316byBoxesMedia360/Digital-Menu-Studio` · rama activa **`sandbox/reverse-engineering`** (la rama `main` es la versión vieja en nube).
- **Arquitectura activa:** editor React/Vite (`npm run dashboard`, :3001) + backend de render local Express (`npm run server`, :3003) → Remotion + Chrome/Edge local → MP4 H.264 en `out/`. **Sin Firebase ni Cloud Run.**
- **Persistencia:** `localStorage` (config del menú) + `public/uploads` (assets). Ya no se usan Firestore/Storage.
- **Correr en local:**
  ```bash
  npm install
  npm run server      # :3003 (backend de render)
  npm run dashboard   # :3001 (editor)  → http://localhost:3001
  ```
- **Novedades recientes (jun 2026):**
  - **Fix de frames:** el render usa el `<Video>` de `@remotion/media` (antes caía en el `<Video>` del DOM → frames congelados/saltados/repetidos). Ver `scripts/render-video.js` (`isRendering: true`).
  - **Selector de FPS 24/30** en el editor (default **24**, coincide 1:1 con videos de 24 fps → sin judder). Todo el frame-math usa `useVideoConfig().fps`.

---

## 🛠️ 1. Arquitectura del Sistema

El sistema es una plataforma híbrida de edición de video en tiempo real:
- **Frontend**: React + Vite (Dashboard Premium).
- **Motor de Video**: Remotion (Live Preview & Render).
- **Backend / Persistencia**: Firebase (Firestore, Storage, Auth).
- **Renderizado Profesional**: **Google Cloud Run** (Microservicio Node.js que genera el MP4 con FFmpeg/Puppeteer).

---

## 🔐 2. Configuración Crítica de Firebase

Si el sistema deja de guardar o las imágenes no suben, revisa estos 3 puntos en la [Consola de Firebase](https://console.firebase.google.com/):

### A. Autenticación (Auth)
- **Estado**: Debe estar habilitado **Anonymous Sign-in**.
- Sin esto, el sistema no tendrá un UID y las reglas de seguridad bloquearán las subidas.

### B. Base de Datos (Firestore)
Para que el sistema sincronice los cambios:
1. Crea la base de datos en **Native Mode**.
2. Ubicación recomendada: `nam5 (us-central)`.
3. **Reglas de Seguridad (Debug)**:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if true;
       }
     }
   }
   ```

### C. Almacenamiento (Storage)
Para que las imágenes funcionen en el video final:
1. **Reglas de Seguridad (Debug)**:
   ```javascript
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /{allPaths=**} {
         allow read, write: if true;
       }
     }
   }
   ```

---

## ☁️ 3. El Nuevo Sistema de Exportación (V2)

### Sincronización Automática (Auto-Sync)
- Ya no necesitas preocuparte por el **icono de la Nube Naranja**. Al pulsar "Exportar MP4", el sistema detecta automáticamente qué imágenes son locales y las sube a Firebase antes de iniciar el renderizado.

### Bandeja de Salida (Export Tray)
- Ubicada en la parte inferior del dashboard.
- Muestra el progreso de tus videos en tiempo real.
- **Estados**: `Queued` -> `Rendering` -> `Completed`.
- Una vez listo, aparecerá un botón de **Descargar MP4**.

### Descarga Forzada (Hotfix v2.1)
- El botón **DESCARGAR MP4** ya no abre el video en el navegador. Utiliza descarga en memoria (Blob) para forzar el guardado local del archivo.
- El archivo se nombra automáticamente con el nombre de tu restaurante: `Menu_[NombreRestaurante].mp4`.
- Si hay error de CORS, el sistema hace fallback a abrir en nueva pestaña.


## 🛡️ 4. Resiliencia del Sistema (Armor Points)

Hemos implementado "puntos de blindaje" para asegurar que el sistema nunca falle visualmente:
1. **Auto-Tamaño de Texto**: Si el nombre de un platillo es muy largo, el sistema reduce la fuente automáticamente para que siempre quepa en el diseño.
2. **Imágenes de Respaldo (Fallback)**: Si una imagen no carga o está rota, se muestra un asset de alta calidad de BoxesMedia por defecto.
3. **Bloque de Renderizado**: Evita que se disparen múltiples renders accidentales mientras uno ya está en curso.

---

## 💻 5. Guía de Desarrollo Local

### Comandos Principales
- `npm run dev`: Abre Remotion Studio (Visualización técnica del video).
- `npm run dashboard`: Abre la aplicación principal de edición (Vite).

### Variables de Entorno (`.env`)
Asegúrate de tener estas variables configuradas para que el frontend pueda hablar con la nube:
```env
VITE_CLOUD_RUN_URL=https://digital-menu-render-938762407896.us-central1.run.app
```

---

## 🚑 6. Solución de Problemas Comunes (FAQ)

#### Q: "El video en la Bandeja de Salida dice 'Failed' u ocurre un Error 500"
**A**: Ocurre si Cloud Run se queda sin memoria (OOM) o el tiempo superó el límite. Con la revisión actual (rev-00006 / 4CPU / 8GB / 30 min), la capacidad es alta. Intenta con menos platillos o sin videos pesados si persiste.

#### Q: "El Error 404 persiste al renderizar"
**A**: Esto indica que el frontend (`index-*.js`) tiene cacheada una URL vieja de Cloud Run. Ve a `.env`, actualiza `VITE_CLOUD_RUN_URL`, ejecuta `npm run build:dashboard` y vuelve a subir a Firebase Hosting (`firebase deploy --only hosting`).

#### Q: "Error 0x80070323 al abrir el video en Windows"
**A**: Windows Media Player es impaciente. Espera a que la descarga termine al 100% o usa **VLC Media Player**.

#### Q: "Sale un Error Unauthorized al subir imagen"
**A**: Tus reglas de Firebase Storage están bloqueando el acceso. Ve a la consola de Firebase y asegúrate de que el `allow write: if true;` esté activo y **Publicado**.

---

**Última revisión completa**: 23 de Julio, 2026 (auditoría de código y documentación).
**Estado del sistema**: ✅ Operativo en render 100% local (Express `:3003` + Remotion + Chrome/Edge). Las referencias a Cloud Run de este documento son legado en retiro.

### Deuda técnica conocida (23 jul 2026)

Detalle completo en [`docs/memoria_proyecto.md`](docs/memoria_proyecto.md) §F y en `informe.html` (pestañas STATUS y ERRORES & FIXES). Los tres primeros antes de tocar nada más:

1. **La duración se calcula en tres sitios** (`Editor.tsx`, `Root.tsx`, `PremiumMenu.tsx`) con reglas distintas → con escenas de menos de ~1.25 s la última sale cortada y el preview no coincide con el MP4.
2. **Dos botones "EXPORTAR MP4"** con comportamiento distinto; el de la barra lateral bloquea con un alert de la era nube.
3. **Reglas de Firestore/Storage en `if true`** sobre un proyecto real — confirmar si sigue vivo y cerrarlo.
4. `npm run lint` no compila (`tsconfig` desalineado con Vite) · backend escuchando en `0.0.0.0` sin auth · SDK de Firebase aún inicializándose en el editor · `out/` 853 MB sin limpieza.
