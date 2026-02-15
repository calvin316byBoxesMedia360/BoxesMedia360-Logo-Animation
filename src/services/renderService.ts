import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import { PremiumMenuProps } from '../compositions/PremiumMenu';
import path from 'path';

/**
 * SERVICIO DE RENDERIZADO MP4
 * Exporta videos finales usando Remotion Renderer
 */

export interface RenderProgress {
    progress: number;      // 0-100
    status: string;        // "bundling" | "rendering" | "complete"
    currentFrame?: number;
    totalFrames?: number;
}

export interface RenderOptions {
    props: PremiumMenuProps;
    outputPath?: string;
    onProgress?: (progress: RenderProgress) => void;
}

/**
 * Renderiza el video a MP4
 * @param options Configuración de renderizado
 * @returns Path del archivo MP4 generado
 */
export async function renderVideoToMP4(options: RenderOptions): Promise<string> {
    const { props, outputPath, onProgress } = options;

    try {
        // Paso 1: Bundling del proyecto
        onProgress?.({ progress: 10, status: 'bundling' });

        const bundleLocation = await bundle({
            entryPoint: path.resolve('./src/index.ts'),
            // @ts-ignore - Remotion bundler config
            webpackOverride: (config) => config,
        });

        onProgress?.({ progress: 30, status: 'bundling' });

        // Paso 2: Seleccionar composición
        const composition = await selectComposition({
            serveUrl: bundleLocation,
            id: 'PremiumMenu',
            inputProps: props as any,
        });

        onProgress?.({ progress: 40, status: 'rendering' });

        // Paso 3: Renderizar video
        const outputLocation = outputPath || path.resolve(`./out/menu-${Date.now()}.mp4`);

        await renderMedia({
            composition,
            serveUrl: bundleLocation,
            codec: 'h264',
            outputLocation,
            inputProps: props as any,
            onProgress: ({ renderedFrames, encodedFrames }) => {
                const totalFrames = composition.durationInFrames;
                const renderProgress = Math.round((renderedFrames / totalFrames) * 100);
                onProgress?.({
                    progress: 40 + (renderProgress * 0.6), // 40-100%
                    status: 'rendering',
                    currentFrame: renderedFrames,
                    totalFrames,
                });
            },
        });

        onProgress?.({ progress: 100, status: 'complete' });

        return outputLocation;
    } catch (error) {
        console.error('Error renderizando video:', error);
        throw new Error(`Fallo en renderizado: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
}

/**
 * Estima el tiempo de renderizado basado en la configuración
 * @param props Configuración del menú
 * @returns Tiempo estimado en segundos
 */
export function estimateRenderTime(props: PremiumMenuProps): number {
    const numItems = props.menuItems.length;
    const sceneDuration = props.sceneDuration || 120;
    const totalFrames = (numItems + 2) * sceneDuration; // +2 por intro y outro

    // Estimación: ~1 segundo por cada 30 frames en hardware promedio
    return Math.ceil(totalFrames / 30);
}
