import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing, Img, Video, staticFile, Sequence } from 'remotion';
import React, { useMemo, useState } from 'react';

// ============================================
// 📋 TIPOS - DEFINICIÓN DE PROPS
// ============================================
export interface MenuItem {
    image: string; // URL o path
    mediaType?: 'image' | 'video'; // Tipo de media
    duration?: number; // Duración específica en segundos (opcional)
    name: string;
    description: string;
    price: string;
    fontSizeMode?: 'normal' | 'medium' | 'large';
    uploadError?: boolean;
    showCurrencySymbol?: boolean; // Mostrar/ocultar símbolo $ en el video
}

export interface PremiumMenuProps {
    menuItems: MenuItem[];
    restaurantName?: string;
    accentColor?: string;
    sceneDuration?: number;
    logoUri?: string;
    backgroundMusic?: string;
    isSeamlessLoop?: boolean;
    lightFxEnabled?: boolean;
    lightFxMode?: 'native' | 'softGlow' | 'vividPop' | 'warmBistro' | 'dramaticDark';
    orientation?: 'landscape' | 'vertical';
    [key: string]: any;
}

// ============================================
// 🎨 COLORES POR DEFECTO
// ============================================
const DEFAULT_COLORS = {
    gold: '#D4AF37',
    cream: '#FFF8E7',
    dark: '#1A1A1A',
};

const TRANSITION_FRAMES = 25;
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000&auto=format&fit=crop'; // Comida genérica premium

// ============================================
// ✨ PARTÍCULAS DORADAS FLOTANTES
// ============================================
const GoldenParticles: React.FC<{ color?: string }> = ({ color = DEFAULT_COLORS.gold }) => {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();

    const particles = useMemo(() => {
        return Array.from({ length: 40 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 2 + 0.5,
            speed: Math.random() * 0.5 + 0.2,
            drift: Math.random() * 2 - 1,
            delay: Math.random() * 1000,
        }));
    }, []);

    return (
        <AbsoluteFill style={{ pointerEvents: 'none' }}>
            {particles.map((p) => {
                const speedMult = p.speed;
                const moveY = (frame * speedMult) % 100;
                const floatX = Math.sin((frame + p.delay) * 0.02) * 2;
                const opacity = 0.2 + Math.sin((frame + p.delay) * 0.05) * 0.15;

                return (
                    <div
                        key={p.id}
                        style={{
                            position: 'absolute',
                            left: `${(p.x + floatX) % 100}%`,
                            top: `${(p.y - moveY + 100) % 100}%`,
                            width: p.size,
                            height: p.size,
                            borderRadius: '50%',
                            backgroundColor: color,
                            opacity,
                            boxShadow: `0 0 ${p.size * 3}px ${color}`,
                            filter: 'blur(0.5px)',
                        }}
                    />
                );
            })}
        </AbsoluteFill>
    );
};

// ============================================
// 🎞️ EFECTO DE GRANO DE PELÍCULA
// ============================================
const FilmGrain: React.FC<{ opacity?: number }> = ({ opacity = 0.04 }) => {
    return (
        <AbsoluteFill style={{ pointerEvents: 'none', opacity, mixBlendMode: 'overlay' }}>
            <svg width="100%" height="100%">
                <filter id="grainy">
                    <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
                    <feColorMatrix type="saturate" values="0" />
                </filter>
                <rect width="100%" height="100%" filter="url(#grainy)" />
            </svg>
        </AbsoluteFill>
    );
};

// ============================================
// 🍽️ ESCENA DE PLATILLO
// ============================================
interface DishSceneProps {
    item: MenuItem;
    sceneDuration: number;
    accentColor: string;
    sceneIndex?: number;
    isSeamlessLoop?: boolean;
    isLastScene?: boolean;
    lightFxEnabled?: boolean;
    lightFxMode?: 'native' | 'softGlow' | 'vividPop' | 'warmBistro' | 'dramaticDark';
}

