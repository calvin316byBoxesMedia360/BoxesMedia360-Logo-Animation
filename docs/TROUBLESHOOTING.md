# Troubleshooting Guide
# Guía de Solución de Problemas

**Common Issues and Solutions / Problemas Comunes y Soluciones**

---

## 🇬🇧 English

### Installation Issues

#### Problem: `npm install` fails

**Symptoms:**
- Error messages during dependency installation
- Missing packages

**Solutions:**

1. **Clear npm cache:**
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Check Node.js version:**
   ```bash
   node --version  # Must be >= 18.0.0
   ```

3. **Use npm instead of yarn:**
   ```bash
   npm install
   ```

---

### Authentication Issues

#### Problem: "API key not valid" or "Authentication failed"

**Solutions:**

1. **Verify service account key location:**
   ```bash
   ls -la vertex-ai-key.json
   # File should exist and have 600 permissions
   ```

2. **Check `.env` configuration:**
   ```env
   GOOGLE_APPLICATION_CREDENTIALS=./vertex-ai-key.json
   ```

3. **Test authentication:**
   ```bash
   gcloud auth application-default login
   gcloud auth print-access-token
   ```

4. **Regenerate service account key:**
   ```bash
   gcloud iam service-accounts keys create new-key.json \
     --iam-account=vertex-ai-user@PROJECT_ID.iam.gserviceaccount.com
   ```

---

### Vertex AI Issues

#### Problem: "Quota exceeded"

**Solutions:**

1. **Check current quota:**
   - Go to [Quotas Page](https://console.cloud.google.com/iam-admin/quotas)
   - Search for "Vertex AI"
   - Check "Predictions per minute"

2. **Request quota increase:**
   - Click "Edit Quotas"
   - Select quota to increase
   - Submit request (usually approved within 24 hours)

3. **Reduce concurrent requests:**
   ```env
   MAX_CONCURRENT_API_REQUESTS=1
   ```

#### Problem: "Model not found: veo-3.1"

**Solutions:**

1. **Check Veo 3.1 access:**
   - Verify approval email from Google
   - Check [Model Garden](https://console.cloud.google.com/vertex-ai/model-garden)

2. **Use Veo 2.0 instead:**
   ```env
   VERTEX_AI_MODEL=veo-2.0
   ```

3. **Verify region support:**
   ```env
   GOOGLE_CLOUD_REGION=us-central1  # Recommended
   ```

---

### Rendering Issues

#### Problem: "Rendering timeout"

**Solutions:**

1. **Increase timeout:**
   ```env
   RENDER_TIMEOUT_MS=600000  # 10 minutes
   ```

2. **Check internet connection:**
   ```bash
   ping -c 4 google.com
   ```

3. **Reduce video duration:**
   ```typescript
   duration: 4  // Instead of 8
   ```

#### Problem: "Out of memory" during render

**Solutions:**

1. **Reduce concurrent renders:**
   ```env
   MAX_CONCURRENT_RENDERS=1
   ```

2. **Lower resolution:**
   ```env
   DEFAULT_RESOLUTION=720p
   ```

3. **Close other applications**

---

### Development Server Issues

#### Problem: "Port 3000 already in use"

**Solutions:**

1. **Use different port:**
   ```env
   PORT=3001
   ```

2. **Kill process on port 3000:**
   ```bash
   # Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   
   # Mac/Linux
   lsof -ti:3000 | xargs kill -9
   ```

---

## 🇪🇸 Español

### Problemas de Instalación

#### Problema: `npm install` falla

**Síntomas:**
- Mensajes de error durante instalación de dependencias
- Paquetes faltantes

**Soluciones:**

1. **Limpiar caché de npm:**
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Verificar versión de Node.js:**
   ```bash
   node --version  # Debe ser >= 18.0.0
   ```

3. **Usar npm en lugar de yarn:**
   ```bash
   npm install
   ```

---

### Problemas de Autenticación

#### Problema: "Clave API no válida" o "Autenticación fallida"

**Soluciones:**

1. **Verificar ubicación de clave de cuenta de servicio:**
   ```bash
   ls -la vertex-ai-key.json
   # El archivo debe existir y tener permisos 600
   ```

2. **Verificar configuración de `.env`:**
   ```env
   GOOGLE_APPLICATION_CREDENTIALS=./vertex-ai-key.json
   ```

3. **Probar autenticación:**
   ```bash
   gcloud auth application-default login
   gcloud auth print-access-token
   ```

4. **Regenerar clave de cuenta de servicio:**
   ```bash
   gcloud iam service-accounts keys create nueva-clave.json \
     --iam-account=usuario-vertex-ai@PROJECT_ID.iam.gserviceaccount.com
   ```

---

### Problemas de Vertex AI

#### Problema: "Cuota excedida"

**Soluciones:**

1. **Verificar cuota actual:**
   - Ir a [Página de Cuotas](https://console.cloud.google.com/iam-admin/quotas)
   - Buscar "Vertex AI"
   - Verificar "Predicciones por minuto"

2. **Solicitar aumento de cuota:**
   - Hacer clic en "Editar Cuotas"
   - Seleccionar cuota a aumentar
   - Enviar solicitud (usualmente aprobada en 24 horas)

3. **Reducir solicitudes concurrentes:**
   ```env
   MAX_CONCURRENT_API_REQUESTS=1
   ```

#### Problema: "Modelo no encontrado: veo-3.1"

**Soluciones:**

1. **Verificar acceso a Veo 3.1:**
   - Verificar correo de aprobación de Google
   - Revisar [Model Garden](https://console.cloud.google.com/vertex-ai/model-garden)

2. **Usar Veo 2.0 en su lugar:**
   ```env
   VERTEX_AI_MODEL=veo-2.0
   ```

3. **Verificar soporte de región:**
   ```env
   GOOGLE_CLOUD_REGION=us-central1  # Recomendado
   ```

---

### Problemas de Renderizado

#### Problema: "Timeout de renderizado"

**Soluciones:**

1. **Aumentar timeout:**
   ```env
   RENDER_TIMEOUT_MS=600000  # 10 minutos
   ```

2. **Verificar conexión a internet:**
   ```bash
   ping -c 4 google.com
   ```

3. **Reducir duración del video:**
   ```typescript
   duration: 4  // En lugar de 8
   ```

#### Problema: "Sin memoria" durante renderizado

**Soluciones:**

1. **Reducir renderizados concurrentes:**
   ```env
   MAX_CONCURRENT_RENDERS=1
   ```

2. **Reducir resolución:**
   ```env
   DEFAULT_RESOLUTION=720p
   ```

3. **Cerrar otras aplicaciones**

---

### Problemas del Servidor de Desarrollo

#### Problema: "Puerto 3000 ya en uso"

**Soluciones:**

1. **Usar puerto diferente:**
   ```env
   PORT=3001
   ```

2. **Terminar proceso en puerto 3000:**
   ```bash
   # Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   
   # Mac/Linux
   lsof -ti:3000 | xargs kill -9
   ```

---

## 📞 Getting Help / Obtener Ayuda

If you continue to experience issues:

Si continúas experimentando problemas:

1. Check [Learning Log](../LEARNING_LOG.md) for similar issues
2. Review [System Contract](../SYSTEM_CONTRACT.md) for workflows
3. Consult [Remotion Docs](https://www.remotion.dev/docs)
4. Check [Vertex AI Status](https://status.cloud.google.com/)

---

**Last Updated**: 2026-01-31  
**Version**: 1.0.0
