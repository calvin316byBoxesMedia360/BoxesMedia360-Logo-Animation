import React, { useState } from 'react';
import { Player } from '@remotion/player';
import { PremiumMenuDynamic, MenuItem, PremiumMenuProps } from './compositions/PremiumMenu';
import { MenuControls } from './components/MenuControls';
import { Sparkles, Utensils, Share2, Download, Loader2 } from 'lucide-react';
import { getMenuConfig } from './services/firebaseService';
import { auth } from './services/firebaseConfig';
import { signInAnonymously } from 'firebase/auth';

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

const DEFAULT_USER_ID = 'los-cuates';

export const Editor: React.FC = () => {
    const [props, setProps] = useState<PremiumMenuProps>({
        menuItems: DEFAULT_MENU_ITEMS,
        restaurantName: 'Los Cuates',
        accentColor: '#D4AF37',
        sceneDuration: 5,
    });
    const [isLoading, setIsLoading] = useState(true);

    // Cargar configuración inicial
    React.useEffect(() => {
        const loadConfig = async () => {
            try {
                // 0. Autenticación Anónima (Para permisos de Firebase)
                try {
                    await signInAnonymously(auth);
                    console.log('🔐 Autenticado anónimamente');
                } catch (authError) {
                    console.error('❌ Error de autenticación:', authError);
                }

                // 1. Primero cargar de LocalStorage (rápido y siempre disponible)
                const saved = localStorage.getItem('menu_studio_config');
                if (saved) {
                    setProps(JSON.parse(saved));
                    console.log('📦 Cargado desde LocalStorage');
                }

                // 2. Intentar actualizar desde Firestore (en segundo plano)
                try {
                    const cloudConfig = await getMenuConfig(DEFAULT_USER_ID);
                    if (cloudConfig) {
                        setProps(cloudConfig);
                        console.log('☁️ Actualizado desde Firestore');
                    }
                } catch (firebaseError) {
                    console.warn('⚠️ Firebase no disponible, usando LocalStorage:', firebaseError);
                    // No es un error crítico, continuar con LocalStorage
                }
            } catch (error) {
                console.error('Error al cargar configuración:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadConfig();
    }, []);

    const calculateDuration = () => {
        const fps = 30;
        const sceneDurationFrames = Math.max((props.sceneDuration || 4) * fps, 30); // Min 1 sec
        const transitionFrames = 25;
        const itemCount = props.menuItems.length;
        return Math.max(itemCount * (sceneDurationFrames - transitionFrames) + transitionFrames, 1);
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col font-sans relative">
            {/* Header */}
            <header className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#D4AF37] to-[#722F37] rounded-xl flex items-center justify-center shadow-lg shadow-gold/20">
                        <Utensils size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg leading-tight">Digital Menu Studio</h1>
                        <p className="text-white/40 text-xs font-medium uppercase tracking-widest">by BoxesMedia360</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all flex items-center gap-2 text-sm font-medium border border-white/10">
                        <Share2 size={16} />
                        Compartir
                    </button>
                    <button
                        onClick={() => {
                            if ((window as any).__menuExport) {
                                (window as any).__menuExport();
                            } else {
                                alert('Error: La función de exportación no está disponible.');
                            }
                        }}
                        className="px-5 py-2 rounded-lg bg-[#D4AF37] hover:bg-[#B18F2E] text-black transition-all flex items-center gap-2 text-sm font-bold shadow-lg shadow-gold/20"
                    >
                        <Download size={16} />
                        Descargar MP4
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex overflow-hidden relative">
                {isLoading && (
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-[100] flex flex-col items-center justify-center">
                        <Loader2 className="w-10 h-10 text-amber-500 animate-spin mb-4" />
                        <p className="text-amber-500 font-bold animate-pulse text-xs uppercase tracking-widest">Sincronizando con la Nube...</p>
                    </div>
                )}

                {/* Left Sidebar: Controls */}
                <section className="w-[400px] border-r border-white/10 overflow-y-auto bg-black/20">
                    <MenuControls props={props} setProps={setProps} />
                </section>

                {/* Right Content: Player */}
                <section className="flex-1 bg-[#111] p-8 flex items-center justify-center">
                    <div className="w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 relative group">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />

                        <Player
                            component={PremiumMenuDynamic}
                            durationInFrames={calculateDuration()}
                            compositionWidth={1920}
                            compositionHeight={1080}
                            fps={30}
                            style={{
                                width: '100%',
                                height: '100%',
                            }}
                            inputProps={{
                                ...props,
                                sceneDuration: (props.sceneDuration || 4) * 30
                            }}
                            controls
                            autoPlay
                            loop
                        />

                        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full z-20 flex items-center gap-2 border border-white/10 transition-all group-hover:scale-105">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">Live Preview</span>
                        </div>

                        <div className="absolute bottom-4 right-16 bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl z-20 hidden group-hover:block transition-all border border-white/10 max-w-xs">
                            <div className="flex items-center gap-2 mb-1">
                                <Sparkles size={14} className="text-[#D4AF37]" />
                                <span className="text-xs font-bold">AI Tip</span>
                            </div>
                            <p className="text-[10px] text-white/60 leading-relaxed italic">
                                Prueba el botón "Magia AI" para generar descripciones apetitosas automáticamente.
                            </p>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};
