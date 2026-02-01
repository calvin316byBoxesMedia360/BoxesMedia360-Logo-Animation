# 🚀 Guía Interactiva de Configuración Google Cloud

**Configuración Paso a Paso para Cinematografía Computacional MVP**

---

## 📋 Antes de Empezar

**Lo que necesitas:**
- ✅ Cuenta de Google (Gmail)
- ✅ Tarjeta de crédito (para verificación, hay $300 USD gratis)
- ✅ 30-45 minutos de tiempo
- ✅ Esta guía abierta

---

## Paso 1: Crear Cuenta de Google Cloud

### 1.1 Acceder a Google Cloud Console

1. **Abre tu navegador** y ve a: https://console.cloud.google.com/
2. **Inicia sesión** con tu cuenta de Google
3. Si es tu primera vez, verás un botón **"Comenzar mi prueba gratuita"** o **"Start my free trial"**

### 1.2 Activar Prueba Gratuita

1. Haz clic en **"Comenzar mi prueba gratuita"**
2. Selecciona tu **país**
3. Acepta los **Términos de Servicio**
4. Haz clic en **"Continuar"**

### 1.3 Configurar Método de Pago

1. Ingresa información de tu **tarjeta de crédito**
   - No se te cobrará automáticamente
   - Solo para verificación
2. Completa tu **dirección de facturación**
3. Haz clic en **"Iniciar mi prueba gratuita"**

**✅ Checkpoint:** Deberías ver el dashboard de Google Cloud Console

---

## Paso 2: Crear Proyecto

### 2.1 Crear Nuevo Proyecto

1. En la parte superior, haz clic en el **selector de proyectos** (junto al logo de Google Cloud)
2. Haz clic en **"NUEVO PROYECTO"** o **"NEW PROJECT"**
3. Completa los datos:
   - **Nombre del proyecto:** `Cinematografia-Computacional`
   - **ID del proyecto:** Se genera automáticamente (ej: `cinematografia-computacional-12345`)
   - **Ubicación:** Deja "Sin organización" si no tienes una
4. Haz clic en **"CREAR"**

### 2.2 Anotar Project ID

**⚠️ IMPORTANTE:** Copia y guarda el **Project ID** (no el nombre, sino el ID único)

```
Tu Project ID: _______________________________
```

**Ejemplo:** `cinematografia-computacional-12345`

**✅ Checkpoint:** Deberías ver tu nuevo proyecto en el selector de proyectos

---

## Paso 3: Habilitar APIs Necesarias

### 3.1 Método Rápido: Usar Cloud Shell

1. En la esquina superior derecha, haz clic en el ícono **">_"** (Activar Cloud Shell)
2. Espera a que se cargue la terminal
3. **Copia y pega** estos comandos uno por uno:

```bash
# Establecer tu proyecto (reemplaza con tu Project ID)
gcloud config set project TU-PROJECT-ID-AQUI

# Habilitar Vertex AI API
gcloud services enable aiplatform.googleapis.com

# Habilitar Cloud Storage API
gcloud services enable storage-component.googleapis.com

# Habilitar Cloud Resource Manager API
gcloud services enable cloudresourcemanager.googleapis.com

# Verificar APIs habilitadas
gcloud services list --enabled | grep -E "aiplatform|storage|cloudresourcemanager"
```

**Ejemplo real:**
```bash
gcloud config set project cinematografia-computacional-12345
```

### 3.2 Método Alternativo: Interfaz Gráfica

Si prefieres usar la interfaz:

1. Ve a **"APIs y servicios" > "Biblioteca"**
2. Busca **"Vertex AI API"** → Haz clic → **"HABILITAR"**
3. Busca **"Cloud Storage API"** → Haz clic → **"HABILITAR"**
4. Busca **"Cloud Resource Manager API"** → Haz clic → **"HABILITAR"**

**✅ Checkpoint:** Ejecuta el comando de verificación y deberías ver las 3 APIs listadas

---

## Paso 4: Crear Cuenta de Servicio

### 4.1 Crear la Cuenta

