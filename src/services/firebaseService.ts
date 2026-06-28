import { PremiumMenuProps } from '../compositions/PremiumMenu';

/**
 * SERVICIO DE PERSISTENCIA LOCAL
 * (Antes usaba Firebase Firestore/Storage — ahora 100% local, sin nube.)
 * - Configuración de menús → localStorage
 * - Imágenes/videos de platillos → servidor local (public/uploads) vía /api/upload-asset
 * Mantiene las mismas firmas para no romper los llamadores existentes.
 */

const LOCAL_SERVER = import.meta.env.VITE_LOCAL_RENDER_URL || 'http://localhost:3003';

const menuKey = (userId: string) => `menu_studio_config_${userId || 'default'}`;
const exportsKey = (userId: string) => `menu_studio_exports_${userId || 'default'}`;

// --- PERSISTENCIA DE MENÚS (localStorage) ---

/**
 * Guarda la configuración del menú en localStorage.
 */
export async function saveMenuConfig(userId: string, menuProps: PremiumMenuProps) {
    try {
        localStorage.setItem(menuKey(userId), JSON.stringify(menuProps));
        // Compatibilidad con la clave usada históricamente por MenuControls
        localStorage.setItem('menu_studio_config', JSON.stringify(menuProps));
        console.log('✅ Configuración guardada localmente');
    } catch (error) {
        console.error('❌ Error guardando configuración local:', error);
        throw error;
    }
}

/**
 * Recupera la configuración del menú desde localStorage.
 */
export async function getMenuConfig(userId: string): Promise<PremiumMenuProps | null> {
    try {
        const raw = localStorage.getItem(menuKey(userId)) || localStorage.getItem('menu_studio_config');
        return raw ? (JSON.parse(raw) as PremiumMenuProps) : null;
    } catch (error) {
        console.error('❌ Error recuperando configuración local:', error);
        return null;
    }
}

// --- SUBIDA DE ASSETS (servidor local) ---

/**
 * Sube un archivo (imagen/video) al servidor local y devuelve su URL local.
 */
async function uploadAssetLocal(file: Blob, filename: string): Promise<string> {
    // Normalizar y limpiar caracteres no-ASCII (tildes, eñes, etc.) para evitar fallos de codificación en headers HTTP
    const cleanFilename = filename
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Elimina acentos/tildes
        .replace(/[^a-zA-Z0-9._-]/g, '_'); // Reemplaza espacios y otros caracteres con guión bajo

    const res = await fetch(`${LOCAL_SERVER}/api/upload-asset`, {
        method: 'POST',
        headers: {
            'x-filename': cleanFilename,
            'Content-Type': file.type || 'application/octet-stream',
        },
        body: file,
    });
    if (!res.ok) {
        const detail = await res.text().catch(() => '');
        throw new Error(`No se pudo subir el asset al servidor local (${res.status}). ${detail}`);
    }
    const data = await res.json();
    console.log('✅ Asset subido localmente:', data.url);
    return data.url as string;
}

export async function uploadMenuItemImage(_userId: string, file: Blob, filename: string): Promise<string> {
    return uploadAssetLocal(file, filename);
}

export async function uploadMenuItemVideo(_userId: string, file: Blob, filename: string): Promise<string> {
    return uploadAssetLocal(file, filename);
}

// --- BANDEJA DE EXPORTACIONES (localStorage) ---

export interface LocalExport {
    id: string;
    filename: string;
    url: string;
    status: 'completed' | 'rendering' | 'failed';
    createdAt: number;
}

/**
 * Registra una exportación local en la bandeja (localStorage).
 */
export function addLocalExport(userId: string, exp: Omit<LocalExport, 'id' | 'createdAt'>): LocalExport[] {
    const list = listLocalExports(userId);
    const entry: LocalExport = { id: `${Date.now()}`, createdAt: Date.now(), ...exp };
    const updated = [entry, ...list].slice(0, 20);
    localStorage.setItem(exportsKey(userId), JSON.stringify(updated));
    return updated;
}

/**
 * Lista las exportaciones locales del usuario (más recientes primero).
 */
export function listLocalExports(userId: string): LocalExport[] {
    try {
        const raw = localStorage.getItem(exportsKey(userId));
        return raw ? (JSON.parse(raw) as LocalExport[]) : [];
    } catch {
        return [];
    }
}
