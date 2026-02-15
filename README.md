# 🎥 Digital Menu Studio - Manual de Operaciones

Este documento contiene todo el conocimiento técnico y operativo necesario para mantener, arreglar y escalar el Digital Menu Studio. **Lee esto antes de realizar cualquier cambio técnico.**

---

## 🛠️ 1. Arquitectura del Sistema

El sistema es una plataforma híbrida de edición de video en tiempo real:
- **Frontend**: React + Vite (Dashboard).
- **Motor de Video**: Remotion (Live Preview & Render).
- **Backend / Persistencia**: Firebase (Firestore, Storage, Auth).
- **Renderizado Professional**: GitHub Actions (Generación de MP4 en la nube).

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

## ☁️ 3. El Sistema de Renderizado (Paso a Paso)

### El icono de la Nube Naranja (Cloud Sync)
- **Significado**: La imagen es "Local". Solo tú la ves en tu navegador.
- **Problema**: El servidor de renderizado NO puede ver tu disco duro.
- **Solución**: Pulsa el botón de la cámara y vuelve a seleccionar la imagen. Cuando la nube naranja desaparezca, la imagen está en Firebase y lista para el video.

### ¿Por qué falla el render?
El 99% de los fallos en GitHub Actions son por:
1. Imágenes locales (`blob:...`) que no se subieron a Firebase.
2. Token de GitHub expirado en el archivo `.env`.

---

## 💻 4. Guía de Desarrollo Local

### Comandos Principales
- `npm run dev`: Abre Remotion Studio (Visualización técnica del video).
- `npm run dashboard`: Abre la aplicación principal de edición (Editor para el usuario).

### Variables de Entorno (`.env`)
Asegúrate de tener estas variables configuradas:
```env
VITE_GITHUB_REPO=tu-usuario/tu-repo
VITE_GITHUB_TOKEN=tu-github-token
```

---

## 🚑 5. Solución de Problemas Comunes (FAQ)

#### Q: "No se guardan los cambios cuando escribo"
**A**: Revisa las pestañas de cada platillo. Ahora hay un botón **GUARDAR** que aparece al escribir. Debes pulsarlo para confirmar el cambio. También verifica que la base de datos de Firestore esté creada.

#### Q: "Error 0x80070323 al abrir el video en Windows"
**A**: Windows Media Player intenta abrir el video antes de que termine de descargarse o mientras el navegador lo tiene bloqueado. **Solución**: Abre el archivo con **VLC Media Player** o espera 10 segundos.

#### Q: "Sale un Error Unauthorized al subir imagen"
**A**: Tus reglas de Firebase Storage están bloqueando el acceso. Ve a la consola de Firebase y asegúrate de que el `allow write: if true;` esté activo y **Publicado**.

#### Q: "El video no hace bucle (loop)"
**A**: Los archivos de video (`.mp4`) no saben que deben repetirse solos. Es función del reproductor de TV o computadora activar el modo "Repetir". Te recomendamos usar VLC en modo Loop.

---

## 📝 6. Contrato de Sincronización

Cada vez que el sistema se inicia, realiza esta cadena:
1. **Auth**: Se loguea anónimamente para obtener un UID.
2. **Local Load**: Carga los datos guardados en el navegador (Rápido).
3. **Cloud Sync**: Busca en Firestore si hay una versión más nueva bajo tu UID.
4. **Push Update**: Al pulsar el botón "Sync Cloud" superior, se fuerza el guardado de TODO en la nube.

---

**Última revisión completa**: 15 de Febrero, 2026.
**Estado del sistema**: Operativo y Sincronizado.
