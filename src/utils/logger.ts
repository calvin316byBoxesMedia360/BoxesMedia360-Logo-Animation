/**
 * Logger Utility - Learning System Integration
 * Utilidad de Logger - Integración del Sistema de Aprendizaje
 * 
 * This module handles all logging for the learning system, including
 * interaction tracking, error logging, and metrics collection.
 * 
 * Este módulo maneja todo el logging para el sistema de aprendizaje, incluyendo
 * rastreo de interacciones, logging de errores y recolección de métricas.
 */

import fs from 'fs/promises';
import path from 'path';
import type { InteractionLog, UserFeedback, Language } from '../types';

// ============================================================================
// Configuration / Configuración
// ============================================================================

const LOGS_DIR = path.join(process.cwd(), 'logs');
const LEARNING_LOG_PATH = path.join(process.cwd(), 'LEARNING_LOG.md');
const LEARNING_FEEDBACK_PATH = path.join(process.cwd(), 'LEARNING_FEEDBACK.json');

// ============================================================================
// Interaction Logging / Registro de Interacciones
// ============================================================================

/**
 * Log an interaction to the learning system
 * Registrar una interacción en el sistema de aprendizaje
 * 
 * @param log - Interaction log entry / Entrada de registro de interacción
 */
export async function logInteraction(log: InteractionLog): Promise<void> {
    try {
        // Ensure logs directory exists / Asegurar que el directorio de logs existe
        await ensureLogsDirectory();

        // Update LEARNING_LOG.md / Actualizar LEARNING_LOG.md
        await appendToLearningLog(log);

        // Update LEARNING_FEEDBACK.json / Actualizar LEARNING_FEEDBACK.json
        await updateFeedbackMetrics(log);

        // Write to daily log file / Escribir en archivo de log diario
        await writeToDailyLog(log);

    } catch (error) {
        console.error('Failed to log interaction:', error);
    }
}

/**
 * Log an error with bilingual support
 * Registrar un error con soporte bilingüe
 * 
 * @param error - Error object / Objeto de error
 * @param language - User language / Idioma del usuario
 * @param context - Additional context / Contexto adicional
 */
export async function logError(
    error: Error,
    language: Language,
    context?: Record<string, unknown>
): Promise<void> {
    const errorLog: InteractionLog = {
        id: `error-${Date.now()}`,
        timestamp: new Date().toISOString(),
        language,
        action: 'error',
        success: false,
        durationMs: 0,
        error: error.message,
        details: {
            stack: error.stack,
            ...context,
        },
    };

    await logInteraction(errorLog);

    // Also log to console with bilingual message
    const messages = {
        en: `❌ Error: ${error.message}`,
        es: `❌ Error: ${error.message}`,
    };

    console.error(messages[language]);
}

// ============================================================================
// User Feedback / Feedback del Usuario
// ============================================================================

/**
 * Collect and save user feedback
 * Recopilar y guardar feedback del usuario
 * 
 * @param feedback - User feedback entry / Entrada de feedback del usuario
 */
export async function saveFeedback(feedback: UserFeedback): Promise<void> {
    try {
        // Read current feedback data / Leer datos actuales de feedback
        const feedbackData = await readFeedbackData();

        // Add new feedback / Agregar nuevo feedback
        if (!feedbackData.user_feedback) {
            feedbackData.user_feedback = {
                total_feedback_entries: 0,
                average_quality_rating: null,
                average_speed_rating: null,
                common_suggestions: [],
                satisfaction_score: null,
            };
        }

        feedbackData.user_feedback.total_feedback_entries += 1;

        // Update averages / Actualizar promedios
        if (feedback.qualityRating) {
            const currentAvg = feedbackData.user_feedback.average_quality_rating || 0;
            const count = feedbackData.user_feedback.total_feedback_entries;
            feedbackData.user_feedback.average_quality_rating =
                (currentAvg * (count - 1) + feedback.qualityRating) / count;
        }

        if (feedback.speedRating) {
            const currentAvg = feedbackData.user_feedback.average_speed_rating || 0;
            const count = feedbackData.user_feedback.total_feedback_entries;
            feedbackData.user_feedback.average_speed_rating =
                (currentAvg * (count - 1) + feedback.speedRating) / count;
        }

        // Save updated data / Guardar datos actualizados
        await fs.writeFile(
            LEARNING_FEEDBACK_PATH,
            JSON.stringify(feedbackData, null, 2),
            'utf-8'
        );

    } catch (error) {
        console.error('Failed to save feedback:', error);
    }
}

// ============================================================================
// Helper Functions / Funciones Auxiliares
// ============================================================================

/**
 * Ensure logs directory exists
 * Asegurar que el directorio de logs existe
 */
async function ensureLogsDirectory(): Promise<void> {
    try {
        await fs.mkdir(LOGS_DIR, { recursive: true });
    } catch (error) {
        // Directory might already exist / El directorio puede ya existir
    }
}

/**
 * Append entry to LEARNING_LOG.md
 * Agregar entrada a LEARNING_LOG.md
 */