const DishScene: React.FC<DishSceneProps> = ({
    item,
    sceneDuration,
    accentColor,
    sceneIndex = 0,
    isSeamlessLoop = false,
    isLastScene = false,
    lightFxEnabled = false,
    lightFxMode = 'softGlow',
}) => {
    const frame = useCurrentFrame();
    const [imgError, setImgError] = useState(false);

    // Detección automática de mediaType si falta (basado en extensión)
    const mediaType = useMemo(() => {
        if (item.mediaType) return item.mediaType;
        const isVideo = item.image.toLowerCase().split('?')[0].endsWith('.mp4') ||
            item.image.toLowerCase().split('?')[0].endsWith('.webm') ||
            item.image.includes('video');
        return isVideo ? 'video' : 'image';
    }, [item.mediaType, item.image]);

    // Modos de movimiento automáticos para variedad cinemática
    const moveType = useMemo(() => {
        const types: ('zoom-in' | 'zoom-out' | 'pan-vertical')[] = ['zoom-in', 'zoom-out', 'pan-vertical'];
        return types[sceneIndex % types.length];
    }, [sceneIndex]);


    // Ken Burns Dinámico - Automático
    const scale = useMemo(() => {
        if (isSeamlessLoop && isLastScene) return 1;
        if (mediaType === 'video') return 1; // Sin zoom en videos

        if (moveType === 'zoom-in') {
            return interpolate(frame, [0, sceneDuration], [1, 1.15], { easing: Easing.out(Easing.quad), extrapolateRight: 'clamp' });
        }
        if (moveType === 'zoom-out') {
            return interpolate(frame, [0, sceneDuration], [1.15, 1], { easing: Easing.out(Easing.quad), extrapolateRight: 'clamp' });
        }
        return 1.1; // Base para paneo vertical
    }, [frame, sceneDuration, moveType, isSeamlessLoop, isLastScene, mediaType]);

    const translateY = useMemo(() => {
        if (isSeamlessLoop && isLastScene) return 0;
        if (mediaType === 'video' || moveType !== 'pan-vertical') return 0;

        return interpolate(frame, [0, sceneDuration], [-30, 30], { easing: Easing.inOut(Easing.quad), extrapolateRight: 'clamp' });
    }, [frame, sceneDuration, moveType, isSeamlessLoop, isLastScene, mediaType]);

    const translateX = useMemo(() => {
        return 0; // Simplificamos para no marear al usuario
    }, []);

    // Fade - Usando TRANSITION_FRAMES constantes
    // Si es un loop sin fin y es la primera escena, empezamos en opacidad 1 (ya visible)
    const startFadeIn = (isSeamlessLoop && sceneIndex === 0) ? 1 : 0;

    const fadeIn = interpolate(frame, [0, TRANSITION_FRAMES], [startFadeIn, 1], {
        extrapolateRight: 'clamp',
        easing: Easing.out(Easing.cubic),
    });

    const endFadeOut = (isSeamlessLoop && isLastScene) ? 1 : 0;

    const fadeOut = interpolate(
        frame,
        [sceneDuration - TRANSITION_FRAMES, sceneDuration],
        [1, endFadeOut],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.cubic) }
    );

    const opacity = Math.min(fadeIn, fadeOut);

    // BLINDAJE 1: Auto-FontSize dinámico + Multiplicador manual (Más agresivo)
    const getTextMultiplier = (mode?: string) => {
        if (mode === 'medium') return 1.4;
        if (mode === 'large') return 1.8;
        return 1.0;
    };

    const getNameFontSize = (text: string, mode?: string) => {
        const multiplier = getTextMultiplier(mode);
        let baseSize = 72;
        if (text.length > 30) baseSize = 48;
        else if (text.length > 20) baseSize = 60;
        return baseSize * multiplier;
    };

    const getDescFontSize = (text: string, mode?: string) => {
        const multiplier = getTextMultiplier(mode);
        let baseSize = 28;
        if (text.length > 80) baseSize = 20;
        else if (text.length > 50) baseSize = 24;
        return baseSize * multiplier;
    };

    // Text animation
    const textDelay = 15;
    const nameY = interpolate(frame, [textDelay, textDelay + 25], [40, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: Easing.out(Easing.back(1.5)),
    });

    const nameOpacity = interpolate(frame, [textDelay, textDelay + 20], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    const descOpacity = interpolate(frame, [textDelay + 10, textDelay + 30], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    const priceScale = interpolate(frame, [textDelay + 20, textDelay + 40], [0.5, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: Easing.out(Easing.back(2)),
    });

    const priceOpacity = interpolate(frame, [textDelay + 20, textDelay + 35], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    const textFadeOut = interpolate(
        frame,
        [sceneDuration - 30, sceneDuration - 10],
        [1, 0],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    // Resolución de imagen/video inteligente con fallback
    const mediaSrc = useMemo(() => {
        if (imgError) return FALLBACK_IMAGE;
        if (!item.image) return FALLBACK_IMAGE;

        if (item.image.startsWith('http') || item.image.startsWith('blob:')) {
            return item.image;
        }

        const cleanPath = item.image.startsWith('public/')
            ? item.image.replace('public/', '')
            : item.image;

        return staticFile(cleanPath);
    }, [item.image, imgError]);

    const isVideo = mediaType === 'video';

    // ── PRESET DE FILTROS ──────────────────────────────────────────────────────
    // off          = look cinematográfico oscuro (cuando Luz FX está apagado)
    // native       = imagen 100% original — solo gradiente mínimo para texto
    // softGlow     = Studio A — brillo suave, colores naturales
    // warmBistro   = Calidez  — tono dorado estilo bistró/Instagram
    // dramaticDark = Dramático — contraste fuerte, moody
    // vividPop     = Vivid Pop — colores intensos, look de anuncio comercial

    type FilterMode = 'native' | 'softGlow' | 'warmBistro' | 'dramaticDark' | 'vividPop';
    const mode: FilterMode | 'off' = !lightFxEnabled ? 'off' : (lightFxMode as FilterMode) || 'native';

    const mediaFilter: string | undefined = ({
        off:          undefined,
        native:       undefined,
        softGlow:     'brightness(1.07) contrast(1.18) saturate(1.1)',
        warmBistro:   'brightness(1.04) contrast(1.22) saturate(1.38)',
        dramaticDark: 'brightness(0.92) contrast(1.32) saturate(0.88)',
        vividPop:     'brightness(1.06) contrast(1.38) saturate(1.6)',
    } as Record<string, string | undefined>)[mode];

    // Gradiente de fondo — solo el bottom se oscurece para legibilidad del texto
    const lightingOverlay: string = ({
        off: `
            radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.4) 100%),
            linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.8) 100%)
        `,
        native: `
            linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.18) 28%, transparent 50%)
        `,
        softGlow: `
            linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.22) 32%, transparent 56%)
        `,
        warmBistro: `
            radial-gradient(ellipse at 50% 45%, rgba(255,195,80,0.07) 0%, transparent 65%),
            linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.25) 35%, transparent 58%)
        `,
        dramaticDark: `
            radial-gradient(ellipse at center, transparent 25%, rgba(0,0,0,0.52) 100%),
            linear-gradient(to bottom, transparent 35%, rgba(0,0,0,0.88) 100%)
        `,
        vividPop: `
            radial-gradient(ellipse at 50% 40%, transparent 50%, rgba(0,0,0,0.2) 100%),
            linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.15) 35%, transparent 58%)
        `,
    } as Record<string, string>)[mode];

    const vignetteShadow: string = ({
        off:          'inset 0 0 200px rgba(0,0,0,0.7)',
        native:       'none',
        softGlow:     'inset 0 0 70px rgba(0,0,0,0.12)',
        warmBistro:   'inset 0 0 150px rgba(0,0,0,0.44)',
        dramaticDark: 'inset 0 0 200px rgba(0,0,0,0.72)',
        vividPop:     'inset 0 0 100px rgba(0,0,0,0.22)',
    } as Record<string, string>)[mode];

    const toneOverlayColor: string = ({
        off:          'rgba(255, 200, 100, 0.15)',
        native:       'transparent',
        softGlow:     'transparent',
        warmBistro:   'rgba(255, 175, 50, 0.09)',
        dramaticDark: 'rgba(255, 200, 100, 0.15)',
        vividPop:     'rgba(255,255,255,0.015)',
    } as Record<string, string>)[mode];

    const toneBlendMode: React.CSSProperties['mixBlendMode'] = ({
        off:          'overlay' as const,
        native:       'normal' as const,
        softGlow:     'normal' as const,
        warmBistro:   'overlay' as const,
        dramaticDark: 'overlay' as const,
        vividPop:     'soft-light' as const,
    } as Record<string, React.CSSProperties['mixBlendMode']>)[mode];

    const clarityOverlay: string = ({
        off:          'transparent',
        native:       'transparent',
        softGlow:     'linear-gradient(to bottom, rgba(255,255,255,0.05) 0%, transparent 45%)',
        warmBistro:   'linear-gradient(to bottom, rgba(255,220,120,0.04) 0%, transparent 45%)',
        dramaticDark: 'transparent',
        vividPop:     'linear-gradient(to bottom, rgba(255,255,255,0.04) 0%, rgba(0,0,0,0.06) 100%)',
    } as Record<string, string>)[mode];

    const clarityOverlayOpacity: number = ({
        off:          0,
        native:       0,
        softGlow:     0.5,
        warmBistro:   0.5,
        dramaticDark: 0,
        vividPop:     0.55,
    } as Record<string, number>)[mode];

    const titleColor: string = ({
        off:          DEFAULT_COLORS.cream,
        native:       '#ffffff',
        softGlow:     '#ffffff',
        warmBistro:   '#fff8ec',
        dramaticDark: DEFAULT_COLORS.cream,
        vividPop:     '#ffffff',
    } as Record<string, string>)[mode];

    const descriptionColor: string = ({
        off:          DEFAULT_COLORS.cream,
        native:       'rgba(255,255,255,0.92)',
        softGlow:     'rgba(255,255,255,0.92)',
        warmBistro:   'rgba(255,245,220,0.95)',
        dramaticDark: DEFAULT_COLORS.cream,
        vividPop:     'rgba(255,255,255,0.94)',
    } as Record<string, string>)[mode];

    const titleShadow: string = ({
        off:          '4px 4px 0 rgba(0,0,0,0.5), 0 0 40px rgba(0,0,0,0.8)',
        native:       '0 2px 20px rgba(0,0,0,0.8)',
        softGlow:     '0 2px 16px rgba(0,0,0,0.55)',
        warmBistro:   '0 3px 18px rgba(0,0,0,0.55)',
        dramaticDark: '4px 4px 0 rgba(0,0,0,0.5), 0 0 40px rgba(0,0,0,0.8)',
        vividPop:     '0 3px 14px rgba(0,0,0,0.55)',
    } as Record<string, string>)[mode];

    const descriptionShadow: string = ({
        off:          '2px 2px 8px rgba(0,0,0,0.9)',
        native:       '0 2px 12px rgba(0,0,0,0.85)',
        softGlow:     '0 2px 10px rgba(0,0,0,0.6)',
        warmBistro:   '0 2px 10px rgba(0,0,0,0.6)',
        dramaticDark: '2px 2px 8px rgba(0,0,0,0.9)',
        vividPop:     '0 2px 10px rgba(0,0,0,0.65)',
    } as Record<string, string>)[mode];

    const priceCardBg: string = ({
        off:          `${accentColor}20`,
        native:       'rgba(0,0,0,0.35)',
        softGlow:     'rgba(255,255,255,0.14)',
        warmBistro:   'rgba(255,210,100,0.12)',
        dramaticDark: `${accentColor}20`,
        vividPop:     'rgba(255,255,255,0.1)',
    } as Record<string, string>)[mode];

    const priceCardBorder: string = ({
        off:          `1px solid ${accentColor}40`,
        native:       `1px solid ${accentColor}60`,
        softGlow:     '1px solid rgba(255,255,255,0.4)',
        warmBistro:   '1px solid rgba(255,210,100,0.45)',
        dramaticDark: `1px solid ${accentColor}40`,
        vividPop:     '1px solid rgba(255,255,255,0.35)',
    } as Record<string, string>)[mode];

    const priceShadow: string = ({
        off:          `0 0 15px ${accentColor}80`,
        native:       `0 0 14px ${accentColor}70`,
        softGlow:     `0 0 12px ${accentColor}55`,
        warmBistro:   `0 0 14px ${accentColor}66`,
        dramaticDark: `0 0 15px ${accentColor}80`,
        vividPop:     `0 0 16px ${accentColor}77`,
    } as Record<string, string>)[mode];

    return (
        <AbsoluteFill style={{ opacity }}>
            <div style={{ position: 'absolute', width: '100%', height: '100%', overflow: 'hidden' }}>
                {isVideo ? (
                    <Video
                        src={mediaSrc}
                        onError={() => setImgError(true)}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transform: `scale(${scale}) translateY(${translateY}px)`,
                            filter: mediaFilter,
                        }}
                        muted
                        loop
                        pauseWhenBuffering
                    />
                ) : (
                    <Img
                        src={mediaSrc}
                        onError={() => setImgError(true)}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transform: `scale(${scale}) translateY(${translateY}px)`,
                            filter: mediaFilter,
                        }}
                    />
                )}

                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background: lightingOverlay,
                    }}
                />

                {/* Vignette Profundo */}
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        boxShadow: vignetteShadow,
                    }}
                />

                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background: toneOverlayColor,
                        mixBlendMode: toneBlendMode,
                    }}
                />

                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background: clarityOverlay,
                        mixBlendMode: 'soft-light',
                        opacity: clarityOverlayOpacity,
                    }}
                />
            </div>

            <div
                style={{
                    position: 'absolute',
                    bottom: 80,
                    left: 80,
                    right: 80,
                    opacity: textFadeOut,
                }}
            >
                <h1
                    style={{
                        fontFamily: '"Playfair Display", Georgia, serif',
                        fontSize: getNameFontSize(item.name, item.fontSizeMode),
                        fontWeight: 900,
                        color: titleColor,
                        margin: 0,
                        textShadow: titleShadow,
                        opacity: nameOpacity,
                        transform: `translateY(${nameY}px)`,
                        letterSpacing: '-0.02em',
                        lineHeight: 1.1,
                        maxWidth: '90%'
                    }}
                >
                    {item.name}
                </h1>

                <p
                    style={{
                        fontFamily: '"Lato", Arial, sans-serif',
                        fontSize: getDescFontSize(item.description, item.fontSizeMode),
                        fontWeight: 400,
                        color: descriptionColor,
                        margin: '20px 0 0 0',
                        textShadow: descriptionShadow,
                        opacity: descOpacity,
                        letterSpacing: '0.05em',
                        lineHeight: 1.4,
                        maxWidth: '80%',
                        fontStyle: 'italic'
                    }}
                >
                    {item.description}
                </p>

                <div
                    style={{
                        marginTop: 35,
                        display: 'inline-block',
                        opacity: priceOpacity,
                        transform: `scale(${priceScale})`,
                    }}
                >
                    <div style={{
                        backgroundColor: priceCardBg,
                        backdropFilter: 'blur(10px)',
                        padding: '10px 25px',
                        borderRadius: '15px',
                        border: priceCardBorder,
                    }}>
                        <span
                            style={{
                                fontFamily: '"Playfair Display", Georgia, serif',
                                fontSize: 48 * getTextMultiplier(item.fontSizeMode),
                                fontWeight: 900,
                                color: accentColor,
                                textShadow: priceShadow,
                                letterSpacing: '0.02em',
                            }}
                        >
                            {(item.showCurrencySymbol !== false) ? item.price : item.price.replace(/[^\d.,]/g, '').trim()}
                        </span>
                    </div>
                </div>
            </div>

            {/* Decoración lateral */}
            <div
                style={{
                    position: 'absolute',
                    bottom: 60,
                    left: 80,
                    width: interpolate(frame, [20, 50], [0, 300], {
                        extrapolateLeft: 'clamp',
                        extrapolateRight: 'clamp',
                    }),
                    height: 4,
                    background: `linear-gradient(90deg, ${accentColor}, transparent)`,
                    opacity: textFadeOut,
                    boxShadow: `0 0 15px ${accentColor}`
                }}
            />
        </AbsoluteFill>
    );
};