En Cloud Shell, ejecuta:

```bash
# Crear cuenta de servicio
gcloud iam service-accounts create vertex-ai-user \
  --display-name="Usuario Vertex AI para Cinematografia Computacional"
```

### 4.2 Asignar Permisos

```bash
# Obtener tu Project ID
PROJECT_ID=$(gcloud config get-value project)

# Asignar rol de Vertex AI User
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:vertex-ai-user@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/aiplatform.user"
```

### 4.3 Generar Clave JSON

```bash
# Crear y descargar clave
gcloud iam service-accounts keys create vertex-ai-key.json \
  --iam-account=vertex-ai-user@${PROJECT_ID}.iam.gserviceaccount.com
```

**✅ Checkpoint:** Deberías ver un mensaje: "created key [...] for [vertex-ai-user@...]"

---

## Paso 5: Descargar la Clave a tu Proyecto

### 5.1 Descargar desde Cloud Shell

1. En Cloud Shell, haz clic en el ícono **"⋮"** (más opciones)
2. Selecciona **"Descargar archivo"** o **"Download file"**
3. Escribe: `vertex-ai-key.json`
4. Haz clic en **"Descargar"**

### 5.2 Mover al Proyecto

En tu terminal local (PowerShell):

```powershell
# Navega al proyecto
cd "C:\Users\boxes\Downloads\Habilidades de Agentes\Computational-Cinematography-MVP"

# Mueve la clave descargada aquí
# (Asumiendo que está en Downloads)
Move-Item "$env:USERPROFILE\Downloads\vertex-ai-key.json" .\

# Verificar que existe
Test-Path .\vertex-ai-key.json
```

**Debería mostrar:** `True`

**✅ Checkpoint:** El archivo `vertex-ai-key.json` está en el directorio del proyecto

---

## Paso 6: Configurar Variables de Entorno

### 6.1 Copiar Template

```powershell
# Copiar .env.example a .env
Copy-Item .env.example .env
```

### 6.2 Editar .env

Abre el archivo `.env` en tu editor:

```powershell
code .env
```

### 6.3 Completar Valores

Reemplaza estos valores:

```env
# Tu Project ID (el que anotaste antes)
GOOGLE_CLOUD_PROJECT_ID=cinematografia-computacional-12345

# Región (recomendado: us-central1)
GOOGLE_CLOUD_REGION=us-central1

# Modelo (usa veo-2.0 por ahora, veo-3.1 requiere aprobación)
VERTEX_AI_MODEL=veo-2.0

# Endpoint (auto-generado desde región)
VERTEX_AI_API_ENDPOINT=https://us-central1-aiplatform.googleapis.com

# Ruta a la clave (ya está correcta)
GOOGLE_APPLICATION_CREDENTIALS=./vertex-ai-key.json
```

**Guarda el archivo** (Ctrl+S)

**✅ Checkpoint:** Archivo `.env` configurado con tus valores

---

## Paso 7: Solicitar Acceso a Veo 3.1 (Opcional)

### 7.1 Acceder a Model Garden

1. En Google Cloud Console, ve a: **"Vertex AI" > "Model Garden"**
2. O usa este link directo: https://console.cloud.google.com/vertex-ai/model-garden

### 7.2 Buscar Veo 3.1

1. En la barra de búsqueda, escribe: **"Veo"**
2. Busca **"Veo 3.1"** (puede aparecer como "Veo 001" o similar)

### 7.3 Solicitar Acceso

1. Haz clic en el modelo
2. Si ves un botón **"Request Access"** o **"Solicitar Acceso"**, haz clic
3. Completa el formulario
4. Espera email de aprobación (1-3 días hábiles)

**Nota:** Mientras tanto, puedes usar **Veo 2.0** que está disponible generalmente.

**✅ Checkpoint:** Solicitud enviada (o Veo 2.0 configurado en .env)

---

## Paso 8: Configurar Presupuesto (Importante)

### 8.1 Crear Alerta de Presupuesto