async function appendToLearningLog(log: InteractionLog): Promise<void> {
    const entry = `
### Entry ${log.id}

**Date/Fecha**: ${log.timestamp}

**Language/Idioma**: ${log.language === 'en' ? 'English' : 'Español'}

**Action/Acción**: ${log.action}

**Success/Éxito**: ${log.success ? '✅' : '❌'}

**Duration/Duración**: ${log.durationMs}ms

${log.error ? `**Error**: ${log.error}\n` : ''}
${log.details ? `**Details/Detalles**: ${JSON.stringify(log.details, null, 2)}\n` : ''}
---

`;

    try {
        await fs.appendFile(LEARNING_LOG_PATH, entry, 'utf-8');
    } catch (error) {
        console.error('Failed to append to learning log:', error);
    }
}

/**
 * Update metrics in LEARNING_FEEDBACK.json
 * Actualizar métricas en LEARNING_FEEDBACK.json
 */
async function updateFeedbackMetrics(log: InteractionLog): Promise<void> {
    try {
        const data = await readFeedbackData();

        // Update interaction count / Actualizar conteo de interacciones
        data.language_analytics.total_interactions += 1;
        data.language_analytics.by_language[log.language].count += 1;

        // Recalculate percentages / Recalcular porcentajes
        const total = data.language_analytics.total_interactions;
        data.language_analytics.by_language.en.percentage =
            (data.language_analytics.by_language.en.count / total) * 100;
        data.language_analytics.by_language.es.percentage =
            (data.language_analytics.by_language.es.count / total) * 100;

        // Add to interaction log / Agregar al log de interacciones
        data.interaction_log.push({
            id: log.id,
            timestamp: log.timestamp,
            language: log.language,
            action: log.action,
            success: log.success,
            duration_ms: log.durationMs,
            details: log.details,
        });

        // Update error tracking if applicable / Actualizar rastreo de errores si aplica
        if (!log.success && log.error) {
            data.error_tracking.total_errors += 1;
            // Categorize error / Categorizar error
            // This is simplified - in production, use proper error categorization
        }

        // Update last_updated / Actualizar last_updated
        data.system_info.last_updated = new Date().toISOString();

        // Save / Guardar
        await fs.writeFile(
            LEARNING_FEEDBACK_PATH,
            JSON.stringify(data, null, 2),
            'utf-8'
        );

    } catch (error) {
        console.error('Failed to update feedback metrics:', error);
    }
}

/**
 * Write to daily log file
 * Escribir en archivo de log diario
 */
async function writeToDailyLog(log: InteractionLog): Promise<void> {
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const logFile = path.join(LOGS_DIR, `${date}.json`);

    try {
        let logs: InteractionLog[] = [];

        // Read existing logs / Leer logs existentes
        try {
            const content = await fs.readFile(logFile, 'utf-8');
            logs = JSON.parse(content);
        } catch {
            // File doesn't exist yet / El archivo aún no existe
        }

        // Append new log / Agregar nuevo log
        logs.push(log);

        // Write back / Escribir de vuelta
        await fs.writeFile(logFile, JSON.stringify(logs, null, 2), 'utf-8');

    } catch (error) {
        console.error('Failed to write to daily log:', error);
    }
}

/**
 * Read feedback data from JSON file
 * Leer datos de feedback desde archivo JSON
 */
async function readFeedbackData(): Promise<any> {
    try {
        const content = await fs.readFile(LEARNING_FEEDBACK_PATH, 'utf-8');
        return JSON.parse(content);
    } catch (error) {
        // Return default structure if file doesn't exist
        // Retornar estructura por defecto si el archivo no existe
        return {
            system_info: {
                name: 'Computational Cinematography MVP',
                version: '1.0.0',
                created: new Date().toISOString(),
                last_updated: new Date().toISOString(),
            },
            language_analytics: {
                total_interactions: 0,
                by_language: {
                    en: { count: 0, percentage: 0 },
                    es: { count: 0, percentage: 0 },
                },
            },
            interaction_log: [],
            error_tracking: {
                total_errors: 0,
            },
        };
    }
}

// ============================================================================
// Utility Functions / Funciones de Utilidad
// ============================================================================

/**
 * Get bilingual message based on language
 * Obtener mensaje bilingüe basado en idioma
 * 
 * @param messages - Bilingual messages object / Objeto de mensajes bilingües
 * @param language - Target language / Idioma objetivo
 * @returns Message in specified language / Mensaje en idioma especificado
 */
export function getBilingualMessage(
    messages: { en: string; es: string },
    language: Language
): string {
    return messages[language];
}

/**
 * Detect language from user input
 * Detectar idioma desde entrada del usuario
 * 
 * @param input - User input text / Texto de entrada del usuario
 * @returns Detected language / Idioma detectado
 */
export function detectLanguage(input: string): Language {
    const spanishKeywords = [
        'crear', 'generar', 'renderizar', 'configurar', 'ayuda',
        'transición', 'video', 'imagen', 'archivo',
    ];

    const lowerInput = input.toLowerCase();
    const hasSpanish = spanishKeywords.some(kw => lowerInput.includes(kw));

    return hasSpanish ? 'es' : 'en';
}
