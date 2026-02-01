/**
 * BoxesMedia360 Logo Animation (ULTRA-PREMIUM VERSION)
 * Rediseño de Entrada de Alto Impacto y Bokeh Particles
 */

import React, { useMemo } from 'react';
import {
    AbsoluteFill,
    Img,
    interpolate,
    spring,
    staticFile,
    useCurrentFrame,
    useVideoConfig,
} from 'remotion';

// --- Partículas Bokeh para mayor profundidad ---
const BokehParticle: React.FC<{ x: number, y: number, size: number, delay: number, speed: number, blur: number }> = ({ x, y, size, delay, speed, blur }) => {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();

    const opacity = interpolate(
        frame,
        [delay, delay + 40, durationInFrames - 40, durationInFrames],
        [0, 0.25, 0.25, 0]
    );

    const moveY = interpolate(frame, [0, durationInFrames], [0, -speed]);

    return (
        <div
            style={{
                position: 'absolute',
                left: `${x}%`,
                top: `${y}%`,
                width: size,
                height: size,
                background: 'radial-gradient(circle, rgba(0, 255, 255, 0.8) 0%, transparent 70%)',
                borderRadius: '50%',
                opacity,
                transform: `translateY(${moveY}px)`,
                filter: `blur(${blur}px)`,
                mixBlendMode: 'screen',
            }}
        />
    );
};

export const BoxesMediaLogo: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps, width, height } = useVideoConfig();

    // 1. Entrada de Alto Impacto (Spring con rebote marcado)
    const introSpring = spring({
        frame,
        fps,
        config: {
            damping: 8,
            stiffness: 100,
            mass: 0.5,
        },
    });

    // 2. Animaciones de la Entrada (Primeros 6 segundos ahora)
    const scale = interpolate(introSpring, [0, 1], [3, 1]); // Empieza gigante y cae a su sitio
    const blur = interpolate(frame, [0, 60], [20, 0], { extrapolateRight: 'clamp' }); // Se aclara
    const opacity = interpolate(frame, [0, 30], [0, 1]);

    // 3. Efecto de Flash Inicial (0-2seg)
    const flash = interpolate(frame, [0, 20, 60], [0, 1, 0], {
        extrapolateRight: 'clamp',
    });

    // 4. Zoom constante post-impacto
    const continuousZoom = interpolate(frame, [60, 300], [1, 1.1]);

    // 5. Sweep de Luz (refinado)
    const sweepPos = interpolate(frame, [90, 200], [-150, 250], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    // Bokeh Particles (Grandes y desenfocadas)
    const particles = useMemo(() => {
        return Array.from({ length: 25 }).map((_, i) => ({
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 60 + 20, // Partículas de 20px a 80px
            delay: Math.random() * 80,
            speed: Math.random() * 50 + 25, // Velocidad reducida a la mitad
            blur: Math.random() * 10 + 5,
        }));
    }, []);

    return (
        <AbsoluteFill
            style={{
                backgroundColor: '#020202',
                overflow: 'hidden',
            }}
        >
            {/* 1. Bokeh Particles */}
            {particles.map((p, i) => (
                <BokehParticle key={i} {...p} />
            ))}

            {/* 2. Flash Impacto Inicial */}
            <div
                style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#00ffff',
                    opacity: flash * 0.4,
                    filter: 'blur(50px)',
                    zIndex: 10,
                }}
            />

            {/* 3. Contenedor Principal */}
            <div
                style={{
                    flex: 1,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    transform: `scale(${scale * continuousZoom})`,
                    opacity,
                    filter: `blur(${blur}px)`,
                }}
            >
                <div style={{ position: 'relative' }}>
                    {/* Glow Pulsante de Fondo */}
                    <div
                        style={{
                            position: 'absolute',
                            width: '140%',
                            height: '140%',
                            left: '-20%',
                            top: '-20%',
                            background: 'radial-gradient(circle, rgba(0, 255, 255, 0.15) 0%, transparent 70%)',
                            filter: `blur(${interpolate(frame, [40, 90], [20, 40])}px)`,
                        }}
                    />

                    {/* Logo con Mascara de Brillo */}
                    <div style={{ position: 'relative', overflow: 'hidden' }}>
                        <Img
                            src={staticFile("boxesmedia360-logo.png")}
                            style={{
                                width: '65vw',
                                maxWidth: '650px',
                                height: 'auto',
                                filter: `drop-shadow(0 0 15px rgba(0, 255, 255, 0.4))`,
                            }}
                        />

                        {/* El Brillo (Light Sweep) */}
                        <div
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: `${sweepPos}%`,
                                width: '30%',
                                height: '100%',
                                background: 'linear-gradient(110deg, transparent, rgba(255, 255, 255, 0.6), transparent)',
                                transform: 'skewX(-30deg)',
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* 4. Eslogan con Entrada de "Cine" */}
            <div
                style={{
                    position: 'absolute',
                    bottom: '18%',
                    width: '100%',
                    textAlign: 'center',
                    opacity: interpolate(frame, [120, 180], [0, 1], { extrapolateLeft: 'clamp' }),
                    letterSpacing: `${interpolate(frame, [120, 300], [2, 12])}px`,
                }}
            >
                <span
                    style={{
                        fontFamily: 'Inter, Arial, sans-serif',
                        fontSize: '1.4rem',
                        color: '#00ffff',
                        textTransform: 'uppercase',
                        fontWeight: 400,
                        textShadow: '0 0 10px rgba(0, 255, 255, 0.5)',
                    }}
                >
                    Creative. Digital. Infinite.
                </span>
            </div>

            {/* 5. Post-Procesado Vignette Fuerte */}
            <div
                style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    background: 'radial-gradient(circle, transparent 20%, rgba(0,0,0,0.85) 100%)',
                    pointerEvents: 'none',
                }}
            />
        </AbsoluteFill>
    );
};
