# 🚨 Problema: Política de Organización Bloqueando Claves

## ❌ Error Detectado

```
Service account key creation is disabled
An Organization Policy that blocks service accounts key creation 
has been enforced on your organization.

Policy: iam.disableServiceAccountKeyCreation
Tracking: c5479561758983654
```

**Causa:** Tu organización `boxesmedia360.com` tiene restricciones de seguridad.

---

## ✅ Solución Rápida: Proyecto Personal

### Por Qué Esta Solución

- ✅ **Sin restricciones** - Control total
- ✅ **Más simple** - Configuración estándar
- ✅ **Mejor para MVP** - Ideal para desarrollo
- ✅ **$300 gratis** - Si es cuenta nueva

### Pasos Rápidos

#### 1. Crear Proyecto Personal

1. **Ir a:** https://console.cloud.google.com/projectcreate
2. **Completar:**
   - Project name: `CinematografiaMVP`
   - Organization: **"No organization"** ⚠️
   - Location: Dejar vacío
3. **Crear**

#### 2. Habilitar APIs

Abre Cloud Shell (ícono `>_` arriba a la derecha):

```bash
# Configurar proyecto
gcloud config set project TU-NUEVO-PROJECT-ID

# Habilitar APIs
gcloud services enable aiplatform.googleapis.com
gcloud services enable storage-component.googleapis.com
gcloud services enable cloudresourcemanager.googleapis.com
```

#### 3. Crear Cuenta de Servicio

```bash
# Crear cuenta
gcloud iam service-accounts create vertex-ai-user \
  --display-name="Vertex AI User MVP"

# Obtener Project ID
PROJECT_ID=$(gcloud config get-value project)

# Asignar permisos
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:vertex-ai-user@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/aiplatform.user"

# Crear clave JSON
gcloud iam service-accounts keys create vertex-ai-key.json \
  --iam-account=vertex-ai-user@${PROJECT_ID}.iam.gserviceaccount.com
```

#### 4. Descargar Clave

En Cloud Shell:
1. Menú `⋮` → **"Download file"**
2. Nombre: `vertex-ai-key.json`
3. Descargar

#### 5. Configurar Localmente

```powershell
# Navegar al proyecto
cd "C:\Users\boxes\Downloads\Habilidades de Agentes\Computational-Cinematography-MVP"

# Mover clave
Move-Item "$env:USERPROFILE\Downloads\vertex-ai-key.json" .\

# Crear .env
Copy-Item .env.example .env

# Editar
code .env
```

En `.env`, actualiza:
```env
GOOGLE_CLOUD_PROJECT_ID=tu-nuevo-project-id-aqui
```

#### 6. Probar

```powershell
node test-vertex-ai.js
```

---

## 🔄 Alternativa: gcloud CLI (Más Rápido)

Si quieres empezar YA sin crear otro proyecto:

### 1. Instalar gcloud CLI

**Descargar:** https://cloud.google.com/sdk/docs/install

**Verificar:**
```powershell
gcloud --version
```

### 2. Autenticarte

```powershell
gcloud auth application-default login
gcloud config set project proyecto-cinemamkr
```

### 3. Actualizar Código

En `src/services/vertexAI.ts`, reemplaza `getAuthToken()`:

```typescript
async function getAuthToken(): Promise<string> {
  const { execSync } = require('child_process');
  const token = execSync('gcloud auth print-access-token', {
    encoding: 'utf-8'
  }).trim();
  return token;
}
```

### 4. Configurar .env

```env
GOOGLE_CLOUD_PROJECT_ID=proyecto-cinemamkr
GOOGLE_CLOUD_REGION=us-central1
VERTEX_AI_MODEL=veo-2.0
# NO necesitas GOOGLE_APPLICATION_CREDENTIALS
```

---

## 🎯 Recomendación

**Para MVP → Usa Proyecto Personal (Solución 1)**

Razones:
- Configuración limpia y estándar
- Sin dependencias de gcloud CLI
- Funciona en cualquier entorno
- Mejor para compartir/desplegar después

---

## ❓ ¿Qué Prefieres?

**A)** Crear proyecto personal (5 min, más limpio)  
**B)** Usar gcloud CLI (2 min, más rápido pero solo local)

Dime cuál prefieres y te guío.
