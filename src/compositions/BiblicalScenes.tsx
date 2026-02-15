import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing, Img, staticFile, Sequence } from 'remotion';
import React from 'react';

// ============================================
// 🎨 CONFIGURACIÓN
// ============================================
const SCENE_DURATION = 90; // 3 segundos por escena a 30fps
const TRANSITION_DURATION = 20; // frames de transición

const SCENES = [
    {
        image: 'scene1.jpg',
        title: 'Jesús mira con compasión',
        subtitle: 'A la multitud hambrienta'
    },
    {
        image: 'scene2.jpg',
        title: 'Los panes son ofrecidos',
        subtitle: 'Un niño trae su almuerzo'
    },
    {
        image: 'scene3.png',
        title: 'El milagro sucede',
        subtitle: 'Abundancia para todos'
    },
    {
        image: 'scene4.jpg',
        title: 'Jesús parte el pan',
        subtitle: 'Con gratitud y bendición'
    },
];

// ============================================
// 🖼️ COMPONENTE: ESCENA INDIVIDUAL
// ============================================
interface SceneProps {
    image: string;
    title: string;
    subtitle: string;
}

const Scene: React.FC<SceneProps> = ({ image, title, subtitle }) => {
    const frame = useCurrentFrame();
    const { width, height } = useVideoConfig();

    // Ken Burns effect: zoom suave durante la escena
    const scale = interpolate(frame, [0, SCENE_DURATION], [1, 1.08], {
        easing: Easing.out(Easing.cubic),
    });

    // Fade in al inicio
    const fadeIn = interpolate(frame, [0, TRANSITION_DURATION], [0, 1], {
        extrapolateRight: 'clamp',
    });

    // Fade out al final
    const fadeOut = interpolate(
        frame,
        [SCENE_DURATION - TRANSITION_DURATION, SCENE_DURATION],
        [1, 0],
        { extrapolateLeft: 'clamp' }
    );

    const opacity = Math.min(fadeIn, fadeOut);

    // Animación del título
    const titleY = interpolate(frame, [10, 30], [50, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: Easing.out(Easing.back(1.2)),
    });

    const titleOpacity = interpolate(frame, [10, 25, SCENE_DURATION - 20, SCENE_DURATION], [0, 1, 1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    return (
        <AbsoluteFill style={{ opacity }}>
            {/* Imagen con Ken Burns */}
            <div
                style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    backgroundColor: '#000',
                }}
            >
                <Img
                    src={staticFile(image)}
                    style={{
                        width: 'auto',
                        height: '120%',
                        objectFit: 'cover',
                        transform: `scale(${scale})`,
                    }}
                />
            </div>

            {/* Gradiente inferior para texto */}
            <div
                style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '40%',
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                }}
            />

            {/* Título y subtítulo */}
            <div
                style={{
                    position: 'absolute',
                    bottom: 80,
                    left: 0,
                    right: 0,
                    textAlign: 'center',
                    opacity: titleOpacity,
                    transform: `translateY(${titleY}px)`,
                }}
            >
                <h1
                    style={{
                        fontFamily: 'Georgia, serif',
                        fontSize: 52,
                        fontWeight: 700,
                        color: '#fff',
                        margin: 0,
                        textShadow: '2px 2px 8px rgba(0,0,0,0.8)',
                        letterSpacing: '0.02em',
                    }}
                >
                    {title}
                </h1>
                <p
                    style={{
                        fontFamily: 'Georgia, serif',
                        fontSize: 28,
                        fontWeight: 400,
                        color: '#f0d080',
                        margin: '10px 0 0 0',
                        textShadow: '1px 1px 4px rgba(0,0,0,0.8)',
                        fontStyle: 'italic',
                    }}
                >
                    {subtitle}
                </p>
            </div>
        </AbsoluteFill>
    );
};

// ============================================
// 🎬 COMPOSICIÓN PRINCIPAL
// ============================================
export const BiblicalScenes: React.FC = () => {
    return (
        <AbsoluteFill style={{ backgroundColor: '#000' }}>
            {SCENES.map((scene, index) => (
                <Sequence
                    key={index}
                    from={index * (SCENE_DURATION - TRANSITION_DURATION)}
                    durationInFrames={SCENE_DURATION}
                >
                    <Scene {...scene} />
                </Sequence>
            ))}
        </AbsoluteFill>
    );
};
