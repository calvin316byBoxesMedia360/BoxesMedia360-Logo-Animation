# Guía Técnica de Implementación - Digital Menu Studio

## Arquitectura del Sistema

### Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React + TS)                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Dashboard  │  │   Remotion   │  │  AI Service  │      │
│  │    Editor    │◄─┤    Player    │◄─┤   Client     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │              │
└─────────┼──────────────────┼──────────────────┼──────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND SERVICES                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Firebase   │  │  Gemini API  │  │   Remotion   │      │
│  │   Firestore  │  │ (Copywriting)│  │   Lambda     │      │
│  │   Storage    │  │              │  │  (Render)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

---

## Estructura de Archivos del Proyecto

```
Computational-Cinematography-MVP/
│
├── src/
│   ├── components/
│   │   └── MenuControls.tsx          # Panel de control del dashboard
│   │
│   ├── compositions/
│   │   ├── PremiumMenu.tsx           # Composición principal del video
│   │   └── HolographicParticlesV2.tsx # Efectos visuales
│   │
│   ├── services/
│   │   ├── aiService.ts              # Lógica de IA (Copywriting, Themes)
│   │   └── renderService.ts          # [NUEVO] Servicio de renderizado MP4
│   │
│   ├── Editor.tsx                    # Componente principal del editor
│   └── dashboard-entry.tsx           # Entry point del dashboard
│
├── public/
│   └── [assets estáticos]
│
├── docs/
│   └── product-presentation/
│       ├── PRODUCT_DOCUMENTATION.md  # Este documento
│       └── TECHNICAL_GUIDE.md        # Guía técnica
│
├── package.json
├── remotion.config.ts                # Configuración de Remotion
└── vite.config.ts                    # Configuración de Vite
```

---

## Flujo de Datos

### 1. Edición de Menú

```typescript
Usuario edita platillo
    ↓
MenuControls.updateItem()
    ↓
setProps({ ...props, menuItems: newItems })
    ↓
Editor.tsx actualiza estado
    ↓
Remotion Player re-renderiza
    ↓
Preview actualizado en tiempo real
```

### 2. Aplicación de IA

```typescript
Usuario hace clic en "Copywriting Epic"
    ↓
MenuControls.handleRefineAllTexts()
    ↓
aiService.refineCopy() para cada platillo
    ↓
Respuesta de IA (mock o Gemini API)
    ↓
Estado actualizado con textos mejorados
    ↓
Preview muestra cambios
```

### 3. Renderizado MP4 (Próximamente)

```typescript
Usuario hace clic en "Descargar MP4"
    ↓
renderService.exportVideo()
    ↓
Envía configuración a Remotion Lambda
    ↓
Lambda renderiza video en la nube
    ↓
Retorna URL de descarga
    ↓
Usuario descarga MP4
```

---

## Interfaces de Datos Clave

### MenuItem
```typescript
interface MenuItem {
    name: string;           // Nombre del platillo
    description?: string;   // Descripción (opcional)
    price: string;          // Precio en formato "$XX.XX"
    image: string;          // URL o path de la imagen
}
```

### PremiumMenuProps
```typescript
interface PremiumMenuProps {
    menuItems: MenuItem[];      // Array de platillos
    restaurantName?: string;    // Nombre del restaurante
    accentColor?: string;       // Color hex (#RRGGBB)
    sceneDuration?: number;     // Duración en frames (30fps)
}
```

### AIResponse
```typescript
interface AIResponse {
    newItems: MenuItem[];       // Platillos generados/refinados
    accentColor?: string;       // Color sugerido
    suggestion?: string;        // Tip creativo de la IA
}
```

---

## Servicios Implementados

### aiService.ts

#### refineCopy(text: string): Promise<string>
**Propósito**: Mejora un texto con copywriting profesional.

**Entrada**: Texto básico (ej: "Flautas")  
**Salida**: Texto mejorado (ej: "Flautas Crujientes Los Cuates")

**Implementación Actual**: Diccionario hardcodeado  
**Implementación Futura**: Llamada a Gemini API

```typescript
// Mock actual
const refinements: Record<string, string> = {
    'Flautas': 'Flautas Crujientes "Los Cuates"',
    // ...
};

// Futuro con Gemini
const response = await geminiAPI.generateText({
    prompt: `Mejora este nombre de platillo: ${text}`,
    model: 'gemini-pro'
});
```

---

#### applyTheme(themeName: string): Promise<ThemeConfig>
**Propósito**: Aplica un preset visual completo.

**Temas Disponibles**:
- `noche_lujo`: Dorado elegante, 5s por escena
- `domingo_familiar`: Naranja festivo, 4s por escena
- `neon_party`: Cian vibrante, 3s por escena

**Retorno**:
```typescript
{
    accentColor: '#D4AF37',
    sceneDuration: 150  // frames (5 segundos a 30fps)
}
```

---

#### optimizeVisibility(currentColor: string): Promise<string>
**Propósito**: Ajusta color para máxima legibilidad en LED.

**Algoritmo**:
1. Convierte hex a HSL
2. Aumenta luminosidad a 70%+
3. Aumenta saturación a 90%+
4. Retorna hex optimizado

**Ejemplo**:
```typescript
Input:  '#8B4513' (marrón oscuro)
Output: '#FFD700' (amarillo oro brillante)
```

---

## Configuración de Remotion

