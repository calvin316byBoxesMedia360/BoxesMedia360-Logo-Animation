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
    lightFxMode?: 'softGlow' | 'vividPop';
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
    lightFxMode?: 'softGlow' | 'vividPop';
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
    const mediaFilter = !lightFxEnabled
        ? undefined
        : lightFxMode === 'vividPop'
            ? 'brightness(1.18) contrast(1.24) saturate(1.34)'
            : 'brightness(1.14) contrast(1.18) saturate(1.2)';

    const lightingOverlay = !lightFxEnabled
        ? `
              radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.4) 100%),
              linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.8) 100%)
            `
        : lightFxMode === 'vividPop'
            ? `
              radial-gradient(ellipse at 52% 45%, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.08) 40%, rgba(0,0,0,0.12) 100%),
              linear-gradient(to bottom, rgba(255,255,255,0.08) 0%, rgba(255,245,220,0.05) 38%, rgba(0,0,0,0.2) 100%)
            `
            : `
              radial-gradient(ellipse at 50% 45%, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.06) 40%, rgba(0,0,0,0.14) 100%),
              linear-gradient(to bottom, rgba(255,255,255,0.06) 0%, rgba(255,246,226,0.04) 35%, rgba(0,0,0,0.24) 100%)
            `;

    const clarityOverlay = !lightFxEnabled
        ? 'transparent'
        : lightFxMode === 'vividPop'
            ? 'linear-gradient(to bottom, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0.1) 100%)'
            : 'linear-gradient(to bottom, rgba(255,255,255,0.02) 0%, rgba(0,0,0,0.12) 100%)';

    const vignetteShadow = !lightFxEnabled
        ? 'inset 0 0 200px rgba(0,0,0,0.7)'
        : lightFxMode === 'vividPop'
            ? 'inset 0 0 70px rgba(0,0,0,0.18)'
            : 'inset 0 0 80px rgba(0,0,0,0.22)';

    const toneOverlayColor = !lightFxEnabled
        ? 'rgba(255, 200, 100, 0.15)'
        : lightFxMode === 'vividPop'
            ? 'rgba(255, 248, 230, 0.08)'
            : 'rgba(255, 245, 220, 0.06)';

    const toneBlendMode = !lightFxEnabled
        ? 'overlay'
        : lightFxMode === 'vividPop'
            ? 'screen'
            : 'soft-light';

    const titleColor = lightFxEnabled ? '#fffdf7' : DEFAULT_COLORS.cream;
    const descriptionColor = lightFxEnabled ? 'rgba(255,248,236,0.96)' : DEFAULT_COLORS.cream;
    const titleShadow = lightFxEnabled
        ? (lightFxMode === 'vividPop'
            ? '0 3px 14px rgba(0,0,0,0.36)'
            : '0 3px 12px rgba(0,0,0,0.38)')
        : '4px 4px 0 rgba(0,0,0,0.5), 0 0 40px rgba(0,0,0,0.8)';
    const descriptionShadow = lightFxEnabled
        ? '0 2px 8px rgba(0,0,0,0.42)'
        : '2px 2px 8px rgba(0,0,0,0.9)';
    const priceCardBg = lightFxEnabled
        ? 'rgba(255,255,255,0.18)'
        : `${accentColor}20`;
    const priceCardBorder = lightFxEnabled
        ? '1px solid rgba(255,255,255,0.35)'
        : `1px solid ${accentColor}40`;
    const priceShadow = lightFxEnabled
        ? `0 0 10px ${accentColor}66`
        : `0 0 15px ${accentColor}80`;

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
                        mixBlendMode: 'multiply',
                        opacity: lightFxEnabled ? 1 : 0,
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
            ? 0.006
            : 0.01;

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
