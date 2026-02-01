/**
 * TypeScript Type Definitions for Computational Cinematography MVP
 * Definiciones de Tipos TypeScript para MVP de Cinematografía Computacional
 */

// ============================================================================
// Vertex AI / Veo 3.1 Types
// ============================================================================

/**
 * Configuration for Veo 3.1 video generation
 * Configuración para generación de video Veo 3.1
 */
export interface VeoTransitionConfig {
    /** First keyframe image path / Ruta de imagen del primer keyframe */
    firstFrame: string;

    /** Last keyframe image path / Ruta de imagen del último keyframe */
    lastFrame: string;

    /** Duration in seconds (1-60) / Duración en segundos (1-60) */
    duration: number;

    /** Text prompt describing the transition / Prompt de texto describiendo la transición */
    prompt: string;

    /** Visual style / Estilo visual */
    style?: 'cinematic' | 'realistic' | 'artistic' | 'animated';

    /** Output resolution / Resolución de salida */
    resolution?: '720p' | '1080p' | '4k';

    /** Frame rate (24, 30, 60) / Tasa de frames (24, 30, 60) */
    fps?: 24 | 30 | 60;

    /** Enable audio generation / Habilitar generación de audio */
    generateAudio?: boolean;
}

/**
 * Response from Veo 3.1 API
 * Respuesta de la API Veo 3.1
 */
export interface VeoGenerationResult {
    /** Generated video URI / URI del video generado */
    videoUri: string;

    /** Generated audio URI (if enabled) / URI del audio generado (si está habilitado) */
    audioUri?: string;

    /** Generation ID for tracking / ID de generación para rastreo */
    generationId: string;

    /** Timestamp of generation / Marca de tiempo de generación */
    timestamp: string;

    /** Duration of generated video in seconds / Duración del video generado en segundos */
    durationSeconds: number;

    /** Metadata about the generation / Metadatos sobre la generación */
    metadata: {
        model: string;
        resolution: string;
        fps: number;
        processingTimeMs: number;
    };
}

/**
 * Error response from Vertex AI
 * Respuesta de error de Vertex AI
 */
export interface VertexAIError {
    code: string;
    message: string;
    details?: Record<string, unknown>;
}

// ============================================================================
// Remotion Composition Types
// ============================================================================

/**
 * Props for VeoTransition composition
 * Props para composición VeoTransition
 */
export interface VeoTransitionProps {
    /** URL of the generated video / URL del video generado */
    videoUrl: string;

    /** Optional audio URL / URL de audio opcional */
    audioUrl?: string;

    /** Composition title / Título de la composición */
    title?: string;

    /** Enable loop / Habilitar loop */
    loop?: boolean;
}

/**
 * Remotion composition configuration
 * Configuración de composición Remotion
 */
export interface CompositionConfig {
    id: string;
    width: number;
    height: number;
    fps: number;
    durationInFrames: number;
    defaultProps?: Record<string, unknown>;
}

// ============================================================================
// Learning System Types
// ============================================================================

/**
 * Language options / Opciones de idioma
 */
export type Language = 'en' | 'es';

/**
 * Interaction log entry
 * Entrada de registro de interacción
 */
export interface InteractionLog {
    id: string;
    timestamp: string;
    language: Language;
    action: string;
    success: boolean;
    durationMs: number;
    details?: Record<string, unknown>;
    error?: string;
}

/**
 * User feedback entry
 * Entrada de feedback del usuario
 */
export interface UserFeedback {
    timestamp: string;
    language: Language;
    qualityRating?: number; // 1-5
    speedRating?: number; // 1-5
    suggestions?: string;
    satisfactionScore?: number; // 1-10
}

/**
 * Learning metrics
 * Métricas de aprendizaje
 */
export interface LearningMetrics {
    totalInteractions: number;
    languageDistribution: Record<Language, number>;
    averageRenderTime: number;
    successRate: number;
    commonErrors: Array<{ code: string; count: number }>;
}

// ============================================================================
// Configuration Types
// ============================================================================

/**
 * Environment configuration
 * Configuración de entorno
 */
export interface EnvironmentConfig {
    googleCloud: {
        projectId: string;
        region: string;
        credentials?: string;
    };
    vertexAI: {
        model: string;
        endpoint: string;
        maxConcurrentRequests: number;
        timeoutMs: number;
    };
    rendering: {
        maxConcurrentRenders: number;
        outputDirectory: string;
        defaultFps: number;
        defaultResolution: { width: number; height: number };
    };
}

/**
 * Bilingual text content
 * Contenido de texto bilingüe
 */
export interface BilingualText {
    en: string;
    es: string;
}

/**
 * Error message with bilingual support
 * Mensaje de error con soporte bilingüe
 */
export interface ErrorMessage {
    code: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: BilingualText;
    solution: BilingualText;
    autoRetry: boolean;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Async operation status
 * Estado de operación asíncrona
 */
export type OperationStatus = 'pending' | 'processing' | 'completed' | 'failed';

/**
 * Render job
 * Trabajo de renderizado
 */
export interface RenderJob {
    id: string;
    status: OperationStatus;
    progress: number; // 0-100
    startTime: string;
    endTime?: string;
    outputPath?: string;
    error?: string;
}

/**
 * Asset reference
 * Referencia de asset
 */
export interface AssetReference {
    type: 'image' | 'video' | 'audio';
    path: string;
    size: number;
    mimeType: string;
    metadata?: Record<string, unknown>;
}