### remotion.config.ts
```typescript
export default {
    codec: 'h264',              // Codec de video
    videoBitrate: '8M',         // Calidad premium
    fps: 30,                    // Frames por segundo
    width: 1920,                // Resolución Full HD
    height: 1080,
    durationInFrames: 900,      // 30 segundos a 30fps
};
```

---

## Persistencia de Datos

### localStorage (Actual)
```typescript
// Guardar
localStorage.setItem('menu_studio_config', JSON.stringify(props));

// Cargar
const saved = localStorage.getItem('menu_studio_config');
const config = saved ? JSON.parse(saved) : defaultConfig;
```

**Limitaciones**:
- Solo disponible en el navegador actual
- Máximo 5-10MB de almacenamiento
- Se pierde al limpiar caché

---

### Firebase (Futuro)
```typescript
// Guardar en Firestore
await db.collection('menus').doc(userId).set({
    menuItems,
    restaurantName,
    accentColor,
    updatedAt: serverTimestamp()
});

// Subir imagen a Storage
const imageRef = storage.ref(`menus/${userId}/${filename}`);
await imageRef.put(imageFile);
const imageUrl = await imageRef.getDownloadURL();
```

**Ventajas**:
- Acceso desde cualquier dispositivo
- Backups automáticos
- Escalabilidad ilimitada

---

## Optimización #3: Renderizado MP4

### Implementación Propuesta

#### Opción A: Remotion Lambda (Cloud)
**Pros**:
- Renderizado rápido (30-60 segundos)
- Sin carga en el cliente
- Escalable automáticamente

**Cons**:
- Costo por renderizado (~$0.10-0.50)
- Requiere AWS account
- Configuración compleja

**Código**:
```typescript
import { renderMediaOnLambda } from '@remotion/lambda';

const { renderId, bucketName } = await renderMediaOnLambda({
    region: 'us-east-1',
    functionName: 'remotion-render',
    composition: 'PremiumMenu',
    inputProps: props,
    codec: 'h264',
});

// Esperar resultado
const { outputFile } = await getRenderProgress({
    renderId,
    bucketName,
    region: 'us-east-1',
});
```

---

#### Opción B: Renderizado Local (Node.js)
**Pros**:
- Sin costos adicionales
- Control total del proceso
- Privacidad de datos

**Cons**:
- Más lento (2-5 minutos)
- Requiere servidor Node.js
- Limitado por hardware

**Código**:
```typescript
import { bundle } from '@remotion/bundler';
import { renderMedia } from '@remotion/renderer';

const bundled = await bundle({
    entryPoint: './src/index.ts',
});

await renderMedia({
    composition: 'PremiumMenu',
    serveUrl: bundled,
    codec: 'h264',
    outputLocation: `out/${Date.now()}.mp4`,
    inputProps: props,
});
```

---

#### Opción C: Renderizado en Navegador (Experimental)
**Pros**:
- Sin backend necesario
- Gratis
- Implementación simple

**Cons**:
- Muy lento (5-10 minutos)
- Limitado por RAM del navegador
- Puede fallar en videos largos

**Código**:
```typescript
import { renderMedia } from '@remotion/renderer/browser';

const { url } = await renderMedia({
    composition: 'PremiumMenu',
    inputProps: props,
    onProgress: ({ progress }) => {
        console.log(`Renderizando: ${progress * 100}%`);
    },
});

// Descargar
const a = document.createElement('a');
a.href = url;
a.download = 'menu.mp4';
a.click();
```

---

## Recomendación de Implementación

**Para MVP**: Opción B (Renderizado Local)  
**Para Producción**: Opción A (Remotion Lambda)

### Razones:
1. MVP necesita validación rápida sin costos AWS
2. Renderizado local es suficiente para 1-10 usuarios
3. Lambda se puede añadir después sin cambiar frontend
4. Permite testing exhaustivo antes de escalar

---

## Próximos Pasos Técnicos

### Sprint 1: Renderizado MP4 (Esta semana)
- [ ] Instalar `@remotion/renderer`
- [ ] Crear `renderService.ts`
- [ ] Añadir botón "Descargar MP4" en UI
- [ ] Implementar barra de progreso
- [ ] Testing con diferentes configuraciones

### Sprint 2: Firebase Integration (Próxima semana)
- [ ] Setup Firebase project
- [ ] Implementar Firestore para menús
- [ ] Implementar Storage para imágenes
- [ ] Migrar de localStorage a Firebase
- [ ] Añadir autenticación básica

### Sprint 3: Gemini API (Semana 3)
- [ ] Obtener API key de Google AI Studio
- [ ] Reemplazar mock en `aiService.ts`
- [ ] Implementar rate limiting
- [ ] Añadir manejo de errores
- [ ] Testing de calidad de respuestas

---

## Métricas de Rendimiento

### Objetivos
- **Carga inicial**: < 3 segundos
- **Actualización de preview**: < 500ms
- **Renderizado MP4**: < 2 minutos (local), < 60s (Lambda)
- **Tamaño de bundle**: < 2MB (gzipped)

### Herramientas de Monitoreo
- Lighthouse (performance score > 90)
- Bundle analyzer (webpack-bundle-analyzer)
- Sentry (error tracking)
- Google Analytics (user behavior)

---

**Versión**: 1.0  
**Última Actualización**: 7 de Febrero, 2026
