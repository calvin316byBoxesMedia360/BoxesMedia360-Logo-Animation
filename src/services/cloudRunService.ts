/**
 * Cloud Run Render Service
 * Llama directamente al servicio de renderizado en Google Cloud Run
 * y retorna la URL pública del video generado.
 */

const CLOUD_RUN_URL = import.meta.env.VITE_CLOUD_RUN_URL ||
    'https://digital-menu-render-938762407896.us-central1.run.app';

export interface CloudRenderResult {
    success: boolean;
    videoUrl: string;
    renderId: string;
    quality: string;
    durationMs: number;
}

export interface CloudRenderProgress {
    status: 'starting' | 'rendering' | 'uploading' | 'complete' | 'error';
    message: string;
    percent?: number;
}

/**
 * Verifica que el servicio de Cloud Run esté disponible
 */
export async function checkRenderServiceHealth(): Promise<boolean> {
    try {
        const res = await fetch(`${CLOUD_RUN_URL}/health`, { signal: AbortSignal.timeout(5000) });
        const data = await res.json();
        return data.status === 'ok';
    } catch {
        return false;
    }
}

/**
 * Envía el menú al Cloud Run service y retorna la URL del video
 */
export async function renderWithCloudRun(
    menuConfig: any,
    quality: '1080p' | '4k' = '1080p',
    onProgress?: (progress: CloudRenderProgress) => void
): Promise<CloudRenderResult> {

    onProgress?.({ status: 'starting', message: 'Conectando con servidor de renderizado...', percent: 5 });

    // Guardar el config en Firestore primero para que Cloud Run lo acceda
    const projectId = menuConfig._projectId || `export-${Date.now()}`;

    onProgress?.({ status: 'rendering', message: 'Iniciando renderizado en la nube...', percent: 15 });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25 * 60 * 1000); // 25 min timeout

    try {
        const response = await fetch(`${CLOUD_RUN_URL}/api/render`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            body: JSON.stringify({
                projectId,
                menuConfig,   // Pasamos el config completo
                quality,
            }),
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
            const detail = errorData.error || errorData.message || JSON.stringify(errorData);
            console.error('❌ Cloud Run error:', errorData);
            throw new Error(`Error del servidor (${response.status}): ${detail}`);
        }

        onProgress?.({ status: 'uploading', message: 'Video listo, obteniendo enlace...', percent: 90 });

        const result: CloudRenderResult = await response.json();

        onProgress?.({ status: 'complete', message: '¡Video listo para descargar!', percent: 100 });

        return result;
    } catch (error: any) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            throw new Error('El renderizado tomó más de 10 minutos. Intenta con menos platillos.');
        }
        throw error;
    }
}