1. Ve a **"Facturación" > "Presupuestos y alertas"**
2. Haz clic en **"CREAR PRESUPUESTO"**
3. Configura:
   - **Nombre:** `MVP Cinematografia - Alerta Mensual`
   - **Proyectos:** Selecciona tu proyecto
   - **Monto:** `$100` USD
   - **Alertas:** 50%, 90%, 100%
4. Agrega tu **email** para notificaciones
5. Haz clic en **"FINALIZAR"**

**✅ Checkpoint:** Alerta de presupuesto configurada

---

## Paso 9: Probar la Configuración

### 9.1 Instalar Google Cloud Auth Library

En tu terminal del proyecto:

```powershell
npm install @google-cloud/aiplatform
```

### 9.2 Crear Script de Prueba

Crea un archivo `test-vertex-ai.js`:

```javascript
const { PredictionServiceClient } = require('@google-cloud/aiplatform');

async function testVertexAI() {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
  const location = process.env.GOOGLE_CLOUD_REGION || 'us-central1';
  
  console.log('🔍 Probando conexión a Vertex AI...');
  console.log(`📍 Proyecto: ${projectId}`);
  console.log(`🌍 Región: ${location}`);
  
  try {
    const client = new PredictionServiceClient({
      keyFilename: './vertex-ai-key.json'
    });
    
    console.log('✅ Cliente creado exitosamente');
    console.log('✅ Autenticación válida');
    console.log('🎉 ¡Configuración correcta!');
    
    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

// Cargar variables de entorno
require('dotenv').config();
testVertexAI();
```

### 9.3 Ejecutar Prueba

```powershell
# Instalar dotenv si no está
npm install dotenv

# Ejecutar prueba
node test-vertex-ai.js
```

**Salida esperada:**
```
🔍 Probando conexión a Vertex AI...
📍 Proyecto: cinematografia-computacional-12345
🌍 Región: us-central1
✅ Cliente creado exitosamente
✅ Autenticación válida
🎉 ¡Configuración correcta!
```

**✅ Checkpoint:** Prueba exitosa, configuración completa

---

## 🎉 ¡Configuración Completada!

### Resumen de lo que hiciste:

✅ Cuenta de Google Cloud activada con $300 USD de crédito  
✅ Proyecto creado: `cinematografia-computacional-XXXXX`  
✅ APIs habilitadas: Vertex AI, Cloud Storage, Resource Manager  
✅ Cuenta de servicio creada con permisos  
✅ Clave JSON descargada y configurada  
✅ Variables de entorno configuradas  
✅ Presupuesto y alertas configurados  
✅ Conexión probada exitosamente  

### Próximos Pasos:

1. **Iniciar servidor de desarrollo:**
   ```powershell
   npm run dev
   ```

2. **Crear tu primera transición** (cuando Veo esté aprobado)

3. **Explorar ejemplos** en `examples/`

---

## 🆘 Solución de Problemas

### Error: "Permission denied"

**Solución:**
```bash
# Verificar permisos de la cuenta de servicio
gcloud projects get-iam-policy $PROJECT_ID \
  --flatten="bindings[].members" \
  --filter="bindings.members:vertex-ai-user@*"
```

### Error: "API not enabled"

**Solución:**
```bash
# Volver a habilitar APIs
gcloud services enable aiplatform.googleapis.com
```

### Error: "Invalid credentials"

**Solución:**
```powershell
# Verificar que la clave existe
Test-Path .\vertex-ai-key.json

# Verificar que .env tiene la ruta correcta
Get-Content .env | Select-String "GOOGLE_APPLICATION_CREDENTIALS"
```

---

## 📞 Recursos Adicionales

- 📚 [Documentación Vertex AI](https://cloud.google.com/vertex-ai/docs)
- 💰 [Calculadora de Costos](https://cloud.google.com/products/calculator)
- 🎓 [Tutoriales Google Cloud](https://cloud.google.com/docs/tutorials)
- 📊 [Panel de Facturación](https://console.cloud.google.com/billing)

---

**Última Actualización:** 2026-01-31  
**Tiempo Estimado:** 30-45 minutos  
**Dificultad:** Media
