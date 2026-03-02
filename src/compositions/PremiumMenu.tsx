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
}

export interface PremiumMenuProps {
    menuItems: MenuItem[];
    restaurantName?: string;
    accentColor?: string;
    sceneDuration?: number;
    logoUri?: string;
    backgroundMusic?: string;
    isSeamlessLoop?: boolean;
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
        return Array.from({ length: 25 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 3 + 1,
            delay: Math.random() * 200,
        }));
    }, []);

    const cycleProgress = (frame % durationInFrames) / durationInFrames;
    const angle = cycleProgress * Math.PI * 2;

    return (
        <>
            {particles.map((p) => {
                const floatY = p.y + Math.sin(angle + p.delay * 0.01) * 3;
                const floatX = p.x + Math.cos(angle + p.delay * 0.01) * 2;
                const opacity = 0.3 + Math.sin(angle + p.delay * 0.02) * 0.2;

                return (
                    <div
                        key={p.id}
                        style={{
                            position: 'absolute',
                            left: `${floatX}%`,
                            top: `${floatY}%`,
                            width: p.size,
                            height: p.size,
                            borderRadius: '50%',
                            backgroundColor: color,
                            opacity,
                            boxShadow: `0 0 ${p.size * 2}px ${color}`,
                        }}
                    />
                );
            })}
        </>
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
}

const DishScene: React.FC<DishSceneProps> = ({ item, sceneDuration, accentColor, sceneIndex = 0, isSeamlessLoop = false, isLastScene = false }) => {
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

    // Ken Burns - Ajustado a la duración real de la escena
    // Si es la escena "ancla" del loop (la última de la secuencia duplicada), 
    // la fijamos en scale 1 para que coincida perfectamente con el inicio del video
    const scale = (isSeamlessLoop && isLastScene) ? 1 : interpolate(frame, [0, sceneDuration], [1, 1.12], {
        easing: Easing.out(Easing.quad),
        extrapolateRight: 'clamp'
    });

    const translateX = (isSeamlessLoop && isLastScene) ? 0 : interpolate(frame, [0, sceneDuration], [0, -15], {
        easing: Easing.inOut(Easing.quad),
        extrapolateRight: 'clamp'
    });

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
                            transform: `scale(${scale}) translateX(${translateX}px)`,
                        }}
                        muted
                        loop
                    />
                ) : (
                    <Img
                        src={mediaSrc}
                        onError={() => setImgError(true)}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transform: `scale(${scale}) translateX(${translateX}px)`,
                        }}
                    />
                )}

                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background: `
              radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%),
              linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.7) 100%)
            `,
                    }}
                />

                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(255, 200, 100, 0.15)',
                        mixBlendMode: 'overlay',
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
                        color: DEFAULT_COLORS.cream,
                        margin: 0,
                        textShadow: `4px 4px 0 rgba(0,0,0,0.5), 0 0 40px rgba(0,0,0,0.8)`,
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
                        color: DEFAULT_COLORS.cream,
                        margin: '20px 0 0 0',
                        textShadow: '2px 2px 8px rgba(0,0,0,0.9)',
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
                        backgroundColor: `${accentColor}20`,
                        backdropFilter: 'blur(10px)',
                        padding: '10px 25px',
                        borderRadius: '15px',
                        border: `1px solid ${accentColor}40`,
                    }}>
                        <span
                            style={{
                                fontFamily: '"Playfair Display", Georgia, serif',
                                fontSize: 48 * getTextMultiplier(item.fontSizeMode),
                                fontWeight: 900,
                                color: accentColor,
                                textShadow: `0 0 15px ${accentColor}80`,
                                letterSpacing: '0.02em',
                            }}
                        >
                            {item.price}
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
    isSeamlessLoop = false,
    logoUri,
}) => {
    // Convertir segundos a frames para la lógica interna
    const sceneDurationFrames = Math.round(sceneDuration * 30);

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

            // Si es el último item y es un loop sin fin, solo lo necesitamos 
            // lo suficiente para que termine la transición (fadeIn del primero)
            if (isSeamlessLoop && index === itemsToRender.length - 1) {
                itemDurationFrames = TRANSITION_FRAMES;
            }

            const startFrame = currentFrame;

            const offset = (index === itemsToRender.length - 1)
                ? 0
                : TRANSITION_FRAMES;

            currentFrame += (itemDurationFrames - offset);

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
            <GoldenParticles color={accentColor} />

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

            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    boxShadow: 'inset 0 0 150px rgba(0,0,0,0.4)',
                    pointerEvents: 'none',
                }}
            />
        </AbsoluteFill>
    );
};

export const PremiumMenu = PremiumMenuDynamic;
