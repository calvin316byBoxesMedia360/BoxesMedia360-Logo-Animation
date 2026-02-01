import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing, Img, staticFile } from 'remotion';
import React, { useMemo } from 'react';

// ============================================
// 🎨 PALETA - SOLO VERDE MENTA
// ============================================
const COLORS = {
    background: '#000000',
    primary: '#00FFD4',       // Verde menta único
    glow: '#00FFE0',
    glowSoft: 'rgba(0, 255, 212, 0.5)',
};

// ============================================
// ✨ PARTÍCULA AMBIENTAL (SIEMPRE FLOTANDO)
// ============================================
interface AmbientParticleProps {
    x: number;
    y: number;
    size: number;
    delay: number;
    speedX: number;
    speedY: number;
    flickerPhase: number;
    depthLayer: number;
}

const AmbientParticle: React.FC<AmbientParticleProps> = ({
    x, y, size, delay, speedX, speedY, flickerPhase, depthLayer
}) => {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();

    // CICLO SEAMLESS: usar progreso del loop (0 a 1) multiplicado por 2*PI
    // Esto garantiza que posición al frame 0 = posición al frame final
    const cycleProgress = (frame % durationInFrames) / durationInFrames;
    const angle = cycleProgress * Math.PI * 2; // Un ciclo completo por loop

    // Movimiento flotante sincronizado con el loop
    // Cada partícula tiene su propio offset (delay) pero completa ciclos exactos
    const floatX = x + Math.sin(angle + delay * 0.01) * 8 * speedX * 100;
    const floatY = y + Math.cos(angle + delay * 0.01) * 6 * speedY * 100;

    // Parpadeo también sincronizado con el loop
    const flickerAngle = cycleProgress * Math.PI * 2;
    const flicker = interpolate(
        Math.sin(flickerAngle + flickerPhase * 0.01),
        [-1, 1],
        [0.3, 0.8]
    );

    // Depth of field: partículas lejanas más borrosas
    const blurAmount = (1 - depthLayer) * 1.5;

    return (
        <div
            style={{
                position: 'absolute',
                left: `${floatX}%`,
                top: `${floatY}%`,
                width: size,
                height: size,
                borderRadius: '50%',
                backgroundColor: COLORS.primary,
                opacity: flicker * (0.4 + depthLayer * 0.4),
                transform: 'translate(-50%, -50%)',
                boxShadow: `0 0 ${size * 1.2}px ${COLORS.primary}`,
                filter: `blur(${blurAmount}px)`,
            }}
        />
    );
};

// ============================================
// 🌌 SISTEMA DE PARTÍCULAS AMBIENTALES
// (Siempre presentes, flotando independientemente)
// ============================================
const AmbientParticleSystem: React.FC = () => {
    const particles = useMemo(() => {
        return Array.from({ length: 85 }, (_, i) => {
            // Distribución por TODA la pantalla
            const x = Math.random() * 100;
            const y = Math.random() * 100;

            // Tamaños variados pero fijos
            const sizeRand = Math.random();
            let size: number;
            if (sizeRand < 0.6) {
                size = Math.random() * 2 + 2;   // 60% pequeñas (2-4px)
            } else if (sizeRand < 0.9) {
                size = Math.random() * 2 + 4;   // 30% medianas (4-6px)
            } else {
                size = Math.random() * 2 + 6;   // 10% grandes (6-8px)
            }

            return {
                id: i,
                x,
                y,
                size,
                delay: Math.random() * 500,
                speedX: 0.003 + Math.random() * 0.004,  // Super lento
                speedY: 0.002 + Math.random() * 0.003,
                flickerPhase: Math.random() * 1000,
                depthLayer: Math.random(),
            };
        });
    }, []);

    return (
        <>
            {particles.map((p) => (
                <AmbientParticle key={p.id} {...p} />
            ))}
        </>
    );
};

