import { MenuItem } from '../compositions/PremiumMenu';

/**
 * SERVICIO DE DIRECCIÓN CREATIVA AI
 * Transforma el contenido existente en una experiencia premium sin inventar datos.
 */

/**
 * Refina el texto de un platillo para hacerlo más apetitoso (Copywriting)
 */
export const refineCopy = async (text: string): Promise<string> => {
    console.log('✍️ IA Refinando Copy:', text);
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulación de refinamiento profesional
    const refinements: Record<string, string> = {
        'Huarache de Cecina': 'Huarache Ancestral con Cecina de Yecapixtla',
        'Cecina acompañada de frijoles': 'Fina Cecina curada artesanalmente, servida con frijoles refritos a la leña.',
        'Flautas': 'Flautas Crujientes "Los Cuates"',
        'Deliciosas flautas': 'Doradas a la perfección, rellenas de tradición y bañadas en crema de rancho.',
        'Quesadilla de Carne': 'Quesadilla Premium en Tortilla de Maíz Criollo',
    };

    return refinements[text] || `${text} con toque Gourmet`;
};

/**
 * Aplica un tema visual (Vibe Check)
 */
export const applyTheme = async (themeName: string): Promise<{ accentColor: string; sceneDuration: number }> => {
    console.log('🎨 IA Aplicando Tema:', themeName);
    await new Promise(resolve => setTimeout(resolve, 2000));

    switch (themeName) {
        case 'noche_lujo':
            return { accentColor: '#D4AF37', sceneDuration: 150 }; // Dorado, más tiempo
        case 'domingo_familiar':
            return { accentColor: '#FF5733', sceneDuration: 120 }; // Naranja enérgico
        case 'neon_party':
            return { accentColor: '#00E5FF', sceneDuration: 90 }; // Cian vibrante, rápido
        default:
            return { accentColor: '#D4AF37', sceneDuration: 120 };
    }
};

/**
 * Optimiza la visibilidad para pantallas LED reales
 */
export const optimizeVisibility = async (currentColor: string): Promise<string> => {
    console.log('👁️ IA Optimizando para LED con color:', currentColor);
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Asegura contrastes altos (simulado)
    return '#FFD700'; // Fuerza un amarillo/oro de alto contraste
};

// Mantenemos la interfaz para compatibilidad si fuera necesario, pero vacía de "inventos"
export interface AIResponse {
    newItems: MenuItem[];
    accentColor?: string;
    suggestion?: string;
}

export const generateMenuFromAI = async (prompt: string, currentItems: MenuItem[]): Promise<AIResponse> => {
    // Esta función queda obsoleta por el nuevo enfoque de Dirección Creativa
    return { newItems: [], suggestion: 'Usa las herramientas de Dirección Creativa para mejores resultados.' };
};
