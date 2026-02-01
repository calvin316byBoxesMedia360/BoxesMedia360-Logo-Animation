# Guía de Configuración - Español

**Configuración Completa de Google Cloud y Vertex AI para el MVP de Cinematografía Computacional**

---

## 📋 Índice

1. [Prerequisitos](#prerequisitos)
2. [Configuración del Proyecto Google Cloud](#configuración-del-proyecto-google-cloud)
3. [Configuración de Vertex AI](#configuración-de-vertex-ai)
4. [Configuración del Entorno Local](#configuración-del-entorno-local)
5. [Prueba de la Integración](#prueba-de-la-integración)
6. [Solución de Problemas](#solución-de-problemas)

---

## Prerequisitos

Antes de comenzar, asegúrate de tener:

- ✅ **Node.js 18.0.0 o superior** ([Descargar](https://nodejs.org/))
- ✅ **npm** (viene con Node.js)
- ✅ **Cuenta de Google Cloud** ([Registrarse](https://cloud.google.com/))
- ✅ **Tarjeta de crédito** (para facturación de Google Cloud, nivel gratuito disponible)
- ✅ **Git** (opcional, para control de versiones)

### Verificar Prerequisitos

```bash
# Verificar versión de Node.js
node --version
# Debería mostrar: v18.0.0 o superior

# Verificar versión de npm
npm --version
# Debería mostrar: 8.0.0 o superior
```

---

## Configuración del Proyecto Google Cloud

### Paso 1: Crear un Proyecto de Google Cloud

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Haz clic en **Seleccionar un proyecto** → **Nuevo Proyecto**
3. Ingresa los detalles del proyecto:
   - **Nombre del proyecto**: `cinematografia-computacional`
   - **Organización**: (opcional)
   - **Ubicación**: (opcional)
4. Haz clic en **Crear**
5. **Anota tu ID de Proyecto** (ej., `cinematografia-computacional-12345`)

### Paso 2: Habilitar Facturación

1. En Cloud Console, ve a **Facturación** → **Vincular una cuenta de facturación**
2. Crea una nueva cuenta de facturación o selecciona una existente
3. Ingresa información de pago
4. **Importante**: Configura alertas de presupuesto para evitar cargos inesperados
   - Ve a **Facturación** → **Presupuestos y alertas**
   - Haz clic en **Crear Presupuesto**
   - Establece monto: `$100/mes` (recomendado para pruebas)
   - Habilita alertas por correo al 50%, 90% y 100%

### Paso 3: Habilitar APIs Requeridas

Ejecuta estos comandos en [Cloud Shell](https://shell.cloud.google.com/) o tu terminal local (con CLI `gcloud` instalado):

```bash
# Establece tu ID de proyecto
export PROJECT_ID="tu-id-de-proyecto-aqui"
gcloud config set project $PROJECT_ID

# Habilitar API de Vertex AI
gcloud services enable aiplatform.googleapis.com

# Habilitar API de Cloud Storage (para assets)
gcloud services enable storage-component.googleapis.com

# Habilitar API de Cloud Resource Manager
gcloud services enable cloudresourcemanager.googleapis.com

# Verificar servicios habilitados
gcloud services list --enabled
```

**Salida esperada**: Deberías ver `aiplatform.googleapis.com` en la lista.

---

## Configuración de Vertex AI

### Paso 1: Configurar Autenticación

#### Opción A: Cuenta de Servicio (Recomendado para Producción)

1. **Crear una Cuenta de Servicio**:
   ```bash
   gcloud iam service-accounts create usuario-vertex-ai \
     --display-name="Usuario Vertex AI para Cinematografía Computacional"
   ```

2. **Otorgar Permisos**:
   ```bash
   gcloud projects add-iam-policy-binding $PROJECT_ID \
     --member="serviceAccount:usuario-vertex-ai@${PROJECT_ID}.iam.gserviceaccount.com" \
     --role="roles/aiplatform.user"
   ```

3. **Crear y Descargar Clave**:
   ```bash
   gcloud iam service-accounts keys create vertex-ai-key.json \
     --iam-account=usuario-vertex-ai@${PROJECT_ID}.iam.gserviceaccount.com
   ```

4. **Asegurar la Clave**:
   ```bash
   # Mover al directorio del proyecto
   mv vertex-ai-key.json ~/ruta/a/Computational-Cinematography-MVP/
   
   # Establecer permisos restrictivos
   chmod 600 vertex-ai-key.json
   ```

#### Opción B: Cuenta de Usuario (Para Desarrollo/Pruebas)

```bash
# Autenticarse con tu cuenta de Google
gcloud auth application-default login

# Sigue las instrucciones del navegador para iniciar sesión
```

### Paso 2: Configurar Región de Vertex AI

Elige una región cercana a tu ubicación para menor latencia:

| Región | Ubicación | Soporte Veo 3.1 |
|--------|-----------|-----------------|
| `us-central1` | Iowa, EE.UU. | ✅ Sí |
| `us-east4` | Virginia, EE.UU. | ✅ Sí |
| `europe-west4` | Países Bajos | ✅ Sí |
| `asia-southeast1` | Singapur | ⚠️ Limitado |

**Establece tu región**:
```bash
export VERTEX_AI_REGION="us-central1"
```

### Paso 3: Solicitar Acceso a Veo 3.1

**Importante**: Veo 3.1 puede requerir acceso por lista de permitidos.

1. Ve a [Vertex AI Model Garden](https://console.cloud.google.com/vertex-ai/model-garden)
2. Busca "Veo 3.1"
3. Haz clic en **Solicitar Acceso** si se te solicita
4. Completa el formulario de solicitud de acceso
5. Espera el correo de aprobación (usualmente 1-3 días hábiles)

**Alternativa**: Usa Veo 2.0 (disponible generalmente) para pruebas:
```bash
export VEO_MODEL_VERSION="veo-2.0"
```

### Paso 4: Probar Acceso a Vertex AI

```bash
# Probar llamada API
curl -X POST \
  -H "Authorization: Bearer $(gcloud auth print-access-token)" \
  -H "Content-Type: application/json" \
  https://${VERTEX_AI_REGION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${VERTEX_AI_REGION}/publishers/google/models/veo-3.1:predict \
  -d '{
    "instances": [{
      "prompt": "Una generación de video de prueba"
    }]
  }'
```

**Respuesta esperada**: JSON con array `predictions` (o error de cuota si aún no está aprobado).

---

## Configuración del Entorno Local

### Paso 1: Clonar/Navegar al Proyecto

```bash
cd ~/ruta/a/Computational-Cinematography-MVP
```

### Paso 2: Instalar Dependencias

```bash
npm install
```

**Salida esperada**: `added 387 packages` (puede variar ligeramente).

### Paso 3: Configurar Variables de Entorno

1. **Copiar la plantilla**:
   ```bash
   cp .env.example .env
   ```

2. **Editar archivo `.env`**:
   ```bash
   # Abrir en tu editor preferido
   nano .env
   # o
   code .env
   ```

3. **Completar los valores**:
   ```env
   # Configuración de Google Cloud
   GOOGLE_CLOUD_PROJECT_ID=tu-id-de-proyecto-aqui
   GOOGLE_CLOUD_REGION=us-central1
   
   # Configuración de Vertex AI
   VERTEX_AI_MODEL=veo-3.1
   VERTEX_AI_API_ENDPOINT=https://us-central1-aiplatform.googleapis.com
   
   # Autenticación
   # Opción A: Cuenta de Servicio (recomendado)
   GOOGLE_APPLICATION_CREDENTIALS=./vertex-ai-key.json
   
   # Opción B: Cuenta de Usuario (comentar si usas cuenta de servicio)
   # GOOGLE_AUTH_TYPE=user
   
   # Opcional: Configuración de Rendimiento
   MAX_CONCURRENT_RENDERS=2
   RENDER_TIMEOUT_MS=300000
   ```

4. **Guardar y cerrar** el archivo.

### Paso 4: Validar Configuración

```bash
# Ejecutar script de validación
npm run validate-setup
```

**Salida esperada**:
```
✅ Versión de Node.js: v18.0.0 (OK)
✅ Versión de npm: 8.0.0 (OK)
✅ Variables de entorno: Todas configuradas
✅ Credenciales de Google Cloud: Válidas
✅ Conexión a Vertex AI: Exitosa
✅ ¡Proyecto listo!
```

---

## Prueba de la Integración

### Paso 1: Iniciar Servidor de Desarrollo

```bash
npm run dev
```

**Salida esperada**:
```
¡Remotion Studio iniciado!
Ver en: http://localhost:3000
```

### Paso 2: Abrir Navegador

Navega a `http://localhost:3000` en tu navegador.

### Paso 3: Probar Transición Básica

1. En Remotion Studio, selecciona la composición **"Transición Básica"**
2. Sube dos imágenes de prueba como keyframes
3. Haz clic en **"Generar Transición"**
4. Espera a que Vertex AI procese (puede tomar 30-60 segundos)
5. Previsualiza la transición generada

### Paso 4: Renderizar Video de Prueba

```bash
npx remotion render src/index.ts transicion-basica out/prueba.mp4
```

**Salida esperada**:
```
Renderizando frames...
[████████████████████████████████] 100%
Video guardado en: out/prueba.mp4
Duración: 8 segundos
Resolución: 1920x1080
```

---

## Solución de Problemas

### Problema: "Clave API no válida"

**Solución**:
1. Verifica que tu clave de cuenta de servicio esté en la ubicación correcta
2. Revisa permisos del archivo: `chmod 600 vertex-ai-key.json`
3. Asegúrate de que la ruta `GOOGLE_APPLICATION_CREDENTIALS` sea correcta en `.env`

### Problema: "Cuota excedida"

**Solución**:
1. Revisa tu cuota de Vertex AI: [Página de Cuotas](https://console.cloud.google.com/iam-admin/quotas)
2. Solicita aumento de cuota si es necesario
3. Espera el reinicio de cuota (usualmente diario)

### Problema: "Modelo no encontrado: veo-3.1"

**Solución**:
1. Verifica que tienes acceso a Veo 3.1 (revisa correo de aprobación)
2. Intenta usar `veo-2.0` en su lugar en `.env`
3. Asegúrate de que la región soporte Veo 3.1 (usa `us-central1`)

### Problema: "Timeout de renderizado"

**Solución**:
1. Aumenta `RENDER_TIMEOUT_MS` en `.env`
2. Verifica estabilidad de conexión a internet
3. Verifica estado del servicio Vertex AI: [Panel de Estado](https://status.cloud.google.com/)

### Problema: "Módulo no encontrado"

**Solución**:
```bash
# Limpiar caché de npm y reinstalar
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

---

## Próximos Pasos

✅ **¡Configuración completa!** Estás listo para crear transiciones imposibles.

**Pasos recomendados**:

1. 📖 Lee la [Referencia de API](./API_REFERENCE.md) para uso avanzado
2. 🎯 Prueba el [Ejemplo de Transición Básica](../examples/transicion-basica/)
3. 🚀 Explora [Ejemplos Avanzados](../examples/advanced/)
4. 📋 Revisa el [Contrato del Sistema](../SYSTEM_CONTRACT.md) para flujos de trabajo

---

## Estimación de Costos

**Costos estimados para pruebas** (primer mes):

| Servicio | Uso | Costo |
|---------|-----|-------|
| Vertex AI (Veo 3.1) | 20 videos @ 8s cada uno | ~$100-200 |
| Cloud Storage | 10 GB | ~$0.20 |
| Networking | 50 GB egreso | ~$5 |
| **Total** | | **~$105-205** |

**Consejos para reducir costos**:
- Usa videos más cortos (4s en lugar de 8s)
- Elimina videos generados de Cloud Storage después de descargar
- Usa `veo-2.0` en lugar de `veo-3.1` (más económico)
- Configura alertas de presupuesto

---

## Soporte

**¿Necesitas ayuda?**

- 📚 Revisa la [Guía de Solución de Problemas](./TROUBLESHOOTING.md)
- 💬 Revisa el [Contrato del Sistema](../SYSTEM_CONTRACT.md)
- 📝 Consulta el [Registro de Aprendizaje](../LEARNING_LOG.md) para problemas comunes
- 🌐 [Documentación de Remotion](https://www.remotion.dev/docs)
- ☁️ [Documentación de Vertex AI](https://cloud.google.com/vertex-ai/docs)

---

**Última Actualización**: 2026-01-31

**Versión**: 1.0.0
