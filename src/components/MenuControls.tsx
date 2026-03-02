import React, { useState, useEffect, useCallback } from 'react';
import { PremiumMenuProps, MenuItem } from '../compositions/PremiumMenu';
import { saveMenuConfig, uploadMenuItemImage } from '../services/firebaseService';
import { refineCopy } from '../services/aiService';
import { triggerRenderWorkflow } from '../services/githubActionsService';
import { auth } from '../services/firebaseConfig';
import {
    Palette,
    Sparkles,
    Save,
    Download,
    Plus,
    Trash2,
    RotateCcw,
    Loader2,
    ImageIcon,
    Camera,
    Utensils,
    Cloud,
    CheckCircle2,
    AlertCircle,
    User,
    Lock,
    Film,
    Infinity
} from 'lucide-react';

interface MenuControlsProps {
    props: PremiumMenuProps;
    setProps: React.Dispatch<React.SetStateAction<PremiumMenuProps>>;
}

// --- SUB-COMPONENTE PARA CADA PLATILLO ---
interface MenuItemCardProps {
    item: MenuItem;
    index: number;
    onUpdate: (index: number, updates: Partial<MenuItem>) => void;
    onRemove: (index: number) => void;
    onUploadImage: (index: number, e: React.ChangeEvent<HTMLInputElement>) => void;
    isGenerating: boolean;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, index, onUpdate, onRemove, onUploadImage, isGenerating }) => {
    const [name, setName] = useState(item.name);
    const [description, setDescription] = useState(item.description);
    const [price, setPrice] = useState(item.price);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        setName(item.name);
        setDescription(item.description);
        setPrice(item.price);
        setHasChanges(false);
    }, [item.name, item.description, item.price]);

    const handleLocalChange = (field: string, value: string) => {
        if (field === 'name') setName(value);
        if (field === 'description') setDescription(value);
        if (field === 'price') setPrice(value);
        setHasChanges(true);
    };

    const commitChanges = () => {
        onUpdate(index, { name, description, price });
        setHasChanges(false);
    };

    const toggleFontSize = () => {
        const nextModeMap: Record<string, 'normal' | 'medium' | 'large'> = {
            'normal': 'medium',
            'medium': 'large',
            'large': 'normal'
        };
        const currentMode = item.fontSizeMode || 'normal';
        onUpdate(index, { fontSizeMode: nextModeMap[currentMode] });
    };

    const getModeLabel = () => {
        const mode = item.fontSizeMode || 'normal';
        if (mode === 'normal') return 'T';
        if (mode === 'medium') return 'T+';
        return 'T++';
    };

    return (
        <div className={`p-3 lg:p-5 space-y-3 lg:space-y-4 border rounded-[2rem] group transition-all duration-300 ${hasChanges ? 'border-amber-500/60 bg-amber-500/10 shadow-2xl shadow-amber-500/10 scale-[1.01]' : 'border-white/5 bg-white/5'}`}>
            <div className="flex flex-row gap-3 lg:gap-4">
                <div className="relative group/img w-20 h-20 lg:w-28 lg:h-28 aspect-square rounded-2xl overflow-hidden bg-black/40 border border-white/10 shrink-0 flex items-center justify-center">
                    {item.image ? (
                        item.mediaType === 'video' ? (
                            <div className="relative w-full h-full">
                                <video
                                    src={item.image}
                                    className="w-full h-full object-cover opacity-80 group-hover/img:opacity-100"
                                    muted
                                    loop
                                    autoPlay
                                    playsInline
                                />
                                <div className="absolute bottom-1 right-1 bg-black/60 p-1 rounded-md">
                                    <Film size={12} className="text-amber-500" />
                                </div>
                            </div>
                        ) : (
                            <img
                                src={item.image}
                                alt={name}
                                className={`w-full h-full object-cover transition-opacity ${item.image.startsWith('blob:') ? 'opacity-40 animate-pulse' : 'opacity-80 group-hover/img:opacity-100'}`}
                            />
                        )
                    ) : (
                        <ImageIcon size={24} className="text-white/10" />
                    )}
                    <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover/img:opacity-100 transition-all cursor-pointer z-10">
                        <Camera size={20} className="text-white" />
                        <input type="file" className="hidden" accept="image/*,video/*" onChange={(e) => onUploadImage(index, e)} disabled={isGenerating} />
                    </label>
                    {item.image?.startsWith('blob:') && (
                        <div className="absolute top-2 right-2 p-1 bg-amber-500 rounded-full shadow-lg animate-bounce z-10" title="¡Súbela a la nube!">
                            <Cloud size={12} className="text-black" />
                        </div>
                    )}
                    {(item as any).uploadError && (
                        <div className="absolute inset-0 flex items-center justify-center bg-red-500/20 backdrop-blur-[2px]">
                            <AlertCircle size={20} className="text-red-500 animate-pulse" />
                        </div>
                    )}
                </div>

                <div className="flex-1 min-w-0 space-y-2 lg:space-y-3">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <input
                                value={name}
                                onChange={(e) => handleLocalChange('name', e.target.value)}
                                className="w-full text-base lg:text-xl font-black text-white bg-transparent border-none focus:ring-0 p-0 placeholder:text-white/10 truncate"
                                placeholder="Nombre..."
                            />
                            {item.duration && (
                                <button
                                    onClick={() => onUpdate(index, { duration: undefined })}
                                    className="px-2 py-0.5 bg-white/10 hover:bg-white/20 rounded-lg text-[8px] font-black text-amber-500 whitespace-nowrap flex items-center gap-1 group/dur"
                                    title="Resetear a duración global"
                                >
                                    {item.duration.toFixed(1)}s
                                    <RotateCcw size={8} className="opacity-0 group-hover/dur:opacity-100 transition-opacity" />
                                </button>
                            )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                            <button
                                onClick={toggleFontSize}
                                className={`w-7 h-7 lg:w-8 lg:h-8 rounded-lg lg:rounded-xl flex items-center justify-center text-[10px] font-black transition-all border ${item.fontSizeMode && item.fontSizeMode !== 'normal' ? 'bg-amber-500 text-black border-amber-400' : 'bg-white/5 text-white/40 border-white/10'}`}
                            >
                                {getModeLabel()}
                            </button>
                            <button onClick={() => onRemove(index)} className="p-1.5 lg:p-2 text-white/10 hover:text-red-500 transition-colors">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                    <textarea
                        value={description}
                        onChange={(e) => handleLocalChange('description', e.target.value)}
                        className="w-full text-[11px] lg:text-sm text-white/40 bg-transparent border-none focus:ring-0 p-0 resize-none h-10 lg:h-14 leading-tight placeholder:text-white/5"
                        placeholder="Descripción..."
                    />
                    <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-xl border border-white/5 focus-within:border-amber-500/50 transition-all">
                            <span className="text-xs font-bold text-amber-500">$</span>
                            <input
                                value={price.replace('$', '')}
                                onChange={(e) => handleLocalChange('price', `$${e.target.value}`)}
                                className="w-14 lg:w-20 text-sm lg:text-base font-black bg-transparent border-none focus:ring-0 p-0 text-white"
                                placeholder="0.00"
                            />
                        </div>

                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-xl border border-white/5 focus-within:border-amber-500/50 transition-all">
                            <RotateCcw size={12} className="text-amber-500" />
                            <input
                                type="number"
                                step="0.5"
                                value={item.duration || ''}
                                onChange={(e) => onUpdate(index, { duration: e.target.value ? parseFloat(e.target.value) : undefined })}
                                className="w-10 text-xs font-black bg-transparent border-none focus:ring-0 p-0 text-amber-500 placeholder:text-white/10"
                                placeholder="Auto"
                                title="Duración manual en segundos"
                            />
                            <span className="text-[10px] font-bold text-white/20">s</span>
                        </div>

                        {hasChanges ? (
                            <button
                                onClick={commitChanges}
                                className="px-4 py-2 lg:px-6 lg:py-2.5 bg-amber-500 hover:bg-amber-400 text-black text-[10px] lg:text-xs font-black rounded-xl lg:rounded-2xl flex items-center gap-1.5 lg:gap-2 transition-all shadow-lg shadow-amber-500/20"
                            >
                                <Save size={16} /> <span className="hidden xs:inline">GUARDAR</span>
                            </button>
                        ) : (
                            <div className="flex items-center gap-1.5 text-[8px] lg:text-[10px] font-bold text-green-500/30 uppercase tracking-[0.2em]">
                                <CheckCircle2 size={12} /> SINCRO
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const MenuControls: React.FC<MenuControlsProps> = ({ props, setProps }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [currentAction, setCurrentAction] = useState<string | null>(null);
    const [isRendering, setIsRendering] = useState(false);
    const [userId, setUserId] = useState<string>('los-cuates');

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                console.log('👤 Usuario activo:', user.uid);
                setUserId(user.uid);
            }
        });
        return () => unsubscribe();
    }, []);

    const saveMenu = async () => {
        setIsGenerating(true);
        setCurrentAction('Sincronizando...');
        try {
            localStorage.setItem('menu_studio_config', JSON.stringify(props));
            await saveMenuConfig(userId, props);
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 2000);
        } catch (error) {
            console.error('Error:', error);
            alert('Error al sincronizar con la nube. Asegúrate de que las reglas de Firebase estén abiertas.');
        } finally {
            setIsGenerating(false);
            setCurrentAction(null);
        }
    };

    const addItem = () => {
        const newItem: MenuItem = { image: '', name: 'Nuevo Item', description: 'Deliciosa descripción', price: '$0.00' };
        setProps({ ...props, menuItems: [...props.menuItems, newItem] });
    };

    const updateItem = useCallback((index: number, updates: Partial<MenuItem>) => {
        setProps((prev: PremiumMenuProps) => ({
            ...prev,
            menuItems: prev.menuItems.map((item: MenuItem, i: number) => i === index ? { ...item, ...updates } : item)
        }));
    }, [setProps]);

    const getVideoDuration = (file: File): Promise<number> => {
        return new Promise((resolve) => {
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.onloadedmetadata = () => {
                window.URL.revokeObjectURL(video.src);
                resolve(video.duration);
            };
            video.src = URL.createObjectURL(file);
        });
    };

    const handleUploadImage = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const isVideo = file.type.startsWith('video/');
        const maxSize = isVideo ? 15 * 1024 * 1024 : 5 * 1024 * 1024;

        if (file.size > maxSize) {
            alert(isVideo ? 'El video es muy pesado. Máximo 15MB.' : 'La imagen es muy pesada. Máximo 5MB.');
            return;
        }

        const localUrl = URL.createObjectURL(file);

        let detectedDuration = undefined;
        if (isVideo) {
            try {
                detectedDuration = await getVideoDuration(file);
            } catch (e) {
                console.error('Error detectando duración:', e);
            }
        }

        updateItem(index, {
            image: localUrl,
            mediaType: isVideo ? 'video' : 'image',
            duration: detectedDuration,
            uploadError: false
        });

        setIsGenerating(true);
        setCurrentAction(isVideo ? 'Subiendo Video...' : 'Subiendo Imagen...');
        try {
            const url = await uploadMenuItemImage(userId, file, file.name);
            updateItem(index, { image: url, mediaType: isVideo ? 'video' : 'image', uploadError: false });
        } catch (error: any) {
            console.error('❌ Error de subida:', error);
            updateItem(index, { uploadError: true });
            alert(`Fallo al subir: ${error.message || 'Error desconocido'}`);
        } finally {
            setIsGenerating(false);
            setCurrentAction(null);
        }
    };

    // BLINDAJE 2: Validación de Render y Bloqueo de UI
    const handleExport = async () => {
        // 1. Verificar imágenes locales (blob)
        const hasBlobs = props.menuItems.some(item => item.image?.startsWith('blob:')) ||
            props.logoUri?.startsWith('blob:');

        if (hasBlobs) {
            alert('❌ REGLA DE SEGURIDAD: Tienes imágenes locales (Nube Naranja parpadeando).\n\nDebes subirlas a la nube antes de exportar el video profesional.');
            return;
        }

        // 2. Prevenir múltiples clicks
        if (isRendering) return;

        setIsRendering(true);
        try {
            const result = await triggerRenderWorkflow({
                menuConfig: props, // Ya enviamos los segundos, GitHub los convertirá
                filename: `menu-${Date.now()}.mp4`
            });
            window.open(result.htmlUrl, '_blank');
            alert('🚀 ¡PRODUCCIÓN INICIADA!\nSe ha abierto la pestaña de GitHub Actions. El video estará listo en breve.');
        } catch (error) {
            console.error('Render error:', error);
            alert('Error al contactar con el servidor de renderizado.');
        } finally {
            setIsRendering(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#0a0a0a] text-white">
            {/* STICKY HEADER AI STYLE */}
            <div className="p-4 lg:p-6 bg-black/80 backdrop-blur-2xl border-b border-white/5 sticky top-0 z-30 space-y-4 lg:space-y-6">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
                            <Sparkles size={20} className="text-black" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-xs lg:text-sm font-black uppercase tracking-tighter truncate">Panel de Control</h2>
                            <div className="flex items-center gap-1.5 text-[8px] lg:text-[9px] text-white/30 font-bold">
                                <User size={10} /> <span className="truncate">{userId === 'los-cuates' ? 'Modo Invitado' : `ID: ${userId.slice(0, 8)}...`}</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={saveMenu}
                        disabled={isGenerating}
                        className={`px-4 lg:px-6 py-2 lg:py-2.5 rounded-2xl font-black text-[10px] lg:text-xs transition-all flex items-center gap-2 border shrink-0 ${isSaved ? 'bg-green-500 text-black border-green-400' : 'bg-amber-500 text-black border-amber-400 hover:scale-105 active:scale-95 shadow-xl shadow-amber-500/20'} disabled:opacity-50`}
                    >
                        {isSaved ? <CheckCircle2 size={14} /> : <Save size={14} />}
                        <span className="hidden sm:inline">{isSaved ? 'SINCRONIZADO' : 'SYNC CLOUD'}</span>
                        <span className="sm:hidden">{isSaved ? 'OK' : 'SYNC'}</span>
                    </button>
                </div>

                <div className="flex gap-2">
                    <input
                        value={props.restaurantName}
                        onChange={(e) => setProps({ ...props, restaurantName: e.target.value })}
                        className="flex-1 bg-white/5 border border-white/10 rounded-2xl py-3 px-4 lg:px-5 text-sm font-bold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50 outline-none transition-all placeholder:text-white/10"
                        placeholder="Nombre Restaurante"
                    />
                    <button
                        onClick={addItem}
                        className="w-12 h-12 bg-white/5 hover:bg-white/10 border border-white/10 text-amber-500 rounded-2xl flex items-center justify-center transition-all active:scale-90 shrink-0"
                    >
                        <Plus size={28} />
                    </button>
                </div>
            </div>

            {/* CONTENT LIST */}
            <div className="p-6 space-y-10 overflow-y-auto pb-40 scrollbar-hide">
                <div className="space-y-4">
                    <div className="flex items-center justify-between text-white/20">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">Menu Manager</h3>
                        <span className="text-[10px] bg-white/5 px-2 py-1 rounded-md">{props.menuItems.length} PLATILLOS</span>
                    </div>
                    <div className="space-y-4">
                        {props.menuItems.length === 0 ? (
                            <div className="py-20 flex flex-col items-center justify-center text-white/10 border-2 border-dashed border-white/5 rounded-[40px] space-y-4">
                                <Utensils size={48} />
                                <p className="text-xs font-black uppercase tracking-widest">El menú está vacío</p>
                                <button onClick={addItem} className="text-[10px] text-amber-500 font-bold border border-amber-500/20 px-4 py-2 rounded-full hover:bg-amber-500/5 transition-all">AÑADIR MI PRIMER PLATILLO</button>
                            </div>
                        ) : (
                            props.menuItems.map((item, index) => (
                                <MenuItemCard
                                    key={`${index}-${item.name}`}
                                    item={item}
                                    index={index}
                                    onUpdate={updateItem}
                                    onRemove={(i) => setProps({ ...props, menuItems: props.menuItems.filter((_, idx) => idx !== i) })}
                                    onUploadImage={handleUploadImage}
                                    isGenerating={isGenerating}
                                />
                            ))
                        )}
                    </div>
                </div>

                {/* VISUAL & AI TOOLS */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-white/5 rounded-3xl border border-white/5 space-y-3">
                        <div className="flex items-center gap-2 text-white/30">
                            <Palette size={14} />
                            <span className="text-[9px] font-black uppercase">Color</span>
                        </div>
                        <input type="color" value={props.accentColor} onChange={(e) => setProps(prev => ({ ...prev, accentColor: e.target.value }))} className="w-full h-12 rounded-xl bg-black/40 border-none cursor-pointer" />
                    </div>
                    <div className="p-4 bg-white/5 rounded-3xl border border-white/5 space-y-3">
                        <div className="flex items-center gap-2 text-white/30">
                            <RotateCcw size={14} />
                            <span className="text-[9px] font-black uppercase">Segs</span>
                        </div>
                        <input type="number" value={props.sceneDuration} step="0.5" onChange={(e) => setProps(prev => ({ ...prev, sceneDuration: parseFloat(e.target.value) }))} className="w-full h-12 px-4 rounded-xl bg-black/40 border-none text-white font-bold" />
                    </div>
                    <button
                        onClick={() => setProps(prev => ({ ...prev, isSeamlessLoop: !prev.isSeamlessLoop }))}
                        className={`p-4 rounded-3xl border transition-all space-y-3 flex flex-col items-start ${props.isSeamlessLoop ? 'bg-amber-500/20 border-amber-500/50' : 'bg-white/5 border-white/5'}`}
                    >
                        <div className={`flex items-center gap-2 ${props.isSeamlessLoop ? 'text-amber-500' : 'text-white/30'}`}>
                            <Infinity size={14} />
                            <span className="text-[9px] font-black uppercase">Loop</span>
                        </div>
                        <div className={`text-[10px] font-black uppercase ${props.isSeamlessLoop ? 'text-amber-500' : 'text-white/40'}`}>
                            {props.isSeamlessLoop ? 'ON' : 'OFF'}
                        </div>
                    </button>
                </div>

                <button
                    onClick={async () => {
                        setIsGenerating(true);
                        setCurrentAction('AI Refinando...');
                        try {
                            const newItems = await Promise.all(props.menuItems.map(async (item) => ({
                                ...item,
                                name: await refineCopy(item.name),
                                description: await refineCopy(item.description || '')
                            })));
                            setProps({ ...props, menuItems: newItems });
                        } finally {
                            setIsGenerating(false);
                            setCurrentAction(null);
                        }
                    }}
                    disabled={isGenerating || props.menuItems.length === 0}
                    className="w-full py-4 bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 rounded-3xl text-amber-500 font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-amber-500/10 transition-all disabled:opacity-30 disabled:grayscale"
                >
                    <Sparkles size={16} /> Magia AI en Textos
                </button>

                {/* EXPORT SECTION */}
                <div className="pt-10 border-t border-white/5 space-y-6">
                    <div className="flex items-center gap-2 text-white/10 uppercase font-black text-[10px] tracking-[0.4em]">Producción Profesional</div>
                    <button
                        onClick={handleExport}
                        disabled={isRendering || props.menuItems.length === 0}
                        className={`w-full py-6 rounded-[32px] font-black text-lg transition-all flex items-center justify-center gap-4 shadow-2xl ${isRendering ? 'bg-white/10 text-white/20' : 'bg-white text-black hover:scale-[1.02] active:scale-95 shadow-white/5'}`}
                    >
                        {isRendering ? <Loader2 size={24} className="animate-spin" /> : isRendering ? <Lock size={24} /> : <Download size={24} />}
                        {isRendering ? 'EN COLA DE PROD...' : 'EXPORTAR VIDEO'}
                    </button>
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => window.location.reload()} className="py-3 bg-white/5 rounded-2xl text-[10px] font-bold text-white/30 uppercase border border-white/5 hover:bg-white/10">Refrescar App</button>
                        <button onClick={() => { localStorage.removeItem('menu_studio_config'); window.location.reload(); }} className="py-3 bg-red-500/10 rounded-2xl text-[10px] font-bold text-red-500/40 uppercase border border-red-500/10 hover:bg-red-500/20">Reset Data</button>
                    </div>
                </div>
            </div>

            {/* FLOATING STATUS */}
            {isGenerating && (
                <div className="fixed bottom-10 left-[420px] px-8 py-4 bg-amber-500 text-black rounded-full shadow-[0_0_50px_rgba(245,158,11,0.4)] flex items-center gap-4 font-black text-sm uppercase tracking-widest animate-in slide-in-from-bottom-10 z-[100]">
                    <Loader2 className="animate-spin" size={20} />
                    {currentAction}
                </div>
            )}
        </div>
    );
};
