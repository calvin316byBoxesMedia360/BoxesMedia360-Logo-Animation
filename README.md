# 🎥 Digital Menu Studio - Manual de Operaciones

Este documento contiene todo el conocimiento técnico y operativo necesario para mantener, arreglar y escalar el Digital Menu Studio. **Lee esto antes de realizar cualquier cambio técnico.**

---

## 🛠️ 1. Arquitectura del Sistema

El sistema es una plataforma híbrida de edición de video en tiempo real:
- **Frontend**: React + Vite (Dashboard Premium).
- **Motor de Video**: Remotion (Live Preview & Render).
- **Backend / Persistencia**: Firebase (Firestore, Storage, Auth).
- **Renderizado Profesional**: GitHub Actions (Generación de MP4 en la nube).

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

---

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
Asegúrate de tener estas variables configuradas:
```env
VITE_GITHUB_REPO=tu-usuario/tu-repo
VITE_GITHUB_TOKEN=tu-github-token
```

---

## 🚑 6. Solución de Problemas Comunes (FAQ)

#### Q: "El video en la Bandeja de Salida dice 'Failed'"
**A**: Generalmente se debe a una pérdida de conexión durante la subida de imágenes o a que los límites de GitHub Actions se han alcanzado. Reintenta la exportación en 5 minutos.

#### Q: "Error 0x80070323 al abrir el video en Windows"
**A**: Windows Media Player es impaciente. Espera a que la descarga termine al 100% o usa **VLC Media Player**.

#### Q: "Sale un Error Unauthorized al subir imagen"
**A**: Tus reglas de Firebase Storage están bloqueando el acceso. Ve a la consola de Firebase y asegúrate de que el `allow write: if true;` esté activo y **Publicado**.

---

**Última revisión completa**: 15 de Febrero, 2026.
**Estado del sistema**: Operativo, Resiliente y Sincronizado.
