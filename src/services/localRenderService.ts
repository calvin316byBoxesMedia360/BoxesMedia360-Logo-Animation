/**
 * Local Render Service
 * Renderiza el video en el equipo local (Asus ROG) a través del servidor Express
 * (scripts/render-video.js + Remotion), sin depender de la nube.
 * Devuelve la URL local del MP4 servida por el propio servidor.
 */

const LOCAL_RENDER_URL = import.meta.env.VITE_LOCAL_RENDER_URL || 'http://localhost:3003';

export interface LocalRenderResult {
    success: boolean;
    videoUrl: string;
    downloadUrl?: string;
    filename: string;
    localPath?: string;
    renderId: string;
    quality: string;
    durationMs: number;
}

export interface LocalRenderProgress {
    status: 'starting' | 'rendering' | 'uploading' | 'complete' | 'error';
    message: string;
    percent?: number;
}

/**
 * Verifica que el servidor de render local esté disponible.
 */
export async function checkLocalRenderHealth(): Promise<boolean> {
    try {
        const res = await fetch(`${LOCAL_RENDER_URL}/api/health`, { signal: AbortSignal.timeout(4000) });
        const data = await res.json();
        return data.status === 'ok';
    } catch {
        return false;
    }
}

/**
 * Envía el menú al servidor local y retorna la URL del video renderizado en el equipo.
 */
export async function renderWithLocal(
    menuConfig: any,
    quality: '1080p' | '4k' = '1080p',
    onProgress?: (progress: LocalRenderProgress) => void
): Promise<LocalRenderResult> {

    onProgress?.({ status: 'starting', message: 'Conectando con el motor de render local...', percent: 5 });

    const projectId = menuConfig._projectId || `local-${Date.now()}`;

    // El render local puede tardar varios minutos según la duración/escenas.
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30 * 60 * 1000); // 30 min

    onProgress?.({ status: 'rendering', message: 'Renderizando en el equipo (Remotion + H.264)...', percent: 20 });

    try {
        const response = await fetch(`${LOCAL_RENDER_URL}/api/render-local`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            body: JSON.stringify({ projectId, menuConfig, quality }),
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
            const detail = errorData.error || errorData.message || JSON.stringify(errorData);
            console.error('❌ Local render error:', errorData);
            throw new Error(`Error del servidor local (${response.status}): ${detail}`);
        }

        onProgress?.({ status: 'uploading', message: 'Video listo, preparando enlace...', percent: 90 });

        const result: LocalRenderResult = await response.json();

        onProgress?.({ status: 'complete', message: '¡Video listo para descargar!', percent: 100 });

        return result;
    } catch (error: any) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            throw new Error('El render local superó el tiempo límite (30 min). Reduce escenas o duración.');
        }
        if (error instanceof TypeError) {
            throw new Error('No se pudo conectar con el servidor local. ¿Está corriendo "npm run server" en el puerto 3003?');
        }
        throw error;
    }
}
