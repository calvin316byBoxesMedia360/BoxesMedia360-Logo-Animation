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

## ⚙️ 3. PROTOCOLO DE RENDERIZADO (GITHUB ACTIONS)

### 3.1 Cadena de Mando
1. `Editor.tsx` dispara la función `triggerRenderWorkflow`.
2. Se envía un payload JSON con toda la configuración del menú.
3. GitHub Actions descarga el repo, instala el navegador de Remotion y renderiza.
4. **IMPORTANTE**: La duración del video se calcula dinámicamente: `(sceneDuration * 30 fps) * totalItems`.

---

## 🚑 4. PROTOCOLO DE EMERGENCIA (TROUBLESHOOTING)

### 4.1 "El video sale sin imágenes"
- **CAUSA**: Se intentó renderizar con imágenes locales (blobs).
- **SOLUCIÓN**: Volver al dashboard, re-subir imágenes hasta que desaparezca el icono naranja y volver a exportar.

### 4.2 "Unauthorized storage error"
- **CAUSA**: Las reglas de Firebase Storage no están publicadas o no son `if true`.
- **SOLUCIÓN**: Ir a Firebase Console -> Storage -> Rules -> Publish.

### 4.3 "Focus perdido al escribir"
- **CAUSA**: El estado principal (props) se actualiza en cada tecla, forzando un re-render completo.
- **SOLUCIÓN INMUTABLE**: Usar estados locales en `MenuItemCard` y sincronizar solo al pulsar "GUARDAR".

---

## 📖 5. DICCIONARIO DE ICONOS (UX/UI)

- **☁️ Naranja (Pulsante)**: Imagen local. Acción: SE REQUIERE SUBIDA.
- **⚠️ Alerta Roja**: Fallo de conexión con Firebase. Acción: REVISAR INTERNET/REGLAS.
- **✅ Check Verde**: Cambios sincronizados con la nube.
- **💾 Botón Ámbar (Parpadeante)**: Cambios detectados sin guardar. Acción: PULSAR GUARDAR.

---

##  Aprendizajes Recientes (Learning Log)
- *15/02/2026*: El sistema de renderizado en la nube FALLA si hay blobs. Se añadió una advertencia crítica en la interfaz.
- *15/02/2026*: Firebase Storage requiere Anonymous Auth activo para que el permiso por default funcione correctamente.
- *15/02/2026*: El reproductor de Windows (Media Player) da falsos errores si se abre el video muy rápido después del render.

---

**ESTABLECIDO EL**: 15 de Febrero, 2026.
**CERTIFICADO PARA**: BoxesMedia360.
