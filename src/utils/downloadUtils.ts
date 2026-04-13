
/**
 * Utility to force download a file from a URL with a specific filename.
 * Uses fetch blob approach to bypass some browser security blocks and force filename.
 */
export async function triggerDownload(url: string, filename: string, onProgress?: (msg: string) => void) {
    try {
        if (onProgress) onProgress('Preparando descarga...');
        
        // Try to fetch the blob (requires CORS on the server)
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = blobUrl;
        
        // Ensure filename has .mp4
        const finalFilename = filename.endsWith('.mp4') ? filename : `${filename}.mp4`;
        a.download = finalFilename;
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(blobUrl);
        
        if (onProgress) onProgress('¡Descarga iniciada!');
        return true;
    } catch (error) {
        console.error('Error forcing download via blob, falling back to window.open:', error);
        
        // Fallback: This might not force the filename if the server doesn't provide Content-Disposition
        // but it's better than nothing.
        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        const finalFilename = filename.endsWith('.mp4') ? filename : `${filename}.mp4`;
        a.download = finalFilename; // Some browsers might ignore this for cross-origin URLs without CORS
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        if (onProgress) onProgress('Enlace abierto en pestaña nueva');
        return false;
    }
}
