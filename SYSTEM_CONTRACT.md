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

## ⚙️ 3. PROTOCOLO DE RENDERIZADO (GITHUB ACTIONS)

### 3.1 Cadena de Mando
1. `Editor.tsx` dispara la función `handleExportWorkflow`.
2. **Pre-vuelo**: Sincronización forzada de imágenes locales a Firebase Storage.
3. Se envía un payload JSON a GitHub Actions con la configuración final.
4. **Bandeja de Salida**: Se registra la tarea en Firestore (`renders/`) para seguimiento en tiempo real.
5. GitHub Actions renderiza y sube el resultado a Firebase Storage.
6. La interfaz actualiza el estado a "Completado" y habilita el botón de descarga.

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
- **⚠️ Alerta Roja**: Fallo de conexión con Firebase. Acción: REVISAR INTERNET/REGLAS.
- **✅ Check Verde**: Cambios sincronizados con la nube.
- **💾 Botón Ámbar (Parpadeante)**: Cambios detectados sin guardar. Acción: PULSAR GUARDAR.
- **📤 Bandeja de Salida**: Estado del render: `Queued` (Gris), `Rendering` (Azul), `Completed` (Verde), `Failed` (Rojo).

---

##  Aprendizajes Recientes (Learning Log)
- *15/02/2026*: Se implementó el "Blindaje de Resiliencia" para manejar textos largos y fallos de imagen.
- *15/02/2026*: La "Bandeja de Salida" mejora drásticamente la percepción del usuario sobre procesos largos en la nube.
- *15/02/2026*: El sistema de renderizado en la nube FALLA si hay blobs. Se añadió la auto-sincronización pre-export.

---

**ESTABLECIDO EL**: 15 de Febrero, 2026.
**CERTIFICADO PARA**: BoxesMedia360.

