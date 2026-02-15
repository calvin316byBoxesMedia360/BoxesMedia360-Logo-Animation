/**
 * GitHub Actions Service
 * Servicio para disparar workflows de GitHub Actions desde el dashboard
 */

const GITHUB_API = 'https://api.github.com';

interface WorkflowDispatchParams {
    menuConfig: any;
    filename?: string;
}

interface WorkflowRunResponse {
    workflowRunId: number;
    htmlUrl: string;
    status: string;
}

/**
 * Dispara el workflow de renderizado en GitHub Actions
 */
export async function triggerRenderWorkflow(
    params: WorkflowDispatchParams
): Promise<WorkflowRunResponse> {
    const repo = import.meta.env.VITE_GITHUB_REPO;
    const token = import.meta.env.VITE_GITHUB_TOKEN;

    if (!repo || !token) {
        throw new Error(
            'Configuración de GitHub faltante. Agrega VITE_GITHUB_REPO y VITE_GITHUB_TOKEN al archivo .env'
        );
    }

    const filename = params.filename || `menu-${Date.now()}.mp4`;

    try {
        // 1. Disparar el workflow
        const dispatchResponse = await fetch(
            `${GITHUB_API}/repos/${repo}/actions/workflows/render.yml/dispatches`,
            {
                method: 'POST',
                headers: {
                    'Accept': 'application/vnd.github+json',
                    'Authorization': `Bearer ${token}`,
                    'X-GitHub-Api-Version': '2022-11-28',
                },
                body: JSON.stringify({
                    ref: 'main', // o 'master', dependiendo de tu rama principal
                    inputs: {
                        menu_props: JSON.stringify(params.menuConfig),
                        filename: filename,
                    },
                }),
            }
        );

        if (!dispatchResponse.ok) {
            const error = await dispatchResponse.text();
            throw new Error(`Error disparando workflow: ${error}`);
        }

        // 2. Esperar un momento y obtener el último run
        await new Promise(resolve => setTimeout(resolve, 2000));

        const runsResponse = await fetch(
            `${GITHUB_API}/repos/${repo}/actions/workflows/render.yml/runs?per_page=1`,
            {
                headers: {
                    'Accept': 'application/vnd.github+json',
                    'Authorization': `Bearer ${token}`,
                    'X-GitHub-Api-Version': '2022-11-28',
                },
            }
        );

        if (!runsResponse.ok) {
            throw new Error('Error obteniendo información del workflow');
        }

        const runsData = await runsResponse.json();
        const latestRun = runsData.workflow_runs[0];

        return {
            workflowRunId: latestRun.id,
            htmlUrl: latestRun.html_url,
            status: latestRun.status,
        };
    } catch (error) {
        console.error('Error en triggerRenderWorkflow:', error);
        throw error;
    }
}

/**
 * Obtiene el estado de un workflow run
 */
export async function getWorkflowStatus(runId: number): Promise<{
    status: 'queued' | 'in_progress' | 'completed';
    conclusion?: 'success' | 'failure' | 'cancelled';
}> {
    const repo = import.meta.env.VITE_GITHUB_REPO;
    const token = import.meta.env.VITE_GITHUB_TOKEN;

    if (!repo || !token) {
        throw new Error('Configuración de GitHub faltante');
    }

    try {
        const response = await fetch(
            `${GITHUB_API}/repos/${repo}/actions/runs/${runId}`,
            {
                headers: {
                    'Accept': 'application/vnd.github+json',
                    'Authorization': `Bearer ${token}`,
                    'X-GitHub-Api-Version': '2022-11-28',
                },
            }
        );

        if (!response.ok) {
            throw new Error('Error obteniendo estado del workflow');
        }

        const data = await response.json();

        return {
            status: data.status,
            conclusion: data.conclusion,
        };
    } catch (error) {
        console.error('Error en getWorkflowStatus:', error);
        throw error;
    }
}

/**
 * Obtiene la URL de descarga del artifact generado
 */
export async function getArtifactDownloadUrl(runId: number): Promise<string | null> {
    const repo = import.meta.env.VITE_GITHUB_REPO;
    const token = import.meta.env.VITE_GITHUB_TOKEN;

    if (!repo || !token) {
        throw new Error('Configuración de GitHub faltante');
    }

    try {
        const response = await fetch(
            `${GITHUB_API}/repos/${repo}/actions/runs/${runId}/artifacts`,
            {
                headers: {
                    'Accept': 'application/vnd.github+json',
                    'Authorization': `Bearer ${token}`,
                    'X-GitHub-Api-Version': '2022-11-28',
                },
            }
        );

        if (!response.ok) {
            throw new Error('Error obteniendo artifacts');
        }

        const data = await response.json();

        if (data.artifacts && data.artifacts.length > 0) {
            // Retornar la URL del primer artifact
            return data.artifacts[0].archive_download_url;
        }

        return null;
    } catch (error) {
        console.error('Error en getArtifactDownloadUrl:', error);
        throw error;
    }
}