// ============================================
// 🖼️ LOGO QUE EMERGE (independiente de partículas)
// ============================================
const EmergingLogo: React.FC = () => {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();

    const cycleProgress = (frame % durationInFrames) / durationInFrames;

    let logoOpacity = 0;
    let logoScale = 0.95;
    let logoBlur = 15;

    if (cycleProgress < 0.15) {
        // Invisible al inicio
        logoOpacity = 0;
        logoBlur = 20;
    } else if (cycleProgress < 0.35) {
        // Emergiendo lentamente
        logoOpacity = interpolate(cycleProgress, [0.15, 0.35], [0, 1], {
            easing: Easing.out(Easing.cubic),
        });
        logoBlur = interpolate(cycleProgress, [0.15, 0.35], [18, 0]);
        logoScale = interpolate(cycleProgress, [0.15, 0.35], [0.96, 1]);
    } else if (cycleProgress < 0.65) {
        // Visible y estable
        logoOpacity = 1;
        logoBlur = 0;
        logoScale = 1 + Math.sin(frame * 0.012) * 0.003;
    } else if (cycleProgress < 0.85) {
        // Desvaneciéndose lentamente
        logoOpacity = interpolate(cycleProgress, [0.65, 0.85], [1, 0], {
            easing: Easing.in(Easing.cubic),
        });
        logoBlur = interpolate(cycleProgress, [0.65, 0.85], [0, 20]);
        logoScale = interpolate(cycleProgress, [0.65, 0.85], [1, 1.02]);
    } else {
        logoOpacity = 0;
    }

    // Glitch muy sutil
    const glitchX = Math.sin(frame * 0.1) * 0.8 * logoOpacity;
    const glitchY = Math.cos(frame * 0.13) * 0.4 * logoOpacity;

    return (
        <div
            style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                transform: `translate(${glitchX}px, ${glitchY}px) scale(${logoScale})`,
            }}
        >
            {/* Glow detrás - REDUCIDO */}
            <Img
                src={staticFile('boxesmedia360-logo-transparent.png')}
                style={{
                    position: 'absolute',
                    width: 380,
                    opacity: logoOpacity * 0.2,
                    filter: 'blur(30px) brightness(1.3)',
                }}
            />
            {/* Aberración cromática */}
            <Img
                src={staticFile('boxesmedia360-logo-transparent.png')}
                style={{
                    position: 'absolute',
                    width: 380,
                    opacity: logoOpacity * 0.06,
                    transform: 'translateX(-3px)',
                    filter: 'hue-rotate(-40deg)',
                }}
            />
            <Img
                src={staticFile('boxesmedia360-logo-transparent.png')}
                style={{
                    position: 'absolute',
                    width: 380,
                    opacity: logoOpacity * 0.06,
                    transform: 'translateX(3px)',
                    filter: 'hue-rotate(30deg)',
                }}
            />

            {/* Logo principal - GLOW REDUCIDO */}
            <Img
                src={staticFile('boxesmedia360-logo-transparent.png')}
                style={{
                    width: 380,
                    opacity: logoOpacity,
                    filter: `
            blur(${logoBlur}px)
            drop-shadow(0 0 6px ${COLORS.glow})
            drop-shadow(0 0 12px ${COLORS.primary})
            saturate(1.1)
          `,
                }}
            />
        </div>
    );
};

// ============================================
// ✍️ SLOGAN (aparece después del logo)
// ============================================
const EmergingSlogan: React.FC = () => {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();

    const cycleProgress = (frame % durationInFrames) / durationInFrames;

    let opacity = 0;
    let blur = 8;
    let y = 15;

    if (cycleProgress < 0.32) {
        opacity = 0;
    } else if (cycleProgress < 0.45) {
        opacity = interpolate(cycleProgress, [0.32, 0.45], [0, 1]);
        blur = interpolate(cycleProgress, [0.32, 0.45], [10, 0]);
        y = interpolate(cycleProgress, [0.32, 0.45], [15, 0]);
    } else if (cycleProgress < 0.58) {
        opacity = 1;
        blur = 0;
        y = 0;
    } else if (cycleProgress < 0.72) {
        opacity = interpolate(cycleProgress, [0.58, 0.72], [1, 0]);
        blur = interpolate(cycleProgress, [0.58, 0.72], [0, 10]);
        y = interpolate(cycleProgress, [0.58, 0.72], [0, -10]);
    } else {
        opacity = 0;
    }

    return (
        <div
            style={{
                marginTop: 45,
                opacity,
                transform: `translateY(${y}px)`,
                filter: `blur(${blur}px)`,
            }}
        >
            <p
                style={{
                    fontFamily: 'Arial, sans-serif',
                    fontSize: 18,
                    fontWeight: 300,
                    letterSpacing: '0.45em',
                    color: COLORS.primary,
                    textShadow: `
            0 0 6px ${COLORS.glow},
            0 0 12px ${COLORS.primary}
          `,
                    margin: 0,
                }}
            >
                CREATIVE. DIGITAL. INFINITE.
            </p>
        </div>
    );
};

// ============================================
// 🎬 COMPOSICIÓN PRINCIPAL
// ============================================
export const HolographicParticlesV2: React.FC = () => {
    return (
        <AbsoluteFill
            style={{
                backgroundColor: COLORS.background,
                overflow: 'hidden',
            }}
        >
            {/* Gradiente radial muy sutil */}
            <div
                style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    background: `radial-gradient(
            ellipse at center,
            rgba(0, 255, 212, 0.025) 0%,
            transparent 40%
          )`,
                }}
            />

            {/* Partículas ambientales - SIEMPRE flotando */}
            <AmbientParticleSystem />

            {/* Logo y slogan - emergen/desaparecen independientemente */}
            <AbsoluteFill
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <EmergingLogo />
                <EmergingSlogan />
            </AbsoluteFill>

            {/* Vignette sutil */}
            <div
                style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    background: `radial-gradient(
            ellipse at center,
            transparent 35%,
            rgba(0, 0, 0, 0.4) 100%
          )`,
                    pointerEvents: 'none',
                }}
            />
        </AbsoluteFill>
    );
};
