# SYSTEM CONTRACT
# CONTRATO DEL SISTEMA

**Computational Cinematography MVP - System Rules and Workflows**

**MVP de Cinematografía Computacional - Reglas y Flujos de Trabajo del Sistema**

---

## 📋 Table of Contents / Índice

### English
1. [System Overview](#system-overview)
2. [Core Principles](#core-principles)
3. [Instruction Chain](#instruction-chain)
4. [Workflows](#workflows)
5. [Error Handling](#error-handling)
6. [Learning Protocol](#learning-protocol)

### Español
1. [Visión General del Sistema](#visión-general-del-sistema)
2. [Principios Fundamentales](#principios-fundamentales)
3. [Cadena de Instrucciones](#cadena-de-instrucciones)
4. [Flujos de Trabajo](#flujos-de-trabajo)
5. [Manejo de Errores](#manejo-de-errores)
6. [Protocolo de Aprendizaje](#protocolo-de-aprendizaje)

---

# 🇬🇧 ENGLISH VERSION

## System Overview

This system is designed to create "impossible" video transitions using AI-powered generative models (Veo 3.1) orchestrated through Remotion. The system operates as a **bilingual, learning-enabled platform** that adapts to user interactions.

### Core Components

1. **Remotion Engine** - Video composition and orchestration
2. **Vertex AI Service** - Veo 3.1 model integration
3. **Learning System** - Continuous improvement through interaction logging
4. **Bilingual Interface** - Full EN/ES support

---

## Core Principles

### 1. Language Freedom

**Rule**: The user can interact in **English** or **Spanish** at any time, and the system will respond in the same language.

**Implementation**:
- Detect user language from input
- Maintain language consistency within a session
- All error messages, logs, and outputs must be bilingual

**Example**:
```typescript
// Auto-detect and respond in user's language
function detectLanguage(input: string): 'en' | 'es' {
  const spanishKeywords = ['crear', 'generar', 'renderizar', 'configurar'];
  const hasSpanish = spanishKeywords.some(kw => input.toLowerCase().includes(kw));
  return hasSpanish ? 'es' : 'en';
}
```

### 2. Learning Commitment

**Rule**: The system **must learn from every interaction** and improve over time.

**Implementation**:
- Log every user command to `LEARNING_LOG.md`
- Store structured feedback in `LEARNING_FEEDBACK.json`
- Analyze patterns to optimize workflows
- Update documentation based on common issues

**Logging Format**:
```json
{
  "timestamp": "2026-01-31T22:00:00Z",
  "language": "en",
  "command": "render transition",
  "success": true,
  "duration_ms": 45000,
  "feedback": "User requested faster rendering",
  "improvement_action": "Document GPU optimization"
}
```

### 3. Detailed Documentation

**Rule**: Every feature, API call, and workflow must be **exhaustively documented** in both languages.

**Standards**:
- Code comments in English
- User-facing docs in EN/ES
- Examples for every use case
- Troubleshooting for every error

---

## Instruction Chain

This section defines the **step-by-step execution flow** for all operations.

### Chain 1: Project Initialization

**Trigger**: User wants to start a new video project

**Steps**:

1. **Verify Prerequisites**
   ```bash
   # Check Node.js version
   node --version  # Must be >= 18.0.0
   
   # Check npm
   npm --version
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   ```bash
   # Copy template
   cp .env.example .env
   
   # User must fill:
   # - GOOGLE_CLOUD_PROJECT_ID
   # - GOOGLE_CLOUD_REGION
   # - VERTEX_AI_API_KEY
   ```

4. **Validate Setup**
   ```bash
   npm run validate-setup
   ```

5. **Log Initialization**
   - Update `LEARNING_LOG.md` with setup details
   - Record any issues encountered

**Success Criteria**:
- ✅ All dependencies installed
- ✅ Environment variables configured
- ✅ Vertex AI connection tested
- ✅ Dev server starts successfully

---

### Chain 2: Creating a Transition

**Trigger**: User wants to generate an "impossible" transition between two keyframes

**Steps**:

1. **Prepare Keyframes**
   ```typescript
   // User provides two images
   const keyframeA = './assets/keyframe-a.jpg';
   const keyframeB = './assets/keyframe-b.jpg';
   ```

2. **Configure Transition**
   ```typescript
   const transitionConfig = {
     duration: 8, // seconds
     prompt: "Camera moves through a solid wall",
     style: "cinematic",
     resolution: "1080p"
   };
   ```

3. **Call Vertex AI**
   ```typescript
   import { generateVeoTransition } from './services/vertexAI';
   
   const result = await generateVeoTransition({
     firstFrame: keyframeA,
     lastFrame: keyframeB,
     config: transitionConfig
   });
   ```

4. **Compose in Remotion**
   ```typescript
   <Composition
     id="impossible-transition"
     component={VeoTransition}
     durationInFrames={240}
     fps={30}
     width={1920}
     height={1080}
     defaultProps={{
       videoUrl: result.videoUri
     }}
   />
   ```

5. **Render Video**
   ```bash
   npx remotion render src/index.ts impossible-transition out/transition.mp4
   ```

6. **Log Interaction**
   - Record generation parameters
   - Note rendering time
   - Capture user feedback

**Success Criteria**:
- ✅ Veo 3.1 generates transition successfully
- ✅ Video renders without errors
- ✅ Output quality meets expectations
- ✅ Interaction logged for learning

---

### Chain 3: Error Recovery

**Trigger**: Any operation fails

**Steps**:

1. **Capture Error**
   ```typescript
   try {
     await generateVeoTransition(config);
   } catch (error) {
     logError(error, 'en'); // or 'es'
   }
   ```

2. **Classify Error**
   - **API Error**: Vertex AI connection/quota issues
   - **Configuration Error**: Missing/invalid environment variables
   - **Rendering Error**: Remotion composition issues
   - **User Error**: Invalid input parameters

3. **Provide Bilingual Solution**
   ```typescript
   const errorMessages = {
     API_QUOTA_EXCEEDED: {
       en: "Vertex AI quota exceeded. Please check your billing.",
       es: "Cuota de Vertex AI excedida. Por favor revisa tu facturación."
     }
   };
   ```

4. **Log for Learning**
   ```json
   {
     "error_type": "API_QUOTA_EXCEEDED",
     "frequency": 3,
     "suggested_fix": "Add quota monitoring to docs"
   }
   ```

5. **Update Documentation**
   - Add error to `TROUBLESHOOTING.md`
   - Update FAQ if recurring

**Success Criteria**:
- ✅ Error clearly explained in user's language
- ✅ Solution provided
- ✅ Error logged for pattern analysis
- ✅ Documentation updated if needed

---

## Workflows

### Workflow 1: Basic Transition (Beginner)

**Goal**: Create a simple transition between two images

**Time**: ~10 minutes

**Steps**:

1. Place two images in `assets/` folder
2. Run development server: `npm run dev`
3. Open browser to `http://localhost:3000`
4. Select "Basic Transition" template
5. Upload keyframe A and keyframe B
6. Click "Generate Transition"
7. Preview result
8. Click "Render Video"

**Expected Output**: MP4 file with 8-second transition

---

### Workflow 2: Advanced Multi-Scene (Intermediate)

**Goal**: Chain multiple transitions for a longer sequence

**Time**: ~30 minutes

**Steps**:

1. Prepare 4+ keyframes
2. Create composition with multiple `<Sequence>` components
3. Configure each transition with unique prompts
4. Use Scene Extension technique for coherence
5. Render full sequence

**Expected Output**: MP4 file with 30+ second sequence

---

### Workflow 3: Custom API Integration (Advanced)

**Goal**: Integrate custom Vertex AI parameters

**Time**: ~1 hour

**Steps**:

1. Review `src/services/vertexAI.ts`
2. Modify API call parameters
3. Add custom preprocessing
4. Test with sample keyframes
5. Document changes

**Expected Output**: Custom-tuned transition generator

---

## Error Handling

### Error Categories

| Category | Severity | Auto-Retry | User Action Required |
|----------|----------|------------|---------------------|
| Network Timeout | Medium | Yes (3x) | Check internet connection |
| API Quota | High | No | Increase quota or wait |
| Invalid Config | Low | No | Fix configuration |
| Rendering Failure | Medium | Yes (1x) | Check logs |

### Error Response Protocol

**For ALL errors**:

1. **Log immediately** to `LEARNING_LOG.md`
2. **Display bilingual message** to user
3. **Suggest solution** based on error type
4. **Update metrics** in `LEARNING_FEEDBACK.json`

**Example**:
```typescript
function handleError(error: Error, language: 'en' | 'es') {
  // 1. Log
  logToLearningSystem(error);
  
  // 2. Display
  const message = getErrorMessage(error.code, language);
  console.error(message);
  
  // 3. Suggest
  const solution = getSolution(error.code, language);
  console.log(solution);
  
  // 4. Update metrics
  updateFeedbackMetrics(error.code);
}
```

---

## Learning Protocol

### Continuous Improvement Process

**Every 10 interactions**:

1. **Analyze Patterns**
   - Most common errors
   - Average rendering times
   - User language preferences
   - Feature usage frequency

2. **Update Documentation**
   - Add new examples for common use cases
   - Improve error messages
   - Optimize workflows

3. **Optimize Code**
   - Cache frequently used API calls
   - Improve rendering performance
   - Reduce memory usage

4. **Report Insights**
   - Generate summary in `LEARNING_LOG.md`
   - Update `LEARNING_FEEDBACK.json` metrics

### Feedback Collection

**After every render**:

```typescript
function collectFeedback() {
  const feedback = {
    quality: prompt("Rate quality (1-5):"),
    speed: prompt("Rate speed (1-5):"),
    suggestions: prompt("Any suggestions?")
  };
  
  saveFeedback(feedback);
}
```

---

# 🇪🇸 VERSIÓN EN ESPAÑOL

## Visión General del Sistema

Este sistema está diseñado para crear transiciones de video "imposibles" usando modelos generativos de IA (Veo 3.1) orquestados a través de Remotion. El sistema opera como una **plataforma bilingüe con capacidad de aprendizaje** que se adapta a las interacciones del usuario.

### Componentes Principales

1. **Motor Remotion** - Composición y orquestación de video
2. **Servicio Vertex AI** - Integración del modelo Veo 3.1
3. **Sistema de Aprendizaje** - Mejora continua mediante registro de interacciones
4. **Interfaz Bilingüe** - Soporte completo EN/ES

---

## Principios Fundamentales

### 1. Libertad de Idioma

**Regla**: El usuario puede interactuar en **Inglés** o **Español** en cualquier momento, y el sistema responderá en el mismo idioma.

**Implementación**:
- Detectar idioma del usuario desde la entrada
- Mantener consistencia de idioma dentro de una sesión
- Todos los mensajes de error, logs y salidas deben ser bilingües

**Ejemplo**:
```typescript
// Auto-detectar y responder en el idioma del usuario
function detectLanguage(input: string): 'en' | 'es' {
  const spanishKeywords = ['crear', 'generar', 'renderizar', 'configurar'];
  const hasSpanish = spanishKeywords.some(kw => input.toLowerCase().includes(kw));
  return hasSpanish ? 'es' : 'en';
}
```

### 2. Compromiso de Aprendizaje

**Regla**: El sistema **debe aprender de cada interacción** y mejorar con el tiempo.

**Implementación**:
- Registrar cada comando del usuario en `LEARNING_LOG.md`
- Almacenar feedback estructurado en `LEARNING_FEEDBACK.json`
- Analizar patrones para optimizar flujos de trabajo
- Actualizar documentación basándose en problemas comunes

**Formato de Registro**:
```json
{
  "timestamp": "2026-01-31T22:00:00Z",
  "language": "es",
  "command": "renderizar transición",
  "success": true,
  "duration_ms": 45000,
  "feedback": "Usuario solicitó renderizado más rápido",
  "improvement_action": "Documentar optimización de GPU"
}
```

### 3. Documentación Detallada

**Regla**: Cada característica, llamada API y flujo de trabajo debe estar **exhaustivamente documentado** en ambos idiomas.

**Estándares**:
- Comentarios de código en inglés
- Documentación para usuarios en EN/ES
- Ejemplos para cada caso de uso
- Solución de problemas para cada error

---

## Cadena de Instrucciones

Esta sección define el **flujo de ejecución paso a paso** para todas las operaciones.

### Cadena 1: Inicialización del Proyecto

**Disparador**: El usuario quiere iniciar un nuevo proyecto de video

**Pasos**:

1. **Verificar Prerequisitos**
   ```bash
   # Verificar versión de Node.js
   node --version  # Debe ser >= 18.0.0
   
   # Verificar npm
   npm --version
   ```

2. **Instalar Dependencias**
   ```bash
   npm install
   ```

3. **Configurar Entorno**
   ```bash
   # Copiar plantilla
   cp .env.example .env
   
   # El usuario debe completar:
   # - GOOGLE_CLOUD_PROJECT_ID
   # - GOOGLE_CLOUD_REGION
   # - VERTEX_AI_API_KEY
   ```

4. **Validar Configuración**
   ```bash
   npm run validate-setup
   ```

5. **Registrar Inicialización**
   - Actualizar `LEARNING_LOG.md` con detalles de configuración
   - Registrar cualquier problema encontrado

**Criterios de Éxito**:
- ✅ Todas las dependencias instaladas
- ✅ Variables de entorno configuradas
- ✅ Conexión a Vertex AI probada
- ✅ Servidor de desarrollo inicia exitosamente

---

### Cadena 2: Crear una Transición

**Disparador**: El usuario quiere generar una transición "imposible" entre dos keyframes

**Pasos**:

1. **Preparar Keyframes**
   ```typescript
   // El usuario proporciona dos imágenes
   const keyframeA = './assets/keyframe-a.jpg';
   const keyframeB = './assets/keyframe-b.jpg';
   ```

2. **Configurar Transición**
   ```typescript
   const transitionConfig = {
     duration: 8, // segundos
     prompt: "La cámara se mueve a través de una pared sólida",
     style: "cinematográfico",
     resolution: "1080p"
   };
   ```

3. **Llamar a Vertex AI**
   ```typescript
   import { generateVeoTransition } from './services/vertexAI';
   
   const result = await generateVeoTransition({
     firstFrame: keyframeA,
     lastFrame: keyframeB,
     config: transitionConfig
   });
   ```

4. **Componer en Remotion**
   ```typescript
   <Composition
     id="transicion-imposible"
     component={VeoTransition}
     durationInFrames={240}
     fps={30}
     width={1920}
     height={1080}
     defaultProps={{
       videoUrl: result.videoUri
     }}
   />
   ```

5. **Renderizar Video**
   ```bash
   npx remotion render src/index.ts transicion-imposible out/transicion.mp4
   ```

6. **Registrar Interacción**
   - Registrar parámetros de generación
   - Anotar tiempo de renderizado
   - Capturar feedback del usuario

**Criterios de Éxito**:
- ✅ Veo 3.1 genera la transición exitosamente
- ✅ El video se renderiza sin errores
- ✅ La calidad de salida cumple expectativas
- ✅ Interacción registrada para aprendizaje

---

## Flujos de Trabajo

### Flujo 1: Transición Básica (Principiante)

**Objetivo**: Crear una transición simple entre dos imágenes

**Tiempo**: ~10 minutos

**Pasos**:

1. Colocar dos imágenes en carpeta `assets/`
2. Ejecutar servidor de desarrollo: `npm run dev`
3. Abrir navegador en `http://localhost:3000`
4. Seleccionar plantilla "Transición Básica"
5. Subir keyframe A y keyframe B
6. Hacer clic en "Generar Transición"
7. Previsualizar resultado
8. Hacer clic en "Renderizar Video"

**Salida Esperada**: Archivo MP4 con transición de 8 segundos

---

## Manejo de Errores

### Categorías de Error

| Categoría | Severidad | Auto-Reintentar | Acción del Usuario Requerida |
|-----------|-----------|-----------------|------------------------------|
| Timeout de Red | Media | Sí (3x) | Verificar conexión a internet |
| Cuota API | Alta | No | Aumentar cuota o esperar |
| Config Inválida | Baja | No | Corregir configuración |
| Fallo de Renderizado | Media | Sí (1x) | Revisar logs |

---

## Protocolo de Aprendizaje

### Proceso de Mejora Continua

**Cada 10 interacciones**:

1. **Analizar Patrones**
   - Errores más comunes
   - Tiempos promedio de renderizado
   - Preferencias de idioma del usuario
   - Frecuencia de uso de características

2. **Actualizar Documentación**
   - Agregar nuevos ejemplos para casos de uso comunes
   - Mejorar mensajes de error
   - Optimizar flujos de trabajo

3. **Optimizar Código**
   - Cachear llamadas API frecuentes
   - Mejorar rendimiento de renderizado
   - Reducir uso de memoria

4. **Reportar Insights**
   - Generar resumen en `LEARNING_LOG.md`
   - Actualizar métricas en `LEARNING_FEEDBACK.json`

---

## 🔒 System Guarantees / Garantías del Sistema

### English

1. **Bilingual Support**: Every feature works identically in English and Spanish
2. **Learning Enabled**: System improves with every interaction
3. **Error Resilience**: Graceful degradation with clear recovery paths
4. **Documentation Complete**: No undocumented features or APIs

### Español

1. **Soporte Bilingüe**: Cada característica funciona idénticamente en inglés y español
2. **Aprendizaje Habilitado**: El sistema mejora con cada interacción
3. **Resiliencia de Errores**: Degradación elegante con rutas de recuperación claras
4. **Documentación Completa**: Sin características o APIs sin documentar

---

**Last Updated / Última Actualización**: 2026-01-31

**Version / Versión**: 1.0.0
