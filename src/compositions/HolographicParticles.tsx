import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';
import React, { useMemo } from 'react';

// ============================================
// 🎨 PALETA DE COLORES BOXESMEDIA
// ============================================
const COLORS = {
    primary: '#00D4AA',      // Verde menta neón principal
    secondary: '#00FFD4',    // Verde más brillante
    accent: '#00A080',       // Verde más oscuro
    glow: '#00FFAA',         // Para efectos de brillo
    background: '#0A0A0F',   // Fondo casi negro
};

// ============================================
// ✨ COMPONENTE: PARTÍCULA INDIVIDUAL
// ============================================
interface ParticleProps {
    x: number;
    y: number;
    size: number;
    speed: number;
    delay: number;
    opacity: number;
}

const Particle: React.FC<ParticleProps> = ({ x, y, size, speed, delay, opacity }) => {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();

    // Movimiento flotante suave (sube y baja)
    const floatY = Math.sin((frame + delay) * speed * 0.05) * 20;
    const floatX = Math.cos((frame + delay) * speed * 0.03) * 10;

    // Parpadeo suave
    const flicker = interpolate(
        Math.sin((frame + delay) * 0.1),
        [-1, 1],
        [0.3, 1]
    );

    return (
        <div
            style={{
                position: 'absolute',
                left: `${x}%`,
                top: `${y}%`,
                width: size,
                height: size,
                borderRadius: '50%',
                backgroundColor: COLORS.primary,
                opacity: opacity * flicker,
                transform: `translate(${floatX}px, ${floatY}px)`,
                boxShadow: `
          0 0 ${size * 2}px ${COLORS.glow},
          0 0 ${size * 4}px ${COLORS.primary}
        `,
                filter: 'blur(1px)',
            }}
        />
    );
};

// ============================================
// 🌌 COMPONENTE: SISTEMA DE PARTÍCULAS
// ============================================
const ParticleSystem: React.FC<{ count: number }> = ({ count }) => {
    // Generar partículas aleatorias (memo para performance)
    const particles = useMemo(() => {
        return Array.from({ length: count }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 4 + 2,
            speed: Math.random() * 2 + 0.5,
            delay: Math.random() * 100,
            opacity: Math.random() * 0.6 + 0.2,
        }));
    }, [count]);

    return (
        <>
            {particles.map((p) => (
                <Particle key={p.id} {...p} />
            ))}
        </>
    );
};

// ============================================
// 👻 COMPONENTE: TEXTO HOLOGRÁFICO
// ============================================
const HolographicText: React.FC = () => {
    const frame = useCurrentFrame();
    const { durationInFrames, fps } = useVideoConfig();

    // Duración del ciclo (mitad emerge, mitad desvanece)
    const cycleProgress = (frame % durationInFrames) / durationInFrames;

    // Animación de loop seamless: 
    // 0 → 0.5 = emerge (0 a 1)
    // 0.5 → 1 = desvanece (1 a 0)
    const visibility = cycleProgress <= 0.5
        ? interpolate(cycleProgress, [0, 0.5], [0, 1], {
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        })
        : interpolate(cycleProgress, [0.5, 1], [1, 0], {
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        });

    // Efecto de glitch/holográfico
    const glitchX = Math.sin(frame * 0.5) * 2 * visibility;
    const glitchY = Math.cos(frame * 0.7) * 1 * visibility;

    // Efecto de escaneo holográfico
    const scanLine = (frame * 3) % 100;

    return (
        <div
            style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            {/* Capa de brillo trasera */}
            <h1
                style={{
                    position: 'absolute',
                    fontSize: 80,
                    fontFamily: 'Arial Black, sans-serif',
                    fontWeight: 900,
                    color: COLORS.primary,
                    opacity: visibility * 0.3,
                    filter: `blur(20px)`,
                    transform: `translate(${glitchX}px, ${glitchY}px) scale(${0.9 + visibility * 0.1})`,
                }}
            >
                BoxesMedia360
            </h1>

            {/* Capa holográfica (offset rojo/cyan) */}
            <h1
                style={{
                    position: 'absolute',
                    fontSize: 80,
                    fontFamily: 'Arial Black, sans-serif',
                    fontWeight: 900,
                    color: '#FF0050',
                    opacity: visibility * 0.15,
                    transform: `translate(${glitchX - 3}px, ${glitchY}px)`,
                    filter: 'blur(1px)',
                }}
            >
                BoxesMedia360
            </h1>

            <h1
                style={{
                    position: 'absolute',
                    fontSize: 80,
                    fontFamily: 'Arial Black, sans-serif',
                    fontWeight: 900,
                    color: '#00FFFF',
                    opacity: visibility * 0.15,
                    transform: `translate(${glitchX + 3}px, ${glitchY}px)`,
                    filter: 'blur(1px)',
                }}
            >
                BoxesMedia360
            </h1>

            {/* Texto principal */}
            <h1
                style={{
                    position: 'relative',
                    fontSize: 80,
                    fontFamily: 'Arial Black, sans-serif',
                    fontWeight: 900,
                    color: 'transparent',
                    backgroundImage: `linear-gradient(
            180deg,
            ${COLORS.secondary} 0%,
            ${COLORS.primary} 50%,
            ${COLORS.accent} 100%
          )`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    opacity: visibility,
                    transform: `translate(${glitchX}px, ${glitchY}px) scale(${0.95 + visibility * 0.05})`,
                    textShadow: `
            0 0 10px ${COLORS.glow},
            0 0 20px ${COLORS.primary},
            0 0 40px ${COLORS.primary}
          `,
                    // Línea de escaneo holográfico
                    maskImage: `linear-gradient(
            180deg,
            rgba(255,255,255,1) ${scanLine - 5}%,
            rgba(255,255,255,0.7) ${scanLine}%,
            rgba(255,255,255,1) ${scanLine + 5}%
          )`,
                    WebkitMaskImage: `linear-gradient(
            180deg,
            rgba(255,255,255,1) ${scanLine - 5}%,
            rgba(255,255,255,0.7) ${scanLine}%,
            rgba(255,255,255,1) ${scanLine + 5}%
          )`,
                }}
            >
                BoxesMedia360
            </h1>
        </div>
    );
};

// ============================================
// 🎬 COMPOSICIÓN PRINCIPAL
// ============================================
export const HolographicParticles: React.FC = () => {
    const frame = useCurrentFrame();

    return (
        <AbsoluteFill
            style={{
                backgroundColor: COLORS.background,
                overflow: 'hidden',
            }}
        >
            {/* Gradiente de fondo sutil */}
            <div
                style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    background: `radial-gradient(
            ellipse at center,
            rgba(0, 212, 170, 0.1) 0%,
            transparent 70%
          )`,
                }}
            />

            {/* Sistema de partículas (fondo) */}
            <ParticleSystem count={80} />

            {/* Texto holográfico (centro) */}
            <AbsoluteFill
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <HolographicText />
            </AbsoluteFill>

            {/* Overlay de ruido/grain sutil */}
            <div
                style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    opacity: 0.03,
                    background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                    pointerEvents: 'none',
                }}
            />
        </AbsoluteFill>
    );
};