// ============================================
// 🎬 COMPOSICIÓN PRINCIPAL CON PROPS
// ============================================

const DEFAULT_MENU_ITEMS: MenuItem[] = [
    {
        image: 'food1.jpg',
        name: 'Enchiladas Suizas',
        description: 'Bañadas en salsa cremosa con arroz y frijoles',
        price: '$14.99',
    },
    {
        image: 'food2.jpg',
        name: 'Mojarra a la Diabla',
        description: 'Pescado entero con camarones en salsa picante',
        price: '$24.99',
    }
];

export const PremiumMenuDynamic: React.FC<PremiumMenuProps> = ({
    menuItems = DEFAULT_MENU_ITEMS,
    restaurantName = 'Los Cuates',
    accentColor = DEFAULT_COLORS.gold,
    sceneDuration = 4.0, // Ahora en segundos
    isSeamlessLoop: isSeamlessLoopProp = false,
    logoUri,
    lightFxEnabled = false,
    lightFxMode = 'softGlow',
}) => {
    // Asegurar booleano real (parche para CLI de Remotion)
    const isSeamlessLoop = isSeamlessLoopProp === true || (isSeamlessLoopProp as unknown) === 'true';

    // Convertir segundos a frames para la lógica interna
    const sceneDurationFrames = Math.round(sceneDuration * 30);
    const grainOpacity = !lightFxEnabled
        ? 0.04
        : lightFxMode === 'vividPop'
            ? 0.002
            : lightFxMode === 'softGlow'
                ? 0.012  // Studio A: grano muy sutil para añadir textura natural
                : lightFxMode === 'warmBistro'
                    ? 0.018  // Calidez: grano suave tipo película analógica
                    : lightFxMode === 'dramaticDark'
                        ? 0.04   // Dramático: mismo grano que cinematográfico OFF
                        : 0.003;

    // BLINDAJE 3: Fallback para menú vacío (Evita crash de Remotion)
    const safeMenuItems = useMemo(() => {
        if (!menuItems || menuItems.length === 0) {
            return [{
                name: 'Menú en Construcción',
                description: 'Próximamente deliciosos platillos para ti.',
                price: '$0.00',
                image: FALLBACK_IMAGE
            }];
        }
        return menuItems;
    }, [menuItems]);

    const itemsToRender = useMemo(() => {
        if (isSeamlessLoop && safeMenuItems.length > 0) {
            return [...safeMenuItems, safeMenuItems[0]];
        }
        return safeMenuItems;
    }, [safeMenuItems, isSeamlessLoop]);

    // Calcular frames acumulados para duraciones dinámicas
    const itemsWithSequences = useMemo(() => {
        let currentFrame = 0;
        return itemsToRender.map((item, index) => {
            let itemDurationFrames = item.duration
                ? Math.round(item.duration * 30)
                : sceneDurationFrames;

            // Asegurar duración mínima
            itemDurationFrames = Math.max(itemDurationFrames, 30);

            // Si es el último item y es un loop sin fin, solo lo necesitamos 
            // lo suficiente para que termine la transición (fadeIn del primero)
            if (isSeamlessLoop && index === itemsToRender.length - 1) {
                itemDurationFrames = TRANSITION_FRAMES;
            }

            const startFrame = currentFrame;

            const isLast = (index === itemsToRender.length - 1);
            const offset = isLast ? 0 : TRANSITION_FRAMES;

            const effectiveDuration = Math.max(itemDurationFrames - offset, 1);
            currentFrame += effectiveDuration;

            return {
                ...item,
                startFrame,
                durationFrames: itemDurationFrames,
                sceneIndex: index
            };
        });
    }, [itemsToRender, sceneDurationFrames, isSeamlessLoop]);

    return (
        <AbsoluteFill style={{ backgroundColor: DEFAULT_COLORS.dark }}>
            <FilmGrain opacity={grainOpacity} />
            {!lightFxEnabled && <GoldenParticles color={accentColor} />}

            {itemsWithSequences.map((item, index) => (
                <Sequence
                    key={`${index}-${item.name}-${index}`}
                    from={item.startFrame}
                    durationInFrames={item.durationFrames}
                >
                    <DishScene
                        item={item}
                        sceneDuration={item.durationFrames}
                        accentColor={accentColor}
                        sceneIndex={item.sceneIndex}
                        isSeamlessLoop={isSeamlessLoop}
                        isLastScene={index === itemsWithSequences.length - 1}
                        lightFxEnabled={lightFxEnabled}
                        lightFxMode={lightFxMode}
                    />
                </Sequence>
            ))}

            {logoUri && (
                <AbsoluteFill style={{ pointerEvents: 'none' }}>
                    <div style={{
                        position: 'absolute',
                        top: 40,
                        right: 40,
                        width: 150,
                        height: 150,
                        opacity: 0.8,
                        filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))',
                    }}>
                        <Img src={logoUri} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                </AbsoluteFill>
            )}
        </AbsoluteFill>
    );
};

export const PremiumMenu = PremiumMenuDynamic;
