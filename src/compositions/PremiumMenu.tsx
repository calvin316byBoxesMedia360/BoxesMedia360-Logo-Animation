import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing, Img, staticFile, Sequence } from 'remotion';
import React, { useMemo } from 'react';

// ============================================
// 📋 TIPOS - DEFINICIÓN DE PROPS
// ============================================
export interface MenuItem {
    image: string;
    name: string;
    description: string;
    price: string;
}

export interface PremiumMenuProps {
    menuItems: MenuItem[];
    restaurantName?: string;
    accentColor?: string;
    sceneDuration?: number;
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
}

const DishScene: React.FC<DishSceneProps> = ({ item, sceneDuration, accentColor }) => {
    const frame = useCurrentFrame();

    // Ken Burns
    const scale = interpolate(frame, [0, sceneDuration], [1, 1.12], {
        easing: Easing.out(Easing.quad),
    });

    const translateX = interpolate(frame, [0, sceneDuration], [0, -15], {
        easing: Easing.inOut(Easing.quad),
    });

    // Fade
    const fadeIn = interpolate(frame, [0, TRANSITION_FRAMES], [0, 1], {
        extrapolateRight: 'clamp',
        easing: Easing.out(Easing.cubic),
    });

    const fadeOut = interpolate(
        frame,
        [sceneDuration - TRANSITION_FRAMES, sceneDuration],
        [1, 0],
        { extrapolateLeft: 'clamp', easing: Easing.in(Easing.cubic) }
    );

    const opacity = Math.min(fadeIn, fadeOut);

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

    return (
        <AbsoluteFill style={{ opacity }}>
            <div style={{ position: 'absolute', width: '100%', height: '100%', overflow: 'hidden' }}>
                <Img
                    src={
                        item.image.startsWith('http') || item.image.startsWith('blob:')
                            ? item.image
                            : staticFile(item.image)
                    }
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transform: `scale(${scale}) translateX(${translateX}px)`,
                    }}
                />

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
                    bottom: 60,
                    left: 60,
                    right: 60,
                    opacity: textFadeOut,
                }}
            >
                <h1
                    style={{
                        fontFamily: '"Playfair Display", Georgia, serif',
                        fontSize: 72,
                        fontWeight: 700,
                        color: DEFAULT_COLORS.cream,
                        margin: 0,
                        textShadow: `2px 2px 0 ${DEFAULT_COLORS.dark}, 0 0 30px rgba(0,0,0,0.8)`,
                        opacity: nameOpacity,
                        transform: `translateY(${nameY}px)`,
                        letterSpacing: '0.02em',
                    }}
                >
                    {item.name}
                </h1>

                <p
                    style={{
                        fontFamily: '"Lato", Arial, sans-serif',
                        fontSize: 28,
                        fontWeight: 300,
                        color: DEFAULT_COLORS.cream,
                        margin: '15px 0 0 0',
                        textShadow: '1px 1px 4px rgba(0,0,0,0.8)',
                        opacity: descOpacity,
                        letterSpacing: '0.05em',
                    }}
                >
                    {item.description}
                </p>

                <div
                    style={{
                        marginTop: 25,
                        display: 'inline-block',
                        opacity: priceOpacity,
                        transform: `scale(${priceScale})`,
                    }}
                >
                    <span
                        style={{
                            fontFamily: '"Playfair Display", Georgia, serif',
                            fontSize: 42,
                            fontWeight: 700,
                            color: accentColor,
                            textShadow: `0 0 10px ${accentColor}, 0 0 20px ${accentColor}50`,
                            letterSpacing: '0.02em',
                        }}
                    >
                        {item.price}
                    </span>
                </div>
            </div>

            <div
                style={{
                    position: 'absolute',
                    bottom: 40,
                    left: 60,
                    width: interpolate(frame, [20, 50], [0, 200], {
                        extrapolateLeft: 'clamp',
                        extrapolateRight: 'clamp',
                    }),
                    height: 2,
                    background: `linear-gradient(90deg, ${accentColor}, transparent)`,
                    opacity: textFadeOut,
                }}
            />
        </AbsoluteFill>
    );
};

// ============================================
// 🎬 COMPOSICIÓN PRINCIPAL CON PROPS
// ============================================

// Datos por defecto para preview en Studio
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
    },
    {
        image: 'food3.jpg',
        name: 'Micheladas Premium',
        description: 'Con camarones frescos y cerveza importada',
        price: '$12.99',
    },
    {
        image: 'food4.jpg',
        name: 'Pupusas Tradicionales',
        description: 'Con curtido y salsa roja casera',
        price: '$9.99',
    },
];

export const PremiumMenuDynamic: React.FC<PremiumMenuProps> = ({
    menuItems = DEFAULT_MENU_ITEMS,
    restaurantName = 'Los Cuates',
    accentColor = DEFAULT_COLORS.gold,
    sceneDuration = 120,
}) => {
    return (
        <AbsoluteFill style={{ backgroundColor: DEFAULT_COLORS.dark }}>
            <GoldenParticles color={accentColor} />

            {menuItems.map((item, index) => (
                <Sequence
                    key={index}
                    from={index * (sceneDuration - TRANSITION_FRAMES)}
                    durationInFrames={sceneDuration}
                >
                    <DishScene
                        item={item}
                        sceneDuration={sceneDuration}
                        accentColor={accentColor}
                    />
                </Sequence>
            ))}

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

// Mantener export original para compatibilidad
export const PremiumMenu = PremiumMenuDynamic;
