import React, { useState } from 'react';
import { Player } from '@remotion/player';
import { PremiumMenu, MenuItem, PremiumMenuProps } from './compositions/PremiumMenu';
import { MenuControls } from './components/MenuControls';
import { Sparkles, Download, Loader2, User, Clock, Play } from 'lucide-react';
import { getMenuConfig, saveMenuConfig, uploadMenuItemImage } from './services/firebaseService';
import { auth, db } from './services/firebaseConfig';
import { signInAnonymously } from 'firebase/auth';
import { triggerRenderWorkflow } from './services/githubActionsService';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { triggerDownload } from './utils/downloadUtils';

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
        sceneDuration: 4.0, // Ahora en Segundos
        lightFxEnabled: false,
        lightFxMode: 'softGlow',
        orientation: 'landscape',
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);
    const [activeTab, setActiveTab] = useState<'edit' | 'video'>('edit');
    const [recentExports, setRecentExports] = useState<any[]>([]);

    // Cargar configuración inicial
    React.useEffect(() => {
        const loadConfig = async () => {
            try {
                // 0. Autenticación Anónima
                try {
                    await signInAnonymously(auth);
                } catch (e) { }

                // 1. Cargar LocalStorage
                const saved = localStorage.getItem('menu_studio_config');
                if (saved) {
                    setProps(JSON.parse(saved));
                }

                // 2. Intentar Firestore
                try {
                    const cloudConfig = await getMenuConfig(DEFAULT_USER_ID);
                    if (cloudConfig) setProps(cloudConfig);
                } catch (e) { }
            } catch (error) {
                console.error('Error al cargar configuración:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadConfig();

        // 3. Escuchar exportaciones en tiempo real
        const q = query(
            collection(db, 'exports'),
            where('userId', '==', DEFAULT_USER_ID),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const exports = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setRecentExports(exports);
        });

        return () => unsubscribe();
    }, []);

    const handleExport = async () => {
        if (isExporting) return;

        setIsExporting(true);
        try {
            // SOLUCIÓN ÓPTIMA: Auto-Sync de imágenes antes de exportar
            const itemsToSync = props.menuItems.filter(item => item.image?.startsWith('blob:'));

            let updatedProps = { ...props };

            if (itemsToSync.length > 0) {
                const syncedItems: MenuItem[] = await Promise.all(props.menuItems.map(async (item): Promise<MenuItem> => {
                    if (item.image?.startsWith('blob:')) {
                        const response = await fetch(item.image);
                        const blob = await response.blob();
                        const isVideo = item.mediaType === 'video' || blob.type.startsWith('video/');
                        const ext = isVideo ? '.mp4' : '.jpg';
                        const url = await uploadMenuItemImage(DEFAULT_USER_ID, blob, `${item.name}${ext}`);
                        return {
                            ...item,
                            image: url,
                            mediaType: (isVideo ? 'video' : 'image') as 'video' | 'image'
                        };
                    }
                    return item;
                }));

                updatedProps = { ...props, menuItems: syncedItems };
                setProps(updatedProps);
                await saveMenuConfig(DEFAULT_USER_ID, updatedProps);
            } else {
                await saveMenuConfig(DEFAULT_USER_ID, props);
            }

            const filename = `menu-${props.restaurantName?.replace(/\s+/g, '-').toLowerCase() || 'premium'}-${Date.now()}.mp4`;

            // Disparar Render en la Nube (GitHub Actions)
            await triggerRenderWorkflow({
                menuConfig: updatedProps,
                filename: filename
            });

            alert(`🚀 ¡Video en camino!\n\nSe está renderizando un video de alta calidad.\n\nPodrás ver el enlace de descarga en la "Bandeja de Salida" de la sección Video cuando esté listo.`);

        } catch (error: any) {
            console.error('Error al exportar:', error);
            alert(`Error al exportar: ${error.message || 'Error desconocido'}`);
        } finally {
            setIsExporting(false);
        }
    };

    const durationInFrames = React.useMemo(() => {
        const TRANSITION_FRAMES = 25;

        // Salvaguarda: si sceneDuration > 100, es probable que se guardó en frames accidentalmente
        let sceneDurationSec = props.sceneDuration || 4;
        if (sceneDurationSec > 100) sceneDurationSec = sceneDurationSec / 30;

        const sceneDurationFrames = Math.round(sceneDurationSec * 30);

        const safeItems = props.menuItems.length > 0 ? props.menuItems : [{
            name: 'Menú en Construcción',
            description: 'Próximamente deliciosos platillos para ti.',
            price: '$0.00',
            image: ''
        } as MenuItem];

        const itemsToRender = props.isSeamlessLoop ? [...safeItems, safeItems[0]] : safeItems;

        let total = 0;
        itemsToRender.forEach((item, index) => {
            // Lo mismo para duraciones individuales
            let itemDurSec = item.duration;
            if (itemDurSec && itemDurSec > 100) itemDurSec = itemDurSec / 30;

            let itemDurationFrames = itemDurSec
                ? Math.round(itemDurSec * 30)
                : sceneDurationFrames;

            // Si es el último item y es un loop sin fin, solo lo necesitamos 
            // lo suficiente para que termine la transición (fadeIn del primero)
            if (props.isSeamlessLoop && index === itemsToRender.length - 1) {
                itemDurationFrames = TRANSITION_FRAMES;
            }

            const offset = (index === itemsToRender.length - 1)
                ? 0
                : TRANSITION_FRAMES;

            total += (itemDurationFrames - offset);
        });

        return Math.max(1, total);
    }, [props.menuItems, props.sceneDuration, props.isSeamlessLoop]);

    return (
        <div className="flex flex-col h-screen bg-[#050505] text-white selection:bg-amber-500/30 overflow-hidden">
            {/* Header */}
            <header className="h-16 lg:h-20 border-b border-white/5 flex items-center justify-between px-6 bg-black/40 backdrop-blur-md z-50 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                        <Sparkles size={18} className="text-black" />
                    </div>
                    <h1 className="text-sm lg:text-lg font-black tracking-tighter uppercase italic">
                        Digital Menu <span className="text-amber-500">Studio</span>
                    </h1>
                </div>

                <div className="flex items-center gap-2 lg:gap-4">
                    <button
                        onClick={handleExport}
                        disabled={isExporting}
                        className="group relative px-4 lg:px-6 py-2 lg:py-2.5 bg-white text-black text-[10px] lg:text-xs font-black rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            {isExporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                            {isExporting ? 'EXPORTANDO...' : 'EXPORTAR MP4'}
                        </span>
                    </button>
                    <div className="hidden lg:flex w-10 h-10 rounded-full border border-white/10 items-center justify-center bg-white/5">
                        <User size={20} className="text-white/40" />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
                {isLoading && (
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-[100] flex flex-col items-center justify-center">
                        <Loader2 className="w-10 h-10 text-amber-500 animate-spin mb-4" />
                        <p className="text-amber-500 font-bold animate-pulse text-xs uppercase tracking-widest">Sincronizando con la Nube...</p>
                    </div>
                )}

                {/* Sidebar: Controls */}
                <section className={`w-full lg:w-[450px] border-r border-white/10 overflow-y-auto bg-black/20 h-full ${activeTab === 'edit' ? 'flex' : 'hidden lg:flex'} flex-col`}>
                    <MenuControls props={props} setProps={setProps} />
                </section>

                {/* Player Section */}
                <section className={`flex-1 bg-[#111] p-4 lg:p-12 flex flex-col items-center justify-center overflow-y-auto ${activeTab === 'video' ? 'flex' : 'hidden lg:flex'}`}>
                    <div className={props.orientation === 'vertical' 
                        ? "w-full max-w-[400px] aspect-[9/16] h-[75vh] max-h-[720px] bg-black rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.6)] ring-1 ring-white/10 relative group shrink-0" 
                        : "w-full max-w-5xl aspect-video bg-black rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] ring-1 ring-white/10 relative group shrink-0"
                    }>
                        <Player
                            component={PremiumMenu}
                            inputProps={{
                                ...props,
                                menuItems: JSON.parse(JSON.stringify(props.menuItems))
                            } as any}
                            durationInFrames={durationInFrames}
                            fps={30}
                            compositionWidth={props.orientation === 'vertical' ? 1080 : 1920}
                            compositionHeight={props.orientation === 'vertical' ? 1920 : 1080}
                            style={{ width: '100%', height: '100%' }}
                            controls
                            autoPlay
                            loop={props.isSeamlessLoop}
                        />
                    </div>

                    {/* BANDEJA DE SALIDA (Real-time Exports) */}
                    <div className="w-full max-w-5xl mt-8 space-y-4">
                        <div className="flex items-center justify-between border-b border-white/5 pb-4">
                            <div className="flex items-center gap-2">
                                <Clock size={16} className="text-amber-500" />
                                <h3 className="text-xs font-black uppercase tracking-widest text-white/60">Bandeja de Salida (Renderizados)</h3>
                            </div>
                            {recentExports.length > 0 && (
                                <span className="px-2 py-0.5 bg-amber-500 text-black text-[10px] font-black rounded-md">{recentExports.length}</span>
                            )}
                        </div>

                        <div className="grid gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar pb-20 lg:pb-0">
                            {recentExports.length === 0 ? (
                                <div className="py-8 text-center border-2 border-dashed border-white/5 rounded-3xl">
                                    <p className="text-[10px] text-white/20 uppercase tracking-[0.2em]">No hay exportaciones recientes</p>
                                </div>
                            ) : (
                                recentExports.map((exp) => (
                                    <div key={exp.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center border border-white/10">
                                                {exp.status === 'completed' ? <Play size={16} className="text-green-500" /> : <Loader2 size={16} className="text-amber-500 animate-spin" />}
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-white uppercase truncate max-w-[150px] lg:max-w-xs">{exp.filename}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`text-[9px] font-black uppercase tracking-tighter ${exp.status === 'completed' ? 'text-green-500' : 'text-amber-500'}`}>
                                                        {exp.status === 'completed' ? 'LISTO' : 'PROCESANDO...'}
                                                    </span>
                                                    <span className="text-[9px] text-white/20">•</span>
                                                    <span className="text-[9px] text-white/20">{exp.createdAt?.toDate ? exp.createdAt.toDate().toLocaleTimeString() : 'Recién'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {exp.status === 'completed' && exp.url && (
                                            <button
                                                onClick={() => triggerDownload(exp.url, exp.filename || 'menu-premium.mp4')}
                                                className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-400 text-black text-[10px] font-black rounded-xl transition-all shadow-lg shadow-green-500/20"
                                            >
                                                <Download size={14} />
                                                BAJAR
                                            </button>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </section>

                {/* Mobile Tab Switcher */}
                <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-xl border border-white/10 p-1.5 rounded-2xl flex gap-1 z-[60] shadow-2xl">
                    <button
                        onClick={() => setActiveTab('edit')}
                        className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'edit' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30' : 'text-white/40'}`}
                    >
                        ✍️ Editar
                    </button>
                    <button
                        onClick={() => setActiveTab('video')}
                        className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'video' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30' : 'text-white/40'}`}
                    >
                        🎬 Video
                    </button>
                </div>
            </main>
        </div>
    );
};
