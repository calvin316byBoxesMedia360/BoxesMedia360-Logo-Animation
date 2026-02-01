# API Reference

**Computational Cinematography MVP - Complete API Documentation**

---

## Table of Contents

1. [Vertex AI Service](#vertex-ai-service)
2. [Logger Utility](#logger-utility)
3. [Remotion Compositions](#remotion-compositions)
4. [Type Definitions](#type-definitions)

---

## Vertex AI Service

### `generateVeoTransition()`

Generate a video transition using Veo 3.1.

**Signature:**
```typescript
async function generateVeoTransition(
  config: VeoTransitionConfig,
  language?: Language
): Promise<VeoGenerationResult>
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `config` | `VeoTransitionConfig` | Yes | Transition configuration |
| `language` | `'en' \| 'es'` | No | User language (default: 'en') |

**Returns:** `Promise<VeoGenerationResult>`

**Example:**
```typescript
import { generateVeoTransition } from './services/vertexAI';

const result = await generateVeoTransition({
  firstFrame: './assets/keyframe-a.jpg',
  lastFrame: './assets/keyframe-b.jpg',
  duration: 8,
  prompt: 'Camera moves through a solid wall',
  style: 'cinematic',
  resolution: '1080p',
  fps: 30
}, 'en');

console.log('Video URL:', result.videoUri);
```

**Throws:**
- `Error` - If configuration is invalid
- `Error` - If Vertex AI API call fails
- `Error` - If authentication fails

---

### `checkGenerationStatus()`

Check the status of a video generation job.

**Signature:**
```typescript
async function checkGenerationStatus(
  generationId: string
): Promise<{ status: string; progress: number }>
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `generationId` | `string` | Yes | ID of the generation job |

**Returns:** `Promise<{ status: string; progress: number }>`

**Example:**
```typescript
const status = await checkGenerationStatus('gen-12345');
console.log(`Status: ${status.status}, Progress: ${status.progress}%`);
```

---

## Logger Utility

### `logInteraction()`

Log an interaction to the learning system.

**Signature:**
```typescript
async function logInteraction(log: InteractionLog): Promise<void>
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `log` | `InteractionLog` | Yes | Interaction log entry |

**Example:**
```typescript
import { logInteraction } from './utils/logger';

await logInteraction({
  id: 'render-001',
  timestamp: new Date().toISOString(),
  language: 'en',
  action: 'render_video',
  success: true,
  durationMs: 45000,
  details: { resolution: '1080p', fps: 30 }
});
```

---

### `logError()`

Log an error with bilingual support.

**Signature:**
```typescript
async function logError(
  error: Error,
  language: Language,
  context?: Record<string, unknown>
): Promise<void>
```

**Example:**
```typescript
try {
  await generateVeoTransition(config);
} catch (error) {
  await logError(error as Error, 'es', { config });
}
```

---

### `saveFeedback()`

Save user feedback.

**Signature:**
```typescript
async function saveFeedback(feedback: UserFeedback): Promise<void>
```

**Example:**
```typescript
await saveFeedback({
  timestamp: new Date().toISOString(),
  language: 'en',
  qualityRating: 5,
  speedRating: 4,
  suggestions: 'Faster rendering would be great'
});
```

---

## Remotion Compositions

### `<VeoTransition />`

Main composition for displaying AI-generated transitions.

**Props:**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `videoUrl` | `string` | Yes | - | URL of generated video |
| `audioUrl` | `string` | No | - | URL of audio track |
| `title` | `string` | No | - | Title overlay text |
| `loop` | `boolean` | No | `false` | Enable video looping |

**Example:**
```typescript
import { VeoTransition } from './compositions/VeoTransition';

<Composition
  id="my-transition"
  component={VeoTransition}
  durationInFrames={240}
  fps={30}
  width={1920}
  height={1080}
  defaultProps={{
    videoUrl: 'https://storage.googleapis.com/my-video.mp4',
    title: 'Impossible Transition'
  }}
/>
```

---

## Type Definitions

### `VeoTransitionConfig`

Configuration for Veo 3.1 video generation.

```typescript
interface VeoTransitionConfig {
  firstFrame: string;
  lastFrame: string;
  duration: number; // 1-60 seconds
  prompt: string;
  style?: 'cinematic' | 'realistic' | 'artistic' | 'animated';
  resolution?: '720p' | '1080p' | '4k';
  fps?: 24 | 30 | 60;
  generateAudio?: boolean;
}
```

### `VeoGenerationResult`

Response from Veo 3.1 API.

```typescript
interface VeoGenerationResult {
  videoUri: string;
  audioUri?: string;
  generationId: string;
  timestamp: string;
  durationSeconds: number;
  metadata: {
    model: string;
    resolution: string;
    fps: number;
    processingTimeMs: number;
  };
}
```

### `InteractionLog`

Interaction log entry for learning system.

```typescript
interface InteractionLog {
  id: string;
  timestamp: string;
  language: 'en' | 'es';
  action: string;
  success: boolean;
  durationMs: number;
  details?: Record<string, unknown>;
  error?: string;
}
```

---

**Last Updated**: 2026-01-31  
**Version**: 1.0.0
